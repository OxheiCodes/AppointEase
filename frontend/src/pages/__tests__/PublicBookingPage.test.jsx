import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PublicBookingPage from '../PublicBookingPage.jsx';

vi.mock('../../services/publicBookingApi.js', () => ({
  getPublicBusinesses: vi.fn(),
  getPublicBookedSlots: vi.fn(),
  createPublicAppointment: vi.fn()
}));

import {
  createPublicAppointment,
  getPublicBookedSlots,
  getPublicBusinesses
} from '../../services/publicBookingApi.js';


describe('PublicBookingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPublicBusinesses.mockResolvedValue([
      { id: 'business-1', full_name: 'Salon Prime' }
    ]);
    getPublicBookedSlots.mockResolvedValue([]);
    createPublicAppointment.mockResolvedValue({ id: 'appt-1' });
  });

  test('walks through 3-step booking and shows confirmation', async () => {
    render(
      <MemoryRouter>
        <PublicBookingPage />
      </MemoryRouter>
    );

    await screen.findByText('Step 1: Select Business');

    fireEvent.change(screen.getByLabelText('Business'), {
      target: { value: 'business-1' }
    });
    fireEvent.click(screen.getByText('Next: Choose Slot'));

    await screen.findByText('Step 2: Choose Date and Time');

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2026-04-03' }
    });

    await waitFor(() => {
      expect(getPublicBookedSlots).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText('Time Slot'), {
      target: { value: '09:00' }
    });
    fireEvent.click(screen.getByText('Next: Confirm'));

    await screen.findByText('Step 3: Confirm Booking');

    fireEvent.change(screen.getByLabelText('Your Name'), {
      target: { value: 'Test Guest' }
    });
    fireEvent.change(screen.getByLabelText('Your Email'), {
      target: { value: 'guest@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Your Phone Number'), {
      target: { value: '5551230000' }
    });

    fireEvent.click(screen.getByText('Confirm Booking'));

    await screen.findByText('Booking Confirmed');
    expect(createPublicAppointment).toHaveBeenCalled();
  });

  test('shows validation message when moving ahead without business', async () => {
    render(
      <MemoryRouter>
        <PublicBookingPage />
      </MemoryRouter>
    );

    await screen.findByText('Step 1: Select Business');
    fireEvent.click(screen.getByText('Next: Choose Slot'));

    expect(screen.getByText('Please select a business first.')).toBeInTheDocument();
  });
});
