import React, { useState, useEffect } from 'react';
import UserSidebar from '../components/UserSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader, Save, KeyRound } from 'lucide-react';
import { updateUserProfile, updateUserPassword } from '../services/api';
import { useToast } from '../hooks/useToast';
import TwoFactorAuthSetup from '../components/TwoFactorAuthSetup';

const UserProfilePage: React.FC = () => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const { addToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  // State for profile information form
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    companyName: '',
    gstNumber: '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // State for password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        companyName: user.companyName || '',
        gstNumber: user.gstNumber || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const updatedUser = await updateUserProfile(profileData);
      updateAuthUser(updatedUser); // Update context/localStorage
      addToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to update profile.', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
        addToast('New password must be at least 8 characters long.', 'error');
        return;
    }
    setIsUpdatingPassword(true);
    try {
      const { message } = await updateUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      addToast(message, 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error: any) {
      addToast(error.message || 'Failed to update password.', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  const on2FAStateChange = (isEnabled: boolean) => {
    if (user) {
      updateAuthUser({ ...user, twoFactorEnabled: isEnabled });
    }
    setShow2FASetup(false);
  };


  if (!user) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin" /></div>;
  }

  return (
    <>
    {show2FASetup && <TwoFactorAuthSetup onClose={() => setShow2FASetup(false)} onStateChange={on2FAStateChange}/>}
    <div className="flex h-screen bg-gray-100 font-sans">
      <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Account Settings</h1>
            
            {/* Profile Information Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-4 mb-6">Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" name="name" value={profileData.name} onChange={handleProfileChange} variant="light" required />
                  <Input label="Email Address" name="email" type="email" value={profileData.email} onChange={handleProfileChange} variant="light" required />
                  <Input label="Phone Number" name="phone" value={profileData.phone} onChange={handleProfileChange} variant="light" required />
                  <Input label="Address" name="address" value={profileData.address} onChange={handleProfileChange} variant="light" required />
                  <Input label="Company Name (Optional)" name="companyName" value={profileData.companyName} onChange={handleProfileChange} variant="light" />
                  <Input label="GST Number (Optional)" name="gstNumber" value={profileData.gstNumber} onChange={handleProfileChange} variant="light" />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? <Loader className="animate-spin h-5 w-5" /> : <><Save size={16} className="mr-2"/> Save Profile</>}
                  </Button>
                </div>
              </form>
            </div>

            {/* Security Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-4 mb-6">Security</h2>
              <div className="flex justify-between items-center">
                  <div>
                      <h3 className="font-semibold text-gray-700">Two-Factor Authentication (2FA)</h3>
                      <p className="text-sm text-gray-500">
                          {user.twoFactorEnabled 
                              ? '2FA is enabled on your account.' 
                              : 'Add an extra layer of security to your account.'}
                      </p>
                  </div>
                  <Button onClick={() => setShow2FASetup(true)} variant={user.twoFactorEnabled ? 'secondary' : 'primary'}>
                      {user.twoFactorEnabled ? 'Manage' : 'Enable 2FA'}
                  </Button>
              </div>
            </div>

            
            {/* Change Password Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-4 mb-6">Change Password</h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Current Password" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} variant="light" required />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="New Password" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} variant="light" required />
                    <Input label="Confirm New Password" name="confirmNewPassword" type="password" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} variant="light" required />
                 </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? <Loader className="animate-spin h-5 w-5" /> : <><KeyRound size={16} className="mr-2"/> Update Password</>}
                  </Button>
                </div>
              </form>
            </div>
            
          </div>
        </main>
      </div>
    </div>
    </>
  );
};

export default UserProfilePage;