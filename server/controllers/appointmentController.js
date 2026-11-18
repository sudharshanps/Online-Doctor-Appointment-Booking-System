import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import DoctorProfile from '../models/DoctorProfile.js';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

/**
 * @desc   Book a new appointment
 * @route  POST /api/appointments
 * @access Private (Patient)
 */
export const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, startTime, endTime, reason } = req.body;
    const patientId = req.user._id;

    if (!doctorId || !appointmentDate || !startTime || !endTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, appointmentDate, startTime, endTime, and reason.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Doctor ID format.'
      });
    }

    // Check if doctor exists
    const doctor = await DoctorProfile.findById(doctorId).populate('userId', 'name');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.'
      });
    }

    // Validate that the date is not in the past
    const [year, month, day] = appointmentDate.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule appointments for past dates.'
      });
    }

    // Check if doctor is unavailable on this date
    if (doctor.unavailableDates.includes(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: 'The selected doctor is unavailable on this date.'
      });
    }

    // Check doctor schedule for the day
    const dayOfWeek = DAYS_OF_WEEK[targetDate.getDay()];
    const daySchedule = doctor.weeklySchedule.find(
      (s) => s.day.toLowerCase() === dayOfWeek.toLowerCase()
    );

    if (!daySchedule || !daySchedule.isAvailable) {
      return res.status(400).json({
        success: false,
        message: `The doctor does not accept appointments on ${dayOfWeek}s.`
      });
    }

    // Check if slot falls within working hours
    if (startTime < daySchedule.startTime || endTime > daySchedule.endTime) {
      return res.status(400).json({
        success: false,
        message: `Requested slot (${startTime}-${endTime}) is outside doctor consultation hours (${daySchedule.startTime}-${daySchedule.endTime}).`
      });
    }

    // Double-booking check: Check if an active appointment already exists for this doctor & time slot
    const existingSlotBooking = await Appointment.findOne({
      doctorId: doctor._id,
      appointmentDate,
      startTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingSlotBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already reserved. Please select another slot.'
      });
    }

    // Create the appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId: doctor._id,
      appointmentDate,
      startTime,
      endTime,
      reason: reason.trim(),
      status: 'pending'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' }
      });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: populatedAppointment
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot was just reserved by another patient. Please select another slot.'
      });
    }
    next(error);
  }
};

/**
 * @desc   Get appointments for the logged-in patient
 * @route  GET /api/appointments/my
 * @access Private (Patient)
 */
export const getMyAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { patientId: req.user._id };

    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ appointmentDate: -1, startTime: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get appointments for the logged-in doctor
 * @route  GET /api/appointments/doctor
 * @access Private (Doctor)
 */
export const getDoctorAppointments = async (req, res, next) => {
  try {
    // Find doctor profile for this user
    const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found for this account.'
      });
    }

    const { status, date } = req.query;
    const query = { doctorId: doctorProfile._id };

    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    if (date) {
      query.appointmentDate = date;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ appointmentDate: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Doctor updates appointment status (confirmed, rejected, completed)
 * @route  PATCH /api/appointments/:id/status
 * @access Private (Doctor)
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, doctorNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Appointment ID format.'
      });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only registered doctors can update consultation status.'
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    // Verify doctor ownership
    if (appointment.doctorId.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This appointment is not assigned to you.'
      });
    }

    // Validate valid transitions
    const validStatuses = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`
      });
    }

    if (['completed', 'cancelled', 'rejected'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of an appointment that is already ${appointment.status}.`
      });
    }

    appointment.status = status;
    if (doctorNotes !== undefined) {
      appointment.doctorNotes = doctorNotes.trim();
    }

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' }
      });

    return res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Reschedule an existing appointment
 * @route  PATCH /api/appointments/:id/reschedule
 * @access Private (Patient or Doctor)
 */
export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, newStartTime, newEndTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Appointment ID format.'
      });
    }

    if (!newDate || !newStartTime || !newEndTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide newDate, newStartTime, and newEndTime.'
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    // Verify ownership: either patient or assigned doctor
    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    let isAssignedDoctor = false;

    if (req.user.role === 'doctor') {
      const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });
      if (doctorProfile && appointment.doctorId.toString() === doctorProfile._id.toString()) {
        isAssignedDoctor = true;
      }
    }

    if (!isPatient && !isAssignedDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to reschedule this appointment.'
      });
    }

    if (['completed', 'cancelled', 'rejected'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule an appointment that is already ${appointment.status}.`
      });
    }

    // Validate that newDate is not in the past
    const [year, month, day] = newDate.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule appointments to past dates.'
      });
    }

    // Verify doctor availability on new date
    const doctor = await DoctorProfile.findById(appointment.doctorId);
    if (doctor.unavailableDates.includes(newDate)) {
      return res.status(400).json({
        success: false,
        message: 'The doctor is unavailable on the chosen date.'
      });
    }

    const dayOfWeek = DAYS_OF_WEEK[targetDate.getDay()];
    const daySchedule = doctor.weeklySchedule.find(
      (s) => s.day.toLowerCase() === dayOfWeek.toLowerCase()
    );

    if (!daySchedule || !daySchedule.isAvailable) {
      return res.status(400).json({
        success: false,
        message: `The doctor does not consult on ${dayOfWeek}s.`
      });
    }

    if (newStartTime < daySchedule.startTime || newEndTime > daySchedule.endTime) {
      return res.status(400).json({
        success: false,
        message: `The requested time (${newStartTime}-${newEndTime}) is outside consultation hours.`
      });
    }

    // Check if new slot conflicts with an active appointment (excluding current appointment)
    const conflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctorId: appointment.doctorId,
      appointmentDate: newDate,
      startTime: newStartTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'The chosen reschedule slot is already booked. Please choose another slot.'
      });
    }

    appointment.appointmentDate = newDate;
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;
    // Reset to pending if patient rescheduled, or keep confirmed if doctor rescheduled
    appointment.status = req.user.role === 'doctor' ? 'confirmed' : 'pending';

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' }
      });

    return res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully.',
      data: updated
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'The selected slot was just reserved by another patient. Please choose another.'
      });
    }
    next(error);
  }
};

/**
 * @desc   Cancel an appointment (releases the slot)
 * @route  PATCH /api/appointments/:id/cancel
 * @access Private (Patient or Doctor)
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Appointment ID format.'
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    // Verify ownership: either patient or assigned doctor
    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    let isAssignedDoctor = false;

    if (req.user.role === 'doctor') {
      const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });
      if (doctorProfile && appointment.doctorId.toString() === doctorProfile._id.toString()) {
        isAssignedDoctor = true;
      }
    }

    if (!isPatient && !isAssignedDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only cancel your own appointments.'
      });
    }

    if (['completed', 'cancelled', 'rejected'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `This appointment is already ${appointment.status}.`
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' }
      });

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully. The time slot is now available.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
