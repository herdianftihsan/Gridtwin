export const env = {
  NEXT_PUBLIC_API_URL: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:4000',
  NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '',
} as const;