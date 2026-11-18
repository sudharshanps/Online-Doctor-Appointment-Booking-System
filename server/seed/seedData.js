export const doctorsData = [
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@medilink.com',
    phone: '+91 98450 12345',
    specialization: 'Cardiology',
    qualifications: 'MBBS, MD (General Medicine), DM (Cardiology), FACC',
    experience: 14,
    consultationFee: 950,
    clinic: {
      name: 'MediLink Heart & Vascular Center',
      address: 'Suite 201, 100 Feet Road, Indiranagar',
      city: 'Bengaluru'
    },
    description: 'Senior Consultant Cardiologist specializing in preventive cardiology, coronary artery disease management, hypertension, and advanced echocardiography.',
    weeklySchedule: [
      { day: 'Monday', isAvailable: true, startTime: '09:00', endTime: '16:00', slotDuration: 30 },
      { day: 'Tuesday', isAvailable: true, startTime: '09:00', endTime: '16:00', slotDuration: 30 },
      { day: 'Wednesday', isAvailable: true, startTime: '09:00', endTime: '16:00', slotDuration: 30 },
      { day: 'Thursday', isAvailable: true, startTime: '09:00', endTime: '16:00', slotDuration: 30 },
      { day: 'Friday', isAvailable: true, startTime: '09:00', endTime: '14:00', slotDuration: 30 },
      { day: 'Saturday', isAvailable: false, startTime: '09:00', endTime: '13:00', slotDuration: 30 },
      { day: 'Sunday', isAvailable: false, startTime: '09:00', endTime: '13:00', slotDuration: 30 }
    ],
    unavailableDates: []
  },
  {
    name: 'Dr. Rajesh Venkataraman',
    email: 'rajesh.v@medilink.com',
    phone: '+91 98450 23456',
    specialization: 'Neurology',
    qualifications: 'MBBS, MD, DM (Neurology), FINR',
    experience: 18,
    consultationFee: 1200,
    clinic: {
      name: 'MediLink Neuro Sciences Clinic',
      address: '4th Floor, Apex Health Towers, Koramangala',
      city: 'Bengaluru'
    },
    description: 'Dedicated neurologist with expertise in stroke rehabilitation, migraine and headache disorders, epilepsy management, and peripheral neuropathies.',
    weeklySchedule: [
      { day: 'Monday', isAvailable: true, startTime: '10:00', endTime: '17:00', slotDuration: 30 },
      { day: 'Tuesday', isAvailable: true, startTime: '10:00', endTime: '17:00', slotDuration: 30 },
      { day: 'Wednesday', isAvailable: false, startTime: '10:00', endTime: '17:00', slotDuration: 30 },
      { day: 'Thursday', isAvailable: true, startTime: '10:00', endTime: '17:00', slotDuration: 30 },
      { day: 'Friday', isAvailable: true, startTime: '10:00', endTime: '17:00', slotDuration: 30 },
      { day: 'Saturday', isAvailable: true, startTime: '09:00', endTime: '13:00', slotDuration: 30 },
      { day: 'Sunday', isAvailable: false, startTime: '09:00', endTime: '13:00', slotDuration: 30 }
    ],
    unavailableDates: []
  },
  {
    name: 'Dr. Ananya Nair',
    email: 'ananya.nair@medilink.com',
    phone: '+91 98450 34567',
    specialization: 'Dermatology',
    qualifications: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    experience: 9,
    consultationFee: 750,
    clinic: {
      name: 'MediLink Skin & Aesthetics Clinic',
      address: '12th Main, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru'
    },
    description: 'Clinical dermatologist and dermato-surgeon focusing on chronic skin conditions, acne scars, psoriasis, hair fall solutions, and allergy testing.',
    weeklySchedule: [
      { day: 'Monday', isAvailable: true, startTime: '09:30', endTime: '17:30', slotDuration: 30 },
      { day: 'Tuesday', isAvailable: true, startTime: '09:30', endTime: '17:30', slotDuration: 30 },
      { day: 'Wednesday', isAvailable: true, startTime: '09:30', endTime: '17:30', slotDuration: 30 },
      { day: 'Thursday', isAvailable: false, startTime: '09:30', endTime: '17:30', slotDuration: 30 },
      { day: 'Friday', isAvailable: true, startTime: '09:30', endTime: '17:30', slotDuration: 30 },
      { day: 'Saturday', isAvailable: true, startTime: '10:00', endTime: '15:00', slotDuration: 30 },
      { day: 'Sunday', isAvailable: false, startTime: '09:00', endTime: '13:00', slotDuration: 30 }
    ],
    unavailableDates: []
  },
  {
    name: 'Dr. Arjun Mehta',
    email: 'arjun.mehta@medilink.com',
    phone: '+91 98450 45678',
    specialization: 'Orthopedics',
    qualifications: 'MBBS, MS (Orthopedics), MCh, Fellow in Joint Replacement',
    experience: 16,
    consultationFee: 1000,
    clinic: {
      name: 'MediLink Bone & Joint Care',
      address: 'Plot 45, Outer Ring Road, Marathahalli',
      city: 'Bengaluru'
    },
    description: 'Specialist orthopedic surgeon in minimally invasive arthroscopy, sports injury rehabilitation, osteoarthritis, and joint reconstructions.',
    weeklySchedule: [
      { day: 'Monday', isAvailable: true, startTime: '09:00', endTime: '15:00', slotDuration: 30 },
      { day: 'Tuesday', isAvailable: true, startTime: '09:00', endTime: '15:00', slotDuration: 30 },
      { day: 'Wednesday', isAvailable: true, startTime: '09:00', endTime: '15:00', slotDuration: 30 },
      { day: 'Thursday', isAvailable: true, startTime: '09:00', endTime: '15:00', slotDuration: 30 },
      { day: 'Friday', isAvailable: true, startTime: '09:00', endTime: '15:00', slotDuration: 30 },
      { day: 'Saturday', isAvailable: false, startTime: '09:00', endTime: '13:00', slotDuration: 30 },
      { day: 'Sunday', isAvailable: false, startTime: '09:00', endTime: '13:00', slotDuration: 30 }
    ],
    unavailableDates: []
  },
  {
    name: 'Dr. Kavita Reddy',
    email: 'kavita.reddy@medilink.com',
    phone: '+91 98450 56789',
    specialization: 'Pediatrics',
    qualifications: 'MBBS, DCH, DNB (Pediatrics)',
    experience: 11,
    consultationFee: 700,
    clinic: {
      name: 'MediLink Children & Child Wellness Care',
      address: '7th Block, Jayanagar',
      city: 'Bengaluru'
    },
    description: 'Empathetic pediatrician offering compassionate child growth assessments, developmental screenings, pediatric nutrition, and immunizations.',
    weeklySchedule: [
      { day: 'Monday', isAvailable: true, startTime: '08:30', endTime: '16:30', slotDuration: 30 },
      { day: 'Tuesday', isAvailable: true, startTime: '08:30', endTime: '16:30', slotDuration: 30 },
      { day: 'Wednesday', isAvailable: true, startTime: '08:30', endTime: '16:30', slotDuration: 30 },
      { day: 'Thursday', isAvailable: true, startTime: '08:30', endTime: '16:30', slotDuration: 30 },
      { day: 'Friday', isAvailable: true, startTime: '08:30', endTime: '16:30', slotDuration: 30 },
      { day: 'Saturday', isAvailable: true, startTime: '09:00', endTime: '13:00', slotDuration: 30 },
      { day: 'Sunday', isAvailable: false, startTime: '09:00', endTime: '13:00', slotDuration: 30 }
    ],
    unavailableDates: []
  },
  {
    name: 'Dr. Vikramaditya Joshi',
    email: 'vikram.joshi@medilink.com',
    phone: '+91 98450 67890',
    specialization: 'General Medicine',
    qualifications: 'MBBS, MD (Internal Medicine)',
    experience: 15,
    consultationFee: 600,
    clinic: {
      name: 'MediLink Comprehensive Health Center',
      address: 'Commercial Street Area, Shivajinagar',
      city: 'Bengaluru'
    },
    description: 'Expert physician delivering comprehensive primary care, metabolic syndrome management, diabetes control, thyroid disorders, and preventive health screenings.',
    weeklySchedule: [
      { day: 'Monday', isAvailable: true, startTime: '09:00', endTime: '18:00', slotDuration: 30 },
      { day: 'Tuesday', isAvailable: true, startTime: '09:00', endTime: '18:00', slotDuration: 30 },
      { day: 'Wednesday', isAvailable: true, startTime: '09:00', endTime: '18:00', slotDuration: 30 },
      { day: 'Thursday', isAvailable: true, startTime: '09:00', endTime: '18:00', slotDuration: 30 },
      { day: 'Friday', isAvailable: true, startTime: '09:00', endTime: '18:00', slotDuration: 30 },
      { day: 'Saturday', isAvailable: true, startTime: '09:00', endTime: '14:00', slotDuration: 30 },
      { day: 'Sunday', isAvailable: false, startTime: '09:00', endTime: '13:00', slotDuration: 30 }
    ],
    unavailableDates: []
  },
  {
    name: 'Dr. Sneha Roy',
    email: 'sneha.roy@medilink.com',
    phone: '+91 98450 78901',
    specialization: 'Ophthalmology',
    qualifications: 'MBBS, MS (Ophthalmology), FICO (UK)',
    experience: 12,
    consultationFee: 800,
    clinic: {
      name: 'MediLink Eye Wellness Center',
      address: '2nd Stage, BTM Layout',
      city: 'Bengaluru'
    },
    description: 'Consultant ophthalmic surgeon focusing on cataract micro-surgeries, diabetic retinopathy screenings, dry eye disease, and refractive vision care.',
    weeklySchedule: [
      { day: 'Monday', isAvailable: true, startTime: '10:00', endTime: '17:00', slotDuration: 30 },
      { day: 'Tuesday', isAvailable: true, startTime: '10:00', endTime: '17:00', slotDuration: 30 },
      { day: 'Wednesday', isAvailable: true, startTime: '10:00', endTime: '17:00', slotDuration: 30 },
      { day: 'Thursday', isAvailable: true, startTime: '10:00', endTime: '17:00', slotDuration: 30 },
      { day: 'Friday', isAvailable: true, startTime: '10:00', endTime: '17:00', slotDuration: 30 },
      { day: 'Saturday', isAvailable: false, startTime: '10:00', endTime: '14:00', slotDuration: 30 },
      { day: 'Sunday', isAvailable: false, startTime: '10:00', endTime: '14:00', slotDuration: 30 }
    ],
    unavailableDates: []
  },
  {
    name: 'Dr. Farhan Siddiqui',
    email: 'farhan.siddiqui@medilink.com',
    phone: '+91 98450 89012',
    specialization: 'Psychiatry',
    qualifications: 'MBBS, MD (Psychiatry), DPM',
    experience: 13,
    consultationFee: 1100,
    clinic: {
      name: 'MediLink Mind & Behavioral Health Clinic',
      address: 'Lavelle Road, Central Business District',
      city: 'Bengaluru'
    },
    description: 'Compassionate psychiatrist committed to evidence-based mental wellness, anxiety, depression therapy, ADHD, OCD, and stress management.',
    weeklySchedule: [
      { day: 'Monday', isAvailable: true, startTime: '11:00', endTime: '18:00', slotDuration: 30 },
      { day: 'Tuesday', isAvailable: true, startTime: '11:00', endTime: '18:00', slotDuration: 30 },
      { day: 'Wednesday', isAvailable: true, startTime: '11:00', endTime: '18:00', slotDuration: 30 },
      { day: 'Thursday', isAvailable: true, startTime: '11:00', endTime: '18:00', slotDuration: 30 },
      { day: 'Friday', isAvailable: true, startTime: '11:00', endTime: '17:00', slotDuration: 30 },
      { day: 'Saturday', isAvailable: true, startTime: '11:00', endTime: '15:00', slotDuration: 30 },
      { day: 'Sunday', isAvailable: false, startTime: '11:00', endTime: '15:00', slotDuration: 30 }
    ],
    unavailableDates: []
  }
];

export const patientsData = [
  {
    name: 'Rahul K. Verma',
    email: 'rahul.verma@example.com',
    phone: '+91 99001 11223',
    role: 'patient'
  },
  {
    name: 'Meera Iyer',
    email: 'meera.iyer@example.com',
    phone: '+91 99002 22334',
    role: 'patient'
  },
  {
    name: 'Amitabh Sen',
    email: 'amitabh.sen@example.com',
    phone: '+91 99003 33445',
    role: 'patient'
  },
  {
    name: 'Pooja Chawla',
    email: 'pooja.chawla@example.com',
    phone: '+91 99004 44556',
    role: 'patient'
  },
  {
    name: 'David Thomas',
    email: 'david.thomas@example.com',
    phone: '+91 99005 55667',
    role: 'patient'
  }
];
