import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSession, getUserRole } from '../services/authService.js';
import { cancelAppointment, getAppointments } from '../services/bookingApi.js';

function OwnerDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadOwnerData() {
    setError('');

    try {
      const session = await getCurrentSession();
      if (!session?.user) {
        navigate('/auth/login');
        return;
      }

      const role = await getUserRole(session.user.id);
      if (role !== 'business_owner') {
        navigate('/bookings');
        return;
      }

      const data = await getAppointments();
      setAppointments(data.appointments);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOwnerData();
  }, []);

  const todayIso = new Date().toISOString().slice(0, 10);

  const totalBookingsToday = useMemo(
    () =>
      appointments.filter(
        (item) => item.date === todayIso && item.status !== 'cancelled'
      ).length,
    [appointments, todayIso]
  );

  const totalUpcomingBookings = useMemo(
    () =>
      appointments.filter(
        (item) => item.date >= todayIso && item.status !== 'cancelled'
      ).length,
    [appointments, todayIso]
  );

  const filteredAppointments = useMemo(() => {
    if (!filterDate) {
      return appointments;
    }
    return appointments.filter((item) => item.date === filterDate);
  }, [appointments, filterDate]);

  const handleCancel = async (appointmentId) => {
    setError('');
    setSuccess('');

    try {
      await cancelAppointment(appointmentId);
      setSuccess('Appointment cancelled successfully.');
      await loadOwnerData();
    } catch (cancelError) {
      setError(cancelError.message);
    }
  };

  if (loading) {
    return (
      <main className="container auth-page">
        <section className="auth-card">
          <h1>Loading owner dashboard...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="container owner-dashboard-page">
      <section className="owner-dashboard-header">
        <p className="eyebrow">Stage 4</p>
        <h1>Business Owner Dashboard</h1>
        <p>Monitor appointments, filter by date, and manage cancellations quickly.</p>
      </section>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      <section className="owner-stats-grid">
        <article className="owner-stat-card">
          <h2>{totalBookingsToday}</h2>
          <p>Total Bookings Today</p>
        </article>

        <article className="owner-stat-card">
          <h2>{totalUpcomingBookings}</h2>
          <p>Total Upcoming Bookings</p>
        </article>
      </section>

      <section className="owner-controls-card">
        <label>
          Filter by date
          <input
            type="date"
            value={filterDate}
            onChange={(event) => setFilterDate(event.target.value)}
          />
        </label>

        <button type="button" onClick={() => setFilterDate('')}>
          Clear Filter
        </button>
      </section>

      <section className="owner-list-card">
        <h2>Daily Appointments</h2>

        <div className="booking-list">
          {filteredAppointments.length === 0 && (
            <p className="booking-empty">No appointments found for the selected date.</p>
          )}

          {filteredAppointments.map((appointment) => (
            <article key={appointment.id} className="booking-item owner-booking-item">
              <div>
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

              {appointment.status !== 'cancelled' && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => handleCancel(appointment.id)}
                >
                  Cancel
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default OwnerDashboardPage;
