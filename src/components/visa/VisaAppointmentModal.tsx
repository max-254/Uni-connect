import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Camera, 
  Briefcase 
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { visaService } from '../../services/visaService';

interface VisaAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

const VisaAppointmentModal: React.FC<VisaAppointmentModalProps> = ({
  isOpen,
  onClose,
  application
}) => {
  const [appointmentType, setAppointmentType] = useState<'biometrics' | 'interview'>('interview');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    const loadAppointmentOptions = async () => {
      if (!application) return;
      
      try {
        setLoading(true);
        
        // In a real app, these would be fetched from an API
        // For demo purposes, we'll generate mock data
        
        // Generate dates (next 30 days)
        const dates = [];
        const now = new Date();
        for (let i = 7; i <= 30; i += 3) {
          const date = new Date(now);
          date.setDate(date.getDate() + i);
          dates.push(date.toISOString().split('T')[0]);
        }
        setAvailableDates(dates);
        
        // Generate times
        const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
        setAvailableTimes(times);
        
        // Generate locations based on country
        let locations = [];
        if (application.country === 'United States') {
          locations = [
            { id: 'us-nyc', name: 'New York', address: 'U.S. Embassy, 845 Third Avenue, New York, NY 10022' },
            { id: 'us-la', name: 'Los Angeles', address: 'U.S. Consulate, 11000 Wilshire Blvd, Los Angeles, CA 90024' },
            { id: 'us-chi', name: 'Chicago', address: 'U.S. Consulate, 77 W Jackson Blvd, Chicago, IL 60604' }
          ];
        } else if (application.country === 'United Kingdom') {
          locations = [
            { id: 'uk-lon', name: 'London', address: 'UK Visa Application Centre, 1 Drummond Gate, London, SW1V 2QQ' },
            { id: 'uk-man', name: 'Manchester', address: 'UK Visa Application Centre, 50 Broadway, Manchester, M50 2UB' }
          ];
        } else if (application.country === 'Canada') {
          locations = [
            { id: 'ca-tor', name: 'Toronto', address: 'Canada Visa Application Centre, 55 Town Centre Court, Toronto, ON M1P 4X4' },
            { id: 'ca-van', name: 'Vancouver', address: 'Canada Visa Application Centre, 1010 Howe St, Vancouver, BC V6Z 2X1' }
          ];
        } else {
          locations = [
            { id: 'default-1', name: 'Main Embassy', address: 'Main Embassy Location' },
            { id: 'default-2', name: 'Consulate Office', address: 'Consulate Office Location' }
          ];
        }
        setAvailableLocations(locations);
        
        // Reset form
        setFormData({
          date: '',
          time: '',
          location: '',
          notes: ''
        });
      } catch (error) {
        console.error('Error loading appointment options:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && application) {
      loadAppointmentOptions();
    }
  }, [isOpen, application, appointmentType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleAppointment = async () => {
    if (!formData.date || !formData.time || !formData.location) {
      alert('Please select a date, time, and location');
      return;
    }

    try {
      setIsScheduling(true);
      
      await visaService.scheduleVisaAppointment(application.id, {
        date: formData.date,
        time: formData.time,
        location: formData.location,
        type: appointmentType,
        notes: formData.notes
      });
      
      // In a real app, you would update the application state here
      
      onClose();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Failed to schedule appointment. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const getAppointmentTypeInfo = () => {
    if (appointmentType === 'biometrics') {
      return {
        title: 'Biometrics Appointment',
        description: 'Schedule an appointment to provide your fingerprints and photo.',
        icon: <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
        requirements: [
          'Bring your appointment confirmation',
          'Bring your passport',
          'Arrive 15 minutes before your appointment time',
          'No jewelry or glasses allowed during photo capture'
        ]
      };
    } else {
      return {
        title: 'Visa Interview Appointment',
        description: 'Schedule your visa interview at the embassy or consulate.',
        icon: <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
        requirements: [
          'Bring all required documents (originals and copies)',
          'Bring your appointment confirmation',
          'Bring your passport',
          'Arrive 30 minutes before your appointment time',
          'Be prepared to answer questions about your study plans'
        ]
      };
    }
  };

  if (!isOpen || !application) return null;

  const appointmentInfo = getAppointmentTypeInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Manage Visa Appointment
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
          <div className="space-y-6">
            {/* Appointment Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Appointment Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAppointmentType('biometrics')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    appointmentType === 'biometrics'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">Biometrics</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fingerprints and photo collection
                  </p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAppointmentType('interview')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    appointmentType === 'interview'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">Interview</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visa interview with consular officer
                  </p>
                </button>
              </div>
            </div>

            {/* Appointment Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  {appointmentInfo.icon}
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-medium text-blue-900 dark:text-blue-300">
                    {appointmentInfo.title}
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                    {appointmentInfo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Appointment Date
              </label>
              <select
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a date</option>
                {loading ? (
                  <option value="" disabled>Loading dates...</option>
                ) : (
                  availableDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Appointment Time
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.date}
              >
                <option value="">Select a time</option>
                {loading ? (
                  <option value="" disabled>Loading times...</option>
                ) : (
                  availableTimes.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Appointment Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a location</option>
                {loading ? (
                  <option value="" disabled>Loading locations...</option>
                ) : (
                  availableLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))
                )}
              </select>
              
              {formData.location && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {availableLocations.find(loc => loc.id === formData.location)?.address}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any special requirements or notes for your appointment"
              />
            </div>

            {/* Requirements */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-base font-medium text-yellow-900 dark:text-yellow-300 mb-2">
                    What to Bring
                  </h4>
                  <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-200">
                    {appointmentInfo.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Official Booking Link */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-start">
                <ExternalLink className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                    Official Booking System
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    For some countries, you may need to book your appointment through the official visa application system.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<ExternalLink size={14} />}
                    onClick={() => {
                      let url = '';
                      if (application.country === 'United States') {
                        url = 'https://ais.usvisa-info.com/';
                      } else if (application.country === 'United Kingdom') {
                        url = 'https://www.gov.uk/book-visa-appointment';
                      } else if (application.country === 'Canada') {
                        url = 'https://www.vfsglobal.ca/';
                      }
                      window.open(url, '_blank');
                    }}
                  >
                    Go to Official Booking System
                  </Button>
                </div>
              </div>
            </div>
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
              onClick={handleScheduleAppointment}
              isLoading={isScheduling}
              disabled={!formData.date || !formData.time || !formData.location}
              leftIcon={<Calendar size={16} />}
            >
              Schedule Appointment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaAppointmentModal;