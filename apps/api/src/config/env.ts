// apps/api/src/config/env.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .default('8080')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1000).max(65535)),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  SUPABASE_URL: isTest
    ? z.string().url().default('https://mock.supabase.co')
    : z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: isTest
    ? z.string().default('mock-service-role-key')
    : z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  GEMINI_API_KEY: isTest
    ? z.string().default('mock-gemini-api-key')
    : z.string().min(1, 'GEMINI_API_KEY is required'),
});

export type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formattedErrors = result.error.errors
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    
    console.error(`CRITICAL: Environment validation failed:\n${formattedErrors}`);

    if (process.env.NODE_ENV === 'test') {
      throw new Error(`Environment validation failed:\n${formattedErrors}`);
    }

    process.exit(1);
  }

  return result.data;
};

export const config: Env = parseEnv();