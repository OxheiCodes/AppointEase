import { getServerSupabaseClient } from '../config/supabase.js';

export async function getBusinessOwners() {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('role', 'business_owner')
    .order('full_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
