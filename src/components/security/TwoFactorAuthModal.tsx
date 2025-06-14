import React, { useState } from 'react';
import { X, Shield, Key, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { authService } from '../../services/authService';

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  userId: string;
}

const TwoFactorAuthModal: React.FC<TwoFactorAuthModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  userId
}) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!token.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      
      const isValid = await authService.verifyTwoFactor(userId, token);
      
      if (isValid) {
        onVerify();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
      console.error('2FA verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<X size={16} />}
          >
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <Key className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please enter the verification code from your authenticator app to continue.
              </p>
            </div>

            <Input
              label="Verification Code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter 6-digit code"
              error={error || undefined}
              maxLength={6}
              autoFocus
            />

            {error && (
              <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
                <AlertTriangle size={16} className="mr-2" />
                {error}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleVerify}
              isLoading={isVerifying}
            >
              Verify
            </Button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              If you're having trouble accessing your account, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthModal;