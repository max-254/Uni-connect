import React, { useState } from 'react';
import { X, Send, Users } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { adminService } from '../../services/adminService';

interface MessageModalProps {
  recipient: any;
  isOpen: boolean;
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  recipient,
  isOpen,
  onClose
}) => {
  const [messageData, setMessageData] = useState({
    subject: '',
    message: '',
    sendToAll: false
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setMessageData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      
      if (messageData.sendToAll) {
        // Send to all students (bulk message)
        await adminService.sendBulkMessage([], messageData.message, messageData.subject);
      } else if (recipient) {
        // Send to specific recipient
        await adminService.sendMessage(recipient.id, messageData.message, messageData.subject);
      }
      
      // Reset form
      setMessageData({
        subject: '',
        message: '',
        sendToAll: false
      });
      
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send Message</h2>
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
          <div className="space-y-6">
            {/* Recipient Selection */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recipients</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="sendToSpecific"
                      type="radio"
                      checked={!messageData.sendToAll}
                      onChange={() => handleInputChange('sendToAll', false)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="sendToSpecific" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Send to specific student: {recipient?.name || 'No recipient selected'}
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="sendToAll"
                      type="radio"
                      checked={messageData.sendToAll}
                      onChange={() => handleInputChange('sendToAll', true)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="sendToAll" className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                      <Users size={16} className="mr-1" />
                      Send to all students (Bulk message)
                    </label>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Message Content */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Message Content</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <Input
                    label="Subject"
                    value={messageData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Enter message subject"
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      value={messageData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Enter your message here..."
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Message Templates */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Templates</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMessageData(prev => ({
                        ...prev,
                        subject: 'Application Status Update',
                        message: 'Dear Student,\n\nWe wanted to update you on the status of your university application...\n\nBest regards,\nAdmissions Team'
                      }));
                    }}
                  >
                    Application Update
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMessageData(prev => ({
                        ...prev,
                        subject: 'Document Submission Reminder',
                        message: 'Dear Student,\n\nThis is a friendly reminder to submit any outstanding documents for your application...\n\nBest regards,\nAdmissions Team'
                      }));
                    }}
                  >
                    Document Reminder
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMessageData(prev => ({
                        ...prev,
                        subject: 'Congratulations on Your Acceptance!',
                        message: 'Dear Student,\n\nCongratulations! We are pleased to inform you that your application has been accepted...\n\nBest regards,\nAdmissions Team'
                      }));
                    }}
                  >
                    Acceptance Letter
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMessageData(prev => ({
                        ...prev,
                        subject: 'Scholarship Opportunity',
                        message: 'Dear Student,\n\nWe are excited to inform you about a scholarship opportunity that matches your profile...\n\nBest regards,\nScholarship Committee'
                      }));
                    }}
                  >
                    Scholarship Info
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
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
              onClick={handleSend}
              isLoading={loading}
              leftIcon={<Send size={16} />}
              disabled={!messageData.subject || !messageData.message}
            >
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;