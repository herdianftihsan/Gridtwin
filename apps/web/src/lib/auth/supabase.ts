import { createClient } from '@supabase/supabase-js';
import { env } from '../env/env';

export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
);