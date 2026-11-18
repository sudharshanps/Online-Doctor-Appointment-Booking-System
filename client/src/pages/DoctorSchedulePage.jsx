import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Clock,
  Calendar,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sliders,
  CalendarX,
  Loader2
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const DoctorSchedulePage = () => {
  const { doctorProfile, refreshUser } = useAuth();

  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadScheduleData();
  }, [doctorProfile]);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      if (res.success && res.doctorProfile) {
        const schedule = DAYS.map((day) => {
          const existing = (res.doctorProfile.weeklySchedule || []).find(
            (s) => s.day.toLowerCase() === day.toLowerCase()
          );
          return (
            existing || {
              day,
              isAvailable: day !== 'Sunday',
              startTime: '09:00',
              endTime: '17:00',
              slotDuration: 30
            }
          );
        });

        setWeeklySchedule(schedule);
        setUnavailableDates(res.doctorProfile.unavailableDates || []);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (index, field, value) => {
    const updated = [...weeklySchedule];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setWeeklySchedule(updated);
  };

  const handleAddBlockedDate = (e) => {
    e.preventDefault();
    if (!newBlockedDate) return;

    if (unavailableDates.includes(newBlockedDate)) {
      setAlert({
        type: 'error',
        message: 'This date is already blocked in your calendar.'
      });
      return;
    }

    setUnavailableDates([...unavailableDates, newBlockedDate].sort());
    setNewBlockedDate('');
  };

  const handleRemoveBlockedDate = (dateToRemove) => {
    setUnavailableDates(unavailableDates.filter((d) => d !== dateToRemove));
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setAlert(null);

      // Validate that for available days, startTime < endTime
      for (const item of weeklySchedule) {
        if (item.isAvailable && item.startTime >= item.endTime) {
          throw new Error(
            `For ${item.day}, Consultation start time (${item.startTime}) must be earlier than finish time (${item.endTime}).`
          );
        }
      }

      const res = await api.updateDoctorSchedule({
        weeklySchedule,
        unavailableDates
      });

      if (res.success) {
        setAlert({
          type: 'success',
          message: 'Weekly schedule and blocked dates saved successfully to MongoDB.'
        });
        await refreshUser();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to update schedule.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper today for min date in date picker
  const getTodayFormatted = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  if (loading) {
    return (
      <div className="page-container py-5 text-center">
        <LoadingSpinner message="Loading doctor consultation calendar..." />
      </div>
    );
  }

  return (
    <div className="page-container schedule-management-page">
      <div className="page-header">
        <h1 className="page-title">Doctor Schedule & Availability Management</h1>
        <p className="page-subtitle">
          Configure your recurring weekly consultation hours, slot duration, and block specific vacation or leave dates.
        </p>
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

      <form onSubmit={handleSaveSchedule}>
        {/* Weekly Schedule Settings */}
        <div className="card mb-4">
          <div className="card-header-flex">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              <h3>Weekly Working Hours</h3>
            </div>
            <span className="text-muted text-xs">Patients can only book active days</span>
          </div>

          <div className="table-responsive">
            <table className="schedule-config-table">
              <thead>
                <tr>
                  <th>Working Day</th>
                  <th>Status</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Slot Duration</th>
                </tr>
              </thead>
              <tbody>
                {weeklySchedule.map((item, index) => (
                  <tr key={item.day} className={item.isAvailable ? '' : 'row-disabled'}>
                    <td className="font-semibold">{item.day}</td>

                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={item.isAvailable}
                          onChange={(e) =>
                            handleDayChange(index, 'isAvailable', e.target.checked)
                          }
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-text">
                          {item.isAvailable ? 'Available' : 'Day Off'}
                        </span>
                      </label>
                    </td>

                    <td>
                      <input
                        type="time"
                        className="form-control time-input"
                        disabled={!item.isAvailable}
                        value={item.startTime}
                        onChange={(e) =>
                          handleDayChange(index, 'startTime', e.target.value)
                        }
                        required={item.isAvailable}
                      />
                    </td>

                    <td>
                      <input
                        type="time"
                        className="form-control time-input"
                        disabled={!item.isAvailable}
                        value={item.endTime}
                        onChange={(e) =>
                          handleDayChange(index, 'endTime', e.target.value)
                        }
                        required={item.isAvailable}
                      />
                    </td>

                    <td>
                      <select
                        className="form-control slot-duration-select"
                        disabled={!item.isAvailable}
                        value={item.slotDuration || 30}
                        onChange={(e) =>
                          handleDayChange(index, 'slotDuration', Number(e.target.value))
                        }
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unavailable / Blocked Dates Section */}
        <div className="card mb-4">
          <div className="card-header-flex">
            <div className="flex items-center gap-2">
              <CalendarX size={20} className="text-warning" />
              <h3>Block Unavailable Dates</h3>
            </div>
            <span className="text-muted text-xs">Dates when consultation is paused</span>
          </div>

          <div className="blocked-dates-body p-4">
            <div className="add-blocked-date-bar">
              <input
                type="date"
                className="form-control date-picker-field"
                min={getTodayFormatted()}
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleAddBlockedDate}
                disabled={!newBlockedDate}
              >
                <Plus size={16} /> Block Date
              </button>
            </div>

            <div className="blocked-dates-list mt-3">
              <h4 className="sub-heading">Currently Blocked Dates:</h4>
              {unavailableDates.length === 0 ? (
                <p className="text-muted text-sm py-2">
                  No blocked dates configured. Your weekly working hours apply continuously.
                </p>
              ) : (
                <div className="blocked-chips-container">
                  {unavailableDates.map((date) => (
                    <div key={date} className="blocked-date-chip">
                      <Calendar size={14} />
                      <span>{date}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlockedDate(date)}
                        className="chip-remove-btn"
                        title="Unblock date"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Floating Bar / Button */}
        <div className="schedule-submit-bar">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>Saving Schedule Updates...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Schedule Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorSchedulePage;
