import React, { useState, useEffect } from 'react';
import { X, Send, Mail, MessageSquare, Bell, Users, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { adminService } from '../../services/adminService';

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (applicationId: string, message: string, subject: string, template: string) => void;
  application: any;
}

const CommunicationModal: React.FC<CommunicationModalProps> = ({
  isOpen,
  onClose,
  onSend,
  application
}) => {
  const [messageData, setMessageData] = useState({
    subject: '',
    message: '',
    template: '',
    sendCopy: true,
    notifyInApp: true
  });
  const [templates, setTemplates] = useState<any[]>([]);
  const [communicationHistory, setCommunicationHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (isOpen && application) {
      loadData();
    }
  }, [isOpen, application]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load message templates and communication history
      const [templatesData, historyData] = await Promise.all([
        adminService.getMessageTemplates(),
        adminService.getCommunicationHistory(application.studentId)
      ]);
      
      setTemplates(templatesData);
      setCommunicationHistory(historyData);
      
      // Reset form
      setMessageData({
        subject: '',
        message: '',
        template: '',
        sendCopy: true,
        notifyInApp: true
      });
    } catch (error) {
      console.error('Error loading communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setMessageData(prev => ({ ...prev, [name]: checked }));
    } else {
      setMessageData(prev => ({ ...prev, [name]: value }));
      
      // If selecting a template, populate subject and message
      if (name === 'template' && value) {
        const selectedTemplate = templates.find(t => t.id === value);
        if (selectedTemplate) {
          // Replace placeholders with actual values
          let subject = selectedTemplate.subject;
          let message = selectedTemplate.body;
          
          if (application) {
            subject = subject
              .replace('{{STUDENT_NAME}}', application.studentName)
              .replace('{{UNIVERSITY_NAME}}', application.universityName)
              .replace('{{PROGRAM_NAME}}', application.programName);
            
            message = message
              .replace('{{STUDENT_NAME}}', application.studentName)
              .replace('{{UNIVERSITY_NAME}}', application.universityName)
              .replace('{{PROGRAM_NAME}}', application.programName)
              .replace('{{APPLICATION_ID}}', application.id)
              .replace('{{APPLICATION_STATUS}}', application.status)
              .replace('{{DEADLINE}}', new Date(application.deadline).toLocaleDateString());
          }
          
          setMessageData(prev => ({
            ...prev,
            subject,
            message
          }));
        }
      }
    }
  };

  const handleSend = async () => {
    if (!application || !messageData.subject || !messageData.message) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSendingMessage(true);
      await onSend(
        application.id, 
        messageData.message, 
        messageData.subject, 
        messageData.template
      );
      
      // Reset form
      setMessageData({
        subject: '',
        message: '',
        template: '',
        sendCopy: true,
        notifyInApp: true
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Send Communication
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                To: {application.studentName} ({application.studentEmail})
              </p>
            </div>
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
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Message Form */}
            <div className="lg:w-2/3 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
              <div className="space-y-6">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message Template
                  </label>
                  <select
                    name="template"
                    value={messageData.template}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a template or create custom message</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <Input
                  label="Subject"
                  name="subject"
                  value={messageData.subject}
                  onChange={handleInputChange}
                  placeholder="Enter message subject"
                  required
                />

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={messageData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your message here..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Notification Options */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="sendCopy"
                      name="sendCopy"
                      type="checkbox"
                      checked={messageData.sendCopy}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sendCopy" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Send a copy to my email
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="notifyInApp"
                      name="notifyInApp"
                      type="checkbox"
                      checked={messageData.notifyInApp}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyInApp" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Also send as in-app notification
                    </label>
                  </div>
                </div>

                {/* Send Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSend}
                    isLoading={sendingMessage}
                    leftIcon={<Send size={16} />}
                    disabled={!messageData.subject || !messageData.message}
                  >
                    Send Message
                  </Button>
                </div>
              </div>
            </div>

            {/* Communication History */}
            <div className="lg:w-1/3 p-6 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Communication History
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : communicationHistory.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {communicationHistory.map((comm, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          {comm.type === 'email' ? (
                            <Mail className="w-4 h-4 text-blue-500 mr-1" />
                          ) : comm.type === 'notification' ? (
                            <Bell className="w-4 h-4 text-purple-500 mr-1" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-green-500 mr-1" />
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comm.subject}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comm.sentAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-1">
                        {comm.message}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          Sent by: {comm.sentBy}
                        </span>
                        {comm.read ? (
                          <span className="text-green-600 dark:text-green-400 flex items-center">
                            <CheckCircle size={12} className="mr-1" />
                            Read
                          </span>
                        ) : (
                          <span className="text-yellow-600 dark:text-yellow-400 flex items-center">
                            <Clock size={12} className="mr-1" />
                            Unread
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No communication history found
                  </p>
                </div>
              )}

              {/* Quick Templates */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Quick Templates
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMessageData({
                        ...messageData,
                        subject: `Application Status Update - ${application.universityName}`,
                        message: `Dear ${application.studentName},\n\nWe wanted to update you on the status of your application to ${application.universityName} for the ${application.programName} program.\n\nYour application is currently under review by our admissions committee. We will notify you of any updates or if additional information is required.\n\nBest regards,\nAdmissions Team`
                      });
                    }}
                  >
                    Status Update
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMessageData({
                        ...messageData,
                        subject: `Additional Documents Required - ${application.universityName}`,
                        message: `Dear ${application.studentName},\n\nThank you for your application to ${application.universityName}.\n\nWe need additional documents to complete your application review. Please log in to your student portal to see the specific requirements and upload the necessary documents.\n\nPlease submit these documents by ${new Date(application.deadline).toLocaleDateString()}.\n\nBest regards,\nAdmissions Team`
                      });
                    }}
                  >
                    Request Documents
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMessageData({
                        ...messageData,
                        subject: `Interview Invitation - ${application.universityName}`,
                        message: `Dear ${application.studentName},\n\nWe are pleased to invite you to an interview for your application to the ${application.programName} program at ${application.universityName}.\n\nPlease log in to your student portal to schedule your interview at a time convenient for you.\n\nBest regards,\nAdmissions Team`
                      });
                    }}
                  >
                    Interview Invitation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Info size={16} className="mr-2" />
              Messages are sent to the student's email and appear in their portal
            </div>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationModal;