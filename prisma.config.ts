import { defineConfig } from 'prisma/config';

export default defineConfig({
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    
    url: 'postgresql://postgres:5bl5V7KkCxlCXOrXaa@db.idklhpsivzxcmieoownk.supabase.co:5432/postgres?sslmode=no-verify',
  },
});