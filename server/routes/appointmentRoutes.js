import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment
} from '../controllers/appointmentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Patient routes
router.post('/', protect, authorizeRoles('patient'), createAppointment);
router.get('/my', protect, authorizeRoles('patient'), getMyAppointments);

// Doctor routes
router.get('/doctor', protect, authorizeRoles('doctor'), getDoctorAppointments);
router.patch('/:id/status', protect, authorizeRoles('doctor'), updateAppointmentStatus);

// Shared actions (Patient or Doctor)
router.patch('/:id/reschedule', protect, rescheduleAppointment);
router.patch('/:id/cancel', protect, cancelAppointment);

export default router;
