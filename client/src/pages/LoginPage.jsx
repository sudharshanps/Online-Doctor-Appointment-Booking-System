import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Stethoscope,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';
import AlertMessage from '../components/AlertMessage';

const LoginPage = () => {
  const { login, isAuthenticated, isDoctor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = isDoctor ? '/doctor/dashboard' : '/patient/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isDoctor, navigate]);

  const defaultRole = searchParams.get('role') === 'doctor' ? 'doctor' : 'patient';
  const [role, setRole] = useState(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const res = await login({
        email: email.trim(),
        password,
        requiredRole: role
      });

      if (res.success) {
        // Redirect to intended location or role dashboard
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else if (res.user.role === 'doctor') {
          navigate('/doctor/dashboard', { replace: true });
        } else {
          navigate('/patient/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (demoType) => {
    if (demoType === 'patient') {
      setRole('patient');
      setEmail('rahul.verma@example.com');
      setPassword('password123');
    } else if (demoType === 'doctor') {
      setRole('doctor');
      setEmail('priya.sharma@medilink.com');
      setPassword('password123');
    }
    setErrorMessage('');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-badge">
            {role === 'doctor' ? <Stethoscope size={24} /> : <User size={24} />}
          </div>
          <h2 className="auth-title">
            {role === 'doctor' ? 'Doctor Portal Sign In' : 'Patient Account Sign In'}
          </h2>
          <p className="auth-subtitle">
            Welcome back to MediLink Innovations Healthcare Services
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="role-switch-tabs">
          <button
            type="button"
            className={`role-tab ${role === 'patient' ? 'active' : ''}`}
            onClick={() => {
              setRole('patient');
              setErrorMessage('');
            }}
          >
            <User size={16} />
            <span>Patient Portal</span>
          </button>
          <button
            type="button"
            className={`role-tab ${role === 'doctor' ? 'active' : ''}`}
            onClick={() => {
              setRole('doctor');
              setErrorMessage('');
            }}
          >
            <Stethoscope size={16} />
            <span>Doctor Portal</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-3">
            <AlertMessage type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group mb-3">
            <label className="form-label" htmlFor="loginEmail">
              <Mail size={16} /> Email Address
            </label>
            <input
              id="loginEmail"
              type="email"
              className="form-control"
              placeholder={role === 'doctor' ? 'doctor@medilink.com' : 'patient@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group mb-3">
            <div className="label-with-action">
              <label className="form-label" htmlFor="loginPassword">
                <Lock size={16} /> Password
              </label>
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotSuccess(false);
                  setShowForgotModal(true);
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div className="password-input-wrapper">
              <input
                id="loginPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-control password-input"
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg mt-4"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to {role === 'doctor' ? 'Doctor Portal' : 'MediLink'}</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Account Fill Helpers */}
        <div className="demo-credentials-box mt-4">
          <div className="demo-credentials-header">
            <HelpCircle size={14} />
            <span>Demonstration Testing Accounts</span>
          </div>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn btn-sm btn-outline-info"
              onClick={() => handleFillDemo('patient')}
            >
              Demo Patient (Rahul V.)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-teal"
              onClick={() => handleFillDemo('doctor')}
            >
              Demo Doctor (Dr. Priya S.)
            </button>
          </div>
        </div>

        <div className="auth-footer mt-4 text-center">
          <p>
            Don't have a patient account yet?{' '}
            <Link to="/register" className="auth-link">
              Register as a Patient
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog forgot-modal">
            <div className="modal-header">
              <h3>Reset Password Assistance</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowForgotModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body p-4">
              {forgotSuccess ? (
                <div className="text-center py-3">
                  <CheckCircle2 size={48} className="text-success mb-2" />
                  <h4>Password Recovery Notice Sent</h4>
                  <p className="text-muted">
                    If an account is associated with <strong>{forgotEmail}</strong>, password reset verification instructions have been dispatched. For demo accounts, the default password is <code>password123</code>.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary mt-3"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <p className="text-muted mb-3">
                    Enter your registered email address and we'll verify your identity to reset your access.
                  </p>
                  <div className="form-group mb-3">
                    <label className="form-label" htmlFor="forgotEmailInput">Email Address</label>
                    <input
                      id="forgotEmailInput"
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowForgotModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Send Instructions
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
