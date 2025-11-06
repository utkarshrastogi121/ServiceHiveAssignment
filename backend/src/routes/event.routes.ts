import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createEvent, getMyEvents, updateEvent, deleteEvent, getSwappableSlots } from '../controllers/event.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', createEvent);
router.get('/', getMyEvents);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

// marketplace
router.get('/swappable', getSwappableSlots);

export default router;
