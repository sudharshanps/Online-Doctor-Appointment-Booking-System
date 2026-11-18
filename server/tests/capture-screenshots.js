import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import puppeteer from 'puppeteer-core';

import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import { runSeed } from '../seed/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(__dirname, '../../screenshots');

const run = async () => {
  console.log('[Capture] Initializing database and demo data...');
  await connectDB();
  await runSeed();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5000, resolve));
  console.log('[Capture] Full-Stack server running on http://localhost:5000');

  // Launch Headless Edge via puppeteer-core
  console.log('[Capture] Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--window-size=1280,850', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  const capture = async (name, delay = 800) => {
    await new Promise((r) => setTimeout(r, delay));
    const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
    await page.screenshot({ path: filePath });
    console.log(`  📸 Captured ${name}.png`);
  };

  try {
    // 1. Landing Page
    console.log('[Capture] 1. Landing Page');
    await page.goto('http://localhost:5000/', { waitUntil: 'networkidle0' });
    await capture('01-landing-page', 1000);

    // 2. Find Doctors Page
    console.log('[Capture] 2. Find Doctors Directory');
    await page.goto('http://localhost:5000/doctors', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.doctor-card', { timeout: 10000 });
    await capture('02-find-doctors', 800);

    // 3. Login Page
    console.log('[Capture] 3. Sign In Page');
    await page.goto('http://localhost:5000/login', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.auth-card', { timeout: 10000 });
    await capture('03-patient-login', 800);

    // 4. Fill Demo Patient & Log In
    console.log('[Capture] 4. Logging in as Patient (Rahul Verma)...');
    const demoPatientBtn = await page.waitForSelector('.btn-outline-info');
    await demoPatientBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    const loginSubmitBtn = await page.waitForSelector('button[type="submit"]');
    await loginSubmitBtn.click();

    await page.waitForSelector('.patient-dashboard', { timeout: 10000 });
    console.log('[Capture] 4. Patient Dashboard');
    await capture('04-patient-dashboard', 1200);

    // 5. Booking Modal (Open booking modal from dashboard)
    console.log('[Capture] 5. Opening Booking Modal with live slots...');
    const bookBtn = await page.waitForSelector('.mini-doctor-item button');
    await bookBtn.click();
    await page.waitForSelector('.booking-modal', { timeout: 10000 });
    await capture('05-appointment-booking', 1500);

    // Close booking modal
    const closeBtn = await page.waitForSelector('.modal-close-btn');
    await closeBtn.click();
    await new Promise((r) => setTimeout(r, 600));

    // 6. My Appointments Page
    console.log('[Capture] 6. My Appointments');
    await page.goto('http://localhost:5000/patient/appointments', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.my-appointments-page', { timeout: 10000 });
    await capture('06-my-appointments', 1200);

    // 7. Logout and Log in as Doctor
    console.log('[Capture] 7. Logging out and switching to Doctor (Dr. Priya Sharma)...');
    const logoutBtn = await page.waitForSelector('.logout-btn');
    await logoutBtn.click();
    await page.waitForSelector('.auth-page-container', { timeout: 10000 });

    // Click Demo Doctor
    const demoDoctorBtn = await page.waitForSelector('.btn-outline-teal');
    await demoDoctorBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    const docLoginBtn = await page.waitForSelector('button[type="submit"]');
    await docLoginBtn.click();

    // 7. Doctor Dashboard
    await page.waitForSelector('.doctor-dashboard', { timeout: 10000 });
    console.log('[Capture] 7. Doctor Dashboard');
    await capture('07-doctor-dashboard', 1200);

    // 8. Doctor Schedule Management
    console.log('[Capture] 8. Doctor Schedule & Working Hours');
    await page.goto('http://localhost:5000/doctor/schedule', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.schedule-management-page', { timeout: 10000 });
    await capture('08-doctor-schedule', 1200);

    console.log('\n============================================================');
    console.log(' All 8 real website screenshots captured successfully!');
    console.log('============================================================\n');
  } catch (err) {
    console.error('[Capture] Error during capture:', err);
  } finally {
    await browser.close();
    server.close();
    await closeDB();
    process.exit(0);
  }
};

run();
