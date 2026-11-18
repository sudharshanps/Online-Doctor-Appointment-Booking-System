import mongoose from 'mongoose';

const weeklyScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ]
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    startTime: {
      type: String,
      default: '09:00', // HH:mm format
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid start time format (HH:mm)']
    },
    endTime: {
      type: String,
      default: '17:00', // HH:mm format
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid end time format (HH:mm)']
    },
    slotDuration: {
      type: Number,
      default: 30, // in minutes
      min: [15, 'Slot duration must be at least 15 minutes'],
      max: [120, 'Slot duration cannot exceed 120 minutes']
    }
  },
  { _id: false }
);

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true
    },
    qualifications: {
      type: String,
      required: [true, 'Qualifications are required'],
      trim: true
    },
    experience: {
      type: Number,
      required: [true, 'Experience in years is required'],
      min: [0, 'Experience cannot be negative']
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Consultation fee cannot be negative']
    },
    clinic: {
      name: { type: String, default: 'MediLink Central Clinic', trim: true },
      address: { type: String, default: 'Suite 402, MediLink Health Plaza', trim: true },
      city: { type: String, default: 'Bengaluru', trim: true }
    },
    description: {
      type: String,
      trim: true,
      default: 'Experienced healthcare specialist committed to compassionate patient care.'
    },
    weeklySchedule: {
      type: [weeklyScheduleSchema],
      default: [
        { day: 'Monday', isAvailable: true, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
        { day: 'Tuesday', isAvailable: true, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
        { day: 'Wednesday', isAvailable: true, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
        { day: 'Thursday', isAvailable: true, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
        { day: 'Friday', isAvailable: true, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
        { day: 'Saturday', isAvailable: false, startTime: '09:00', endTime: '13:00', slotDuration: 30 },
        { day: 'Sunday', isAvailable: false, startTime: '09:00', endTime: '13:00', slotDuration: 30 }
      ]
    },
    unavailableDates: {
      type: [String], // Array of YYYY-MM-DD
      default: []
    }
  },
  {
    timestamps: true
  }
);

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);
export default DoctorProfile;
