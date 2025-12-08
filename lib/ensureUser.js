import { clerkClient } from "@clerk/nextjs/server";
import prisma from "./prisma";

export default async function ensureUser(userId) {
  if (!userId) return null;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const email = user?.emailAddresses?.[0]?.emailAddress || null;
    const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || null;
    const image = user?.profileImageUrl || user?.imageUrl || null;

    const dbUser = await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email,
        name,
        image,
      },
      update: {
        email,
        name,
        image,
      },
    });

    return dbUser;
  } catch (err) {
    console.error("ensureUser error:", err);
    return null;
  }
}
