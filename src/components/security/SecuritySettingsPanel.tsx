import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  RefreshCw, 
  Smartphone, 
  Clock, 
  FileText 
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const SecuritySettingsPanel: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [twoFactorSuccess, setTwoFactorSuccess] = useState<string | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState(30); // minutes
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSecuritySettings();
    }
  }, [user]);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      
      // In a real app, these would be fetched from your API
      // For demo purposes, we'll use mock data
      
      // Get 2FA status
      const twoFactorStatus = await authService.getTwoFactorStatus(user!.id);
      setTwoFactorEnabled(twoFactorStatus.enabled);
      
      // Get session info
      const sessionInfo = await authService.getSessionInfo(user!.id);
      setSessionTimeout(sessionInfo.timeoutMinutes);
      setLastActivity(new Date(sessionInfo.lastActivity));
      
      // Get security logs
      const logs = await authService.getSecurityLogs(user!.id);
      setSecurityLogs(logs);
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Reset states
    setPasswordError(null);
    setPasswordSuccess(null);
    
    // Validate inputs
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      
      // Verify current password
      await authService.verifyPassword(currentPassword);
      
      // Update password
      await authService.updatePassword(newPassword);
      
      // Log password change
      await authService.logAuditEvent(
        user!.id,
        'update',
        'password',
        { method: 'self_service' }
      );
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Show success message
      setPasswordSuccess('Password changed successfully');
      
      // Refresh session
      await authService.refreshSession();
    } catch (error) {
      console.error('Change password error:', error);
      setPasswordError('Failed to change password. Please check your current password and try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setTwoFactorError(null);
      setTwoFactorSuccess(null);
      setIsEnabling2FA(true);
      
      // Generate 2FA secret and QR code
      const twoFactorData = await authService.generateTwoFactorSecret(user!.id);
      setQrCodeUrl(twoFactorData.qrCodeUrl);
    } catch (error) {
      console.error('Enable 2FA error:', error);
      setTwoFactorError('Failed to enable two-factor authentication');
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      setTwoFactorError(null);
      
      if (!verificationCode) {
        setTwoFactorError('Verification code is required');
        return;
      }
      
      // Verify code
      const isValid = await authService.verifyTwoFactor(user!.id, verificationCode);
      
      if (isValid) {
        // Enable 2FA
        await authService.enableTwoFactor(user!.id);
        
        // Log 2FA enablement
        await authService.logAuditEvent(
          user!.id,
          'update',
          'security_settings',
          { action: 'enable_2fa' }
        );
        
        // Update state
        setTwoFactorEnabled(true);
        setQrCodeUrl(null);
        setVerificationCode('');
        setTwoFactorSuccess('Two-factor authentication enabled successfully');
        
        // Refresh user data
        await refreshUser();
      } else {
        setTwoFactorError('Invalid verification code');
      }
    } catch (error) {
      console.error('Verify 2FA error:', error);
      setTwoFactorError('Failed to verify code');
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }
    
    try {
      setTwoFactorError(null);
      setTwoFactorSuccess(null);
      
      // Disable 2FA
      await authService.disableTwoFactor(user!.id);
      
      // Log 2FA disablement
      await authService.logAuditEvent(
        user!.id,
        'update',
        'security_settings',
        { action: 'disable_2fa' }
      );
      
      // Update state
      setTwoFactorEnabled(false);
      setTwoFactorSuccess('Two-factor authentication disabled successfully');
      
      // Refresh user data
      await refreshUser();
    } catch (error) {
      console.error('Disable 2FA error:', error);
      setTwoFactorError('Failed to disable two-factor authentication');
    }
  };

  const handleUpdateSessionTimeout = async (minutes: number) => {
    try {
      await authService.updateSessionTimeout(user!.id, minutes);
      
      // Log session timeout update
      await authService.logAuditEvent(
        user!.id,
        'update',
        'security_settings',
        { action: 'update_session_timeout', value: minutes }
      );
      
      // Update state
      setSessionTimeout(minutes);
    } catch (error) {
      console.error('Update session timeout error:', error);
      alert('Failed to update session timeout');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account security and authentication settings
        </p>
      </div>

      {/* Password Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Password Management</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Change your account password. We recommend using a strong, unique password.
            </p>
            
            <div className="space-y-4">
              {/* Current Password */}
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <Input
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Confirm New Password */}
              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Error/Success Messages */}
              {passwordError && (
                <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
                  <AlertTriangle size={16} className="mr-2" />
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle size={16} className="mr-2" />
                  {passwordSuccess}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleChangePassword}
                  isLoading={isChangingPassword}
                  leftIcon={<Lock size={16} />}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            
            {twoFactorEnabled ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-300">Two-Factor Authentication is Enabled</h4>
                  <p className="mt-1 text-sm text-green-700 dark:text-green-200">
                    Your account is protected with an additional layer of security. You'll need to enter a verification code from your authenticator app when signing in.
                  </p>
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      onClick={handleDisable2FA}
                      leftIcon={<X size={16} />}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Disable Two-Factor Authentication
                    </Button>
                  </div>
                </div>
              </div>
            ) : qrCodeUrl ? (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Set Up Two-Factor Authentication</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mb-4">
                    Scan the QR code below with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).
                  </p>
                  
                  <div className="flex justify-center mb-4">
                    <div className="p-2 bg-white rounded-lg">
                      <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      label="Verification Code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code from your app"
                      maxLength={6}
                    />
                    
                    {twoFactorError && (
                      <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
                        <AlertTriangle size={16} className="mr-2" />
                        {twoFactorError}
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setQrCodeUrl(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleVerify2FA}
                        disabled={!verificationCode}
                        leftIcon={<CheckCircle size={16} />}
                      >
                        Verify and Enable
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-300">Two-Factor Authentication is Disabled</h4>
                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-200">
                      Your account is less secure without two-factor authentication. We strongly recommend enabling this feature.
                    </p>
                  </div>
                </div>
                
                {twoFactorSuccess && (
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle size={16} className="mr-2" />
                    {twoFactorSuccess}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleEnable2FA}
                    isLoading={isEnabling2FA}
                    leftIcon={<Shield size={16} />}
                  >
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Session Management</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Manage your active sessions and session timeout settings.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Session Timeout</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Set how long your session remains active during inactivity.
                </p>
                <div className="flex items-center space-x-3">
                  <select
                    value={sessionTimeout}
                    onChange={(e) => handleUpdateSessionTimeout(parseInt(e.target.value))}
                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Current Session</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Activity:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {lastActivity ? new Date(lastActivity).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Browser:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {navigator.userAgent.split(' ').slice(-1)[0].split('/')[0]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">IP Address:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        127.0.0.1 (localhost)
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<RefreshCw size={14} />}
                      onClick={() => authService.refreshSession()}
                    >
                      Refresh Session
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Recent Security Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Security Activity</h3>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {securityLogs.length > 0 ? (
              securityLogs.map((log, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        {log.action === 'login' ? (
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : log.action === 'password_change' ? (
                          <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : log.action === 'enable_2fa' ? (
                          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{log.ipAddress}</span>
                        <span className="mx-1">•</span>
                        <span>{log.browser}</span>
                        {log.location && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{log.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Security Activity
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Your security activity will appear here.
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SecuritySettingsPanel;