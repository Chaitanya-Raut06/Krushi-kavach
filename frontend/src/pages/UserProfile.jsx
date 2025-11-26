import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    language: '',
    district: '',
    taluka: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      setProfile(response.data);
      setFormData({
        fullName: response.data.fullName || '',
        language: response.data.language || 'en',
        district: response.data.address?.district || '',
        taluka: response.data.address?.taluka || '',
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.updateProfile(formData);
      updateUser(response.data);
      setError('');
      alert('Profile updated successfully');
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setError('');
      alert('Password changed successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const response = await userAPI.uploadPhoto(file);
      updateUser(response.data);
      setError('');
      alert('Photo uploaded successfully');
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    }
  };

  const handlePhotoDelete = async () => {
    if (window.confirm('Are you sure you want to delete your profile photo?')) {
      try {
        await userAPI.deletePhoto();
        fetchProfile();
        setError('');
        alert('Photo deleted successfully');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete photo');
      }
    }
  };

  const handlePhotoClick = () => {
    if (profile?.profilePhoto?.url) {
      setShowPhotoModal(true);
    }
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <style>{`
          .profile-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
          }
        `}</style>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <style>{`
        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        }

        .profile-header {
          font-size: 2rem;
          font-weight: bold;
          color: #2d5016;
          margin-bottom: 30px;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #f5c6cb;
          margin-bottom: 20px;
        }

        .profile-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .tab-navigation {
          display: flex;
          border-bottom: 2px solid #e0e0e0;
        }

        .tab-button {
          padding: 15px 30px;
          font-size: 1rem;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
          color: #666;
        }

        .tab-button:hover {
          background: #f5f5f5;
          color: #333;
        }

        .tab-button.active {
          color: #28a745;
          border-bottom-color: #28a745;
        }

        .tab-content {
          padding: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 10px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
          box-sizing: border-box;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #28a745;
        }

        .form-input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .photo-section {
          margin-bottom: 30px;
        }

        .photo-preview {
          margin-bottom: 15px;
        }

        .photo-image {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          cursor: pointer;
          border: 4px solid #28a745;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .photo-image:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .photo-actions {
          display: flex;
          gap: 10px;
        }

        .button {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }

        .button-primary {
          background: #28a745;
          color: white;
        }

        .button-primary:hover {
          background: #218838;
        }

        .button-danger {
          background: #dc3545;
          color: white;
        }

        .button-danger:hover {
          background: #c82333;
        }

        .file-input-wrapper {
          position: relative;
          display: inline-block;
        }

        .file-input-wrapper input[type=file] {
          position: absolute;
          left: -9999px;
        }

        .file-input-label {
          display: inline-block;
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .file-input-label:hover {
          background: #218838;
        }

        /* Photo Modal Styles */
        .photo-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .photo-modal-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .photo-modal-image {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .photo-modal-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: white;
          color: #333;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        }

        .photo-modal-close:hover {
          background: #f0f0f0;
        }

        .form-actions {
          margin-top: 30px;
        }

        @media (max-width: 768px) {
          .profile-container {
            padding: 10px;
          }

          .profile-header {
            font-size: 1.5rem;
          }

          .tab-content {
            padding: 20px;
          }

          .photo-actions {
            flex-direction: column;
          }

          .photo-modal-close {
            top: -50px;
            right: -10px;
          }
        }
      `}</style>

      <h1 className="profile-header">Profile</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="profile-card">
        <div className="tab-navigation">
          <button
            onClick={() => setActiveTab('profile')}
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          >
            Change Password
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'profile' && (
            <div>
              <div className="photo-section">
                <label className="form-label">Profile Photo</label>
                {profile?.profilePhoto?.url && (
                  <div className="photo-preview">
                    <img
                      src={profile.profilePhoto.url}
                      alt="Profile"
                      className="photo-image"
                      onClick={handlePhotoClick}
                      title="Click to view full size"
                    />
                  </div>
                )}
                <div className="photo-actions">
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="file-input-label">
                      Upload Photo
                    </label>
                  </div>
                  {profile?.profilePhoto && (
                    <button
                      onClick={handlePhotoDelete}
                      className="button button-danger"
                    >
                      Delete Photo
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="text"
                    disabled
                    className="form-input"
                    value={profile?.mobileNumber || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select
                    className="form-select"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">District</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Taluka</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.taluka}
                    onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="button button-primary">
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="button button-primary">
                  Change Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && profile?.profilePhoto?.url && (
        <div className="photo-modal-overlay" onClick={closePhotoModal}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={closePhotoModal}>
              ×
            </button>
            <img
              src={profile.profilePhoto.url}
              alt="Profile Photo"
              className="photo-modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
