"use server";
import { CreateColumnSchema } from "@/components/kanban-board/add-column-form";
import { CreateTaskSchema } from "@/components/kanban-board/add-task-form";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { KanbanColorType, Prisma } from "@prisma/client";
import { headers } from "next/headers";

export type KanbanBoardType = Prisma.KanbanBoardGetPayload<{
  include: {
    owner: {
      select: {
        id: true;
        name: true;
      };
    };
    members: {
      select: {
        id: true;
        name: true;
      };
    };
    columns: {
      include: {
        cards: {
          include: {
            assignees: {
              select: {
                user: { select: { name: true; id: true } };
              };
            };
            labels: true;
          };
        };
      };
    };
    labels: true;
  };
}>;
export type KanbanBoardColumnType = KanbanBoardType["columns"][number];
export type KanbanBoardCardType = KanbanBoardColumnType["cards"][number];

export async function getKanbanBoard({ projectId }: { projectId: string }) {
  const existing = await prisma.kanbanBoard.findUnique({
    where: { projectId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      members: {
        select: {
          id: true,
          name: true,
        },
      },
      columns: {
        include: {
          cards: {
            include: {
              assignees: {
                select: {
                  user: { select: { name: true, id: true } },
                },
              },
              labels: true,
            },
          },
        },
      },
      labels: true,
    },
  });

  if (existing) return existing;

  // Create default if not exist
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  const participants = await prisma.volunteerRequest.findFirst({
    where: { projectId: { equals: project?.id } },
    select: {
      volunteers: {
        where: { status: { equals: "Approved" } },
      },
    },
  });
  console.log(participants);
  return await prisma.kanbanBoard.create({
    data: {
      projectId,
      name: project?.title ?? "Untitled Board",
      owner: { connect: { id: project?.createdById } },
      members: {
        connect: participants?.volunteers.map((v) => ({ id: v.userId })) ?? [],
      },
      columns: {
        create: [
          { title: "To Do", position: 1 },
          { title: "In Progress", position: 2 },
          { title: "Done", position: 3 },
        ],
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      members: {
        select: {
          id: true,
          name: true,
        },
      },
      columns: {
        include: {
          cards: {
            include: {
              assignees: true,
              labels: true,
            },
          },
        },
      },
      labels: true,
    },
  });
}

export async function getKanbanFormRequirements({
  projectId,
}: {
  projectId: string;
}) {
  const board = await prisma.kanbanBoard.findUnique({
    where: { projectId },
    include: {
      columns: {
        include: {
          cards: {
            select: {
              position: true,
            },
          },
        },
      },
      labels: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  if (!board) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      from: true,
      to: true,
      volunteerRequests: {
        select: {
          volunteers: {
            select: {
              availability: true,
              user: true,
            },
          },
        },
      },
    },
  });

  if (!project) throw new Error("Project not found");

  // Add lastPosition to each column
  const columnsWithPosition = board.columns.map((column) => ({
    id: column.id,
    title: column.title,
    position: column.position,
    lastPosition: column.cards.length
      ? Math.max(...column.cards.map((c) => c.position))
      : 0,
  }));

  return {
    boardId: board.id,
    boardLastPosition: board.columns.length,
    columns: columnsWithPosition,
    labels: board.labels,
    users: project.volunteerRequests[0].volunteers ?? [],
    duration: { from: project.from, to: project.to },
  };
}

export async function addTaskCard(data: CreateTaskSchema) {
  const session = await auth.api.getSession({ headers: await headers() });
  const column = await prisma.kanbanColumn.findUnique({
    where: { id: data.columnId },
    include: { cards: true, board: { select: { projectId: true } } },
  });

  if (!column) throw new Error("Column not found");

  const createdCard = await prisma.kanbanCard.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      position: data.position,
      columnId: data.columnId,
      creatorId: session?.user.id ?? "",
      assignees: data.assignees?.length
        ? {
            create: data.assignees.map((userId) => ({
              user: { connect: { id: userId } },
            })),
          }
        : undefined,
    },
    include: {
      assignees: {
        include: { user: true },
      },
      labels: true,
    },
  });

  return { ...createdCard, projectId: column.board.projectId };
}

export async function updateTaskCardPosition({
  columnId,
  position,
  taskId,
}: {
  taskId: string;
  columnId: string;
  position: number;
}) {
  try {
    await prisma.kanbanCard.update({
      where: { id: taskId },
      data: { columnId: columnId, position: position },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateColumnPosition({
  columnId,
  position,
}: {
  columnId: string;
  position: number;
}) {
  try {
    await prisma.kanbanColumn.update({
      where: { id: columnId },
      data: { position },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateColumnColor({
  columnId,
  color,
}: {
  columnId: string;
  color: KanbanColorType;
}) {
  try {
    await prisma.kanbanColumn.update({
      where: { id: columnId },
      data: { color },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function addKanbanColumn(data: CreateColumnSchema) {
  try {
    await prisma.kanbanColumn.create({
      data: {
        title: data.title,
        position: data.position,
        boardId: data.boardId,
        color: data.color,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function deleteColumn({ columnId }: { columnId: string }) {
  try {
    await prisma.kanbanCard.deleteMany({ where: { columnId } }); // delete cards
    await prisma.kanbanColumn.delete({ where: { id: columnId } }); // then delete column
  } catch (error) {
    console.error(error);
  }
}

export async function renameColumn({
  columnId,
  title,
}: {
  columnId: string;
  title: string;
}) {
  try {
    await prisma.kanbanColumn.update({
      where: { id: columnId },
      data: { title },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function deleteTask({ taskId }: { taskId: string }) {
  try {
    const existing = await prisma.kanbanCard.findUnique({
      where: { id: taskId },
    });
    if (!existing) {
      console.error("Kanban card not found for ID:", taskId);
      return;
    }
    await prisma.kanbanCard.delete({ where: { id: taskId } });
  } catch (error) {
    console.error(error);
  }
}
