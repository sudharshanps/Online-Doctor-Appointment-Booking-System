import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import AlertMessage from '../components/AlertMessage';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const res = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role: 'patient'
      });

      if (res.success) {
        navigate('/patient/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <UserPlus size={24} />
          </div>
          <h2 className="auth-title">Create Patient Account</h2>
          <p className="auth-subtitle">
            Join MediLink Innovations to schedule and manage doctor appointments
          </p>
        </div>

        {errorMessage && (
          <div className="mb-3">
            <AlertMessage type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group mb-3">
            <label className="form-label" htmlFor="regName">
              <User size={16} /> Full Name <span className="required">*</span>
            </label>
            <input
              id="regName"
              name="name"
              type="text"
              className="form-control"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="regEmail">
                <Mail size={16} /> Email Address <span className="required">*</span>
              </label>
              <input
                id="regEmail"
                name="email"
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label" htmlFor="regPhone">
                <Phone size={16} /> Phone Number
              </label>
              <input
                id="regPhone"
                name="phone"
                type="tel"
                className="form-control"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="regPassword">
                <Lock size={16} /> Password <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="regPassword"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control password-input"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password view"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label" htmlFor="regConfirmPassword">
                <Lock size={16} /> Confirm Password <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="regConfirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control password-input"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password view"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="security-notice">
            <ShieldCheck size={16} />
            <span>Passswords are encrypted using bcrypt; authentication is managed with HTTP-only cookies.</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg mt-4"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register Patient Account</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer mt-4 text-center">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
