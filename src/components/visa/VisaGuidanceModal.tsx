import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Clock, 
  DollarSign, 
  Briefcase, 
  GraduationCap,
  Info,
  Globe,
  Calendar,
  Shield,
  Download,
  BookOpen
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { getVisaInfoByCountry, VisaInfo, VisaRequirement } from '../../data/visaData';

interface VisaGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  universityCountry: string;
  universityName: string;
}

const VisaGuidanceModal: React.FC<VisaGuidanceModalProps> = ({
  isOpen,
  onClose,
  universityCountry,
  universityName
}) => {
  const [activeTab, setActiveTab] = useState<'requirements' | 'process' | 'links'>('requirements');
  const [checkedRequirements, setCheckedRequirements] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const visaInfo = getVisaInfoByCountry(universityCountry);

  if (!visaInfo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Visa Information</h2>
            <Button variant="ghost" size="sm" onClick={onClose} leftIcon={<X size={16} />}>
              Close
            </Button>
          </div>
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Visa Information Not Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed visa guidance for {universityCountry} is not currently available. 
              Please consult the official embassy or consulate website for the most up-to-date information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const toggleRequirement = (requirementId: string) => {
    setCheckedRequirements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requirementId)) {
        newSet.delete(requirementId);
      } else {
        newSet.add(requirementId);
      }
      return newSet;
    });
  };

  const getRequirementIcon = (requirement: VisaRequirement) => {
    if (requirement.required) {
      return checkedRequirements.has(requirement.id) ? 
        <CheckCircle className="w-5 h-5 text-green-500" /> : 
        <AlertTriangle className="w-5 h-5 text-red-500" />;
    } else {
      return checkedRequirements.has(requirement.id) ? 
        <CheckCircle className="w-5 h-5 text-green-500" /> : 
        <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const completedRequired = visaInfo.requirements
    .filter(req => req.required)
    .filter(req => checkedRequirements.has(req.id)).length;
  
  const totalRequired = visaInfo.requirements.filter(req => req.required).length;
  const progressPercentage = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {visaInfo.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Visa guidance for {universityName}, {universityCountry}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={16} />}
            >
              Download Checklist
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              leftIcon={<X size={16} />}
            >
              Close
            </Button>
          </div>
        </div>

        {/* Progress Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Visa Preparation Progress
            </h3>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {completedRequired}/{totalRequired} required items completed
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-600 to-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Processing Time</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{visaInfo.processingTime}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Application Fee</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{visaInfo.applicationFee}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Work Rights</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{visaInfo.workRights}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <GraduationCap className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Post-Study</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{visaInfo.postStudyOptions}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'requirements', label: 'Requirements', icon: FileText },
              { id: 'process', label: 'Process & Tips', icon: BookOpen },
              { id: 'links', label: 'Official Links', icon: ExternalLink }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              {/* Description */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  About {visaInfo.title}
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  {visaInfo.description}
                </p>
              </div>

              {/* Requirements Checklist */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Visa Requirements Checklist
                </h3>
                <div className="space-y-4">
                  {visaInfo.requirements.map((requirement) => (
                    <Card key={requirement.id} className="overflow-hidden">
                      <CardBody className="p-4">
                        <div className="flex items-start space-x-4">
                          <button
                            onClick={() => toggleRequirement(requirement.id)}
                            className="flex-shrink-0 mt-1"
                          >
                            {getRequirementIcon(requirement)}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {requirement.title}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                requirement.required 
                                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' 
                                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              }`}>
                                {requirement.required ? 'Required' : 'Optional'}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                              {requirement.description}
                            </p>
                            
                            {requirement.documents && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Required Documents:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {requirement.documents.map((doc, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    >
                                      {doc}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {requirement.notes && (
                              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                  <strong>Note:</strong> {requirement.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'process' && (
            <div className="space-y-6">
              {/* Important Notes */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Important Information & Tips
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {visaInfo.importantNotes.map((note, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{note}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Timeline Reminder */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Application Timeline
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                      <span className="font-medium text-orange-800 dark:text-orange-300">
                        Recommended Timeline
                      </span>
                    </div>
                    <p className="text-orange-700 dark:text-orange-200 text-sm">
                      Start your visa application process at least <strong>3-4 months</strong> before your intended course start date. 
                      Processing times can vary, and you may need additional time to gather required documents.
                    </p>
                  </div>
                </CardBody>
              </Card>

              {/* Work Rights & Post-Study Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Work Rights
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <div className="flex items-start space-x-3">
                      <Briefcase className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-2">
                          During Studies
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {visaInfo.workRights}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Post-Study Options
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <div className="flex items-start space-x-3">
                      <GraduationCap className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-2">
                          After Graduation
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {visaInfo.postStudyOptions}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Official Resources & Links
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visaInfo.officialLinks.map((link, index) => (
                  <Card key={index} hoverable={true}>
                    <CardBody className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {link.name}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            {link.description}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(link.url, '_blank')}
                            leftIcon={<ExternalLink size={14} />}
                            className="w-full"
                          >
                            Visit Website
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Additional Resources */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Additional Resources
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                          Embassy/Consulate Locator
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Find the nearest embassy or consulate in your country for visa applications and support.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                          Document Checklist
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Download a comprehensive checklist to ensure you have all required documents.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                          Application Timeline Planner
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Plan your visa application timeline to ensure you meet all deadlines.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1"
              onClick={() => window.open(visaInfo.officialLinks[0]?.url, '_blank')}
              leftIcon={<ExternalLink size={16} />}
            >
              Start Application
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              leftIcon={<Download size={16} />}
            >
              Download Checklist
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              leftIcon={<Calendar size={16} />}
            >
              Set Reminders
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Disclaimer:</strong> This information is for guidance only. Always check the official embassy/consulate 
              website for the most current and accurate visa requirements, as they may change without notice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaGuidanceModal;