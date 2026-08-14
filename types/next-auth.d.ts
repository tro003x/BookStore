import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role: string;
      publisherId?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
    publisherId?: string | null;
  }
}