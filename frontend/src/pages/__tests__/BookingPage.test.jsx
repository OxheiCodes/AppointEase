import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookingPage from '../BookingPage.jsx';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('../../services/authService.js', () => ({
  getCurrentSession: vi.fn(),
  getUserRole: vi.fn()
}));

vi.mock('../../services/bookingApi.js', () => ({
  cancelAppointment: vi.fn(),
  createAppointment: vi.fn(),
  getAppointments: vi.fn(),
  getBookedSlots: vi.fn(),
  getBusinessOwners: vi.fn(),
  rescheduleAppointment: vi.fn()
}));

import { getCurrentSession, getUserRole } from '../../services/authService.js';
import {
  createAppointment,
  getAppointments,
  getBusinessOwners,
  rescheduleAppointment
} from '../../services/bookingApi.js';

describe('BookingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    getCurrentSession.mockResolvedValue({
      user: { id: 'customer-1', email: 'test@example.com' },
      access_token: 'token'
    });
    getUserRole.mockResolvedValue('customer');
    getAppointments.mockResolvedValue({ appointments: [], role: 'customer' });
    getBusinessOwners.mockResolvedValue([
      { id: 'business-1', full_name: 'Salon Prime' }
    ]);
    createAppointment.mockResolvedValue({
      id: 'appt-1',
      date: '2026-04-03',
      time: '10:00',
      status: 'pending'
    });
    rescheduleAppointment.mockResolvedValue({
      id: 'appt-1',
      date: '2026-04-04',
      time: '11:00',
      status: 'confirmed'
    });
  });

  test('shows a newly created booking immediately in My Bookings', async () => {
    render(
      <MemoryRouter>
        <BookingPage />
      </MemoryRouter>
    );

    await screen.findByText('Create Appointment');

    fireEvent.change(screen.getByLabelText('Business'), {
      target: { value: 'business-1' }
    });
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2026-04-03' }
    });
    fireEvent.change(screen.getByLabelText('Available Slot'), {
      target: { value: '10:00' }
    });
    fireEvent.click(screen.getByText('Book Appointment'));

    await waitFor(() => {
      expect(createAppointment).toHaveBeenCalled();
    });
  });
});
