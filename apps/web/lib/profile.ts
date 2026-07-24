import { prisma } from "@/lib/prisma";

export async function getProfile(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateProfile(
  userId: string,
  data: { name?: string; image?: string | null },
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
