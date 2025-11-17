import { createClient } from '@supabase/supabase-js';

/**
 * PUBLIC_INTERFACE
 * getSupabaseClient
 * Returns a singleton Supabase client instance configured using environment variables.
 * - REACT_APP_SUPABASE_URL: Supabase project URL (required)
 * - REACT_APP_SUPABASE_ANON_KEY: Supabase anonymous public key (required)
 *
 * Throws a descriptive error if variables are missing to avoid silent failures.
 */
let supabaseInstance = null;

export function getSupabaseClient() {
  /** This is a public function. Creates or returns the existing Supabase client. */
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Do not log secrets; only indicate missing configuration
    throw new Error(
      'Supabase configuration missing. Ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set.'
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  return supabaseInstance;
}
