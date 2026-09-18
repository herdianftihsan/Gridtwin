// apps/api/src/config/env.ts
import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load from apps/api/.env deterministically
const apiEnvPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: apiEnvPath });

const isTest = process.env.NODE_ENV === 'test';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = parseInt(val || '8080', 10);
      return isNaN(parsed) ? 8080 : parsed;
    }),
  FRONTEND_URL: z
    .string()
    .default(process.env.NODE_ENV === 'production' ? 'https://gridtwin-web.vercel.app' : 'http://localhost:3000,https://gridtwin-web.vercel.app')
    .transform((val) => val.split(',').map((url) => url.trim())),
  SUPABASE_URL: isTest
    ? z.string().url().default('https://mock.supabase.co')
    : z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: isTest
    ? z.string().default('mock-service-role-key')
    : z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  GEMINI_API_KEY: isTest
    ? z.string().default('mock-gemini-api-key')
    : z.string().optional(),
  GEMINI_MODEL: isTest
    ? z.string().default('gemini-3.5-flash-lite')
    : z.string().optional(),
  GEMINI_TIMEOUT_MS: z
    .string()
    .default('15000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1000).max(60000)),
  GEMINI_MAX_INPUT_CHARS: z
    .string()
    .default('2000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(100).max(10000)),
  GEMINI_MAX_OUTPUT_TOKENS: z
    .string()
    .default('500')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(50).max(4000)),
});

export type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formattedErrors = result.error.errors
      .map((err) => `Missing required environment variable: ${err.path.join('.')}`)
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