const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function publicRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

export async function getPublicBusinesses() {
  const data = await publicRequest('/api/public/businesses');
  return data.businesses;
}

export async function getPublicBookedSlots({ businessId, date }) {
  const params = new URLSearchParams({ businessId, date });
  const data = await publicRequest(`/api/public/availability?${params.toString()}`);
  return data.bookedSlots;
}

export async function createPublicAppointment(payload) {
  const data = await publicRequest('/api/public/appointments', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return data.appointment;
}
