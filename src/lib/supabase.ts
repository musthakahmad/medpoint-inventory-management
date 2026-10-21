import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && publishableKey);
export const supabase = supabaseConfigured ? createClient(url, publishableKey) : null;

// Keep customer shop sessions separate from the owner/staff workspace session.
export const customerSupabase = supabaseConfigured
  ? createClient(url, publishableKey, { auth: { storageKey: 'medpoint-customer-auth' } })
  : null;
