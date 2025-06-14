import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle, AlertTriangle, ExternalLink, Clock, DollarSign, Briefcase, GraduationCap, Info, Globe, Calendar, Shield, Download, Eye, Plus, ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { visaService, VisaRequirement } from '../../services/visaService';

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
  const [requirements, setRequirements] = useState<VisaRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [visaType, setVisaType] = useState('');

  useEffect(() => {
    const loadRequirements = async () => {
      try {
        setLoading(true);
        
        // Determine the appropriate visa type based on the country
        let defaultVisaType = '';
        switch (universityCountry) {
          case 'United States':
            defaultVisaType = 'F-1 Student Visa';
            break;
          case 'United Kingdom':
            defaultVisaType = 'Student Visa (Tier 4)';
            break;
          case 'Canada':
            defaultVisaType = 'Study Permit';
            break;
          case 'Australia':
            defaultVisaType = 'Student Visa (Subclass 500)';
            break;
          case 'Germany':
            defaultVisaType = 'National Visa (Type D)';
            break;
          default:
            defaultVisaType = 'Student Visa';
        }
        
        setVisaType(defaultVisaType);
        
        // Load requirements for this visa type
        const reqs = await visaService.getVisaRequirements(universityCountry, defaultVisaType);
        setRequirements(reqs);
      } catch (error) {
        console.error('Error loading visa requirements:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && universityCountry) {
      loadRequirements();
    }
  }, [isOpen, universityCountry]);

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

  const completedRequired = requirements
    .filter(req => req.required)
    .filter(req => checkedRequirements.has(req.id)).length;
  
  const totalRequired = requirements.filter(req => req.required).length;
  const progressPercentage = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;

  if (!isOpen) return null;

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
                {visaType} Guidance
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
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {universityCountry === 'United States' ? '2-3 months' : 
               universityCountry === 'United Kingdom' ? '3-6 weeks' : 
               universityCountry === 'Canada' ? '8-12 weeks' : 
               universityCountry === 'Australia' ? '4-6 weeks' : 
               '4-8 weeks'}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Application Fee</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {universityCountry === 'United States' ? '$185 + $350 SEVIS' : 
               universityCountry === 'United Kingdom' ? '£348 + £470 IHS/year' : 
               universityCountry === 'Canada' ? 'CAD $150 + $85 biometrics' : 
               universityCountry === 'Australia' ? 'AUD $650' : 
               '€75-150'}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Work Rights</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {universityCountry === 'United States' ? '20 hrs/week on-campus' : 
               universityCountry === 'United Kingdom' ? '20 hrs/week during term' : 
               universityCountry === 'Canada' ? '20 hrs/week off-campus' : 
               universityCountry === 'Australia' ? '40 hrs/fortnight' : 
               universityCountry === 'Germany' ? '120 days/year' : 
               'Limited during studies'}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <GraduationCap className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Post-Study</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {universityCountry === 'United States' ? 'OPT: 12 months' : 
               universityCountry === 'United Kingdom' ? 'Graduate visa: 2 years' : 
               universityCountry === 'Canada' ? 'PGWP: up to 3 years' : 
               universityCountry === 'Australia' ? 'PSW: 2-4 years' : 
               universityCountry === 'Germany' ? '18 months job-seeking' : 
               'Varies by country'}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'requirements', label: 'Requirements', icon: FileText },
              { id: 'process', label: 'Process & Tips', icon: Eye },
              { id: 'links', label: 'Official Links', icon: ExternalLinkIcon }
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
                  About {visaType}
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  {universityCountry === 'United States' 
                    ? 'The F-1 Student Visa is for academic students enrolled at an accredited US institution. It allows you to study full-time and work on-campus for up to 20 hours per week during the academic year.'
                    : universityCountry === 'United Kingdom'
                    ? 'The UK Student Visa (formerly Tier 4) allows you to study in the UK for courses longer than 6 months. You can work part-time during term time and full-time during holidays.'
                    : universityCountry === 'Canada'
                    ? 'The Study Permit allows international students to study at designated learning institutions in Canada. It includes the ability to work part-time during studies and apply for post-graduation work permits.'
                    : universityCountry === 'Australia'
                    ? 'The Student Visa (Subclass 500) allows you to stay in Australia to study full-time in a registered course. It includes work rights and potential pathways to post-study work visas.'
                    : 'This student visa allows you to study at recognized educational institutions in the country. Check specific details for work rights and post-study options.'}
                </p>
              </div>

              {/* Requirements Checklist */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Visa Requirements Checklist
                </h3>
                <div className="space-y-4">
                  {loading ? (
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      ))}
                    </div>
                  ) : (
                    requirements.map((requirement) => (
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
                                  {requirement.name}
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
                              
                              <div className="mb-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Instructions:
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {requirement.instructions}
                                </p>
                              </div>
                              
                              {requirement.externalLink && (
                                <div className="mb-3">
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
                              
                              {requirement.fee && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                                  <div className="flex items-start">
                                    <DollarSign className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                        Fee: {requirement.fee.amount} {requirement.fee.currency}
                                      </p>
                                      <p className="text-xs text-yellow-700 dark:text-yellow-200 mt-1">
                                        {requirement.fee.paymentInstructions}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))
                  )}
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
                    {universityCountry === 'United States' ? (
                      <>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Start your application process at least 3-4 months before your program start date.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Complete the DS-160 form carefully. Any mistakes could lead to delays or denial.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Pay the SEVIS fee at least 3 days before your visa interview.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Prepare for questions about your study plans, financial situation, and ties to your home country.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">You can enter the US up to 30 days before your program start date.</p>
                        </div>
                      </>
                    ) : universityCountry === 'United Kingdom' ? (
                      <>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Apply for your visa no more than 6 months before your course starts.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">You'll need to pay the Immigration Health Surcharge (IHS) as part of your application.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Financial documents must show you have enough money for your course fees and living costs for up to 9 months.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">You'll need to provide biometric information (fingerprints and a photo) at a visa application center.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Most decisions are made within 3 weeks of your application.</p>
                        </div>
                      </>
                    ) : universityCountry === 'Canada' ? (
                      <>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Apply online through the IRCC portal. Paper applications are no longer accepted for most applicants.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">You must prove you have enough money to pay your tuition fees and living expenses (approximately CAD $10,000 per year plus tuition).</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Most applicants need to provide biometrics (fingerprints and photo).</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Processing times vary significantly by country of residence.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">You may need to undergo a medical examination depending on your country of residence.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Start your application process early, ideally 3-6 months before your intended travel date.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Ensure all documents are complete and meet the specific requirements of the embassy or consulate.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Financial documentation is critical - make sure you can demonstrate sufficient funds for your entire study period.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Check if you need to provide documents in the local language or with certified translations.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm">Be prepared to explain your study plans and why you chose this specific institution and program.</p>
                        </div>
                      </>
                    )}
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
                          {universityCountry === 'United States' 
                            ? 'You can work on-campus for up to 20 hours per week during the academic year and full-time during breaks. Off-campus work is generally not permitted except in cases of severe economic hardship or through programs like CPT.'
                            : universityCountry === 'United Kingdom'
                            ? 'You can work up to 20 hours per week during term time and full-time during holidays if you\'re studying at degree level or above. Lower-level courses have more restricted work rights.'
                            : universityCountry === 'Canada'
                            ? 'You can work up to 20 hours per week off-campus during academic sessions and full-time during scheduled breaks. On-campus work has no hour restrictions.'
                            : universityCountry === 'Australia'
                            ? 'You can work up to 48 hours per fortnight (two weeks) while your course is in session and unlimited hours during scheduled course breaks.'
                            : 'Work rights vary by country. Generally, student visas allow for part-time work during the academic year and full-time work during breaks.'}
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
                          {universityCountry === 'United States' 
                            ? 'Optional Practical Training (OPT) allows you to work for up to 12 months after graduation. STEM graduates may be eligible for a 24-month extension. H-1B visas are available for those sponsored by employers.'
                            : universityCountry === 'United Kingdom'
                            ? 'The Graduate Route allows you to stay and work in the UK for 2 years after graduation (3 years for PhD graduates). You can then switch to a Skilled Worker visa if you find eligible employment.'
                            : universityCountry === 'Canada'
                            ? 'The Post-Graduation Work Permit (PGWP) allows you to work in Canada for up to 3 years, depending on the length of your study program. This can lead to permanent residency through Express Entry or other immigration programs.'
                            : universityCountry === 'Australia'
                            ? 'The Temporary Graduate visa (subclass 485) allows you to live, work, and study in Australia temporarily after graduation. The Post-Study Work stream is for 2-4 years depending on your qualification level.'
                            : 'Many countries offer post-study work options that allow international graduates to gain work experience. These can often lead to pathways for permanent residency.'}
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
                {universityCountry === 'United States' ? (
                  <>
                    <Card hoverable={true}>
                      <CardBody className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              U.S. Department of State
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                              Official information about F-1 student visas, including requirements and application procedures.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open('https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html', '_blank')}
                              leftIcon={<ExternalLink size={14} />}
                              className="w-full"
                            >
                              Visit Website
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                    
                    <Card hoverable={true}>
                      <CardBody className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              SEVP Portal
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                              Information about the Student and Exchange Visitor Program and SEVIS fee payment.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open('https://www.ice.gov/sevis', '_blank')}
                              leftIcon={<ExternalLink size={14} />}
                              className="w-full"
                            >
                              Visit Website
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                    
                    <Card hoverable={true}>
                      <CardBody className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              DS-160 Online Form
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                              Online Nonimmigrant Visa Application form required for all student visa applicants.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open('https://ceac.state.gov/genniv/', '_blank')}
                              leftIcon={<ExternalLink size={14} />}
                              className="w-full"
                            >
                              Visit Website
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </>
                ) : universityCountry === 'United Kingdom' ? (
                  <>
                    <Card hoverable={true}>
                      <CardBody className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              UK Visas and Immigration
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                              Official information about UK student visas, including requirements and application procedures.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open('https://www.gov.uk/student-visa', '_blank')}
                              leftIcon={<ExternalLink size={14} />}
                              className="w-full"
                            >
                              Visit Website
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                    
                    <Card hoverable={true}>
                      <CardBody className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              UKCISA
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                              UK Council for International Student Affairs - guidance and advice for international students.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open('https://www.ukcisa.org.uk/', '_blank')}
                              leftIcon={<ExternalLink size={14} />}
                              className="w-full"
                            >
                              Visit Website
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </>
                ) : universityCountry === 'Canada' ? (
                  <>
                    <Card hoverable={true}>
                      <CardBody className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              Immigration, Refugees and Citizenship Canada
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                              Official information about study permits, including requirements and application procedures.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open('https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html', '_blank')}
                              leftIcon={<ExternalLink size={14} />}
                              className="w-full"
                            >
                              Visit Website
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                    
                    <Card hoverable={true}>
                      <CardBody className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              IRCC Online Application Portal
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                              Portal for submitting study permit applications online.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open('https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html', '_blank')}
                              leftIcon={<ExternalLink size={14} />}
                              className="w-full"
                            >
                              Visit Website
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </>
                ) : (
                  <>
                    <Card hoverable={true}>
                      <CardBody className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              Official Immigration Website
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                              Visit the official immigration website for {universityCountry} for the most up-to-date information.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open('https://www.google.com/search?q=' + encodeURIComponent(`${universityCountry} student visa official website`), '_blank')}
                              leftIcon={<ExternalLink size={14} />}
                              className="w-full"
                            >
                              Search Official Website
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                    
                    <Card hoverable={true}>
                      <CardBody className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              Embassy/Consulate Website
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                              Check the {universityCountry} embassy or consulate website in your country for specific application procedures.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open('https://www.google.com/search?q=' + encodeURIComponent(`${universityCountry} embassy consulate`), '_blank')}
                              leftIcon={<ExternalLink size={14} />}
                              className="w-full"
                            >
                              Find Embassy/Consulate
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </>
                )}
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
              onClick={() => {
                let url = '';
                if (universityCountry === 'United States') {
                  url = 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html';
                } else if (universityCountry === 'United Kingdom') {
                  url = 'https://www.gov.uk/student-visa/apply';
                } else if (universityCountry === 'Canada') {
                  url = 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/apply.html';
                } else {
                  url = 'https://www.google.com/search?q=' + encodeURIComponent(`${universityCountry} student visa application`);
                }
                window.open(url, '_blank');
              }}
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