import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import AlertMessage from './AlertMessage';

const BookingModal = ({ doctor, isOpen, onClose, onBookingSuccess }) => {
  const { isAuthenticated, isPatient } = useAuth();
  const navigate = useNavigate();

  // Helper to format date YYYY-MM-DD
  const getTodayFormatted = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getTomorrowFormatted = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [step, setStep] = useState(1); // 1: Date & Slot, 2: Reason & Review, 3: Success Confirmation
  const [selectedDate, setSelectedDate] = useState(getTomorrowFormatted());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  // Fetch slots whenever doctor or selectedDate changes
  useEffect(() => {
    if (isOpen && doctor?._id && selectedDate) {
      fetchSlots();
    }
  }, [isOpen, doctor?._id, selectedDate]);

  const fetchSlots = async () => {
    try {
      setLoadingSlots(true);
      setErrorMessage('');
      setSelectedSlot(null);
      const res = await api.getDoctorAvailability(doctor._id, selectedDate);
      if (res.success) {
        setAvailability(res);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load doctor availability.');
      setAvailability(null);
    } finally {
      setLoadingSlots(false);
    }
  };

  if (!isOpen || !doctor) return null;

  // If not logged in, prompt to log in
  if (!isAuthenticated) {
    return (
      <div className="modal-backdrop">
        <div className="modal-dialog auth-prompt-modal">
          <div className="modal-header">
            <h3>Sign In Required</h3>
            <button type="button" onClick={onClose} className="modal-close-btn">
              <X size={20} />
            </button>
          </div>
          <div className="modal-body text-center p-4">
            <AlertCircle size={48} className="text-primary mb-3" />
            <h4>Please sign in to book an appointment</h4>
            <p className="text-muted">
              Booking an appointment with {doctor.userId?.name || 'this doctor'} requires a verified patient account.
            </p>
            <div className="modal-actions-center mt-4">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
              >
                Sign In / Register
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle final confirmation
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage('Please select a time slot.');
      return;
    }
    if (!reason.trim()) {
      setErrorMessage('Please describe the reason for your appointment.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const res = await api.createAppointment({
        doctorId: doctor._id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: reason.trim()
      });

      if (res.success) {
        setConfirmedAppointment(res.data);
        setStep(3); // Step 3: Success Screen
        if (onBookingSuccess) {
          onBookingSuccess(res.data);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to book appointment. Please try again.');
      // If double booking conflict, reload availability
      if (err.status === 409) {
        fetchSlots();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedSlot(null);
    setReason('');
    setErrorMessage('');
    setConfirmedAppointment(null);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog booking-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <h3>Book Consultation</h3>
            <p className="modal-subtitle">
              {doctor.userId?.name} — {doctor.specialization}
            </p>
          </div>
          <button type="button" onClick={handleClose} className="modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3">
            <AlertMessage type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
          </div>
        )}

        {/* STEP 1: Select Date & Available Slot */}
        {step === 1 && (
          <div className="modal-body">
            <div className="booking-doctor-brief">
              <div className="brief-item">
                <MapPin size={16} />
                <span>{doctor.clinic?.name}, {doctor.clinic?.city}</span>
              </div>
              <div className="brief-item fee-badge">
                <span>Fee: ₹{doctor.consultationFee}</span>
              </div>
            </div>

            {/* Date Selector */}
            <div className="form-group mb-4">
              <label htmlFor="appointmentDate" className="form-label">
                <Calendar size={16} /> Select Consultation Date
              </label>
              <input
                id="appointmentDate"
                type="date"
                className="form-control"
                min={getTodayFormatted()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Slots Section */}
            <div className="slots-section">
              <div className="slots-header">
                <h4 className="slots-title">Available Time Slots</h4>
                {availability && (
                  <span className="slots-count-tag">
                    {availability.isAvailable
                      ? `${availability.availableSlotsCount} of ${availability.totalSlotsCount} slots open`
                      : 'Unavailable'}
                  </span>
                )}
              </div>

              {loadingSlots ? (
                <div className="slots-loading-box">
                  <LoadingSpinner message="Checking real-time doctor availability..." size={22} />
                </div>
              ) : !availability?.isAvailable ? (
                <div className="slot-unavailable-alert">
                  <AlertCircle size={20} className="text-warning" />
                  <p>{availability?.reason || 'Doctor is not available on this date. Please pick another date.'}</p>
                </div>
              ) : availability.slots.length === 0 ? (
                <p className="text-muted text-center py-3">No slots configured for this date.</p>
              ) : (
                <div className="slots-grid">
                  {availability.slots.map((slot) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        disabled={slot.isBooked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`slot-chip ${isSelected ? 'selected' : ''} ${
                          slot.isBooked ? 'booked' : 'available'
                        }`}
                      >
                        <Clock size={14} />
                        <span>{slot.startTime}</span>
                        {slot.isBooked && <span className="booked-label">Reserved</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={handleClose} className="btn btn-outline">
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedSlot || !availability?.isAvailable}
                onClick={() => setStep(2)}
                className="btn btn-primary"
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Reason & Review */}
        {step === 2 && (
          <form onSubmit={handleConfirmBooking} className="modal-body">
            <div className="booking-summary-card">
              <h4 className="summary-title">Appointment Summary</h4>
              <div className="summary-grid">
                <div className="summary-row">
                  <span className="summary-label">Doctor</span>
                  <span className="summary-value">{doctor.userId?.name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Specialization</span>
                  <span className="summary-value">{doctor.specialization}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Date</span>
                  <span className="summary-value">{selectedDate} ({availability?.dayOfWeek})</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Time Slot</span>
                  <span className="summary-value highlight-time">
                    {selectedSlot.startTime} – {selectedSlot.endTime}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Clinic Location</span>
                  <span className="summary-value">{doctor.clinic?.name}, {doctor.clinic?.address}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Consultation Fee</span>
                  <span className="summary-value fee-value">₹{doctor.consultationFee}</span>
                </div>
              </div>
            </div>

            <div className="form-group mt-3">
              <label htmlFor="visitReason" className="form-label">
                <FileText size={16} /> Reason for Consultation / Symptoms <span className="required">*</span>
              </label>
              <textarea
                id="visitReason"
                className="form-control"
                rows="3"
                placeholder="Briefly describe your symptoms or reason for visit (e.g. routine checkup, persistent cough, chest discomfort)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                minLength={3}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-outline"
                disabled={submitting}
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                type="submit"
                disabled={submitting || !reason.trim()}
                className="btn btn-primary"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="spin-icon" />
                    <span>Reserving Slot...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Booking Success Confirmation */}
        {step === 3 && confirmedAppointment && (
          <div className="modal-body confirmation-body text-center">
            <div className="confirmation-icon-container">
              <CheckCircle2 size={56} className="text-success" />
            </div>
            <h3 className="confirmation-title">Appointment Confirmed!</h3>
            <p className="confirmation-desc">
              Your consultation request has been successfully registered in the MediLink system.
            </p>

            <div className="confirmed-details-card">
              <div className="confirmed-row">
                <span className="label">Appointment ID:</span>
                <span className="value code-val">{confirmedAppointment._id}</span>
              </div>
              <div className="confirmed-row">
                <span className="label">Doctor:</span>
                <span className="value">{doctor.userId?.name}</span>
              </div>
              <div className="confirmed-row">
                <span className="label">Date & Time:</span>
                <span className="value highlight-time">
                  {confirmedAppointment.appointmentDate} at {confirmedAppointment.startTime} - {confirmedAppointment.endTime}
                </span>
              </div>
              <div className="confirmed-row">
                <span className="label">Status:</span>
                <span className="value text-capitalize font-semibold text-warning">
                  {confirmedAppointment.status}
                </span>
              </div>
              <div className="confirmed-row">
                <span className="label">Clinic:</span>
                <span className="value">{doctor.clinic?.name}</span>
              </div>
            </div>

            <div className="modal-footer-center mt-4">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  navigate('/patient/appointments');
                }}
                className="btn btn-primary"
              >
                Go to My Appointments
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-outline"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
