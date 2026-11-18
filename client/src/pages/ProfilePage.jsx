import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  GraduationCap,
  Briefcase,
  MapPin,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

const ProfilePage = () => {
  const { user, doctorProfile, refreshUser, isDoctor } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Doctor-specific fields
  const [specialization, setSpecialization] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experience, setExperience] = useState(0);
  const [consultationFee, setConsultationFee] = useState(500);
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicCity, setClinicCity] = useState('');
  const [description, setDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }

    if (doctorProfile) {
      setSpecialization(doctorProfile.specialization || '');
      setQualifications(doctorProfile.qualifications || '');
      setExperience(doctorProfile.experience || 0);
      setConsultationFee(doctorProfile.consultationFee || 500);
      setClinicName(doctorProfile.clinic?.name || '');
      setClinicAddress(doctorProfile.clinic?.address || '');
      setClinicCity(doctorProfile.clinic?.city || '');
      setDescription(doctorProfile.description || '');
    }
  }, [user, doctorProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setAlert(null);

      if (isDoctor) {
        // Update both user & doctor profile
        await api.updateDoctorProfile({
          name: name.trim(),
          phone: phone.trim(),
          specialization: specialization.trim(),
          qualifications: qualifications.trim(),
          experience: Number(experience),
          consultationFee: Number(consultationFee),
          clinic: {
            name: clinicName.trim(),
            address: clinicAddress.trim(),
            city: clinicCity.trim()
          },
          description: description.trim()
        });
      } else {
        // Patient update
        await api.updateProfile({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim()
        });
      }

      await refreshUser();
      setAlert({
        type: 'success',
        message: 'Your profile has been updated and saved to MongoDB successfully.'
      });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to update profile.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container profile-page">
      <div className="page-header">
        <h1 className="page-title">Profile & Account Settings</h1>
        <p className="page-subtitle">
          Manage your personal information, contact records, and professional details.
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

      <form onSubmit={handleSubmit} className="profile-form-grid">
        {/* Left Card: Account / Personal Info */}
        <div className="card">
          <div className="card-header-flex">
            <div className="flex items-center gap-2">
              <User size={20} className="text-primary" />
              <h3>Personal Details</h3>
            </div>
            <span className="user-role-tag">
              {user?.role === 'doctor' ? 'Doctor Account' : 'Patient Account'}
            </span>
          </div>

          <div className="p-4">
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="profileName">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="profileName"
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label" htmlFor="profileEmail">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="profileEmail"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isDoctor} // Doctor login email is primary account key
              />
              {isDoctor && (
                <span className="form-hint">Doctor login emails are managed by hospital administration.</span>
              )}
            </div>

            <div className="form-group mb-3">
              <label className="form-label" htmlFor="profilePhone">
                Contact Phone Number
              </label>
              <input
                id="profilePhone"
                type="tel"
                className="form-control"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Card: Doctor Professional Credentials (If Doctor) */}
        {isDoctor && (
          <div className="card">
            <div className="card-header-flex">
              <div className="flex items-center gap-2">
                <Stethoscope size={20} className="text-primary" />
                <h3>Clinical & Practice Information</h3>
              </div>
            </div>

            <div className="p-4">
              <div className="form-row-2">
                <div className="form-group mb-3">
                  <label className="form-label" htmlFor="docSpecialization">
                    Medical Specialization <span className="required">*</span>
                  </label>
                  <input
                    id="docSpecialization"
                    type="text"
                    className="form-control"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label" htmlFor="docExperience">
                    Years of Experience <span className="required">*</span>
                  </label>
                  <input
                    id="docExperience"
                    type="number"
                    min="0"
                    max="60"
                    className="form-control"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group mb-3">
                  <label className="form-label" htmlFor="docFee">
                    Consultation Fee (in INR ₹) <span className="required">*</span>
                  </label>
                  <input
                    id="docFee"
                    type="number"
                    min="0"
                    className="form-control"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label" htmlFor="docQualifications">
                    Qualifications & Degrees <span className="required">*</span>
                  </label>
                  <input
                    id="docQualifications"
                    type="text"
                    className="form-control"
                    placeholder="e.g. MBBS, MD, DM"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group mb-3">
                  <label className="form-label" htmlFor="clinicNameInput">Clinic / Hospital Name</label>
                  <input
                    id="clinicNameInput"
                    type="text"
                    className="form-control"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label" htmlFor="clinicAddressInput">Address</label>
                  <input
                    id="clinicAddressInput"
                    type="text"
                    className="form-control"
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label" htmlFor="clinicCityInput">City</label>
                  <input
                    id="clinicCityInput"
                    type="text"
                    className="form-control"
                    value={clinicCity}
                    onChange={(e) => setClinicCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label" htmlFor="docDescription">Doctor Bio / Practice Summary</label>
                <textarea
                  id="docDescription"
                  rows="3"
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <div className="profile-submit-full mt-3">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
