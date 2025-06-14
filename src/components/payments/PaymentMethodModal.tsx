import React, { useState } from 'react';
import { X, CreditCard, CheckCircle, Globe, Calendar, Lock } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { paymentService, PaymentMethod } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentMethod: PaymentMethod) => void;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'card' | 'bank'>('card');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Card details
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    // Bank details
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    // Common
    saveForFuture: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formattedValue }));
  };

  const handleSaveCard = async () => {
    if (!user) return;
    
    // Basic validation
    if (!formData.cardNumber || !formData.cardholderName || !formData.expiryMonth || !formData.expiryYear || !formData.cvv) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      
      // In a real app, you would use a secure payment processor
      // For demo purposes, we'll simulate adding a card
      const newPaymentMethod = await paymentService.addPaymentMethod(user.id, {
        type: 'card',
        cardNumber: formData.cardNumber,
        cardholderName: formData.cardholderName,
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cvv: formData.cvv,
        saveForFuture: formData.saveForFuture
      });
      
      onSave(newPaymentMethod);
      resetForm();
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert('Failed to save payment method. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBank = async () => {
    if (!user) return;
    
    // Basic validation
    if (!formData.accountName || !formData.accountNumber || !formData.routingNumber || !formData.bankName) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      
      // In a real app, you would use a secure payment processor
      // For demo purposes, we'll simulate adding a bank account
      const newPaymentMethod = await paymentService.addPaymentMethod(user.id, {
        type: 'bank',
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber,
        bankName: formData.bankName,
        saveForFuture: formData.saveForFuture
      });
      
      onSave(newPaymentMethod);
      resetForm();
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert('Failed to save payment method. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      saveForFuture: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Add Payment Method
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<X size={16} />}
          >
            Close
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 py-4 text-center font-medium text-sm ${
              activeTab === 'card'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('card')}
          >
            <CreditCard size={16} className="inline mr-2" />
            Credit/Debit Card
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium text-sm ${
              activeTab === 'bank'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('bank')}
          >
            <Globe size={16} className="inline mr-2" />
            Bank Transfer
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'card' ? (
            <div className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                    className="pl-10"
                  />
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>

              {/* Cardholder Name */}
              <Input
                label="Cardholder Name"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleInputChange}
                placeholder="John Smith"
                required
              />

              {/* Expiry Date and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <div className="flex space-x-2">
                    <select
                      name="expiryMonth"
                      value={formData.expiryMonth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        return (
                          <option key={month} value={month.toString().padStart(2, '0')}>
                            {month.toString().padStart(2, '0')}
                          </option>
                        );
                      })}
                    </select>
                    <select
                      name="expiryYear"
                      value={formData.expiryYear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">YY</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <option key={year} value={year.toString().slice(-2)}>
                            {year.toString().slice(-2)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVV
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={4}
                      required
                      className="pl-10"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Security Message */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your payment information is encrypted and secure. We never store your full card details.
                  </p>
                </div>
              </div>

              {/* Save for Future */}
              <div className="flex items-center mt-4">
                <input
                  id="saveForFuture"
                  name="saveForFuture"
                  type="checkbox"
                  checked={formData.saveForFuture}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="saveForFuture" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Save this card for future payments
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bank Account Details */}
              <Input
                label="Account Holder Name"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                placeholder="John Smith"
                required
              />
              
              <Input
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="123456789"
                required
              />
              
              <Input
                label="Routing Number"
                name="routingNumber"
                value={formData.routingNumber}
                onChange={handleInputChange}
                placeholder="123456789"
                required
              />
              
              <Input
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                placeholder="Bank of America"
                required
              />

              {/* Security Message */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your banking information is encrypted and secure. We use industry-standard security measures to protect your data.
                  </p>
                </div>
              </div>

              {/* Save for Future */}
              <div className="flex items-center mt-4">
                <input
                  id="saveForFuture"
                  name="saveForFuture"
                  type="checkbox"
                  checked={formData.saveForFuture}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="saveForFuture" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Save this bank account for future payments
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={activeTab === 'card' ? handleSaveCard : handleSaveBank}
              isLoading={isSaving}
              leftIcon={activeTab === 'card' ? <CreditCard size={16} /> : <Globe size={16} />}
            >
              {activeTab === 'card' ? 'Add Card' : 'Add Bank Account'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;