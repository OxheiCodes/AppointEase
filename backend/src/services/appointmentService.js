import { getServerSupabaseClient } from '../config/supabase.js';
import { getUserProfileById } from './authService.js';

function appError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function createAppointment({
  customerId,
  businessId,
  date,
  time,
  guestName,
  guestEmail
}) {
  const supabase = getServerSupabaseClient();

  if (!businessId || !date || !time) {
    throw appError('businessId, date, and time are required.', 400);
  }

  const isCustomerBooking = Boolean(customerId);

  if (!isCustomerBooking && (!guestName || !guestEmail)) {
    throw appError('guestName and guestEmail are required for public bookings.', 400);
  }

  const businessProfile = await getUserProfileById(businessId);
  if (!businessProfile || businessProfile.role !== 'business_owner') {
    throw appError('Selected business is invalid.', 400);
  }

  const { data: conflicting, error: conflictError } = await supabase
    .from('appointments')
    .select('id')
    .eq('business_id', businessId)
    .eq('date', date)
    .eq('time', time)
    .in('status', ['pending', 'confirmed'])
    .limit(1);

  if (conflictError) {
    throw appError(conflictError.message, 500);
  }

  if (conflicting.length > 0) {
    throw appError('This slot is already booked. Please choose another time.', 409);
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      user_id: isCustomerBooking ? customerId : null,
      business_id: businessId,
      date,
      time,
      status: 'pending',
      guest_name: isCustomerBooking ? null : guestName,
      guest_email: isCustomerBooking ? null : guestEmail
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw appError('This slot is already booked. Please choose another time.', 409);
    }
    throw appError(error.message, 500);
  }

  return data;
}

export async function getAppointmentsForUser({ userId, role }) {
  const supabase = getServerSupabaseClient();

  const baseQuery = supabase
    .from('appointments')
    .select('id, user_id, business_id, guest_name, guest_email, date, time, status, created_at')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  const { data, error } =
    role === 'business_owner'
      ? await baseQuery.eq('business_id', userId)
      : await baseQuery.eq('user_id', userId);

  if (error) {
    throw appError(error.message, 500);
  }

  return data;
}

export async function getBookedSlots({ businessId, date }) {
  const supabase = getServerSupabaseClient();

  if (!businessId || !date) {
    throw appError('businessId and date are required.', 400);
  }

  const { data, error } = await supabase
    .from('appointments')
    .select('time, status')
    .eq('business_id', businessId)
    .eq('date', date)
    .in('status', ['pending', 'confirmed']);

  if (error) {
    throw appError(error.message, 500);
  }

  return data.map((item) => item.time.slice(0, 5));
}

export async function cancelAppointment({ appointmentId, userId }) {
  const supabase = getServerSupabaseClient();

  const { data: existing, error: existingError } = await supabase
    .from('appointments')
    .select('id, user_id, business_id, status')
    .eq('id', appointmentId)
    .single();

  if (existingError || !existing) {
    throw appError('Appointment not found.', 404);
  }

  const isAllowed =
    existing.user_id === userId || existing.business_id === userId;

  if (!isAllowed) {
    throw appError('You are not allowed to cancel this appointment.', 403);
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)
    .select('id, user_id, business_id, guest_name, guest_email, date, time, status, created_at')
    .single();

  if (error) {
    throw appError(error.message, 500);
  }

  return data;
}

export async function rescheduleAppointment({ appointmentId, userId, date, time }) {
  const supabase = getServerSupabaseClient();

  if (!date || !time) {
    throw appError('date and time are required.', 400);
  }

  const { data: existing, error: existingError } = await supabase
    .from('appointments')
    .select('id, user_id, business_id, status')
    .eq('id', appointmentId)
    .single();

  if (existingError || !existing) {
    throw appError('Appointment not found.', 404);
  }

  const isAllowed =
    existing.user_id === userId || existing.business_id === userId;

  if (!isAllowed) {
    throw appError('You are not allowed to reschedule this appointment.', 403);
  }

  const { data: conflicting, error: conflictError } = await supabase
    .from('appointments')
    .select('id')
    .eq('business_id', existing.business_id)
    .eq('date', date)
    .eq('time', time)
    .in('status', ['pending', 'confirmed'])
    .neq('id', appointmentId)
    .limit(1);

  if (conflictError) {
    throw appError(conflictError.message, 500);
  }

  if (conflicting.length > 0) {
    throw appError('This slot is already booked. Please choose another time.', 409);
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({
      date,
      time,
      status: 'confirmed'
    })
    .eq('id', appointmentId)
    .select('id, user_id, business_id, guest_name, guest_email, date, time, status, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw appError('This slot is already booked. Please choose another time.', 409);
    }
    throw appError(error.message, 500);
  }

  return data;
}
