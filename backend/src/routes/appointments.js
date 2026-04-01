import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getUserProfileById } from '../services/authService.js';
import {
  cancelAppointment,
  createAppointment,
  getAppointmentsForUser,
  getBookedSlots,
  rescheduleAppointment
} from '../services/appointmentService.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const user = await getUserProfileById(req.authUser.id);
    const data = await getAppointmentsForUser({
      userId: req.authUser.id,
      role: user.role
    });

    res.status(200).json({ appointments: data, role: user.role });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
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

router.post('/', async (req, res) => {
  try {
    const user = await getUserProfileById(req.authUser.id);

    if (user.role !== 'customer') {
      return res
        .status(403)
        .json({ message: 'Only customers can create appointments.' });
    }

    const { businessId, date, time, contactEmail, contactPhone } = req.body;

    const appointment = await createAppointment({
      customerId: req.authUser.id,
      customerEmail: req.authUser.email,
      businessId,
      date,
      time,
      contactEmail,
      contactPhone
    });

    return res.status(201).json({ appointment });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const appointment = await cancelAppointment({
      appointmentId: req.params.id,
      userId: req.authUser.id
    });

    res.status(200).json({ appointment });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const appointment = await rescheduleAppointment({
      appointmentId: req.params.id,
      userId: req.authUser.id,
      date: req.body.date,
      time: req.body.time
    });

    res.status(200).json({ appointment });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

export default router;
