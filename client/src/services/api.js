/**
 * MediLink Innovations - Centralized API Service
 * Handles all HTTP communication with credentials (HTTP-only cookies)
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers,
    credentials: 'include' // Always include HTTP-only cookies
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Authentication
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me', { method: 'GET' }),

  // Doctors
  getDoctors: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.specialization && params.specialization !== 'All') {
      query.append('specialization', params.specialization);
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/doctors${qs}`, { method: 'GET' });
  },
  getDoctorById: (id) => request(`/doctors/${id}`, { method: 'GET' }),
  getDoctorAvailability: (id, date) => request(`/doctors/${id}/availability?date=${date}`, { method: 'GET' }),
  updateDoctorProfile: (profileData) => request('/doctors/profile', { method: 'PUT', body: profileData }),
  updateDoctorSchedule: (scheduleData) => request('/doctors/schedule', { method: 'PUT', body: scheduleData }),

  // Appointments
  createAppointment: (appointmentData) => request('/appointments', { method: 'POST', body: appointmentData }),
  getMyAppointments: (status) => {
    const qs = status && status !== 'All' ? `?status=${status}` : '';
    return request(`/appointments/my${qs}`, { method: 'GET' });
  },
  getDoctorAppointments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.date) query.append('date', params.date);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/appointments/doctor${qs}`, { method: 'GET' });
  },
  updateAppointmentStatus: (id, status, doctorNotes) =>
    request(`/appointments/${id}/status`, { method: 'PATCH', body: { status, doctorNotes } }),
  rescheduleAppointment: (id, newDate, newStartTime, newEndTime) =>
    request(`/appointments/${id}/reschedule`, { method: 'PATCH', body: { newDate, newStartTime, newEndTime } }),
  cancelAppointment: (id) => request(`/appointments/${id}/cancel`, { method: 'PATCH' }),

  // User Profile
  getProfile: () => request('/profile', { method: 'GET' }),
  updateProfile: (profileData) => request('/profile', { method: 'PUT', body: profileData })
};
