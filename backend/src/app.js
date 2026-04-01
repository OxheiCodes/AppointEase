import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import appointmentsRouter from './routes/appointments.js';
import businessesRouter from './routes/businesses.js';
import publicBookingRouter from './routes/publicBooking.js';

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const isExplicitlyAllowed = allowedOrigins.includes(origin);
      const isVercelPreview = origin.endsWith('.vercel.app');

      if (isExplicitlyAllowed || isVercelPreview) {
        return callback(null, true);
      }

      return callback(new Error('CORS origin not allowed.'));
    }
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'AppointEase Now API is running' });
});

app.use('/api/health', healthRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/businesses', businessesRouter);
app.use('/api/public', publicBookingRouter);

export default app;
