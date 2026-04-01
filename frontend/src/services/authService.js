import { getSupabaseClient } from './supabaseClient.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function signUpUser({ fullName, email, password, role }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fullName, email, password, role })
    });

    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : {};

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed.');
    }

    return data;
  } catch (error) {
    const isNetworkError =
      error instanceof TypeError ||
      String(error.message || '').toLowerCase().includes('failed to fetch');

    if (!isNetworkError) {
      throw error;
    }

    const supabase = getSupabaseClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role
        }
      }
    });

    if (signUpError) {
      throw new Error(
        `Signup failed. Backend unreachable and Supabase fallback failed: ${signUpError.message}`
      );
    }

    return data;
  }
}

export async function signInUser({ email, password }) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOutUser() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export function onAuthStateChange(callback) {
  const supabase = getSupabaseClient();
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
}

export async function getUserRole(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.role;
}
