import React, { useState, useEffect } from 'react';
import { X, Bell, Mail, Smartphone, Calendar, Clock, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { visaService } from '../../services/visaService';
import { useAuth } from '../../context/AuthContext';

interface VisaNotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VisaNotificationSettingsModal: React.FC<VisaNotificationSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: {
      enabled: true,
      address: '',
      notifications: {
        documentUploaded: true,
        statusChange: true,
        appointmentReminder: true,
        deadlineReminder: true,
        additionalDocumentsRequired: true
      }
    },
    sms: {
      enabled: false,
      phoneNumber: '',
      notifications: {
        statusChange: true,
        appointmentReminder: true,
        deadlineReminder: true,
        additionalDocumentsRequired: false
      }
    },
    inApp: {
      enabled: true,
      notifications: {
        documentUploaded: true,
        statusChange: true,
        appointmentReminder: true,
        deadlineReminder: true,
        additionalDocumentsRequired: true
      }
    },
    reminderTiming: {
      appointmentReminder: '1_day',
      deadlineReminder: '7_days'
    }
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // In a real app, this would fetch from your API
        // For demo purposes, we'll simulate loading settings
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulate user's email from auth context
        setFormData(prev => ({
          ...prev,
          email: {
            ...prev.email,
            address: user.email || ''
          }
        }));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && user) {
      loadSettings();
    }
  }, [isOpen, user]);

  const handleToggleChannel = (channel: 'email' | 'sms' | 'inApp', enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        enabled
      }
    }));
  };

  const handleToggleNotification = (channel: 'email' | 'sms' | 'inApp', notification: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        notifications: {
          ...prev[channel].notifications,
          [notification]: enabled
        }
      }
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setFormData(prev => ({
        ...prev,
        email: {
          ...prev.email,
          address: value
        }
      }));
    } else if (name === 'phoneNumber') {
      setFormData(prev => ({
        ...prev,
        sms: {
          ...prev.sms,
          phoneNumber: value
        }
      }));
    } else if (name === 'appointmentReminder' || name === 'deadlineReminder') {
      setFormData(prev => ({
        ...prev,
        reminderTiming: {
          ...prev.reminderTiming,
          [name]: value
        }
      }));
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // In a real app, this would save to your API
      await visaService.updateNotificationSettings(user.id, formData);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert('Failed to save notification settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Notification Settings
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
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400">
                Configure how you want to receive notifications about your visa applications.
              </p>
              
              {/* Email Notifications */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.email.enabled}
                      onChange={() => handleToggleChannel('email', !formData.email.enabled)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                {formData.email.enabled && (
                  <div className="p-4">
                    <div className="mb-4">
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email.address}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Notification Types</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          id="email-documentUploaded"
                          type="checkbox"
                          checked={formData.email.notifications.documentUploaded}
                          onChange={(e) => handleToggleNotification('email', 'documentUploaded', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="email-documentUploaded" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Document upload confirmations
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="email-statusChange"
                          type="checkbox"
                          checked={formData.email.notifications.statusChange}
                          onChange={(e) => handleToggleNotification('email', 'statusChange', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="email-statusChange" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Application status changes
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="email-appointmentReminder"
                          type="checkbox"
                          checked={formData.email.notifications.appointmentReminder}
                          onChange={(e) => handleToggleNotification('email', 'appointmentReminder', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="email-appointmentReminder" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Appointment reminders
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="email-deadlineReminder"
                          type="checkbox"
                          checked={formData.email.notifications.deadlineReminder}
                          onChange={(e) => handleToggleNotification('email', 'deadlineReminder', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="email-deadlineReminder" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Deadline reminders
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="email-additionalDocumentsRequired"
                          type="checkbox"
                          checked={formData.email.notifications.additionalDocumentsRequired}
                          onChange={(e) => handleToggleNotification('email', 'additionalDocumentsRequired', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="email-additionalDocumentsRequired" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Additional document requests
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* SMS Notifications */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                    <h3 className="font-medium text-gray-900 dark:text-white">SMS Notifications</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.sms.enabled}
                      onChange={() => handleToggleChannel('sms', !formData.sms.enabled)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                {formData.sms.enabled && (
                  <div className="p-4">
                    <div className="mb-4">
                      <Input
                        label="Phone Number"
                        name="phoneNumber"
                        type="tel"
                        value={formData.sms.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+1 (123) 456-7890"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Standard message rates may apply
                      </p>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Notification Types</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          id="sms-statusChange"
                          type="checkbox"
                          checked={formData.sms.notifications.statusChange}
                          onChange={(e) => handleToggleNotification('sms', 'statusChange', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sms-statusChange" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Application status changes
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="sms-appointmentReminder"
                          type="checkbox"
                          checked={formData.sms.notifications.appointmentReminder}
                          onChange={(e) => handleToggleNotification('sms', 'appointmentReminder', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sms-appointmentReminder" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Appointment reminders
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="sms-deadlineReminder"
                          type="checkbox"
                          checked={formData.sms.notifications.deadlineReminder}
                          onChange={(e) => handleToggleNotification('sms', 'deadlineReminder', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sms-deadlineReminder" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Deadline reminders
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="sms-additionalDocumentsRequired"
                          type="checkbox"
                          checked={formData.sms.notifications.additionalDocumentsRequired}
                          onChange={(e) => handleToggleNotification('sms', 'additionalDocumentsRequired', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sms-additionalDocumentsRequired" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Additional document requests
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* In-App Notifications */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
                    <h3 className="font-medium text-gray-900 dark:text-white">In-App Notifications</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.inApp.enabled}
                      onChange={() => handleToggleChannel('inApp', !formData.inApp.enabled)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                {formData.inApp.enabled && (
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Notification Types</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          id="inApp-documentUploaded"
                          type="checkbox"
                          checked={formData.inApp.notifications.documentUploaded}
                          onChange={(e) => handleToggleNotification('inApp', 'documentUploaded', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="inApp-documentUploaded" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Document upload confirmations
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="inApp-statusChange"
                          type="checkbox"
                          checked={formData.inApp.notifications.statusChange}
                          onChange={(e) => handleToggleNotification('inApp', 'statusChange', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="inApp-statusChange" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Application status changes
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="inApp-appointmentReminder"
                          type="checkbox"
                          checked={formData.inApp.notifications.appointmentReminder}
                          onChange={(e) => handleToggleNotification('inApp', 'appointmentReminder', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="inApp-appointmentReminder" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Appointment reminders
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="inApp-deadlineReminder"
                          type="checkbox"
                          checked={formData.inApp.notifications.deadlineReminder}
                          onChange={(e) => handleToggleNotification('inApp', 'deadlineReminder', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="inApp-deadlineReminder" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Deadline reminders
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="inApp-additionalDocumentsRequired"
                          type="checkbox"
                          checked={formData.inApp.notifications.additionalDocumentsRequired}
                          onChange={(e) => handleToggleNotification('inApp', 'additionalDocumentsRequired', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="inApp-additionalDocumentsRequired" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Additional document requests
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Reminder Timing */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Reminder Timing</h3>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Appointment Reminders
                      </label>
                      <select
                        name="appointmentReminder"
                        value={formData.reminderTiming.appointmentReminder}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1_day">1 day before</option>
                        <option value="2_days">2 days before</option>
                        <option value="3_days">3 days before</option>
                        <option value="1_week">1 week before</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Deadline Reminders
                      </label>
                      <select
                        name="deadlineReminder"
                        value={formData.reminderTiming.deadlineReminder}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1_day">1 day before</option>
                        <option value="3_days">3 days before</option>
                        <option value="7_days">1 week before</option>
                        <option value="14_days">2 weeks before</option>
                        <option value="30_days">1 month before</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {saveSuccess && (
                <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                  <p className="text-green-700 dark:text-green-300">
                    Your notification settings have been saved successfully.
                  </p>
                </div>
              )}
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
              onClick={handleSaveSettings}
              isLoading={isSaving}
              leftIcon={<CheckCircle size={16} />}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaNotificationSettingsModal;