import { Router } from 'express';
import { getBusinessOwners } from '../services/businessService.js';
import {
  createAppointment,
  getBookedSlots
} from '../services/appointmentService.js';
import { registerUser } from '../services/registrationService.js';

const router = Router();

router.post('/auth/register', async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.get('/businesses', async (_req, res) => {
  try {
    const businesses = await getBusinessOwners();
    res.status(200).json({ businesses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/availability', async (req, res) => {
  try {
    const { businessId, date } = req.query;
    const bookedSlots = await getBookedSlots({ businessId, date });
    res.status(200).json({ bookedSlots });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.post('/appointments', async (req, res) => {
  try {
    const { businessId, date, time, guestName, guestEmail } = req.body;

    const appointment = await createAppointment({
      businessId,
      date,
      time,
      guestName,
      guestEmail
    });

    res.status(201).json({ appointment });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

export default router;
