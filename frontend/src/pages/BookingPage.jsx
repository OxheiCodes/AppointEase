import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSession, getUserRole } from '../services/authService.js';
import {
  cancelAppointment,
  createAppointment,
  getAppointments,
  getBookedSlots,
  getBusinessOwners,
  rescheduleAppointment
} from '../services/bookingApi.js';

const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00'
];

function BookingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [editingAppointmentId, setEditingAppointmentId] = useState('');
  const [editForm, setEditForm] = useState({ date: '', time: '' });
  const [form, setForm] = useState({
    businessId: '',
    date: '',
    time: ''
  });

  const availableSlots = useMemo(
    () => TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot)),
    [bookedSlots]
  );

  async function loadPageData() {
    setError('');

    try {
      const session = await getCurrentSession();
      if (!session?.user) {
        navigate('/auth/login');
        return;
      }

      const userRole = await getUserRole(session.user.id);
      setRole(userRole);

      const appointmentData = await getAppointments();
      setAppointments(appointmentData.appointments);

      if (userRole === 'customer') {
        const businessData = await getBusinessOwners();
        setBusinesses(businessData);
      }
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!form.businessId || !form.date || role !== 'customer') {
        setBookedSlots([]);
        return;
      }

      try {
        const slots = await getBookedSlots({
          businessId: form.businessId,
          date: form.date
        });
        setBookedSlots(slots);
      } catch (availabilityError) {
        setError(availabilityError.message);
      }
    };

    fetchAvailability();
  }, [form.businessId, form.date, role]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => {
      const next = { ...previous, [name]: value };
      if (name !== 'time') {
        next.time = '';
      }
      return next;
    });
    setSuccess('');
    setError('');
  };

  const handleCreateAppointment = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const appointment = await createAppointment(form);
      setSuccess('Appointment created successfully.');
      setAppointments((previous) => [appointment, ...previous]);
      setForm({ businessId: '', date: '', time: '' });
      setBookedSlots([]);
      await loadPageData();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    setError('');
    setSuccess('');

    try {
      await cancelAppointment(appointmentId);
      setSuccess('Appointment cancelled successfully.');
      await loadPageData();
    } catch (cancelError) {
      setError(cancelError.message);
    }
  };

  const startReschedule = (appointment) => {
    setEditingAppointmentId(appointment.id);
    setEditForm({
      date: appointment.date,
      time: appointment.time.slice(0, 5)
    });
    setSuccess('');
    setError('');
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((previous) => ({ ...previous, [name]: value }));
  };

  const saveReschedule = async (appointmentId) => {
    setError('');
    setSuccess('');

    try {
      await rescheduleAppointment(appointmentId, editForm);
      setSuccess('Appointment rescheduled successfully.');
      setEditingAppointmentId('');
      await loadPageData();
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  if (loading) {
    return (
      <main className="container auth-page">
        <section className="auth-card">
          <h1>Loading booking page...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="container booking-page">
      <section className="booking-header">
        <p className="eyebrow">Stage 3</p>
        <h1>Booking System</h1>
        <p>
          {role === 'business_owner'
            ? 'View all bookings for your business and cancel when needed.'
            : 'Book a slot and avoid conflicts with real-time availability.'}
        </p>
      </section>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      {role === 'customer' && (
        <section className="booking-card">
          <h2>Create Appointment</h2>

          <form onSubmit={handleCreateAppointment} className="booking-form">
            <label>
              Business
              <select
                name="businessId"
                value={form.businessId}
                onChange={handleFormChange}
                required
              >
                <option value="">Select a business</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.full_name || business.id}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                required
              />
            </label>

            <label>
              Available Slot
              <select
                name="time"
                value={form.time}
                onChange={handleFormChange}
                required
                disabled={availableSlots.length === 0}
              >
                <option value="">
                  {availableSlots.length === 0
                    ? 'No slots available'
                    : 'Select a slot'}
                </option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </section>
      )}

      <section className="booking-card">
        <h2>{role === 'business_owner' ? 'All Business Bookings' : 'My Bookings'}</h2>

        <div className="booking-list">
          {appointments.length === 0 && (
            <p className="booking-empty">No appointments yet.</p>
          )}

          {appointments.map((appointment) => (
            <article key={appointment.id} className="booking-item">
              <div>
                {appointment.guest_name && (
                  <p>
                    <strong>Guest:</strong> {appointment.guest_name}
                  </p>
                )}
                <p>
                  <strong>Date:</strong> {appointment.date}
                </p>
                <p>
                  <strong>Time:</strong> {appointment.time.slice(0, 5)}
                </p>
                <p>
                  <strong>Status:</strong> {appointment.status}
                </p>
              </div>

              <div className="booking-actions">
                {appointment.status !== 'cancelled' && (
                  <>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => startReschedule(appointment)}
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => handleCancel(appointment.id)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {editingAppointmentId && (
        <section className="booking-card">
          <h2>Reschedule Booking</h2>

          <div className="booking-form">
            <label>
              New Date
              <input type="date" name="date" value={editForm.date} onChange={handleEditChange} />
            </label>

            <label>
              New Time
              <select name="time" value={editForm.time} onChange={handleEditChange}>
                <option value="">Select a slot</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>

            <div className="booking-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setEditingAppointmentId('')}
              >
                Close
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => saveReschedule(editingAppointmentId)}
              >
                Save New Time
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default BookingPage;
