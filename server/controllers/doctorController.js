import mongoose from 'mongoose';
import DoctorProfile from '../models/DoctorProfile.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// Helper to calculate day of week in English
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
 * Generate time slots array between startTime and endTime
 * @param {string} startTime - HH:mm
 * @param {string} endTime - HH:mm
 * @param {number} durationMinutes - e.g. 30
 */
const generateTimeSlots = (startTime, endTime, durationMinutes = 30) => {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const finishMinutes = endH * 60 + endM;

  while (currentMinutes + durationMinutes <= finishMinutes) {
    const slotStartH = Math.floor(currentMinutes / 60);
    const slotStartM = currentMinutes % 60;
    const slotEndMins = currentMinutes + durationMinutes;
    const slotEndH = Math.floor(slotEndMins / 60);
    const slotEndM = slotEndMins % 60;

    const formatTime = (h, m) =>
      `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    slots.push({
      startTime: formatTime(slotStartH, slotStartM),
      endTime: formatTime(slotEndH, slotEndM)
    });

    currentMinutes += durationMinutes;
  }

  return slots;
};

/**
 * @desc   Get all doctors with optional search and specialization filters
 * @route  GET /api/doctors
 * @access Public
 */
export const getAllDoctors = async (req, res, next) => {
  try {
    const { search, specialization } = req.query;

    const query = {};

    if (specialization && specialization !== 'All') {
      query.specialization = new RegExp(`^${specialization}$`, 'i');
    }

    let doctors = await DoctorProfile.find(query).populate({
      path: 'userId',
      select: 'name email phone'
    });

    // If search term is present, filter by doctor name, clinic name, or specialization
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      doctors = doctors.filter((doc) => {
        const docName = doc.userId?.name?.toLowerCase() || '';
        const docSpec = doc.specialization?.toLowerCase() || '';
        const clinicName = doc.clinic?.name?.toLowerCase() || '';
        const clinicCity = doc.clinic?.city?.toLowerCase() || '';
        return (
          docName.includes(term) ||
          docSpec.includes(term) ||
          clinicName.includes(term) ||
          clinicCity.includes(term)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single doctor by ID (DoctorProfile ID)
 * @route  GET /api/doctors/:id
 * @access Public
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Doctor ID format.'
      });
    }

    const doctor = await DoctorProfile.findById(id).populate({
      path: 'userId',
      select: 'name email phone'
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get doctor availability and time slots for a given date
 * @route  GET /api/doctors/:id/availability
 * @access Public
 */
export const getDoctorAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Doctor ID format.'
      });
    }

    const doctor = await DoctorProfile.findById(id).populate({
      path: 'userId',
      select: 'name'
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.'
      });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date in YYYY-MM-DD format.'
      });
    }

    // Parse the given date
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = DAYS_OF_WEEK[targetDate.getDay()];

    // Check if the date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastDate = targetDate < today;

    // Check if doctor blocked this specific date
    const isDateBlocked = doctor.unavailableDates.includes(date);

    // Find schedule for this day of week
    const daySchedule = doctor.weeklySchedule.find(
      (s) => s.day.toLowerCase() === dayOfWeek.toLowerCase()
    );

    const isWorkingDay = daySchedule ? daySchedule.isAvailable : false;

    // If past date, blocked, or not a working day
    if (isPastDate) {
      return res.status(200).json({
        success: true,
        date,
        dayOfWeek,
        isAvailable: false,
        reason: 'Appointments cannot be booked for past dates.',
        slots: []
      });
    }

    if (isDateBlocked) {
      return res.status(200).json({
        success: true,
        date,
        dayOfWeek,
        isAvailable: false,
        reason: 'Doctor has marked this date as unavailable.',
        slots: []
      });
    }

    if (!isWorkingDay) {
      return res.status(200).json({
        success: true,
        date,
        dayOfWeek,
        isAvailable: false,
        reason: `Doctor is not scheduled to consult on ${dayOfWeek}s.`,
        slots: []
      });
    }

    // Generate potential slots
    const slotDuration = daySchedule.slotDuration || 30;
    const generatedSlots = generateTimeSlots(
      daySchedule.startTime,
      daySchedule.endTime,
      slotDuration
    );

    // Fetch existing active appointments for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctorId: doctor._id,
      appointmentDate: date,
      status: { $in: ['pending', 'confirmed'] }
    }).select('startTime endTime');

    const bookedTimes = new Set(bookedAppointments.map((a) => a.startTime));

    // Mark slots with booked status
    const slots = generatedSlots.map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBooked: bookedTimes.has(slot.startTime)
    }));

    return res.status(200).json({
      success: true,
      date,
      dayOfWeek,
      isAvailable: true,
      schedule: {
        startTime: daySchedule.startTime,
        endTime: daySchedule.endTime,
        slotDuration
      },
      availableSlotsCount: slots.filter((s) => !s.isBooked).length,
      totalSlotsCount: slots.length,
      slots
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update doctor profile
 * @route  PUT /api/doctors/profile
 * @access Private (Doctor only)
 */
export const updateDoctorProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      specialization,
      qualifications,
      experience,
      consultationFee,
      clinic,
      description
    } = req.body;

    // Update User model (name, phone)
    if (name || phone) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          ...(name && { name: name.trim() }),
          ...(phone && { phone: phone.trim() })
        },
        { runValidators: true }
      );
    }

    // Update DoctorProfile model
    const profile = await DoctorProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        ...(specialization && { specialization: specialization.trim() }),
        ...(qualifications && { qualifications: qualifications.trim() }),
        ...(experience !== undefined && { experience: Number(experience) }),
        ...(consultationFee !== undefined && {
          consultationFee: Number(consultationFee)
        }),
        ...(clinic && { clinic }),
        ...(description && { description: description.trim() })
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully.',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update doctor weekly schedule and unavailable dates
 * @route  PUT /api/doctors/schedule
 * @access Private (Doctor only)
 */
export const updateDoctorSchedule = async (req, res, next) => {
  try {
    const { weeklySchedule, unavailableDates } = req.body;

    const profile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.'
      });
    }

    if (weeklySchedule && Array.isArray(weeklySchedule)) {
      // Validate each day's schedule
      for (const dayItem of weeklySchedule) {
        if (!dayItem.day || !dayItem.startTime || !dayItem.endTime) {
          return res.status(400).json({
            success: false,
            message: 'Each schedule entry must contain day, startTime, and endTime.'
          });
        }
        if (dayItem.startTime >= dayItem.endTime) {
          return res.status(400).json({
            success: false,
            message: `Start time (${dayItem.startTime}) must be earlier than end time (${dayItem.endTime}) for ${dayItem.day}.`
          });
        }
      }
      profile.weeklySchedule = weeklySchedule;
    }

    if (unavailableDates && Array.isArray(unavailableDates)) {
      profile.unavailableDates = unavailableDates;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Schedule and availability updated successfully.',
      weeklySchedule: profile.weeklySchedule,
      unavailableDates: profile.unavailableDates
    });
  } catch (error) {
    next(error);
  }
};
