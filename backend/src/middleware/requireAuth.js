import { getServerSupabaseClient } from '../config/supabase.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (!token) {
      return res.status(401).json({ message: 'Missing auth token.' });
    }

    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ message: 'Invalid or expired auth token.' });
    }

    req.authUser = data.user;
    return next();
  } catch (authError) {
    return res.status(500).json({ message: authError.message });
  }
}
