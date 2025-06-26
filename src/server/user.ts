"use server";

import prisma from "@/lib/prisma";

export async function getUserById(params: { userId: string }) {
  return await prisma.user.findUnique({
    where: {
      id: params.userId,
    },
  });
}
