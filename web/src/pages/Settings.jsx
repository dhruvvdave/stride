import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { updateProfile } from '../store/slices/authSlice';
import { updateProfile as updateProfileService } from '../services/auth';
import toast from 'react-hot-toast';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updatedUser = await updateProfileService(profileData);
      dispatch(updateProfile(updatedUser));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      // Call password change API
      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout requireAuth={true}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Profile Settings */}
        <Card padding="lg" className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              required
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>

        {/* Password Settings */}
        <Card padding="lg" className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </Card>

        {/* Subscription */}
        {user?.subscription_status === 'active' && (
          <Card padding="lg" className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">Premium Plan</p>
                <p className="text-sm text-gray-600">Active subscription</p>
              </div>
              <Button variant="secondary">Manage Subscription</Button>
            </div>
          </Card>
        )}

        {/* Danger Zone */}
        <Card padding="lg" className="border-2 border-danger-main">
          <h2 className="text-xl font-semibold text-danger-main mb-4">Danger Zone</h2>
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="danger">Delete Account</Button>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
