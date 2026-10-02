import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { User, Mail, Phone, MapPin, Building, Lock, Shield, Check, Save } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const toast = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    ward: user?.ward || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile(profileData);
      toast.success('Your profile details have been saved.', 'Profile Updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.', 'Error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirmation do not match.', 'Password Mismatch');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.', 'Password Too Short');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Your password has been updated successfully.', 'Password Changed');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.', 'Error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Account Profile & Settings"
        subtitle="Manage your personal contact details, municipal credentials, and security settings."
      />

      {/* Profile Overview Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar name={user.name} size="xl" status="online" />
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {user.name}
              </h2>
              <Badge
                variant={
                  user.role === 'admin'
                    ? 'purple'
                    : user.role === 'officer'
                    ? 'warning'
                    : 'primary'
                }
                size="sm"
              >
                {user.role?.toUpperCase()}
              </Badge>
              {user.department && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {user.department.name} ({user.department.code})
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.designation || (user.role === 'citizen' ? 'Registered Citizen' : 'System Administrator')} &bull;{' '}
              <span className="font-mono">{user.email}</span>
            </p>

            {user.ward && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned Jurisdiction: <strong>{user.ward}</strong></span>
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form 1: Edit Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Update your contact info for official grievance notifications.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <Input
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  required
                  leftIcon={<User className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Email
                </label>
                <Input
                  value={user.email}
                  disabled
                  helperText="Email cannot be changed directly in prototype"
                  leftIcon={<Mail className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <Input
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="+91 98000 00000"
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Municipal Ward / Beat
                </label>
                <Input
                  name="ward"
                  value={profileData.ward}
                  onChange={handleProfileChange}
                  placeholder="e.g. Ward 2 - North"
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential / Office Address
                </label>
                <Input
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  placeholder="Street or Building name"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isUpdatingProfile}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Profile Details
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Form 2: Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Password</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ensure your account is secured with a strong passphrase.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <Input
                  type="password"
                  name="currentPassword"
                  required
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password (min 6 characters)
                </label>
                <Input
                  type="password"
                  name="newPassword"
                  required
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New secure password"
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  required
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-type new password"
                  leftIcon={<Check className="w-4 h-4" />}
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  Password Requirements:
                </p>
                <p>&bull; At least 6 characters in length</p>
                <p>&bull; Demo accounts can be re-seeded via <code>npm run seed</code></p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  isLoading={isChangingPassword}
                  leftIcon={<Lock className="w-4 h-4" />}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
