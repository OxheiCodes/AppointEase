import { getCurrentSession } from './authService.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function getAccessToken() {
  const session = await getCurrentSession();
  if (!session?.access_token) {
    throw new Error('You must be logged in to continue.');
  }
  return session.access_token;
}

async function apiRequest(path, options = {}) {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

export async function getBusinessOwners() {
  const data = await apiRequest('/api/businesses');
  return data.businesses;
}

export async function getAppointments() {
  const data = await apiRequest('/api/appointments');
  return data;
}

export async function getBookedSlots({ businessId, date }) {
  const params = new URLSearchParams({ businessId, date });
  const data = await apiRequest(`/api/appointments/availability?${params.toString()}`);
  return data.bookedSlots;
}

export async function createAppointment(payload) {
  const data = await apiRequest('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.appointment;
}

export async function cancelAppointment(appointmentId) {
  const data = await apiRequest(`/api/appointments/${appointmentId}`, {
    method: 'DELETE'
  });
  return data.appointment;
}

export async function rescheduleAppointment(appointmentId, payload) {
  const data = await apiRequest(`/api/appointments/${appointmentId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });

  return data.appointment;
}
