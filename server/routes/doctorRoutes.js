import express from 'express';
import {
  getAllDoctors,
  getDoctorById,
  getDoctorAvailability,
  updateDoctorProfile,
  updateDoctorSchedule
} from '../controllers/doctorController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);

// Protected routes (Doctor only)
router.put('/profile', protect, authorizeRoles('doctor'), updateDoctorProfile);
router.put('/schedule', protect, authorizeRoles('doctor'), updateDoctorSchedule);

export default router;
