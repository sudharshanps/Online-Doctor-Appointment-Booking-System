import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Phone, Mail, MapPin, Heart, ShieldAlert } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Col 1: Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <div className="logo-icon-box">
                <Activity size={22} className="logo-icon" />
              </div>
              <div className="brand-text-block">
                <span className="brand-name">MediLink</span>
                <span className="brand-tagline">Innovations</span>
              </div>
            </div>
            <p className="footer-bio">
              Empowering patients and medical practitioners with seamless, intelligent, and secure doctor appointment scheduling.
            </p>
            <div className="footer-badge">
              <ShieldAlert size={16} />
              <span>Verified Medical Specialist Network</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/doctors">Find a Doctor</Link></li>
              <li><Link to="/login">Patient Sign In</Link></li>
              <li><Link to="/login?role=doctor">Doctor Portal</Link></li>
              <li><Link to="/register">Create Patient Account</Link></li>
            </ul>
          </div>

          {/* Col 3: Specializations */}
          <div className="footer-col">
            <h4 className="footer-heading">Specialties</h4>
            <ul className="footer-links">
              <li><Link to="/doctors?specialization=Cardiology">Cardiology</Link></li>
              <li><Link to="/doctors?specialization=Neurology">Neurology</Link></li>
              <li><Link to="/doctors?specialization=Dermatology">Dermatology</Link></li>
              <li><Link to="/doctors?specialization=Orthopedics">Orthopedics</Link></li>
              <li><Link to="/doctors?specialization=Pediatrics">Pediatrics</Link></li>
              <li><Link to="/doctors?specialization=General Medicine">General Medicine</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Emergency */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact & Support</h4>
            <ul className="contact-list">
              <li>
                <MapPin size={18} className="contact-icon" />
                <span>MediLink Innovations Healthcare Plaza, Indiranagar, Bengaluru, India</span>
              </li>
              <li>
                <Phone size={18} className="contact-icon" />
                <span>Consultation Helpline: +91 80 4000 5500</span>
              </li>
              <li>
                <Mail size={18} className="contact-icon" />
                <span>support@medilink-innovations.com</span>
              </li>
            </ul>
            <div className="emergency-callout">
              <p className="emergency-title">Medical Emergency?</p>
              <p className="emergency-text">Please dial 112 or visit your nearest emergency room immediately.</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} MediLink Innovations. All rights reserved.</p>
          <p className="footer-disclaimer">
            This platform is an educational appointment booking system. Real medical decisions must always be guided by qualified healthcare professionals.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
