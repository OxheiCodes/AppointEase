import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getBusinessOwners } from '../services/businessService.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (_req, res) => {
  try {
    const businesses = await getBusinessOwners();
    res.status(200).json({ businesses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
