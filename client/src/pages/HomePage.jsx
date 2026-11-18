import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  ShieldCheck,
  Award,
  Clock,
  UserCheck,
  CheckCircle,
  ArrowRight,
  HeartPulse,
  Brain,
  Sparkles,
  Bone,
  Baby,
  Eye,
  Activity,
  Smile
} from 'lucide-react';
import { api } from '../services/api';
import DoctorCard from '../components/DoctorCard';
import BookingModal from '../components/BookingModal';
import LoadingSpinner from '../components/LoadingSpinner';

const SPECIALTIES = [
  { name: 'Cardiology', icon: HeartPulse, desc: 'Heart & vascular conditions' },
  { name: 'Neurology', icon: Brain, desc: 'Brain, nerves & headache care' },
  { name: 'Dermatology', icon: Sparkles, desc: 'Skin, hair & aesthetics' },
  { name: 'Orthopedics', icon: Bone, desc: 'Bones, joints & sports injuries' },
  { name: 'Pediatrics', icon: Baby, desc: 'Child health & vaccinations' },
  { name: 'General Medicine', icon: Activity, desc: 'Primary & metabolic care' },
  { name: 'Ophthalmology', icon: Eye, desc: 'Eye examinations & vision care' },
  { name: 'Psychiatry', icon: Smile, desc: 'Mental wellness & psychotherapy' }
];

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await api.getDoctors();
        if (res.success && res.data) {
          // Take top 4 as featured
          setFeaturedDoctors(res.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load featured doctors:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <ShieldCheck size={16} />
              <span>MediLink Innovations Healthcare Platform</span>
            </div>
            <h1 className="hero-title">
              Your Health, <span className="highlight-text">Our Priority</span>
            </h1>
            <p className="hero-subtitle">
              Book consultations with top certified medical specialists in seconds. Real-time slot availability, instant confirmation, and effortless appointment management.
            </p>

            <div className="hero-actions">
              <Link to="/doctors" className="btn btn-primary btn-lg">
                <Search size={18} />
                <span>Find a Doctor</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (featuredDoctors.length > 0) {
                    setSelectedDoctorForBooking(featuredDoctors[0]);
                  } else {
                    navigate('/doctors');
                  }
                }}
                className="btn btn-outline btn-lg"
              >
                <Calendar size={18} />
                <span>Book Appointment</span>
              </button>
            </div>

            {/* Key Trust Stats */}
            <div className="hero-stats">
              <div className="stat-pill">
                <span className="stat-num">8+</span>
                <span className="stat-label">Specialist Disciplines</span>
              </div>
              <div className="stat-pill">
                <span className="stat-num">100%</span>
                <span className="stat-label">Verified Doctors</span>
              </div>
              <div className="stat-pill">
                <span className="stat-num">0</span>
                <span className="stat-label">Double-Booking Conflict</span>
              </div>
            </div>
          </div>

          <div className="hero-graphic-card">
            <div className="graphic-header">
              <Activity size={24} className="text-primary" />
              <span>Quick Booking Preview</span>
            </div>
            <div className="graphic-body">
              <div className="graphic-step">
                <div className="step-num">1</div>
                <div>
                  <h4>Select Specialization</h4>
                  <p>Choose from cardiology, neurology, pediatrics & more.</p>
                </div>
              </div>
              <div className="graphic-step">
                <div className="step-num">2</div>
                <div>
                  <h4>Live Time Slot Selection</h4>
                  <p>Check doctor's working schedule & reserve an open slot.</p>
                </div>
              </div>
              <div className="graphic-step">
                <div className="step-num">3</div>
                <div>
                  <h4>Instant Confirmation</h4>
                  <p>Get your digital appointment ID with zero wait time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialization Quick Search */}
      <section className="section-container specialties-section">
        <div className="section-header text-center">
          <span className="section-tag">Explore Specialties</span>
          <h2 className="section-title">Find Doctors by Specialization</h2>
          <p className="section-subtitle">
            Consult with top healthcare experts across diverse medical specialties.
          </p>
        </div>

        <div className="specialties-grid">
          {SPECIALTIES.map((spec) => {
            const Icon = spec.icon;
            return (
              <div
                key={spec.name}
                className="specialty-card"
                onClick={() => navigate(`/doctors?specialization=${encodeURIComponent(spec.name)}`)}
                role="button"
                tabIndex={0}
              >
                <div className="specialty-icon-box">
                  <Icon size={26} className="specialty-icon" />
                </div>
                <h3 className="specialty-name">{spec.name}</h3>
                <p className="specialty-desc">{spec.desc}</p>
                <span className="specialty-explore-link">
                  <span>Browse Specialists</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-container how-it-works-section">
        <div className="section-header text-center">
          <span className="section-tag">Simple & Intuitive</span>
          <h2 className="section-title">How Appointment Booking Works</h2>
          <p className="section-subtitle">
            MediLink streamlines your patient journey from search to consultation.
          </p>
        </div>

        <div className="workflow-grid">
          <div className="workflow-card">
            <div className="workflow-number">01</div>
            <div className="workflow-icon-box">
              <Search size={24} />
            </div>
            <h3>Discover Doctors</h3>
            <p>Filter by clinical discipline, experience, consultation fee, and clinic location.</p>
          </div>

          <div className="workflow-card">
            <div className="workflow-number">02</div>
            <div className="workflow-icon-box">
              <Clock size={24} />
            </div>
            <h3>Pick Available Slot</h3>
            <p>Choose an available calendar date and live time slot tailored to your schedule.</p>
          </div>

          <div className="workflow-card">
            <div className="workflow-number">03</div>
            <div className="workflow-icon-box">
              <CheckCircle size={24} />
            </div>
            <h3>Receive Confirmation</h3>
            <p>Obtain an official Appointment ID with automated database validation.</p>
          </div>

          <div className="workflow-card">
            <div className="workflow-number">04</div>
            <div className="workflow-icon-box">
              <UserCheck size={24} />
            </div>
            <h3>Consult & Manage</h3>
            <p>Attend your appointment, reschedule if needed, or track historical records.</p>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="section-container featured-doctors-section">
        <div className="section-header-flex">
          <div>
            <span className="section-tag">Qualified Practitioners</span>
            <h2 className="section-title">Featured Medical Specialists</h2>
          </div>
          <Link to="/doctors" className="btn btn-outline btn-sm">
            <span>View All Doctors</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loadingDoctors ? (
          <div className="py-5 text-center">
            <LoadingSpinner message="Loading featured specialists..." />
          </div>
        ) : (
          <div className="doctors-grid">
            {featuredDoctors.map((doc) => (
              <DoctorCard
                key={doc._id}
                doctor={doc}
                onBook={(doctor) => setSelectedDoctorForBooking(doctor)}
                onViewDetails={(doctor) => navigate(`/doctors?id=${doctor._id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Services Banner */}
      <section className="section-container services-banner-section">
        <div className="services-banner">
          <div className="banner-text">
            <h2>Are You a Licensed Medical Doctor?</h2>
            <p>
              Join MediLink Innovations to manage your clinic appointments, streamline consultation hours, and reach patients needing specialized care.
            </p>
          </div>
          <div className="banner-action">
            <Link to="/login?role=doctor" className="btn btn-light-teal btn-lg">
              Doctor Portal Login
            </Link>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedDoctorForBooking && (
        <BookingModal
          doctor={selectedDoctorForBooking}
          isOpen={!!selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onBookingSuccess={() => {
            setSelectedDoctorForBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
