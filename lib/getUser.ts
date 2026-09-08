import { getToken } from 'next-auth/jwt';
import { prisma } from './prisma';

export async function getUserFromRequest(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: token.email as string },
    include: {
      publisher: true,
      author: true,
    },
  });
  return user;
}