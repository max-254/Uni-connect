import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, FileText, Mail, ExternalLink, Download } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';

const ApplicationSuccess: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [applicationDate] = useState(new Date());
  
  // In a real app, you would fetch the application details from your API
  const [applicationDetails] = useState({
    id: applicationId,
    course: 'Master of Computer Science',
    university: 'University of Technology',
    status: 'Submitted',
    submissionDate: new Date(),
    estimatedResponseTime: '2-4 weeks'
  });

  // Simulate email sending
  useEffect(() => {
    // In a real app, this would be handled by your backend
    console.log(`Confirmation email sent for application ${applicationId}`);
  }, [applicationId]);

  const handleViewDashboard = () => {
    navigate('/dashboard/applications');
  };

  const handleDownloadConfirmation = () => {
    // In a real app, this would generate and download a PDF
    alert('Confirmation PDF would be downloaded here');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Message */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Application Submitted Successfully!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your application has been received and is now being processed.
        </p>
      </div>

      {/* Application Details Card */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Application Details
          </h2>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Application ID</p>
              <p className="font-medium text-gray-900 dark:text-white">{applicationDetails.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {applicationDetails.status}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Course</p>
              <p className="font-medium text-gray-900 dark:text-white">{applicationDetails.course}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">University</p>
              <p className="font-medium text-gray-900 dark:text-white">{applicationDetails.university}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Submission Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {applicationDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Response Time</p>
              <p className="font-medium text-gray-900 dark:text-white">{applicationDetails.estimatedResponseTime}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Next Steps Card */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Next Steps
          </h2>
        </CardHeader>
        <CardBody className="p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5 mr-3">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Check Your Email</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  We've sent a confirmation email to your registered email address with all the details of your application.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5 mr-3">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Document Verification</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Our team will verify all your submitted documents. This typically takes 3-5 business days.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5 mr-3">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Application Review</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Your application will be reviewed by the admissions committee. You can track the status in your dashboard.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5 mr-3">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">4</span>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Decision Notification</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  You will be notified of the decision via email and in your application dashboard.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Important Dates */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Important Dates
          </h2>
        </CardHeader>
        <CardBody className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <span className="text-gray-900 dark:text-white">Application Submission</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                {applicationDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <span className="text-gray-900 dark:text-white">Expected Decision By</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                {new Date(applicationDate.getTime() + 28 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <span className="text-gray-900 dark:text-white">Course Start Date</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">September 15, 2025</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleViewDashboard}
          leftIcon={<FileText size={16} />}
          className="flex-1"
        >
          View Application Status
        </Button>
        
        <Button
          variant="outline"
          onClick={handleDownloadConfirmation}
          leftIcon={<Download size={16} />}
          className="flex-1"
        >
          Download Confirmation
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate('/courses')}
          leftIcon={<ExternalLink size={16} />}
          className="flex-1"
        >
          Browse More Courses
        </Button>
      </div>
    </div>
  );
};

export default ApplicationSuccess;