import { getServerSupabaseClient } from '../config/supabase.js';

function appError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function registerUser({ fullName, email, password, role }) {
  if (!fullName || !email || !password || !role) {
    throw appError('fullName, email, password, and role are required.', 400);
  }

  if (!['customer', 'business_owner'].includes(role)) {
    throw appError('Invalid role.', 400);
  }

  if (password.length < 6) {
    throw appError('Password must be at least 6 characters.', 400);
  }

  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role
    }
  });

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      throw appError('Email is already registered. Try logging in.', 409);
    }
    throw appError(error.message, 500);
  }

  return data.user;
}
