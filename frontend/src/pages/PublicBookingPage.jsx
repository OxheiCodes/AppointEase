import { useEffect, useMemo, useState } from 'react';
import {
  createPublicAppointment,
  getPublicBookedSlots,
  getPublicBusinesses
} from '../services/publicBookingApi.js';

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

function PublicBookingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [form, setForm] = useState({
    businessId: '',
    date: '',
    time: '',
    guestName: '',
    guestEmail: ''
  });

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const data = await getPublicBusinesses();
        setBusinesses(data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!form.businessId || !form.date) {
        setBookedSlots([]);
        return;
      }

      try {
        const slots = await getPublicBookedSlots({
          businessId: form.businessId,
          date: form.date
        });
        setBookedSlots(slots);
      } catch (availabilityError) {
        setError(availabilityError.message);
      }
    };

    loadAvailability();
  }, [form.businessId, form.date]);

  const availableSlots = useMemo(
    () => TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot)),
    [bookedSlots]
  );

  const selectedBusiness = businesses.find((item) => item.id === form.businessId);

  const updateField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setError('');
  };

  const goToStep2 = () => {
    if (!form.businessId) {
      setError('Please select a business first.');
      return;
    }
    setError('');
    setStep(2);
  };

  const goToStep3 = () => {
    if (!form.date || !form.time) {
      setError('Please choose date and time to continue.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await createPublicAppointment(form);
      setSuccess('Booking confirmed. Your appointment request has been submitted.');
      setStep(4);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
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
    <main className="container public-booking-page">
      <section className="public-booking-header">
        <p className="eyebrow">Stage 5</p>
        <h1>Public Booking</h1>
        <p>Simple 3-step flow: choose business, choose slot, confirm details.</p>
      </section>

      <section className="step-indicator" aria-label="Booking steps">
        <span className={step >= 1 ? 'step-pill active' : 'step-pill'}>1. Business</span>
        <span className={step >= 2 ? 'step-pill active' : 'step-pill'}>2. Slot</span>
        <span className={step >= 3 ? 'step-pill active' : 'step-pill'}>3. Confirm</span>
      </section>

      {error && <p className="form-error">{error}</p>}
      {success && step !== 4 && <p className="form-success">{success}</p>}

      {step === 1 && (
        <section className="public-step-card">
          <h2>Step 1: Select Business</h2>

          <label>
            Business
            <select
              value={form.businessId}
              onChange={(event) => updateField('businessId', event.target.value)}
            >
              <option value="">Select a business</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.full_name || business.id}
                </option>
              ))}
            </select>
          </label>

          <button type="button" onClick={goToStep2}>
            Next: Choose Slot
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="public-step-card">
          <h2>Step 2: Choose Date and Time</h2>

          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
            />
          </label>

          <label>
            Time Slot
            <select
              value={form.time}
              onChange={(event) => updateField('time', event.target.value)}
              disabled={availableSlots.length === 0}
            >
              <option value="">
                {availableSlots.length === 0 ? 'No slots available' : 'Select a slot'}
              </option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>

          <div className="step-actions">
            <button type="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" onClick={goToStep3}>
              Next: Confirm
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="public-step-card">
          <h2>Step 3: Confirm Booking</h2>

          <div className="booking-summary">
            <p>
              <strong>Business:</strong> {selectedBusiness?.full_name || 'Not selected'}
            </p>
            <p>
              <strong>Date:</strong> {form.date}
            </p>
            <p>
              <strong>Time:</strong> {form.time}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="public-confirm-form">
            <label>
              Your Name
              <input
                type="text"
                value={form.guestName}
                onChange={(event) => updateField('guestName', event.target.value)}
                required
              />
            </label>

            <label>
              Your Email
              <input
                type="email"
                value={form.guestEmail}
                onChange={(event) => updateField('guestEmail', event.target.value)}
                required
              />
            </label>

            <div className="step-actions">
              <button type="button" onClick={() => setStep(2)}>
                Back
              </button>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </section>
      )}

      {step === 4 && (
        <section className="public-step-card confirmation-card">
          <h2>Booking Confirmed</h2>
          <p>{success}</p>
          <p>
            We saved your request for <strong>{form.date}</strong> at <strong>{form.time}</strong>.
          </p>
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setSuccess('');
              setForm({
                businessId: '',
                date: '',
                time: '',
                guestName: '',
                guestEmail: ''
              });
            }}
          >
            Book Another Appointment
          </button>
        </section>
      )}
    </main>
  );
}

export default PublicBookingPage;
