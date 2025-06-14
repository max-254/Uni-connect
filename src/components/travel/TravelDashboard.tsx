import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Calendar, 
  CheckSquare, 
  MapPin, 
  Globe, 
  Clock, 
  ArrowRight, 
  Smartphone, 
  Download, 
  Users, 
  FileText, 
  Zap, 
  Bell, 
  Settings, 
  Languages, 
  HelpCircle 
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import TravelChecklist from './TravelChecklist';
import { useAuth } from '../../context/AuthContext';
import { travelService } from '../../services/travelService';
import { TravelDestination } from '../../types/travel';

const TravelDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'orientation' | 'resources'>('overview');
  const [destinations, setDestinations] = useState<TravelDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    if (user) {
      loadTravelData();
    }
  }, [user]);

  const loadTravelData = async () => {
    try {
      setLoading(true);
      const destinations = await travelService.getUserDestinations(user!.id);
      setDestinations(destinations);
    } catch (error) {
      console.error('Error loading travel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingDestination = () => {
    if (!destinations.length) return null;
    
    const upcoming = destinations.find(d => d.status === 'upcoming');
    const active = destinations.find(d => d.status === 'active');
    
    return upcoming || active || destinations[0];
  };

  const getDaysUntilArrival = (destination: TravelDestination) => {
    const today = new Date();
    const arrivalDate = new Date(destination.arrivalDate);
    const diffTime = arrivalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const upcomingDestination = getUpcomingDestination();
  const daysUntilArrival = upcomingDestination ? getDaysUntilArrival(upcomingDestination) : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Travel Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your international travel preparations and orientation
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="appearance-none pl-8 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="ar">العربية</option>
            </select>
            <Languages className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<HelpCircle size={16} />}
          >
            Help
          </Button>
        </div>
      </div>

      {/* Upcoming Trip Banner */}
      {upcomingDestination && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Upcoming Trip: {upcomingDestination.city}, {upcomingDestination.country}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Arrival: {new Date(upcomingDestination.arrivalDate).toLocaleDateString()}</span>
                  </div>
                  {upcomingDestination.purpose === 'study' && upcomingDestination.university && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{upcomingDestination.university}</span>
                    </div>
                  )}
                  {daysUntilArrival !== null && daysUntilArrival > 0 && (
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{daysUntilArrival} days until arrival</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Button
                  onClick={() => setActiveTab('checklist')}
                  leftIcon={<CheckSquare size={16} />}
                >
                  View Checklist
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Globe },
            { id: 'checklist', label: 'Pre-departure Checklist', icon: CheckSquare },
            { id: 'orientation', label: 'Orientation Program', icon: Users },
            { id: 'resources', label: 'Resources', icon: FileText }
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Plane className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Destinations</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{destinations.length}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Checklist Progress</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">75%</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Orientation Sessions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Documents</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverable={true}>
              <CardBody className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Complete Your Checklist
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Track your pre-departure tasks and document uploads.
                </p>
                <Button
                  className="w-full"
                  onClick={() => setActiveTab('checklist')}
                  rightIcon={<ArrowRight size={16} />}
                >
                  View Checklist
                </Button>
              </CardBody>
            </Card>

            <Card hoverable={true}>
              <CardBody className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Orientation Program
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  View your orientation schedule and resources.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab('orientation')}
                  rightIcon={<ArrowRight size={16} />}
                >
                  View Program
                </Button>
              </CardBody>
            </Card>

            <Card hoverable={true}>
              <CardBody className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Download Mobile App
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get offline access and real-time notifications.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  leftIcon={<Download size={16} />}
                >
                  Download App
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Pre-departure Orientation</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Virtual Session • {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Add to Calendar
                    </Button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                        <Plane className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Flight to {upcomingDestination?.city}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {upcomingDestination?.arrivalDate ? new Date(upcomingDestination.arrivalDate).toLocaleDateString() : 'Date TBD'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Flight Details
                    </Button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                        <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Welcome Reception</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          In-person • {upcomingDestination?.arrivalDate ? new Date(new Date(upcomingDestination.arrivalDate).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'Date TBD'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'checklist' && (
        <TravelChecklist />
      )}

      {activeTab === 'orientation' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Orientation Program</h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Orientation Program
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                  Your orientation program includes both virtual pre-departure sessions and in-person events after your arrival. 
                  It's designed to help you settle in and adapt to life in your new location.
                </p>
                <Button
                  leftIcon={<Calendar size={16} />}
                >
                  View Full Schedule
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Orientation Timeline */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Orientation Timeline</h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                
                {/* Timeline Events */}
                <div className="space-y-8 relative">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center z-10 mr-4">
                      <Video className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Virtual Pre-departure Orientation</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        1 week before arrival • Online via Zoom
                      </p>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Join us for an online session to prepare for your arrival. We'll cover important pre-departure information, 
                        what to pack, and answer any questions you may have.
                      </p>
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          Add to Calendar
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center z-10 mr-4">
                      <Plane className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Airport Pickup & Housing Check-in</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Arrival day • Airport and Housing Location
                      </p>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Our team will meet you at the airport and help you get to your accommodation. 
                        We'll assist with check-in procedures and make sure you're comfortably settled.
                      </p>
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          Confirm Pickup
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center z-10 mr-4">
                      <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">In-person Orientation</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        2 days after arrival • Campus Main Hall
                      </p>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Join us for a comprehensive orientation session covering academic expectations, 
                        campus resources, cultural adjustment, and more. You'll also meet other international students.
                      </p>
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          View Location
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center z-10 mr-4">
                      <MapPin className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">City Tour & Cultural Activities</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        3-4 days after arrival • Various Locations
                      </p>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Explore your new city with guided tours and cultural activities. 
                        Learn about local transportation, important locations, and cultural norms.
                      </p>
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          View Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card hoverable={true}>
              <CardBody className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Country Guide</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Comprehensive guide to local customs, culture, and practical information.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  leftIcon={<Download size={16} />}
                >
                  Download Guide
                </Button>
              </CardBody>
            </Card>
            
            <Card hoverable={true}>
              <CardBody className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Campus & City Maps</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Interactive maps of your campus and surrounding city areas.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  leftIcon={<MapPin size={16} />}
                >
                  View Maps
                </Button>
              </CardBody>
            </Card>
            
            <Card hoverable={true}>
              <CardBody className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Welcome Package</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Digital welcome package with essential information and resources.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  leftIcon={<Download size={16} />}
                >
                  Download Package
                </Button>
              </CardBody>
            </Card>
            
            <Card hoverable={true}>
              <CardBody className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Start Guide</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Essential first steps for your first 48 hours after arrival.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  leftIcon={<FileText size={16} />}
                >
                  View Guide
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* Language & Cultural Resources */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Language & Cultural Resources</h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                    <Languages className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Language Basics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Essential phrases and language resources for your destination.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Learn Phrases
                  </Button>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cultural Norms</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Understanding local customs, etiquette, and social expectations.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    View Guide
                  </Button>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cultural Adjustment</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Tips for managing culture shock and adapting to your new environment.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Read More
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Mobile App Promotion */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Download Our Mobile App
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
                    Get offline access to all your travel documents, receive real-time notifications, 
                    and stay connected with your support network.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    leftIcon={<Download size={16} />}
                  >
                    App Store
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<Download size={16} />}
                  >
                    Google Play
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TravelDashboard;