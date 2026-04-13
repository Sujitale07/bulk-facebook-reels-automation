import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

export async function getAuthenticatedUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0].emailAddress;

  // Sync with local DB if necessary
  let user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: email,
      }
    });
  }

  return user;
}
