import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Home, 
  Shield, 
  Stethoscope, 
  DollarSign, 
  Phone, 
  CheckCircle, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  X, 
  Plus,
  Search,
  Filter,
  MapPin,
  Globe,
  Zap,
  Wifi,
  WifiOff,
  Smartphone,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { travelService } from '../../services/travelService';
import DocumentUploadModal from './DocumentUploadModal';
import EmergencyContactModal from './EmergencyContactModal';
import OrientationModal from './OrientationModal';

interface ChecklistItem {
  id: string;
  category: 'documents' | 'housing' | 'insurance' | 'health' | 'finance' | 'emergency' | 'other';
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  dueDate?: string;
  completedAt?: string;
  documentId?: string;
  documentStatus?: 'pending' | 'approved' | 'rejected';
  notes?: string;
  icon: React.ReactNode;
}

interface TravelDestination {
  id: string;
  country: string;
  city: string;
  arrivalDate: string;
  departureDate?: string;
  purpose: 'study' | 'work' | 'tourism' | 'other';
  university?: string;
  employer?: string;
  status: 'upcoming' | 'active' | 'completed';
}

const TravelChecklist: React.FC = () => {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<TravelDestination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<TravelDestination | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showOrientationModal, setShowOrientationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check online status
    const handleOnlineStatusChange = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadTravelData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedDestination) {
      loadChecklist(selectedDestination.id);
    }
  }, [selectedDestination]);

  useEffect(() => {
    // Calculate completion percentage
    if (checklist.length > 0) {
      const requiredItems = checklist.filter(item => item.required);
      const completedRequiredItems = requiredItems.filter(item => item.completed);
      const percentage = Math.round((completedRequiredItems.length / requiredItems.length) * 100);
      setCompletionPercentage(percentage);
    }
  }, [checklist]);

  const loadTravelData = async () => {
    try {
      setLoading(true);
      const destinations = await travelService.getUserDestinations(user!.id);
      setDestinations(destinations);
      
      // Select the most relevant destination (upcoming or active)
      const activeDestination = destinations.find(d => d.status === 'active');
      const upcomingDestination = destinations.find(d => d.status === 'upcoming');
      setSelectedDestination(activeDestination || upcomingDestination || destinations[0]);
    } catch (error) {
      console.error('Error loading travel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChecklist = async (destinationId: string) => {
    try {
      setLoading(true);
      const checklist = await travelService.getDestinationChecklist(destinationId);
      setChecklist(checklist);
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      const item = checklist.find(i => i.id === itemId);
      if (!item) return;

      const updatedItem = await travelService.updateChecklistItem(itemId, {
        completed: !item.completed,
        completedAt: !item.completed ? new Date().toISOString() : undefined
      });

      setChecklist(prev => 
        prev.map(i => i.id === itemId ? updatedItem : i)
      );
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const handleUploadDocument = (item: ChecklistItem) => {
    setSelectedItem(item);
    setShowDocumentModal(true);
  };

  const handleAddEmergencyContact = () => {
    setShowEmergencyModal(true);
  };

  const handleViewOrientation = () => {
    setShowOrientationModal(true);
  };

  const handleDocumentUploaded = async (itemId: string, documentId: string) => {
    try {
      const updatedItem = await travelService.updateChecklistItem(itemId, {
        documentId,
        documentStatus: 'pending'
      });

      setChecklist(prev => 
        prev.map(i => i.id === itemId ? updatedItem : i)
      );
      setShowDocumentModal(false);
    } catch (error) {
      console.error('Error updating document reference:', error);
    }
  };

  const handleAddNote = async (itemId: string, note: string) => {
    try {
      const updatedItem = await travelService.updateChecklistItem(itemId, { notes: note });
      setChecklist(prev => 
        prev.map(i => i.id === itemId ? updatedItem : i)
      );
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const getDocumentStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig: Record<string, { color: string, icon: React.ReactNode }> = {
      'pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <Clock size={14} className="mr-1" /> },
      'approved': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle size={14} className="mr-1" /> },
      'rejected': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <AlertTriangle size={14} className="mr-1" /> }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documents':
        return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'housing':
        return <Home className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'insurance':
        return <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'health':
        return <Stethoscope className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'finance':
        return <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'emergency':
        return <Phone className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const filteredChecklist = checklist.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'completed' && item.completed) ||
      (statusFilter === 'pending' && !item.completed);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getDaysUntilArrival = () => {
    if (!selectedDestination) return null;
    
    const today = new Date();
    const arrivalDate = new Date(selectedDestination.arrivalDate);
    const diffTime = arrivalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysUntilArrival = getDaysUntilArrival();

  if (loading && !selectedDestination) {
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
      {/* Offline Warning */}
      {isOffline && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center">
          <WifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-300">You're offline</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              You can still view your checklist, but changes won't be saved until you're back online.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pre-departure Checklist</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Prepare for your international journey with our comprehensive checklist
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleViewOrientation}
            leftIcon={<Calendar size={16} />}
          >
            View Orientation
          </Button>
          <Button
            variant="outline"
            onClick={handleAddEmergencyContact}
            leftIcon={<Phone size={16} />}
          >
            Emergency Contacts
          </Button>
        </div>
      </div>

      {/* Destination Selector */}
      {destinations.length > 0 && (
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Destination
                </label>
                <select
                  value={selectedDestination?.id || ''}
                  onChange={(e) => {
                    const destination = destinations.find(d => d.id === e.target.value);
                    setSelectedDestination(destination || null);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {destinations.map(destination => (
                    <option key={destination.id} value={destination.id}>
                      {destination.city}, {destination.country} ({new Date(destination.arrivalDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus size={16} />}
                  onClick={() => {/* Add new destination logic */}}
                >
                  Add Destination
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Destination Overview */}
      {selectedDestination && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center mb-2">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedDestination.city}, {selectedDestination.country}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Plane className="w-4 h-4 mr-1" />
                    <span>Arrival: {new Date(selectedDestination.arrivalDate).toLocaleDateString()}</span>
                  </div>
                  {selectedDestination.purpose === 'study' && selectedDestination.university && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{selectedDestination.university}</span>
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
              <div className="flex flex-col items-end">
                <div className="text-right mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Checklist Completion</span>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completionPercentage}%</div>
                </div>
                <div className="w-full max-w-[200px] bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search checklist items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="documents">Travel Documents</option>
              <option value="housing">Housing</option>
              <option value="insurance">Insurance</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
              <option value="emergency">Emergency</option>
              <option value="other">Other</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Checklist */}
      {filteredChecklist.length > 0 ? (
        <div className="space-y-4">
          {filteredChecklist.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${item.completed ? 'border-green-200 dark:border-green-800' : ''}`}>
              <CardBody className="p-0">
                <div className="flex items-start p-6">
                  <div className="flex-shrink-0 mr-4">
                    <button
                      onClick={() => handleToggleItem(item.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        item.completed 
                          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                          : 'border-2 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {item.completed && <CheckCircle className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                          {getCategoryIcon(item.category)}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        {item.required && (
                          <span className="ml-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {item.documentStatus && getDocumentStatusBadge(item.documentStatus)}
                        {item.dueDate && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {item.description}
                    </p>
                    
                    {item.notes && (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <span className="font-medium">Notes:</span> {item.notes}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {item.documentId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye size={14} />}
                          onClick={() => {/* View document logic */}}
                        >
                          View Document
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Upload size={14} />}
                          onClick={() => handleUploadDocument(item)}
                        >
                          Upload Document
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FileText size={14} />}
                        onClick={() => {
                          const note = prompt('Add a note to this item:', item.notes || '');
                          if (note !== null) {
                            handleAddNote(item.id, note);
                          }
                        }}
                      >
                        Add Note
                      </Button>
                    </div>
                  </div>
                </div>
                
                {item.completed && item.completedAt && (
                  <div className="px-6 py-2 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
                    <div className="flex items-center text-sm text-green-700 dark:text-green-300">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span>Completed on {new Date(item.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Checklist Items Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || categoryFilter || statusFilter 
                ? "No items match your current filters. Try adjusting your search criteria."
                : "No checklist items have been created yet."}
            </p>
            {searchQuery || categoryFilter || statusFilter ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('');
                  setStatusFilter('');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                onClick={() => {/* Add checklist item logic */}}
                leftIcon={<Plus size={16} />}
              >
                Add Checklist Item
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      {/* Mobile App Features */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mobile App Features</h3>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Automated Reminders</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive timely notifications for document uploads and approaching deadlines
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Interactive Checklist</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your progress with completion timestamps and real-time updates
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                <WifiOff className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Offline Access</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access critical information even without an internet connection
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button
              leftIcon={<Smartphone size={16} />}
              onClick={() => {/* Download app logic */}}
            >
              Download Mobile App
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Orientation Program */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Orientation Program</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewOrientation}
            >
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {selectedDestination && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Virtual Pre-departure Orientation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(new Date(selectedDestination.arrivalDate).getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} at 10:00 AM (Your local time)
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-13"
                >
                  Add to Calendar
                </Button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Airport Pickup</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(selectedDestination.arrivalDate).toLocaleDateString()} - Confirmation pending
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-13"
                >
                  Confirm Details
                </Button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">In-person Orientation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(new Date(selectedDestination.arrivalDate).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()} at 9:00 AM (Local time)
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-13"
                >
                  View Location
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onUpload={(documentId) => {
          if (selectedItem) {
            handleDocumentUploaded(selectedItem.id, documentId);
          }
        }}
        item={selectedItem}
      />

      <EmergencyContactModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        destinationId={selectedDestination?.id}
      />

      <OrientationModal
        isOpen={showOrientationModal}
        onClose={() => setShowOrientationModal(false)}
        destination={selectedDestination}
      />
    </div>
  );
};

export default TravelChecklist;