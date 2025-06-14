import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Globe, 
  Clock, 
  CheckCircle, 
  Download, 
  ExternalLink, 
  Video, 
  Book, 
  Coffee, 
  Home, 
  Utensils, 
  ShoppingBag, 
  Bus, 
  Landmark, 
  Phone, 
  Mail, 
  Info 
} from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { travelService } from '../../services/travelService';
import { TravelDestination, OrientationSession } from '../../types/travel';

interface OrientationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: TravelDestination | null;
}

const OrientationModal: React.FC<OrientationModalProps> = ({
  isOpen,
  onClose,
  destination
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'resources' | 'contacts'>('schedule');
  const [orientationSessions, setOrientationSessions] = useState<OrientationSession[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && destination) {
      loadOrientationData();
    }
  }, [isOpen, destination]);

  const loadOrientationData = async () => {
    try {
      setLoading(true);
      if (destination) {
        const [sessionsData, resourcesData, contactsData] = await Promise.all([
          travelService.getOrientationSessions(destination.id),
          travelService.getOrientationResources(destination.id),
          travelService.getOrientationContacts(destination.id)
        ]);
        
        setOrientationSessions(sessionsData);
        setResources(resourcesData);
        setContacts(contactsData);
      }
    } catch (error) {
      console.error('Error loading orientation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = (session: OrientationSession) => {
    // In a real app, this would generate a calendar event file or link
    alert(`Added "${session.title}" to your calendar`);
  };

  const handleDownloadResource = (resourceId: string) => {
    // In a real app, this would download the resource
    alert(`Downloading resource...`);
  };

  if (!isOpen || !destination) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Orientation Program
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {destination.city}, {destination.country}
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

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'schedule', label: 'Schedule', icon: Calendar },
              { id: 'resources', label: 'Resources', icon: Book },
              { id: 'contacts', label: 'Contacts', icon: Phone }
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
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                          About Your Orientation
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Your orientation program is designed to help you settle in and adapt to life in {destination.city}. 
                          It includes both virtual pre-departure sessions and in-person events after your arrival.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Orientation Schedule
                  </h3>
                  
                  <div className="space-y-4">
                    {orientationSessions.length > 0 ? (
                      orientationSessions.map((session) => (
                        <Card key={session.id} className="overflow-hidden">
                          <CardBody className="p-0">
                            <div className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex items-start space-x-3">
                                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {session.type === 'virtual' ? (
                                      <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    ) : (
                                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center">
                                      <h4 className="font-medium text-gray-900 dark:text-white">{session.title}</h4>
                                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        session.type === 'virtual' 
                                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                      }`}>
                                        {session.type === 'virtual' ? 'Virtual' : 'In-person'}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {session.description}
                                    </p>
                                    <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-1">
                                      <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        <span>{new Date(session.date).toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>{session.time}</span>
                                      </div>
                                      {session.location && (
                                        <div className="flex items-center">
                                          <MapPin className="w-4 h-4 mr-1" />
                                          <span>{session.location}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-4 md:mt-0 flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddToCalendar(session)}
                                    leftIcon={<Calendar size={14} />}
                                  >
                                    Add to Calendar
                                  </Button>
                                  {session.type === 'virtual' && session.link && (
                                    <Button
                                      size="sm"
                                      leftIcon={<ExternalLink size={14} />}
                                      onClick={() => window.open(session.link, '_blank')}
                                    >
                                      Join
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {session.required && (
                              <div className="px-6 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center text-sm text-yellow-700 dark:text-yellow-300">
                                  <Info className="w-4 h-4 mr-2" />
                                  <span>Attendance is required for this session</span>
                                </div>
                              </div>
                            )}
                          </CardBody>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Sessions Scheduled
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Orientation sessions will be added as your arrival date approaches.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Orientation Resources
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resources.length > 0 ? (
                      resources.map((resource) => (
                        <Card key={resource.id} hoverable={true}>
                          <CardBody className="p-6">
                            <div className="flex items-start space-x-3 mb-4">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                {resource.type === 'guide' ? (
                                  <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                ) : resource.type === 'map' ? (
                                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{resource.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {resource.description}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              {resource.downloadUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadResource(resource.id)}
                                  leftIcon={<Download size={14} />}
                                >
                                  Download
                                </Button>
                              )}
                              {resource.externalUrl && (
                                <Button
                                  size="sm"
                                  leftIcon={<ExternalLink size={14} />}
                                  onClick={() => window.open(resource.externalUrl, '_blank')}
                                >
                                  View
                                </Button>
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Resources Available
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Resources will be added as your arrival date approaches.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Local Information */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Local Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardBody className="p-4">
                          <div className="flex items-center mb-3">
                            <Home className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                            <h4 className="font-medium text-gray-900 dark:text-white">Accommodation</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Information about your housing, check-in procedures, and local amenities.
                          </p>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardBody className="p-4">
                          <div className="flex items-center mb-3">
                            <Utensils className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                            <h4 className="font-medium text-gray-900 dark:text-white">Food & Dining</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Local food options, dining halls, grocery stores, and dietary considerations.
                          </p>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardBody className="p-4">
                          <div className="flex items-center mb-3">
                            <Bus className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                            <h4 className="font-medium text-gray-900 dark:text-white">Transportation</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Public transit options, campus shuttles, and getting around the city.
                          </p>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardBody className="p-4">
                          <div className="flex items-center mb-3">
                            <ShoppingBag className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                            <h4 className="font-medium text-gray-900 dark:text-white">Shopping</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Where to buy essentials, clothing, electronics, and other necessities.
                          </p>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardBody className="p-4">
                          <div className="flex items-center mb-3">
                            <Coffee className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                            <h4 className="font-medium text-gray-900 dark:text-white">Social Activities</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Student clubs, events, and social opportunities to meet people.
                          </p>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardBody className="p-4">
                          <div className="flex items-center mb-3">
                            <Landmark className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                            <h4 className="font-medium text-gray-900 dark:text-white">Cultural Tips</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Local customs, etiquette, and cultural norms to be aware of.
                          </p>
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Important Contacts
                  </h3>
                  
                  <div className="space-y-4">
                    {contacts.length > 0 ? (
                      contacts.map((contact) => (
                        <Card key={contact.id}>
                          <CardBody className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                {contact.type === 'university' ? (
                                  <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                ) : contact.type === 'housing' ? (
                                  <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                ) : contact.type === 'support' ? (
                                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium text-gray-900 dark:text-white">{contact.name}</h4>
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                    ({contact.role})
                                  </span>
                                </div>
                                <div className="mt-1 space-y-1 text-sm">
                                  {contact.phone && (
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                      <Phone className="w-4 h-4 mr-1" />
                                      <span>{contact.phone}</span>
                                    </div>
                                  )}
                                  {contact.email && (
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                      <Mail className="w-4 h-4 mr-1" />
                                      <span>{contact.email}</span>
                                    </div>
                                  )}
                                  {contact.location && (
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      <span>{contact.location}</span>
                                    </div>
                                  )}
                                </div>
                                {contact.notes && (
                                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    {contact.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Contacts Available
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Contact information will be added as your arrival date approaches.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Support Network */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Your Support Network
                    </h3>
                    
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <CardBody className="p-6">
                        <div className="flex items-center mb-4">
                          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                          <h4 className="font-medium text-blue-900 dark:text-blue-300">Connect with Others</h4>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                          We've connected you with other travelers heading to {destination.city} around the same time. 
                          Join the group chat to meet them before you arrive!
                        </p>
                        <div className="flex justify-end">
                          <Button
                            leftIcon={<ExternalLink size={16} />}
                            onClick={() => {/* Join group chat logic */}}
                          >
                            Join Group Chat
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => window.print()}
              leftIcon={<Download size={16} />}
            >
              Print Schedule
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

export default OrientationModal;