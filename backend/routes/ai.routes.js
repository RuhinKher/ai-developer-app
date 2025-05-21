import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { body } from 'express-validator';
import { authUser } from '../middleware/auth.middleware.js';

const router = Router();

// Your existing route
router.get('/get-result', aiController.getResult);

// ✅ NEW: POST /review
router.post('/review',
    authUser,
    body('code').isString().withMessage('Code is required'),
    aiController.reviewCodeWithGemini
);

export default router;
