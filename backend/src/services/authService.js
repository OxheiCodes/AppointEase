import { getServerSupabaseClient } from '../config/supabase.js';

export async function getUserProfileById(userId) {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
