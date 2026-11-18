import React from 'react';
import {
  Stethoscope,
  GraduationCap,
  Briefcase,
  MapPin,
  CalendarCheck,
  ChevronRight,
  Clock
} from 'lucide-react';

const DoctorCard = ({ doctor, onBook, onViewDetails }) => {
  const doctorUser = doctor.userId || {};
  const clinic = doctor.clinic || {};
  
  // Get active working days
  const activeDays = (doctor.weeklySchedule || [])
    .filter((d) => d.isAvailable)
    .map((d) => d.day.slice(0, 3));

  return (
    <div className="doctor-card">
      <div className="doctor-card-header">
        <div className="doctor-avatar-box">
          <Stethoscope size={28} className="doctor-avatar-icon" />
        </div>
        <div className="doctor-primary-info">
          <h3 className="doctor-name">{doctorUser.name || 'Specialist Doctor'}</h3>
          <span className="doctor-specialization-badge">{doctor.specialization}</span>
        </div>
      </div>

      <div className="doctor-card-body">
        <div className="doctor-detail-row">
          <GraduationCap size={16} className="detail-icon" />
          <span className="detail-text" title={doctor.qualifications}>
            {doctor.qualifications}
          </span>
        </div>

        <div className="doctor-detail-row">
          <Briefcase size={16} className="detail-icon" />
          <span className="detail-text">{doctor.experience} years clinical experience</span>
        </div>

        <div className="doctor-detail-row">
          <MapPin size={16} className="detail-icon" />
          <span className="detail-text">
            {clinic.name}, {clinic.city}
          </span>
        </div>

        <div className="doctor-detail-row">
          <Clock size={16} className="detail-icon" />
          <span className="detail-text">
            Days: {activeDays.length > 0 ? activeDays.join(', ') : 'By appointment'}
          </span>
        </div>
      </div>

      <div className="doctor-card-footer">
        <div className="fee-container">
          <span className="fee-label">Consultation Fee</span>
          <span className="fee-amount">₹{doctor.consultationFee}</span>
        </div>

        <div className="card-actions">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(doctor)}
              className="btn btn-outline btn-sm"
            >
              Profile
            </button>
          )}
          <button
            type="button"
            onClick={() => onBook(doctor)}
            className="btn btn-primary btn-sm"
          >
            <CalendarCheck size={16} />
            <span>Book Slot</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
