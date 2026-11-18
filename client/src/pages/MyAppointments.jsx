import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  RefreshCw,
  XCircle,
  PlusCircle,
  Filter,
  CheckCircle,
  Stethoscope
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AlertMessage from '../components/AlertMessage';
import RescheduleModal from '../components/RescheduleModal';

const STATUS_FILTERS = [
  'All',
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled'
];

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [alert, setAlert] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.getMyAppointments(selectedStatus);
      if (res.success) {
        setAppointments(res.data || []);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to retrieve appointments.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? This action will release the reserved time slot.')) {
      return;
    }

    try {
      const res = await api.cancelAppointment(id);
      if (res.success) {
        setAlert({
          type: 'success',
          message: 'Appointment cancelled. The consultation slot has been released.'
        });
        fetchAppointments();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to cancel appointment.'
      });
    }
  };

  return (
    <div className="page-container my-appointments-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">My Consultation Appointments</h1>
          <p className="page-subtitle">
            Manage your scheduled, past, and upcoming medical visits with MediLink specialists.
          </p>
        </div>
        <Link to="/doctors" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Book New Slot</span>
        </Link>
      </div>

      {alert && (
        <div className="mb-4">
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="status-filter-tabs-card">
        <div className="filter-tabs-scroll">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              className={`filter-tab-btn ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => setSelectedStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Listings */}
      <div className="appointments-list-section mt-4">
        {loading ? (
          <div className="py-5 text-center">
            <LoadingSpinner message="Loading your consultation records..." />
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={`No ${selectedStatus !== 'All' ? selectedStatus : ''} Appointments`}
            description="You currently have no appointment records under this category."
            actionText="Find & Book a Doctor"
            onAction={() => navigate('/doctors')}
          />
        ) : (
          <div className="appointment-cards-grid">
            {appointments.map((appt) => {
              const doc = appt.doctorId || {};
              const docUser = doc.userId || {};
              const clinic = doc.clinic || {};
              const isActive = ['pending', 'confirmed'].includes(appt.status);

              return (
                <div key={appt._id} className="appointment-card">
                  <div className="appt-card-header">
                    <div className="appt-doc-info">
                      <div className="appt-avatar">
                        <Stethoscope size={22} />
                      </div>
                      <div>
                        <h3 className="appt-doc-name">{docUser.name || 'Specialist Doctor'}</h3>
                        <span className="appt-doc-spec">{doc.specialization}</span>
                      </div>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>

                  <div className="appt-card-body">
                    <div className="appt-info-row">
                      <Calendar size={16} className="appt-icon" />
                      <span className="appt-val font-semibold">{appt.appointmentDate}</span>
                    </div>

                    <div className="appt-info-row">
                      <Clock size={16} className="appt-icon" />
                      <span className="appt-val highlight-time">
                        {appt.startTime} – {appt.endTime}
                      </span>
                    </div>

                    <div className="appt-info-row">
                      <MapPin size={16} className="appt-icon" />
                      <span className="appt-val">
                        {clinic.name}, {clinic.city}
                      </span>
                    </div>

                    <div className="appt-info-row">
                      <FileText size={16} className="appt-icon" />
                      <span className="appt-val text-reason">
                        <strong>Reason:</strong> {appt.reason}
                      </span>
                    </div>

                    {appt.doctorNotes && (
                      <div className="appt-notes-box">
                        <strong>Doctor's Notes:</strong> {appt.doctorNotes}
                      </div>
                    )}

                    <div className="appt-id-line">
                      <span>Appointment ID:</span>
                      <code>{appt._id}</code>
                    </div>
                  </div>

                  <div className="appt-card-footer">
                    <div className="appt-fee">
                      <span>Fee:</span> <strong>₹{doc.consultationFee || '—'}</strong>
                    </div>

                    {isActive && (
                      <div className="appt-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setRescheduleTarget(appt)}
                        >
                          <RefreshCw size={14} /> Reschedule
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleCancelAppointment(appt._id)}
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <RescheduleModal
          appointment={rescheduleTarget}
          isOpen={!!rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onRescheduleSuccess={() => {
            setRescheduleTarget(null);
            setAlert({
              type: 'success',
              message: 'Your appointment has been successfully rescheduled.'
            });
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
};

export default MyAppointments;
