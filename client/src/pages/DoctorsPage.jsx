import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Stethoscope,
  X,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  CalendarCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import DoctorCard from '../components/DoctorCard';
import BookingModal from '../components/BookingModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AlertMessage from '../components/AlertMessage';

const ALL_SPECIALTIES = [
  'All',
  'Cardiology',
  'Neurology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'General Medicine',
  'Ophthalmology',
  'Psychiatry'
];

const DoctorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSpec = searchParams.get('specialization') || 'All';
  const initialDoctorId = searchParams.get('id') || '';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpec);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [selectedDoctorForDetails, setSelectedDoctorForDetails] = useState(null);
  const [bannerMessage, setBannerMessage] = useState('');

  // Fetch doctors whenever filters change
  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.getDoctors({
        specialization: selectedSpecialty,
        search: searchTerm
      });

      if (res.success && res.data) {
        setDoctors(res.data);

        // If URL had ?id=..., open that doctor's detail modal
        if (initialDoctorId) {
          const matched = res.data.find((d) => d._id === initialDoctorId);
          if (matched) setSelectedDoctorForDetails(matched);
        }
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleSpecialtyClick = (spec) => {
    setSelectedSpecialty(spec);
    const newParams = new URLSearchParams(searchParams);
    if (spec === 'All') {
      newParams.delete('specialization');
    } else {
      newParams.set('specialization', spec);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="page-container doctors-page">
      <div className="page-header">
        <h1 className="page-title">Find a Medical Specialist</h1>
        <p className="page-subtitle">
          Search qualified doctors, review consultation schedules, and book direct appointments with verified clinicians.
        </p>
      </div>

      {bannerMessage && (
        <div className="mb-4">
          <AlertMessage type="success" message={bannerMessage} onClose={() => setBannerMessage('')} />
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="search-filter-card">
        <form onSubmit={handleSearchSubmit} className="search-bar-form">
          <div className="search-input-group">
            <Search size={18} className="search-bar-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by doctor name, clinical specialty, or clinic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchTerm('');
                  setTimeout(fetchDoctors, 0);
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        {/* Specialization Filter Pills */}
        <div className="specialty-pills-container">
          <span className="pills-label">
            <Filter size={14} /> Filter Specialty:
          </span>
          <div className="pills-scroll-wrapper">
            {ALL_SPECIALTIES.map((spec) => (
              <button
                key={spec}
                type="button"
                className={`specialty-pill-btn ${selectedSpecialty === spec ? 'active' : ''}`}
                onClick={() => handleSpecialtyClick(spec)}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctors Grid / Results */}
      <div className="doctors-results-section mt-4">
        <div className="results-count-bar">
          <span className="results-count-text">
            Showing <strong>{doctors.length}</strong> available doctor{doctors.length === 1 ? '' : 's'}
            {selectedSpecialty !== 'All' && ` in ${selectedSpecialty}`}
          </span>
        </div>

        {loading ? (
          <div className="py-5 text-center">
            <LoadingSpinner message="Finding medical specialists..." />
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No Doctors Found"
            description="No medical specialists matched your search criteria. Try selecting another specialization or clearing your keyword."
            actionText="Reset Filters"
            onAction={() => {
              setSelectedSpecialty('All');
              setSearchTerm('');
              setSearchParams({});
              setTimeout(fetchDoctors, 0);
            }}
          />
        ) : (
          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onBook={(doc) => setSelectedDoctorForBooking(doc)}
                onViewDetails={(doc) => setSelectedDoctorForDetails(doc)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctorForDetails && (
        <div className="modal-backdrop">
          <div className="modal-dialog doctor-detail-modal">
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>{selectedDoctorForDetails.userId?.name}</h3>
                <span className="doctor-specialization-badge">
                  {selectedDoctorForDetails.specialization}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedDoctorForDetails(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-profile-hero">
                <div className="detail-avatar">
                  <Stethoscope size={36} />
                </div>
                <div className="detail-meta">
                  <div className="meta-line">
                    <GraduationCap size={16} />
                    <span>{selectedDoctorForDetails.qualifications}</span>
                  </div>
                  <div className="meta-line">
                    <Briefcase size={16} />
                    <span>{selectedDoctorForDetails.experience} years clinical practice</span>
                  </div>
                  <div className="meta-line">
                    <MapPin size={16} />
                    <span>
                      {selectedDoctorForDetails.clinic?.name},{' '}
                      {selectedDoctorForDetails.clinic?.address},{' '}
                      {selectedDoctorForDetails.clinic?.city}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section mt-3">
                <h4 className="detail-subtitle">About the Doctor</h4>
                <p className="detail-description">{selectedDoctorForDetails.description}</p>
              </div>

              <div className="detail-section mt-3">
                <h4 className="detail-subtitle">Weekly Consultation Schedule</h4>
                <div className="weekly-schedule-table-box">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Hours</th>
                        <th>Slot Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedDoctorForDetails.weeklySchedule || []).map((s) => (
                        <tr key={s.day} className={s.isAvailable ? '' : 'row-off'}>
                          <td className="font-semibold">{s.day}</td>
                          <td>{s.isAvailable ? `${s.startTime} - ${s.endTime}` : '—'}</td>
                          <td>{s.isAvailable ? `${s.slotDuration || 30} mins` : '—'}</td>
                          <td>
                            {s.isAvailable ? (
                              <span className="badge-available">Available</span>
                            ) : (
                              <span className="badge-off">Closed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer justify-between mt-4">
                <div className="modal-fee-display">
                  <span>Consultation Fee:</span>
                  <strong>₹{selectedDoctorForDetails.consultationFee}</strong>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const doc = selectedDoctorForDetails;
                    setSelectedDoctorForDetails(null);
                    setSelectedDoctorForBooking(doc);
                  }}
                >
                  <CalendarCheck size={16} />
                  <span>Book Appointment Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      {selectedDoctorForBooking && (
        <BookingModal
          doctor={selectedDoctorForBooking}
          isOpen={!!selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onBookingSuccess={(booked) => {
            setBannerMessage(
              `Appointment successfully scheduled with ${selectedDoctorForBooking.userId?.name} for ${booked.appointmentDate} at ${booked.startTime}!`
            );
          }}
        />
      )}
    </div>
  );
};

export default DoctorsPage;
