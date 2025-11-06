import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createSwapRequest, respondSwapRequest, getMySwapRequests } from '../controllers/swap.controller';

const router = Router();

router.use(authMiddleware);

router.post('/request', createSwapRequest);
router.post('/response/:requestId', respondSwapRequest);
router.get('/my-requests', getMySwapRequests);

export default router;
