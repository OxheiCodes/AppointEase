import { jest } from '@jest/globals';

const mockGetServerSupabaseClient = jest.fn();
const mockGetUserProfileById = jest.fn();

jest.unstable_mockModule('../../config/supabase.js', () => ({
  getServerSupabaseClient: mockGetServerSupabaseClient
}));

jest.unstable_mockModule('../authService.js', () => ({
  getUserProfileById: mockGetUserProfileById
}));

const { createAppointment, rescheduleAppointment } = await import('../appointmentService.js');

function buildConflictQuery(result) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result)
  };
}

function buildInsertQuery(result) {
  return {
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result)
  };
}

describe('createAppointment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserProfileById.mockResolvedValue({ role: 'business_owner' });
  });

  test('blocks duplicate slot booking with 409', async () => {
    const conflictQuery = buildConflictQuery({ data: [{ id: 'a1' }], error: null });

    const supabase = {
      from: jest.fn().mockReturnValue(conflictQuery)
    };

    mockGetServerSupabaseClient.mockReturnValue(supabase);

    await expect(
      createAppointment({
        customerId: 'customer-1',
        businessId: 'business-1',
        date: '2026-04-02',
        time: '10:00'
      })
    ).rejects.toMatchObject({
      status: 409,
      message: 'This slot is already booked. Please choose another time.'
    });
  });

  test('creates guest booking when guest details are provided', async () => {
    const conflictQuery = buildConflictQuery({ data: [], error: null });
    const insertQuery = buildInsertQuery({
      data: {
        id: 'appt-1',
        business_id: 'business-1',
        guest_name: 'Jane Guest',
        guest_email: 'jane@example.com',
        date: '2026-04-02',
        time: '11:00',
        status: 'pending'
      },
      error: null
    });

    const supabase = {
      from: jest
        .fn()
        .mockReturnValueOnce(conflictQuery)
        .mockReturnValueOnce(insertQuery)
    };

    mockGetServerSupabaseClient.mockReturnValue(supabase);

    const result = await createAppointment({
      businessId: 'business-1',
      date: '2026-04-02',
      time: '11:00',
      guestName: 'Jane Guest',
      guestEmail: 'jane@example.com'
    });

    expect(result.id).toBe('appt-1');
    expect(result.guest_name).toBe('Jane Guest');
  });

  test('reschedules a booking and marks it confirmed', async () => {
    const existingQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'appt-1',
          user_id: 'customer-1',
          business_id: 'business-1',
          status: 'pending'
        },
        error: null
      })
    };

    const conflictQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null })
    };

    const updateQuery = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'appt-1',
          date: '2026-04-05',
          time: '14:00',
          status: 'confirmed'
        },
        error: null
      })
    };

    const supabase = {
      from: jest
        .fn()
        .mockReturnValueOnce(existingQuery)
        .mockReturnValueOnce(conflictQuery)
        .mockReturnValueOnce(updateQuery)
    };

    mockGetServerSupabaseClient.mockReturnValue(supabase);

    const result = await rescheduleAppointment({
      appointmentId: 'appt-1',
      userId: 'customer-1',
      date: '2026-04-05',
      time: '14:00'
    });

    expect(result.status).toBe('confirmed');
  });
});
