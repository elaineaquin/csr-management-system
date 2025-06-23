"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";

export type VolunteerRequestType = Prisma.VolunteerRequestGetPayload<{
  include: {
    project: {
      select: {
        id: true;
        title: true;
        description: true;
        needsAttention: true;
      };
    };
    createdBy: {
      select: {
        id: true;
        name: true;
        image: true;
      };
    };
  };
}>;

export type VolunteerType = Prisma.VolunteerGetPayload<{
  include: {
    availability: {
      select: {
        day: true;
      };
    };

    user: {
      select: {
        id: true;
        name: true;
        image: true;
        email: true;
      };
    };
    volunteerRequest: {
      select: {
        id: true;
        message: true;
      };
    };
    volunteerForm: {
      select: {
        motivation: true;
        experience: true;
      };
    };
  };
}>;

export async function getAllRequest() {
  return await prisma.volunteerRequest.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          description: true,
          needsAttention: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

export async function participateRequest({
  requestId,
  userId,
  availability,
  motivation,
  experience,
}: {
  requestId: string;
  userId: string;
  availability: string[];
  motivation: string;
  experience: string;
}) {
  // 1. Ensure request exists
  const request = await prisma.volunteerRequest.findUnique({
    where: { id: requestId },
    include: { volunteers: true },
  });

  if (!request) {
    throw new Error("Volunteer request not found.");
  }

  // 2. Check if volunteer already exists
  let volunteer = await prisma.volunteer.findFirst({
    where: {
      userId,
      volunteerRequestId: requestId,
    },
    include: {
      volunteerRequest: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (volunteer) {
    // 3a. If exists, update availability and upsert volunteerForm
    await prisma.volunteerAvailability.deleteMany({
      where: {
        volunteerId: volunteer.id,
      },
    });

    const existingForm = await prisma.volunteerForm.findUnique({
      where: { id: volunteer.id },
      select: { id: true },
    });

    await prisma.volunteer.update({
      where: { id: volunteer.id },
      data: {
        availability: {
          create: availability.map((day) => ({ day })),
        },
        volunteerForm: existingForm
          ? {
              upsert: {
                where: { id: existingForm.id },
                update: { motivation, experience },
                create: { motivation, experience },
              },
            }
          : {
              create: { motivation, experience },
            },
      },
    });
  } else {
    // 3b. If not exists, create new volunteer
    volunteer = await prisma.volunteer.create({
      data: {
        userId,
        volunteerRequestId: requestId,
        status: "Pending",
        availability: {
          create: availability.map((day) => ({ day })),
        },
        volunteerForm: {
          create: {
            motivation,
            experience,
          },
        },
      },
      include: {
        volunteerRequest: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  return {
    name: user?.name ?? "unknown",
    title: volunteer.volunteerRequest.project.title,
    requestId: volunteer.volunteerRequest.id,
    createdById: volunteer.volunteerRequest.createdById,
    requestStatus: request.status,
  };
}

export async function getVolunteersByProjectId(params: { projectId: string }) {
  const { projectId } = params;

  const volunteers = await prisma.volunteer.findMany({
    where: {
      volunteerRequest: {
        projectId,
      },
    },
    include: {
      availability: {
        select: {
          day: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
        },
      },
      volunteerRequest: {
        select: {
          id: true,
          message: true,
        },
      },
      volunteerForm: {
        select: {
          motivation: true,
          experience: true,
        },
      },
    },
  });

  return volunteers;
}

export async function getVolunteerRequestById({ id }: { id: string }) {
  const request = await prisma.volunteerRequest.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          volunteers: {
            where: {
              status: "Approved",
            },
          },
        },
      },
      project: true,
      volunteers: {
        include: {
          availability: {
            select: {
              day: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
          volunteerRequest: {
            select: {
              id: true,
              message: true,
            },
          },
          volunteerForm: {
            select: {
              motivation: true,
              experience: true,
            },
            take: 1,
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!request) {
    throw new Error("Volunteer request not found");
  }

  return {
    ...request,
    totalParticipants: request._count.volunteers,
  };
}

export async function closeVolunteerRequest({ id }: { id: string }) {
  try {
    const volunteerRequest = await prisma.volunteerRequest.update({
      where: { id },
      data: {
        status: "Closed",
      },
      include: {
        project: true,
      },
    });

    await prisma.project.update({
      where: { id: volunteerRequest.projectId },
      data: { status: "Ongoing" },
    });

    await prisma.projectHistory.create({
      data: {
        projectId: volunteerRequest.projectId,
        title: "Project Ongoing",
        subtitle: "A project request has been closed and ongoing",
      },
    });
  } catch (error) {
    console.error("Failed to close volunteer request:", error);
    throw new Error("Unable to close the volunteer request");
  }
}

export async function updateVolunteerRequest(params: {
  id: string;
  message: string;
  participantLimit: number;
}) {
  try {
    const updatedRequest = await prisma.volunteerRequest.update({
      where: {
        id: params.id,
      },
      data: {
        message: params.message,
        participantLimit: params.participantLimit,
      },
    });

    return updatedRequest;
  } catch (error) {
    console.error("Error updating volunteer request:", error);
    throw new Error("Failed to update volunteer request");
  }
}

export async function updateUserAvailability({
  volunteerId,
  days,
}: {
  volunteerId: string;
  days: string[];
}) {
  await prisma.volunteerAvailability.deleteMany({
    where: { volunteerId },
  });

  if (days.length > 0) {
    await prisma.volunteerAvailability.createMany({
      data: days.map((day) => ({
        volunteerId,
        day,
      })),
    });
  }
}

export async function getUserParticipatedProjects() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("User session not found");
  }

  const volunteeredProjects = await prisma.volunteer.findMany({
    where: { userId: session.user.id },
    include: {
      volunteerRequest: {
        select: {
          project: {
            include: {
              createdBy: true,
            },
          },
        },
      },
    },
  });

  const projects = volunteeredProjects.map(
    (volunteered) => volunteered.volunteerRequest.project
  );

  return projects;
}

export async function getUserTasks() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("User session not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      assignees: {
        include: {
          card: {
            include: {
              column: {
                include: {
                  board: true,
                },
              },
              labels: {
                include: {
                  label: true,
                },
              },
              assignees: {
                include: {
                  user: true,
                },
              },
              comments: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error(`User with id ${session.user.id} not found`);
  }

  // Extract the Kanban cards
  const tasks = user.assignees.map((a) => a.card);

  return tasks;
}

export async function updateVolunteerStatus({
  volunteerId,
  status,
}: {
  volunteerId: string;
  status: "Pending" | "Approved" | "Rejected";
}) {
  // Get volunteer's current data
  const currentVolunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
    include: {
      volunteerRequest: {
        include: {
          project: {
            select: { id: true, title: true },
          },
          volunteers: {
            select: { status: true },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!currentVolunteer) throw new Error("Volunteer not found");

  const volunteerRequest = currentVolunteer.volunteerRequest;
  const participantLimit = volunteerRequest.participantLimit ?? Infinity;

  // Count current approved volunteers (excluding this one)
  const approvedCount = volunteerRequest.volunteers.filter(
    (v) => v.status === "Approved"
  ).length;

  if (status === "Approved" && approvedCount >= participantLimit) {
    throw new Error(
      "Participant limit reached. Cannot approve more volunteers."
    );
  }

  // Update volunteer status
  const updatedVolunteer = await prisma.volunteer.update({
    where: { id: volunteerId },
    data: { status },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      volunteerRequest: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  // If after this approval, limit is now reached, mark request as filled
  if (status === "Approved" && approvedCount + 1 >= participantLimit) {
    await prisma.volunteerRequest.update({
      where: { id: volunteerRequest.id },
      data: { status: "Filled" },
    });
  }

  return {
    name: updatedVolunteer.user.name,
    userId: updatedVolunteer.user.id,
    title: updatedVolunteer.volunteerRequest.project.title,
    requestId: updatedVolunteer.volunteerRequest.id,
    createdById: updatedVolunteer.volunteerRequest.createdById,
    requestStatus: updatedVolunteer.volunteerRequest.status,
  };
}
