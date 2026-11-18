import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlusCircle,
  User,
  ArrowRight,
  Stethoscope,
  RefreshCw,
  Search
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AlertMessage from '../components/AlertMessage';
import BookingModal from '../components/BookingModal';
import RescheduleModal from '../components/RescheduleModal';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [selectedAppointmentForReschedule, setSelectedAppointmentForReschedule] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [apptRes, docRes] = await Promise.all([
        api.getMyAppointments(),
        api.getDoctors()
      ]);

      if (apptRes.success) {
        setAppointments(apptRes.data || []);
      }
      if (docRes.success) {
        setRecommendedDoctors((docRes.data || []).slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setAlert({ type: 'error', message: err.message || 'Error loading dashboard metrics.' });
    } finally {
      setLoading(false);
    }
  };

  // Compute stat metrics
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
  const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled').length;
  const pendingAppointments = appointments.filter((a) => a.status === 'pending').length;
  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed').length;

  // Next upcoming active appointment
  const upcomingAppointment = appointments.find((a) =>
    ['pending', 'confirmed'].includes(a.status)
  );

  // Cancel handler
  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? The reserved slot will be released.')) {
      return;
    }

    try {
      const res = await api.cancelAppointment(appointmentId);
      if (res.success) {
        setAlert({
          type: 'success',
          message: 'Appointment cancelled successfully. Time slot has been released.'
        });
        fetchDashboardData();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to cancel appointment.'
      });
    }
  };

  return (
    <div className="page-container patient-dashboard">
      {/* Welcome Banner */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-text">
          <h1>Welcome, {user?.name || 'Patient'}!</h1>
          <p>
            MediLink Patient Portal — Manage your health consultations, view specialist schedules, and track medical appointments.
          </p>
        </div>
        <div className="welcome-actions">
          <Link to="/doctors" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Book New Consultation</span>
          </Link>
        </div>
      </div>

      {alert && (
        <div className="mt-3 mb-3">
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {loading ? (
        <div className="py-5 text-center">
          <LoadingSpinner message="Loading patient dashboard records..." />
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="stats-cards-grid mt-4">
            <div className="stat-card stat-card-blue">
              <div className="stat-card-icon">
                <Calendar size={24} />
              </div>
              <div className="stat-card-info">
                <span className="stat-card-title">Total Bookings</span>
                <span className="stat-card-value">{totalAppointments}</span>
              </div>
            </div>

            <div className="stat-card stat-card-amber">
              <div className="stat-card-icon">
                <Clock size={24} />
              </div>
              <div className="stat-card-info">
                <span className="stat-card-title">Pending & Confirmed</span>
                <span className="stat-card-value">{pendingAppointments + confirmedAppointments}</span>
              </div>
            </div>

            <div className="stat-card stat-card-green">
              <div className="stat-card-icon">
                <CheckCircle size={24} />
              </div>
              <div className="stat-card-info">
                <span className="stat-card-title">Completed Consultations</span>
                <span className="stat-card-value">{completedAppointments}</span>
              </div>
            </div>

            <div className="stat-card stat-card-rose">
              <div className="stat-card-icon">
                <XCircle size={24} />
              </div>
              <div className="stat-card-info">
                <span className="stat-card-title">Cancelled</span>
                <span className="stat-card-value">{cancelledAppointments}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Appointment Highlight */}
          {upcomingAppointment && (
            <div className="upcoming-highlight-card mt-4">
              <div className="highlight-header">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={20} className="text-primary" />
                  <h3>Next Upcoming Appointment</h3>
                </div>
                <StatusBadge status={upcomingAppointment.status} />
              </div>

              <div className="highlight-content-grid">
                <div className="highlight-item">
                  <span className="label">Doctor</span>
                  <span className="value">
                    {upcomingAppointment.doctorId?.userId?.name || 'Specialist Doctor'} (
                    {upcomingAppointment.doctorId?.specialization})
                  </span>
                </div>
                <div className="highlight-item">
                  <span className="label">Date & Time</span>
                  <span className="value highlight-time">
                    {upcomingAppointment.appointmentDate} at {upcomingAppointment.startTime} -{' '}
                    {upcomingAppointment.endTime}
                  </span>
                </div>
                <div className="highlight-item">
                  <span className="label">Clinic Location</span>
                  <span className="value">
                    {upcomingAppointment.doctorId?.clinic?.name},{' '}
                    {upcomingAppointment.doctorId?.clinic?.city}
                  </span>
                </div>
                <div className="highlight-item">
                  <span className="label">Reason</span>
                  <span className="value text-truncate">{upcomingAppointment.reason}</span>
                </div>
              </div>

              <div className="highlight-actions mt-3">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedAppointmentForReschedule(upcomingAppointment)}
                >
                  <RefreshCw size={14} /> Reschedule
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleCancel(upcomingAppointment._id)}
                >
                  <XCircle size={14} /> Cancel
                </button>
              </div>
            </div>
          )}

          {/* Main Dashboard Layout: Recent Appointments + Recommended Specialists */}
          <div className="dashboard-columns-grid mt-4">
            {/* Left Col: Recent Appointments Table */}
            <div className="dashboard-main-col">
              <div className="card">
                <div className="card-header-flex">
                  <h3>Recent Appointment History</h3>
                  <Link to="/patient/appointments" className="link-more">
                    View All <ArrowRight size={14} />
                  </Link>
                </div>

                {appointments.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="No Appointments Scheduled"
                    description="You have not booked any consultations yet. Explore verified doctors to schedule your first visit."
                    actionText="Find a Doctor"
                    onAction={() => navigate('/doctors')}
                  />
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Doctor</th>
                          <th>Specialty</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.slice(0, 5).map((appt) => {
                          const docName = appt.doctorId?.userId?.name || 'Doctor';
                          const spec = appt.doctorId?.specialization || 'General';
                          const isActive = ['pending', 'confirmed'].includes(appt.status);

                          return (
                            <tr key={appt._id}>
                              <td className="font-semibold">{docName}</td>
                              <td>{spec}</td>
                              <td>
                                {appt.appointmentDate}
                                <div className="sub-time">
                                  {appt.startTime} – {appt.endTime}
                                </div>
                              </td>
                              <td>
                                <StatusBadge status={appt.status} />
                              </td>
                              <td>
                                <div className="action-buttons-cell">
                                  {isActive ? (
                                    <>
                                      <button
                                        type="button"
                                        title="Reschedule"
                                        className="btn-icon btn-icon-blue"
                                        onClick={() => setSelectedAppointmentForReschedule(appt)}
                                      >
                                        <RefreshCw size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        title="Cancel Appointment"
                                        className="btn-icon btn-icon-red"
                                        onClick={() => handleCancel(appt._id)}
                                      >
                                        <XCircle size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-muted text-xs">—</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Recommended Doctors */}
            <div className="dashboard-side-col">
              <div className="card">
                <div className="card-header-flex">
                  <h3>Available Doctors</h3>
                  <Link to="/doctors" className="link-more">
                    All <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="recommended-doctors-list">
                  {recommendedDoctors.map((doc) => (
                    <div key={doc._id} className="mini-doctor-item">
                      <div className="mini-doctor-avatar">
                        <Stethoscope size={18} />
                      </div>
                      <div className="mini-doctor-info">
                        <h4 className="mini-doctor-name">{doc.userId?.name}</h4>
                        <span className="mini-doctor-spec">{doc.specialization}</span>
                        <span className="mini-doctor-fee">Fee: ₹{doc.consultationFee}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => setSelectedDoctorForBooking(doc)}
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Booking Modal */}
      {selectedDoctorForBooking && (
        <BookingModal
          doctor={selectedDoctorForBooking}
          isOpen={!!selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onBookingSuccess={() => {
            setSelectedDoctorForBooking(null);
            fetchDashboardData();
          }}
        />
      )}

      {/* Reschedule Modal */}
      {selectedAppointmentForReschedule && (
        <RescheduleModal
          appointment={selectedAppointmentForReschedule}
          isOpen={!!selectedAppointmentForReschedule}
          onClose={() => setSelectedAppointmentForReschedule(null)}
          onRescheduleSuccess={() => {
            setSelectedAppointmentForReschedule(null);
            setAlert({
              type: 'success',
              message: 'Appointment successfully rescheduled.'
            });
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
