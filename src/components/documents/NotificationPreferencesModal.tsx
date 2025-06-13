import React, { useState, useEffect } from 'react';
import { X, Mail, MessageSquare, Bell, Smartphone, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import { documentService } from '../../services/documentService';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationPreference {
  id: string;
  type: 'email' | 'sms' | 'in_app';
  enabled: boolean;
  documentTypes: string[];
}

const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose
}) => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        const data = await documentService.getNotificationPreferences();
        setPreferences(data);
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  const handleTogglePreference = (id: string, enabled: boolean) => {
    setPreferences(prev => 
      prev.map(pref => pref.id === id ? { ...pref, enabled } : pref)
    );
  };

  const handleToggleDocumentType = (preferenceId: string, documentType: string, checked: boolean) => {
    setPreferences(prev => 
      prev.map(pref => {
        if (pref.id === preferenceId) {
          return {
            ...pref,
            documentTypes: checked
              ? [...pref.documentTypes, documentType]
              : pref.documentTypes.filter(type => type !== documentType)
          };
        }
        return pref;
      })
    );
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      await documentService.updateNotificationPreferences(preferences);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'sms':
        return <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'in_app':
        return <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
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
              Notification Preferences
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
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400">
                Choose how you want to be notified when new documents are available.
              </p>
              
              {preferences.map(preference => (
                <div 
                  key={preference.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mr-4">
                        {getChannelIcon(preference.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {preference.type === 'email' 
                            ? 'Email Notifications' 
                            : preference.type === 'sms' 
                              ? 'SMS Notifications' 
                              : 'In-App Notifications'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {preference.type === 'email' 
                            ? 'Receive email notifications' 
                            : preference.type === 'sms' 
                              ? 'Receive text message notifications' 
                              : 'Receive notifications in the application'}
                        </p>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={preference.enabled}
                        onChange={() => handleTogglePreference(preference.id, !preference.enabled)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {preference.enabled && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                        Notify me about these document types:
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { value: 'offer_letter', label: 'Offer Letter' },
                          { value: 'coe', label: 'Confirmation of Enrollment (COE)' },
                          { value: 'i20', label: 'I-20' },
                          { value: 'cas', label: 'CAS' },
                          { value: 'admission_letter', label: 'Admission Letter' },
                          { value: 'visa_support', label: 'Visa Support Letter' },
                          { value: 'financial_document', label: 'Financial Document' },
                          { value: 'all', label: 'All Document Types' }
                        ].map(docType => (
                          <div key={docType.value} className="flex items-center">
                            <input
                              id={`${preference.id}-${docType.value}`}
                              type="checkbox"
                              checked={preference.documentTypes.includes(docType.value) || preference.documentTypes.includes('all')}
                              onChange={(e) => handleToggleDocumentType(preference.id, docType.value, e.target.checked)}
                              disabled={docType.value !== 'all' && preference.documentTypes.includes('all')}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label 
                              htmlFor={`${preference.id}-${docType.value}`} 
                              className={`ml-2 text-sm ${
                                docType.value !== 'all' && preference.documentTypes.includes('all')
                                  ? 'text-gray-400 dark:text-gray-500'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {docType.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      {preference.type === 'email' && (
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                          Notifications will be sent to your registered email address.
                        </div>
                      )}
                      
                      {preference.type === 'sms' && (
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                          Notifications will be sent to your registered phone number.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {saveSuccess && (
                <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                  <p className="text-green-700 dark:text-green-300">
                    Your notification preferences have been saved successfully.
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
              onClick={handleSavePreferences}
              isLoading={isSaving}
              leftIcon={<CheckCircle size={16} />}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesModal;