import React, { useState, useEffect } from 'react';
import { X, Mail, MessageSquare, Bell, Smartphone, Globe, CheckCircle, Settings, Plus } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { documentService } from '../../services/documentService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  documentType: string;
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'in_app';
  enabled: boolean;
  config: any;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'channels'>('templates');
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [editedTemplate, setEditedTemplate] = useState<Partial<NotificationTemplate>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [templatesData, channelsData] = await Promise.all([
          documentService.getNotificationTemplates(),
          documentService.getNotificationChannels()
        ]);
        setTemplates(templatesData);
        setChannels(channelsData);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleSelectTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setEditedTemplate(template);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveTemplate = async () => {
    if (!editedTemplate.name || !editedTemplate.subject || !editedTemplate.body || !editedTemplate.documentType) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      
      if (selectedTemplate) {
        // Update existing template
        await documentService.updateNotificationTemplate(selectedTemplate.id, editedTemplate);
        
        setTemplates(prev => 
          prev.map(t => t.id === selectedTemplate.id ? { ...t, ...editedTemplate } as NotificationTemplate : t)
        );
      } else {
        // Create new template
        const newTemplate = await documentService.createNotificationTemplate(editedTemplate);
        setTemplates(prev => [...prev, newTemplate]);
      }
      
      setSelectedTemplate(null);
      setEditedTemplate({});
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleChannel = async (channelId: string, enabled: boolean) => {
    try {
      await documentService.updateNotificationChannel(channelId, { enabled });
      
      setChannels(prev => 
        prev.map(c => c.id === channelId ? { ...c, enabled } : c)
      );
    } catch (error) {
      console.error('Error updating channel:', error);
      alert('Failed to update notification channel. Please try again.');
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
        return <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 py-4 text-center font-medium text-sm ${
              activeTab === 'templates'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('templates')}
          >
            <MessageSquare size={16} className="inline mr-2" />
            Notification Templates
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium text-sm ${
              activeTab === 'channels'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('channels')}
          >
            <Settings size={16} className="inline mr-2" />
            Notification Channels
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'templates' && (
                <div className="p-6">
                  {selectedTemplate || Object.keys(editedTemplate).length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {selectedTemplate ? 'Edit Template' : 'New Template'}
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(null);
                            setEditedTemplate({});
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <Input
                          label="Template Name"
                          name="name"
                          value={editedTemplate.name || ''}
                          onChange={handleTemplateChange}
                          placeholder="e.g., New Document Notification"
                          required
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Document Type
                          </label>
                          <select
                            name="documentType"
                            value={editedTemplate.documentType || ''}
                            onChange={handleTemplateChange}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select Document Type</option>
                            <option value="offer_letter">Offer Letter</option>
                            <option value="coe">Confirmation of Enrollment (COE)</option>
                            <option value="i20">I-20</option>
                            <option value="cas">CAS</option>
                            <option value="admission_letter">Admission Letter</option>
                            <option value="visa_support">Visa Support Letter</option>
                            <option value="financial_document">Financial Document</option>
                            <option value="all">All Document Types</option>
                          </select>
                        </div>
                        
                        <Input
                          label="Email Subject"
                          name="subject"
                          value={editedTemplate.subject || ''}
                          onChange={handleTemplateChange}
                          placeholder="e.g., Your [Document Type] is now available"
                          required
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Body
                          </label>
                          <textarea
                            name="body"
                            value={editedTemplate.body || ''}
                            onChange={handleTemplateChange}
                            rows={8}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Dear {{student_name}},&#10;&#10;Your {{document_type}} is now available. You can access it by logging into your student portal.&#10;&#10;Regards,&#10;The Admissions Team"
                            required
                          />
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Available variables: {'{{student_name}}'}, {'{{document_type}}'}, {'{{expiry_date}}'}, {'{{document_link}}'}
                          </p>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            onClick={handleSaveTemplate}
                            isLoading={isSaving}
                          >
                            {selectedTemplate ? 'Update Template' : 'Create Template'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Notification Templates
                        </h3>
                        <Button
                          onClick={() => setEditedTemplate({})}
                          leftIcon={<Plus size={16} />}
                        >
                          New Template
                        </Button>
                      </div>
                      
                      {templates.length > 0 ? (
                        <div className="space-y-4">
                          {templates.map(template => (
                            <div 
                              key={template.id}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {template.name}
                                </h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                  {template.documentType === 'all' 
                                    ? 'All Documents' 
                                    : template.documentType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Subject: {template.subject}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {template.body}
                              </p>
                              <div className="mt-3 flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSelectTemplate(template)}
                                >
                                  Edit Template
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Templates Found
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Create your first notification template to get started
                          </p>
                          <Button
                            onClick={() => setEditedTemplate({})}
                            leftIcon={<Plus size={16} />}
                          >
                            Create Template
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'channels' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                    Notification Channels
                  </h3>
                  
                  <div className="space-y-4">
                    {channels.map(channel => (
                      <div 
                        key={channel.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mr-4">
                              {getChannelIcon(channel.type)}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {channel.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {channel.type === 'email' 
                                  ? 'Email notifications' 
                                  : channel.type === 'sms' 
                                    ? 'SMS notifications' 
                                    : 'In-app notifications'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <span className={`mr-3 text-sm ${
                              channel.enabled 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {channel.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={channel.enabled}
                                onChange={() => handleToggleChannel(channel.id, !channel.enabled)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                        
                        {channel.enabled && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                              Configuration
                            </h5>
                            
                            {channel.type === 'email' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sender Email</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {channel.config.senderEmail || 'noreply@example.com'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sender Name</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {channel.config.senderName || 'University Admissions'}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {channel.type === 'sms' && (
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">SMS Provider</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {channel.config.provider || 'Twilio'}
                                </p>
                              </div>
                            )}
                            
                            <div className="mt-3 flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                Edit Configuration
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;