"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  DocumentCategory,
  DocumentPermission,
} from "@/lib/zod/document.schema";
import { DocumentFolder, DocumentVersionView } from "@/types/document.type";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

const permissionLevels: Record<DocumentPermission, number> = {
  READ: 1,
  WRITE: 2,
  OWNER: 3,
};

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SelectedUser extends User {
  permission: DocumentPermission;
}

export async function createNewDocument(
  data: Prisma.DocumentVersionCreateInput
) {
  try {
    const documentVersion = await prisma.documentVersion.create({ data });
    return await prisma.document.findFirst({
      where: { id: documentVersion.documentId },
    });
  } catch (error) {
    console.error("Project creation failed:", error);
    throw new Error("Failed to create project");
  }
}

export async function getDocumentById({ id }: { id: string }) {
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      documentVersions: {
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: true,
          attachment: true,
        },
      },
    },
  });

  return document;
}

export async function getDocumentVersions({
  documentId,
}: {
  documentId: string;
}): Promise<DocumentVersionView[]> {
  const documentVersions = await prisma.documentVersion.findMany({
    where: {
      documentId,
    },
    include: {
      attachment: true,
      createdBy: true,
      document: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return documentVersions.map((version) => {
    return {
      id: version.id,
      title: version.attachment.name,
      url: version.attachment.storageId,
      size: version.attachment.size,
      type: version.attachment.type,
      createdBy: version.createdBy.name,
      createdAt: version.createdAt,
      version: version.version,
      message: version.message ?? "",
    };
  });
}

export async function updateDocument(
  id: string,
  data: Prisma.DocumentUpdateInput
) {
  const document = await prisma.document.update({ where: { id }, data });
  return document;
}

export async function deleteDocument({ id }: { id: string }) {
  try {
    await prisma.documentVersion.deleteMany({ where: { documentId: id } });
    return await prisma.document.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to delete document:", error);
    throw new Error("Failed to delete document");
  }
}

export async function createNewFolder({ name }: { name: string }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return;
    }

    return await prisma.documentFolder.create({
      data: {
        title: name,
        createdById: session.user.id,
      },
    });
  } catch (error) {
    console.error("Failed to create Folder:", error);
    throw new Error("Failed to create Folder");
  }
}

export async function getFolders(): Promise<DocumentFolder[]> {
  const folders = await prisma.documentFolder.findMany({
    select: {
      id: true,
      createdById: true,
      createdBy: true,
      title: true,
      createdAt: true,
      isRestricted: true,
      inviteToken: true,
      shares: {
        select: {
          user: {
            select: { name: true, id: true, email: true },
          },
          permission: true,
        },
      },
    },
  });

  return folders.map((f) => ({
    id: f.id,
    name: f.title,
    owner: f.createdBy.name,
    lastModified: f.createdAt,
    isRestricted: f.isRestricted,
    ownerId: f.createdById,
    inviteToken: f.inviteToken,
    shared: f.shares.map((share) => ({
      id: share.user.id,
      name: share.user.name,
      email: share.user.email,
      permission: share.permission,
    })),
  }));
}

export async function getDocuments({ id }: { id: string }) {
  const folder = await prisma.documentFolder.findUnique({
    where: { id },
    select: {
      title: true,
      documents: {
        include: {
          documentFolder: {
            select: { id: true },
          },
          documentVersions: {
            select: {
              attachment: true,
              createdBy: true,
              version: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc", // Ensure latest version is first
            },
            take: 1, // Only get the latest version
          },
        },
      },
    },
  });

  if (!folder) {
    return null;
  }

  const documents = folder.documents.flatMap((document) => {
    const version = document.documentVersions[0];

    if (!version) return []; // skip documents without versions

    const { attachment, createdBy, version: ver, createdAt } = version;

    return [
      {
        archived: document.archived,
        category: document.category as DocumentCategory,
        createdBy: createdBy.name,
        createdById: createdBy.id,
        folderId: document.documentFolderId,
        id: document.id,
        size: attachment.size,
        title: document.title,
        type: attachment.type,
        updatedAt: createdAt,
        version: ver,
        url: attachment.storageId,
        filename: attachment.name,
      },
    ];
  });

  return {
    title: folder.title,
    documents,
  };
}

export async function checkFolderPermission({
  folderId,
  permissions,
}: {
  folderId: string;
  permissions: DocumentPermission;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return null;
  }

  // Check special role
  if (session.user.role?.includes("u1") || session.user.role?.includes("u2"))
    return true;

  // Check if the user is the owner
  const folder = await prisma.documentFolder.findUnique({
    where: { id: folderId },
    select: { createdById: true, isRestricted: true },
  });

  if (!folder) {
    return false;
  }

  if (!folder.isRestricted && permissions === "READ") {
    return true;
  }

  if (folder.createdById === session.user.id) {
    return true; // Owners always have full access
  }

  // Check shared permission
  const share = await prisma.folderShare.findUnique({
    where: {
      folderId_userId: {
        folderId,
        userId: session.user.id,
      },
    },
  });

  if (!share) {
    return false;
  }

  if (
    permissionLevels[share.permission as DocumentPermission] >=
    permissionLevels[permissions]
  ) {
    return true;
  }

  return false;
}

export async function shareDocuments({
  folderId,
  users,
}: {
  folderId: string;
  users: SelectedUser[];
}) {
  try {
    const folder = await prisma.documentFolder.findUnique({
      where: { id: folderId },
    });
    if (!folder) {
      throw new Error("Folder not found");
    }
    if (users.length === 0) {
      return { success: true, folderId, folderName: "", shared: [] };
    }

    const shareOps = users.map((user) =>
      prisma.folderShare.upsert({
        where: {
          folderId_userId: {
            folderId,
            userId: user.id,
          },
        },
        update: {
          permission: user.permission,
        },
        create: {
          folderId,
          userId: user.id,
          permission: user.permission,
        },
      })
    );

    await prisma.$transaction(shareOps);

    return {
      success: true,
      folderId,
      folderName: folder.title,
      shared: users.map((u) => ({ id: u.id, permission: u.permission })),
    };
  } catch (error) {
    console.error("Error sharing documents:", error);
    throw new Error("Failed to share documents");
  }
}

export async function updateRestrictions({
  folderId,
  isRestricted,
  inviteToken,
}: {
  folderId: string;
  isRestricted: boolean;
  inviteToken?: string | null;
}) {
  try {
    await prisma.documentFolder.update({
      where: { id: folderId },
      data: {
        isRestricted,
        ...(inviteToken !== undefined && { inviteToken }),
      },
    });
  } catch (error) {
    console.error("Error updating document restrictions:", error);
    throw new Error("Failed to update document restrictions");
  }
}

export async function deleteFolder({ folderId }: { folderId: string }) {
  try {
    await prisma.documentFolder.delete({ where: { id: folderId } });
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new Error("Failed to delete document");
  }
}

export async function findFolderName({ name }: { name: string }) {
  try {
    const folder = await prisma.documentFolder.findUnique({
      where: { title: name },
    });
    return folder;
  } catch (error) {
    console.error("Error finding document:", error);
    throw new Error("Failed to find document");
  }
}

export async function generateInviteLink({ folderId }: { folderId: string }) {
  try {
    const token = nanoid(16);
    const updated = await prisma.documentFolder.update({
      where: { id: folderId },
      data: {
        inviteToken: token,
      },
      select: {
        id: true,
        inviteToken: true,
      },
    });
    return updated;
  } catch {
    throw new Error("Failed to generate invite link");
  }
}

export async function removeInviteLink({ folderId }: { folderId: string }) {
  try {
    await prisma.documentFolder.update({
      where: { id: folderId },
      data: {
        inviteToken: null,
      },
    });
    return null;
  } catch {
    throw new Error("Failed to remove invite link");
  }
}

export async function acceptInviteLink({ token }: { token: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const folder = await prisma.documentFolder.findFirst({
    where: { inviteToken: token },
    include: { shares: true },
  });

  if (!folder) {
    throw new Error("Invalid or expired invite link");
  }

  if (folder.createdById === session.user.id) {
    return { message: "You are the owner of this folder", folderId: folder.id };
  }

  const alreadyShared = folder.shares.some(
    (user) => user.id === session.user.id
  );

  if (alreadyShared) {
    return { message: "Already has access", folderId: folder.id };
  }

  await prisma.documentFolder.update({
    where: { id: folder.id },
    data: {
      shares: {
        connect: {
          folderId_userId: {
            userId: session.user.id,
            folderId: folder.id,
          },
        },
      },
    },
  });

  return { message: "Access granted", folderId: folder.id };
}
