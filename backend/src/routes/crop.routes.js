import express from 'express';
import { addCrop, getCrops, deleteCrop } from '../controllers/crop.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.use(authorizeRoles('farmer'));

router.post('/', addCrop);
router.get('/', getCrops);
router.delete('/:id', deleteCrop);

export default router;
