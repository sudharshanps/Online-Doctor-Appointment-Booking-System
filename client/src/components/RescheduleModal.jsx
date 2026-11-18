import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import AlertMessage from './AlertMessage';

const RescheduleModal = ({ appointment, isOpen, onClose, onRescheduleSuccess }) => {
  const getTodayFormatted = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [newDate, setNewDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Extract doctorId correctly from appointment
  const doctorId = appointment?.doctorId?._id || appointment?.doctorId;

  useEffect(() => {
    if (isOpen && appointment) {
      setNewDate(appointment.appointmentDate || getTodayFormatted());
      setSelectedSlot(null);
      setErrorMessage('');
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    if (isOpen && doctorId && newDate) {
      fetchSlots();
    }
  }, [isOpen, doctorId, newDate]);

  const fetchSlots = async () => {
    try {
      setLoadingSlots(true);
      setErrorMessage('');
      setSelectedSlot(null);
      const res = await api.getDoctorAvailability(doctorId, newDate);
      if (res.success) {
        setAvailability(res);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load availability for this date.');
      setAvailability(null);
    } finally {
      setLoadingSlots(false);
    }
  };

  if (!isOpen || !appointment) return null;

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage('Please select a new consultation time slot.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const res = await api.rescheduleAppointment(
        appointment._id,
        newDate,
        selectedSlot.startTime,
        selectedSlot.endTime
      );

      if (res.success) {
        if (onRescheduleSuccess) {
          onRescheduleSuccess(res.data);
        }
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reschedule appointment.');
      if (err.status === 409) {
        fetchSlots();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog reschedule-modal">
        <div className="modal-header">
          <div className="modal-title-group">
            <h3>Reschedule Appointment</h3>
            <p className="modal-subtitle">
              Current: {appointment.appointmentDate} at {appointment.startTime}
            </p>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3">
            <AlertMessage type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
          </div>
        )}

        <form onSubmit={handleReschedule} className="modal-body">
          <div className="form-group mb-3">
            <label htmlFor="rescheduleDate" className="form-label">
              <Calendar size={16} /> Choose New Date
            </label>
            <input
              id="rescheduleDate"
              type="date"
              className="form-control"
              min={getTodayFormatted()}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
          </div>

          <div className="slots-section">
            <div className="slots-header">
              <h4 className="slots-title">Select New Time Slot</h4>
              {availability && (
                <span className="slots-count-tag">
                  {availability.isAvailable
                    ? `${availability.availableSlotsCount} open slots`
                    : 'Doctor Unavailable'}
                </span>
              )}
            </div>

            {loadingSlots ? (
              <div className="slots-loading-box">
                <LoadingSpinner message="Checking available slots..." size={20} />
              </div>
            ) : !availability?.isAvailable ? (
              <div className="slot-unavailable-alert">
                <AlertCircle size={18} className="text-warning" />
                <p>{availability?.reason || 'Doctor is not available on this date.'}</p>
              </div>
            ) : (
              <div className="slots-grid">
                {availability.slots.map((slot) => {
                  const isCurrentSlot =
                    appointment.appointmentDate === newDate &&
                    appointment.startTime === slot.startTime;
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  // If it is the current slot being rescheduled, allow it or mark it
                  const disabled = slot.isBooked && !isCurrentSlot;

                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedSlot(slot)}
                      className={`slot-chip ${isSelected ? 'selected' : ''} ${
                        disabled ? 'booked' : 'available'
                      }`}
                    >
                      <Clock size={13} />
                      <span>{slot.startTime}</span>
                      {disabled && <span className="booked-label">Reserved</span>}
                      {isCurrentSlot && <span className="current-slot-badge">Current</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="btn btn-primary"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Rescheduling...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Confirm New Time</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;
