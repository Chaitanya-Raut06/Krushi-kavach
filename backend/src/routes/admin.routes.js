import express from 'express';
import { listFarmers, listAgronomists, assignLocations } from '../controllers/admin.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect, authorizeRoles('admin'));

router.get('/farmers', listFarmers);
router.get('/agronomists', listAgronomists);
router.put('/agronomist/:id/assign-locations', assignLocations);

export default router;
