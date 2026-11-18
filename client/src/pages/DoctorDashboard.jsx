import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Clock3,
  Stethoscope,
  Phone,
  Mail,
  Sliders,
  Check,
  X,
  MessageSquare,
  Loader2
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AlertMessage from '../components/AlertMessage';

const DoctorDashboard = () => {
  const { user, doctorProfile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [alert, setAlert] = useState(null);

  // Complete consultation modal
  const [completeTarget, setCompleteTarget] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.getDoctorAppointments({
        status: filterStatus !== 'All' ? filterStatus : undefined
      });
      if (res.success) {
        setAppointments(res.data || []);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to fetch doctor appointments.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper for today's date YYYY-MM-DD
  const getTodayFormatted = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = getTodayFormatted();

  // Metrics
  const totalConsultations = appointments.length;
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);
  const pendingRequests = appointments.filter((a) => a.status === 'pending');
  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed');
  const completedAppointments = appointments.filter((a) => a.status === 'completed');

  // Handle Status Update (Confirm, Reject)
  const handleUpdateStatus = async (appointmentId, newStatus, notes = '') => {
    try {
      setSubmittingAction(true);
      const res = await api.updateAppointmentStatus(appointmentId, newStatus, notes);
      if (res.success) {
        setAlert({
          type: 'success',
          message: `Appointment marked as ${newStatus}.`
        });
        fetchAppointments();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || `Failed to update status to ${newStatus}.`
      });
    } finally {
      setSubmittingAction(false);
      setCompleteTarget(null);
      setDoctorNotes('');
    }
  };

  return (
    <div className="page-container doctor-dashboard">
      <div className="dashboard-welcome-banner doctor-banner">
        <div className="welcome-text">
          <h1>{user?.name || 'Doctor'} — Consultation Portal</h1>
          <p>
            {doctorProfile?.specialization || 'Specialist'} | {doctorProfile?.clinic?.name || 'MediLink Central Clinic'}
          </p>
        </div>
        <div className="welcome-actions">
          <Link to="/doctor/schedule" className="btn btn-primary">
            <Sliders size={16} />
            <span>Manage Weekly Schedule</span>
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

      {/* Metrics Row */}
      <div className="stats-cards-grid mt-4">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Today's Schedule</span>
            <span className="stat-card-value">{todayAppointments.length}</span>
          </div>
        </div>

        <div className="stat-card stat-card-amber">
          <div className="stat-card-icon">
            <Clock3 size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Pending Requests</span>
            <span className="stat-card-value">{pendingRequests.length}</span>
          </div>
        </div>

        <div className="stat-card stat-card-teal">
          <div className="stat-card-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Confirmed Visits</span>
            <span className="stat-card-value">{confirmedAppointments.length}</span>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-card-icon">
            <Stethoscope size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Completed Cases</span>
            <span className="stat-card-value">{completedAppointments.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="status-filter-tabs-card mt-4">
        <div className="filter-tabs-scroll">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'].map(
            (tab) => (
              <button
                key={tab}
                type="button"
                className={`filter-tab-btn ${filterStatus === tab ? 'active' : ''}`}
                onClick={() => setFilterStatus(tab)}
              >
                {tab}
              </button>
            )
          )}
        </div>
      </div>

      {/* Appointments Management Table */}
      <div className="card mt-4">
        <div className="card-header-flex">
          <h3>Patient Consultation Bookings</h3>
          <span className="text-muted text-sm">
            Total {appointments.length} appointment{appointments.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div className="py-5 text-center">
            <LoadingSpinner message="Loading patient consultation roster..." />
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Bookings Found"
            description="There are currently no patient appointment bookings matching this filter."
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Details</th>
                  <th>Date & Slot</th>
                  <th>Clinical Reason</th>
                  <th>Status</th>
                  <th>Doctor Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => {
                  const patient = appt.patientId || {};
                  const isPending = appt.status === 'pending';
                  const isConfirmed = appt.status === 'confirmed';

                  return (
                    <tr key={appt._id}>
                      <td>
                        <div className="patient-cell-name font-semibold">{patient.name || 'Anonymous Patient'}</div>
                        <div className="patient-contact-meta">
                          {patient.email && (
                            <span className="contact-item">
                              <Mail size={12} /> {patient.email}
                            </span>
                          )}
                          {patient.phone && (
                            <span className="contact-item">
                              <Phone size={12} /> {patient.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="date-time-cell">
                          <span className="font-semibold">{appt.appointmentDate}</span>
                          <span className="slot-pill highlight-time">
                            {appt.startTime} – {appt.endTime}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="reason-cell" title={appt.reason}>
                          {appt.reason}
                        </div>
                        {appt.doctorNotes && (
                          <div className="notes-preview">
                            <MessageSquare size={12} /> {appt.doctorNotes}
                          </div>
                        )}
                      </td>

                      <td>
                        <StatusBadge status={appt.status} />
                      </td>

                      <td>
                        <div className="action-buttons-cell">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                className="btn btn-success btn-xs"
                                title="Confirm this appointment"
                                disabled={submittingAction}
                                onClick={() => handleUpdateStatus(appt._id, 'confirmed')}
                              >
                                <Check size={14} /> Confirm
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-xs"
                                title="Decline this appointment"
                                disabled={submittingAction}
                                onClick={() => handleUpdateStatus(appt._id, 'rejected')}
                              >
                                <X size={14} /> Reject
                              </button>
                            </>
                          )}

                          {isConfirmed && (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              title="Mark consultation completed and add clinical notes"
                              onClick={() => {
                                setCompleteTarget(appt);
                                setDoctorNotes(appt.doctorNotes || '');
                              }}
                            >
                              <CheckCircle size={14} /> Complete
                            </button>
                          )}

                          {!isPending && !isConfirmed && (
                            <span className="text-muted text-xs">Finished</span>
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

      {/* Complete Consultation Modal with Clinical Notes */}
      {completeTarget && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Complete Consultation</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setCompleteTarget(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body p-4">
              <p className="text-muted mb-3">
                Finalizing consultation for <strong>{completeTarget.patientId?.name}</strong> on{' '}
                {completeTarget.appointmentDate} at {completeTarget.startTime}.
              </p>

              <div className="form-group mb-3">
                <label className="form-label" htmlFor="clinicalNotes">
                  Consultation Notes / Diagnosis / Prescriptions
                </label>
                <textarea
                  id="clinicalNotes"
                  className="form-control"
                  rows="4"
                  placeholder="Enter medical observations, prescribed medications, or recommendations for the patient..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setCompleteTarget(null)}
                  disabled={submittingAction}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  disabled={submittingAction}
                  onClick={() =>
                    handleUpdateStatus(completeTarget._id, 'completed', doctorNotes)
                  }
                >
                  {submittingAction ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Mark as Completed</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
