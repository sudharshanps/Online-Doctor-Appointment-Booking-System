import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';
import { doctorsData, patientsData } from './seedData.js';

export const runSeed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Cleaning existing data...');
    await Appointment.deleteMany({});
    await DoctorProfile.deleteMany({});
    await User.deleteMany({});

    // Hash common demo password
    const commonPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(commonPassword, salt);

    console.log('[Seed] Seeding doctors...');
    const createdDoctors = [];

    for (const doc of doctorsData) {
      // 1. Create User
      const user = await User.create({
        name: doc.name,
        email: doc.email.toLowerCase(),
        passwordHash,
        role: 'doctor',
        phone: doc.phone
      });

      // 2. Create DoctorProfile
      const profile = await DoctorProfile.create({
        userId: user._id,
        specialization: doc.specialization,
        qualifications: doc.qualifications,
        experience: doc.experience,
        consultationFee: doc.consultationFee,
        clinic: doc.clinic,
        description: doc.description,
        weeklySchedule: doc.weeklySchedule,
        unavailableDates: doc.unavailableDates
      });

      createdDoctors.push({ user, profile });
    }
    console.log(`[Seed] Created ${createdDoctors.length} doctors.`);

    console.log('[Seed] Seeding patients...');
    const createdPatients = [];
    for (const patient of patientsData) {
      const user = await User.create({
        name: patient.name,
        email: patient.email.toLowerCase(),
        passwordHash,
        role: 'patient',
        phone: patient.phone
      });
      createdPatients.push(user);
    }
    console.log(`[Seed] Created ${createdPatients.length} patients.`);

    // Helper to format date offset
    const getFutureDateString = (daysOffset) => {
      const d = new Date();
      d.setDate(d.getDate() + daysOffset);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const getPastDateString = (daysOffset) => {
      const d = new Date();
      d.setDate(d.getDate() - daysOffset);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    console.log('[Seed] Seeding sample appointments...');

    const sampleAppointments = [
      // Upcoming Confirmed
      {
        patientId: createdPatients[0]._id,
        doctorId: createdDoctors[0].profile._id, // Dr. Priya Sharma (Cardiology)
        appointmentDate: getFutureDateString(2),
        startTime: '10:00',
        endTime: '10:30',
        reason: 'Annual heart checkup and blood pressure monitoring.',
        status: 'confirmed',
        doctorNotes: 'Please bring past ECG reports.'
      },
      // Upcoming Pending
      {
        patientId: createdPatients[1]._id,
        doctorId: createdDoctors[1].profile._id, // Dr. Rajesh Venkataraman (Neurology)
        appointmentDate: getFutureDateString(3),
        startTime: '11:00',
        endTime: '11:30',
        reason: 'Recurrent morning headaches and visual aura over the past two weeks.',
        status: 'pending'
      },
      // Upcoming Confirmed
      {
        patientId: createdPatients[2]._id,
        doctorId: createdDoctors[2].profile._id, // Dr. Ananya Nair (Dermatology)
        appointmentDate: getFutureDateString(4),
        startTime: '14:00',
        endTime: '14:30',
        reason: 'Persistent skin rash and allergy flare-up.',
        status: 'confirmed',
        doctorNotes: 'Avoid applying topical steroid cream 24 hours prior to consultation.'
      },
      // Past Completed
      {
        patientId: createdPatients[0]._id,
        doctorId: createdDoctors[3].profile._id, // Dr. Arjun Mehta (Orthopedics)
        appointmentDate: getPastDateString(5),
        startTime: '09:30',
        endTime: '10:00',
        reason: 'Post-running right knee soreness and swelling.',
        status: 'completed',
        doctorNotes: 'Diagnosed mild patellofemoral strain. Prescribed 10 days of physiotherapy and joint mobility exercises.'
      },
      // Past Completed
      {
        patientId: createdPatients[3]._id,
        doctorId: createdDoctors[4].profile._id, // Dr. Kavita Reddy (Pediatrics)
        appointmentDate: getPastDateString(10),
        startTime: '10:30',
        endTime: '11:00',
        reason: 'Child routine wellness screening and 5-year vaccination booster.',
        status: 'completed',
        doctorNotes: 'Growth milestones normal. Administered booster vaccine without acute reactions.'
      },
      // Cancelled appointment
      {
        patientId: createdPatients[4]._id,
        doctorId: createdDoctors[0].profile._id, // Dr. Priya Sharma
        appointmentDate: getFutureDateString(5),
        startTime: '11:30',
        endTime: '12:00',
        reason: 'Routine consultation (Patient had to travel on office duty).',
        status: 'cancelled',
        doctorNotes: 'Cancelled upon patient request.'
      }
    ];

    for (const appt of sampleAppointments) {
      await Appointment.create(appt);
    }

    console.log(`[Seed] Created ${sampleAppointments.length} sample appointments across multiple states.`);
    console.log('------------------------------------------------------------');
    console.log(' Seeding completed successfully!');
    console.log(' All demo accounts use password: password123');
    console.log(' Demo Doctors:');
    createdDoctors.forEach((d) => console.log(`   - ${d.user.email} (${d.profile.specialization})`));
    console.log(' Demo Patients:');
    createdPatients.forEach((p) => console.log(`   - ${p.email}`));
    console.log('------------------------------------------------------------');
  } catch (error) {
    console.error(`[Seed] Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

// If run directly
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed().then(async () => {
    await closeDB();
    process.exit(0);
  });
}
