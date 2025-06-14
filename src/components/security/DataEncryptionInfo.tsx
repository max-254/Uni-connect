import React from 'react';
import { Shield, Lock, Database, Server, Key } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';

const DataEncryptionInfo: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Protection Information</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            We take the security and privacy of your data seriously. Here's how we protect your information:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Encryption at Rest</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All sensitive data is encrypted when stored in our database using AES-256 encryption.
                  This includes personal information, documents, and application details.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Server className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Encryption in Transit</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All data transmitted between your browser and our servers is encrypted using TLS 1.3,
                  ensuring that your information cannot be intercepted during transmission.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Row-Level Security</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our database implements row-level security policies that ensure users can only access
                  data they are authorized to view, even at the database level.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Key className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Secure Key Management</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Encryption keys are securely managed and rotated regularly. Access to keys is
                  strictly controlled and monitored.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Compliance Information</h4>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Our security practices are designed to comply with GDPR, FERPA, and other relevant data protection regulations.
              We maintain detailed audit logs of all data access and modifications to ensure compliance and security.
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default DataEncryptionInfo;