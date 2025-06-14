import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  DollarSign, 
  Download, 
  Calendar, 
  Clock, 
  Info, 
  Upload 
} from 'lucide-react';
import Button from '../ui/Button';
import { visaService } from '../../services/visaService';

interface VisaRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

const VisaRequirementsModal: React.FC<VisaRequirementsModalProps> = ({
  isOpen,
  onClose,
  application
}) => {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequirements = async () => {
      if (!application) return;
      
      try {
        setLoading(true);
        const reqs = await visaService.getVisaRequirements(application.country, application.visaType);
        setRequirements(reqs);
      } catch (error) {
        console.error('Error loading visa requirements:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && application) {
      loadRequirements();
    }
  }, [isOpen, application]);

  const getRequirementStatus = (requirementId: string): 'completed' | 'pending' | 'not_started' => {
    if (!application || !application.documents) return 'not_started';
    
    const matchingDocument = application.documents.find((doc: any) => 
      doc.name === requirements.find(req => req.id === requirementId)?.name
    );
    
    if (!matchingDocument) return 'not_started';
    
    return matchingDocument.status === 'approved' ? 'completed' : 'pending';
  };

  const handleDownloadChecklist = () => {
    // In a real app, this would generate and download a PDF checklist
    alert('Checklist download would start here');
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Visa Requirements Checklist
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {application.visaType} - {application.country}
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
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Requirements Progress
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {application.completedRequirements} of {application.totalRequirements} requirements completed
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Not Started</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(application.completedRequirements / application.totalRequirements) * 100}%` }}
                  />
                </div>
              </div>

              {/* Requirements List */}
              <div className="space-y-4">
                {requirements.map((requirement) => {
                  const status = getRequirementStatus(requirement.id);
                  
                  return (
                    <div 
                      key={requirement.id}
                      className={`border rounded-lg overflow-hidden ${
                        status === 'completed' 
                          ? 'border-green-200 dark:border-green-800' 
                          : status === 'pending'
                            ? 'border-yellow-200 dark:border-yellow-800'
                            : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className={`p-4 ${
                        status === 'completed' 
                          ? 'bg-green-50 dark:bg-green-900/20' 
                          : status === 'pending'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20'
                            : 'bg-white dark:bg-gray-800'
                      }`}>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            {status === 'completed' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : status === 'pending' ? (
                              <Clock className="w-5 h-5 text-yellow-500" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-medium text-gray-900 dark:text-white">
                                {requirement.name}
                              </h4>
                              {requirement.required && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {requirement.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-gray-900">
                        <div className="space-y-4">
                          {/* Instructions */}
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p className="mb-2 font-medium text-gray-900 dark:text-white">Instructions:</p>
                            <p>{requirement.instructions}</p>
                          </div>
                          
                          {/* External Link */}
                          {requirement.externalLink && (
                            <div>
                              <a 
                                href={requirement.externalLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <ExternalLink size={14} className="mr-1" />
                                Visit Official Website
                              </a>
                            </div>
                          )}
                          
                          {/* Fee Information */}
                          {requirement.fee && (
                            <div className="flex items-start p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                  Fee: {requirement.fee.amount} {requirement.fee.currency}
                                </p>
                                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-200">
                                  {requirement.fee.paymentInstructions}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            {status !== 'completed' && (
                              <Button
                                size="sm"
                                leftIcon={<Upload size={14} />}
                                onClick={() => {
                                  onClose();
                                  // This would trigger the document upload modal
                                  // with this requirement pre-selected
                                }}
                              >
                                Upload Document
                              </Button>
                            )}
                            
                            {requirement.externalLink && (
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<ExternalLink size={14} />}
                                onClick={() => window.open(requirement.externalLink, '_blank')}
                              >
                                Go to Form
                              </Button>
                            )}
                            
                            {requirement.fee && (
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<DollarSign size={14} />}
                                onClick={() => {
                                  // This would open a payment flow
                                  alert(`Payment flow for ${requirement.name} would open here`);
                                }}
                              >
                                Pay Fee
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Important Notes */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-base font-medium text-blue-900 dark:text-blue-300 mb-2">
                      Important Information
                    </h4>
                    <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-200">
                      <li>• Requirements may vary based on your specific circumstances and nationality</li>
                      <li>• All documents not in English must be accompanied by certified translations</li>
                      <li>• Processing times may vary depending on application volume and other factors</li>
                      <li>• Keep copies of all submitted documents for your records</li>
                      <li>• Check the embassy or consulate website regularly for any requirement changes</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Estimated Processing Times */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Estimated Processing Times
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Application Review</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {application.country === 'United States' ? '2-4 weeks' : 
                       application.country === 'United Kingdom' ? '3-6 weeks' : 
                       application.country === 'Canada' ? '4-8 weeks' : 
                       '3-5 weeks'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Interview Wait Time</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {application.country === 'United States' ? '14-30 days' : 
                       application.country === 'United Kingdom' ? '5-15 days' : 
                       application.country === 'Canada' ? 'Not required for most' : 
                       '7-21 days'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Decision After Interview</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {application.country === 'United States' ? '1-7 days' : 
                       application.country === 'United Kingdom' ? '10-15 working days' : 
                       application.country === 'Canada' ? '4-8 weeks' : 
                       '5-10 working days'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleDownloadChecklist}
              leftIcon={<Download size={16} />}
            >
              Download Checklist
            </Button>
            <Button
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaRequirementsModal;