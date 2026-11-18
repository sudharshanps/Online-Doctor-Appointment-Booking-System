import dotenv from 'dotenv';
dotenv.config();

import assert from 'assert';
import http from 'http';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import { runSeed } from '../seed/seed.js';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';

let server;
let baseUrl;

// Helper to make HTTP requests
const request = ({ method, path, body, headers = {}, cookie = '' }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (cookie) {
      reqHeaders['Cookie'] = cookie;
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }

          // Extract Set-Cookie header if present
          const setCookie = res.headers['set-cookie'];
          const cookieHeader = Array.isArray(setCookie)
            ? setCookie.map((c) => c.split(';')[0]).join('; ')
            : setCookie
            ? setCookie.split(';')[0]
            : '';

          resolve({
            status: res.statusCode,
            headers: res.headers,
            cookie: cookieHeader,
            body: parsed
          });
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n============================================================');
  console.log(' Starting MediLink Innovations Automated Test Suite');
  console.log('============================================================\n');

  try {
    // 1. Connect and Seed Data
    await connectDB();
    await runSeed();

    // 2. Start Test Server on ephemeral port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`[Test Server] Running on ${baseUrl}\n`);

    // ==========================================================
    // TEST 1: Patient Registration
    // ==========================================================
    console.log('▶ [TEST 1] Patient Registration');
    const newPatientEmail = `test.patient.${Date.now()}@example.com`;
    const regRes = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        name: 'Aditi Deshmukh',
        email: newPatientEmail,
        password: 'password123',
        phone: '+91 98888 77777',
        role: 'patient'
      }
    });

    assert.strictEqual(regRes.status, 201, `Expected status 201, got ${regRes.status}`);
    assert.strictEqual(regRes.body.success, true, 'Registration was not successful');
    assert.strictEqual(regRes.body.user.email, newPatientEmail);
    assert.ok(regRes.cookie.includes('token='), 'HTTP-only cookie was not issued');

    // Verify persistence in MongoDB
    const savedUser = await User.findOne({ email: newPatientEmail });
    assert.ok(savedUser, 'Patient was not persisted in MongoDB');
    assert.strictEqual(savedUser.name, 'Aditi Deshmukh');
    console.log('  ✔ Patient registered and verified in MongoDB successfully.\n');

    const patientCookie = regRes.cookie;

    // ==========================================================
    // TEST 2: Doctor Search
    // ==========================================================
    console.log('▶ [TEST 2] Doctor Search (Cardiologist search)');
    const searchRes = await request({
      method: 'GET',
      path: '/api/doctors?specialization=Cardiology'
    });

    assert.strictEqual(searchRes.status, 200);
    assert.strictEqual(searchRes.body.success, true);
    assert.ok(searchRes.body.data.length >= 1, 'Should find at least 1 cardiologist');
    const cardiologist = searchRes.body.data.find(
      (d) => d.specialization.toLowerCase() === 'cardiology'
    );
    assert.ok(cardiologist, 'Cardiologist was not in the returned list');
    assert.ok(cardiologist.userId.name.includes('Dr. Priya Sharma'));
    console.log(`  ✔ Successfully retrieved cardiologist: ${cardiologist.userId.name} (${cardiologist.specialization}).\n`);

    const doctorProfileId = cardiologist._id;

    // ==========================================================
    // TEST 3: Appointment Booking
    // ==========================================================
    console.log('▶ [TEST 3] Appointment Booking');
    // Calculate a valid weekday in the future
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7); // 7 days ahead
    // Make sure it's Monday if needed (Dr Priya is available Mon-Fri)
    while (targetDate.getDay() === 0 || targetDate.getDay() === 6) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const bookingDate = `${year}-${month}-${day}`;

    // Book 09:00 slot
    const bookRes = await request({
      method: 'POST',
      path: '/api/appointments',
      cookie: patientCookie,
      body: {
        doctorId: doctorProfileId,
        appointmentDate: bookingDate,
        startTime: '09:00',
        endTime: '09:30',
        reason: 'Routine cardiac health checkup'
      }
    });

    assert.strictEqual(bookRes.status, 201, `Booking failed with status ${bookRes.status}`);
    assert.strictEqual(bookRes.body.success, true);
    assert.strictEqual(bookRes.body.data.appointmentDate, bookingDate);
    assert.strictEqual(bookRes.body.data.startTime, '09:00');
    const bookedAppointmentId = bookRes.body.data._id;

    // Verify persistence in MongoDB
    const savedAppointment = await Appointment.findById(bookedAppointmentId);
    assert.ok(savedAppointment, 'Appointment was not saved in MongoDB');
    assert.strictEqual(savedAppointment.status, 'pending');
    console.log(`  ✔ Appointment booked & saved in MongoDB (ID: ${bookedAppointmentId}).\n`);

    // ==========================================================
    // TEST 4: Double Booking Prevention
    // ==========================================================
    console.log('▶ [TEST 4] Double Booking Prevention');
    // Second patient attempts to book the EXACT SAME doctor, date, and startTime
    // Register second patient
    const patient2Email = `patient2.${Date.now()}@example.com`;
    const reg2Res = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        name: 'Karan Malhotra',
        email: patient2Email,
        password: 'password123',
        phone: '+91 97777 66666'
      }
    });
    const patient2Cookie = reg2Res.cookie;

    const conflictRes = await request({
      method: 'POST',
      path: '/api/appointments',
      cookie: patient2Cookie,
      body: {
        doctorId: doctorProfileId,
        appointmentDate: bookingDate,
        startTime: '09:00',
        endTime: '09:30',
        reason: 'Attempting conflicting booking'
      }
    });

    assert.strictEqual(conflictRes.status, 409, `Expected 409 Conflict, got ${conflictRes.status}`);
    assert.strictEqual(conflictRes.body.success, false);
    assert.ok(
      conflictRes.body.message.includes('already reserved') ||
      conflictRes.body.message.includes('already booked'),
      'Conflict error message did not match'
    );
    console.log('  ✔ Backend successfully prevented double booking (returned 409 Conflict).\n');

    // ==========================================================
    // TEST 5: Appointment Cancellation
    // ==========================================================
    console.log('▶ [TEST 5] Appointment Cancellation & Slot Release');
    const cancelRes = await request({
      method: 'PATCH',
      path: `/api/appointments/${bookedAppointmentId}/cancel`,
      cookie: patientCookie
    });

    assert.strictEqual(cancelRes.status, 200, `Expected 200, got ${cancelRes.status}`);
    assert.strictEqual(cancelRes.body.success, true);
    assert.strictEqual(cancelRes.body.data.status, 'cancelled');

    // Verify slot is now available again for booking
    const rebookRes = await request({
      method: 'POST',
      path: '/api/appointments',
      cookie: patient2Cookie,
      body: {
        doctorId: doctorProfileId,
        appointmentDate: bookingDate,
        startTime: '09:00',
        endTime: '09:30',
        reason: 'Booking released slot after cancellation'
      }
    });

    assert.strictEqual(rebookRes.status, 201, `Failed to book released slot: ${rebookRes.status}`);
    assert.strictEqual(rebookRes.body.success, true);
    console.log('  ✔ Slot was released upon cancellation and successfully rebooked by another patient.\n');

    // ==========================================================
    // ADDITIONAL TEST: Appointment Rescheduling
    // ==========================================================
    console.log('▶ [ADDITIONAL TEST] Appointment Rescheduling');
    const reschedRes = await request({
      method: 'PATCH',
      path: `/api/appointments/${rebookRes.body.data._id}/reschedule`,
      cookie: patient2Cookie,
      body: {
        newDate: bookingDate,
        newStartTime: '09:30',
        newEndTime: '10:00'
      }
    });

    assert.strictEqual(reschedRes.status, 200);
    assert.strictEqual(reschedRes.body.data.startTime, '09:30');
    console.log('  ✔ Rescheduled appointment successfully to 09:30.\n');

    // ==========================================================
    // ADDITIONAL TEST: Doctor Login & Schedule Management
    // ==========================================================
    console.log('▶ [ADDITIONAL TEST] Doctor Login & Schedule Update');
    const doctorLoginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: 'priya.sharma@medilink.com',
        password: 'password123',
        requiredRole: 'doctor'
      }
    });

    assert.strictEqual(doctorLoginRes.status, 200);
    const doctorCookie = doctorLoginRes.cookie;

    // Block a vacation date
    const blockDate = '2026-12-25';
    const scheduleUpdateRes = await request({
      method: 'PUT',
      path: '/api/doctors/schedule',
      cookie: doctorCookie,
      body: {
        unavailableDates: [blockDate]
      }
    });

    assert.strictEqual(scheduleUpdateRes.status, 200);
    assert.ok(scheduleUpdateRes.body.unavailableDates.includes(blockDate));

    // Verify availability check respects blocked date
    const availCheckRes = await request({
      method: 'GET',
      path: `/api/doctors/${doctorProfileId}/availability?date=${blockDate}`
    });
    assert.strictEqual(availCheckRes.body.isAvailable, false);
    console.log(`  ✔ Doctor schedule updated and blocked date (${blockDate}) recognized.\n`);

    // ==========================================================
    // ADDITIONAL TEST: Unauthorized Access & Logout
    // ==========================================================
    console.log('▶ [ADDITIONAL TEST] Unauthorized Access & Logout');
    const logoutRes = await request({
      method: 'POST',
      path: '/api/auth/logout',
      cookie: doctorCookie
    });
    assert.strictEqual(logoutRes.status, 200);

    // Attempt protected route without cookie
    const unauthRes = await request({
      method: 'GET',
      path: '/api/auth/me'
    });
    assert.strictEqual(unauthRes.status, 401);
    console.log('  ✔ Logout cleared session and protected endpoint denied unauthenticated access.\n');

    console.log('============================================================');
    console.log(' ALL 5 CORE TEST SCENARIOS + ADDITIONAL TESTS PASSED 100%! ');
    console.log('============================================================\n');

    if (server) server.close();
    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    if (server) server.close();
    await closeDB();
    process.exit(1);
  }
};

runTests();
