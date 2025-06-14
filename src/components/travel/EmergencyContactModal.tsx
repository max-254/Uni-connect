import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Phone, Mail, MapPin, Globe, Shield, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardBody } from '../ui/Card';
import { travelService } from '../../services/travelService';
import { EmergencyContact } from '../../types/travel';

interface EmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationId?: string;
}

const EmergencyContactModal: React.FC<EmergencyContactModalProps> = ({
  isOpen,
  onClose,
  destinationId
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    isLocal: false,
    notes: ''
  });
  const [localEmergencyNumbers, setLocalEmergencyNumbers] = useState<any>(null);

  useEffect(() => {
    if (isOpen && destinationId) {
      loadContacts();
      loadLocalEmergencyInfo();
    }
  }, [isOpen, destinationId]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      if (destinationId) {
        const data = await travelService.getEmergencyContacts(destinationId);
        setContacts(data);
      }
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalEmergencyInfo = async () => {
    try {
      if (destinationId) {
        const info = await travelService.getLocalEmergencyInfo(destinationId);
        setLocalEmergencyNumbers(info);
      }
    } catch (error) {
      console.error('Error loading local emergency info:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddContact = async () => {
    try {
      if (!destinationId) return;
      
      if (!formData.name || !formData.phone) {
        alert('Name and phone number are required');
        return;
      }
      
      const newContact = await travelService.addEmergencyContact(destinationId, formData);
      setContacts(prev => [...prev, newContact]);
      setIsAdding(false);
      resetForm();
    } catch (error) {
      console.error('Error adding emergency contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await travelService.deleteEmergencyContact(contactId);
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
      isLocal: false,
      notes: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Emergency Contacts
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
            {/* Local emergency numbers */}
            {localEmergencyNumbers && (
              <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <CardBody className="p-4">
                  <div className="flex items-center mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <h3 className="font-medium text-red-900 dark:text-red-300">Local Emergency Numbers</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                        <Phone className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-red-700 dark:text-red-300">Emergency (Police/Fire/Ambulance)</p>
                        <p className="font-bold text-red-900 dark:text-red-200">{localEmergencyNumbers.emergency}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                        <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-red-700 dark:text-red-300">Police</p>
                        <p className="font-bold text-red-900 dark:text-red-200">{localEmergencyNumbers.police}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                        <Ambulance className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-red-700 dark:text-red-300">Ambulance</p>
                        <p className="font-bold text-red-900 dark:text-red-200">{localEmergencyNumbers.ambulance}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                        <Globe className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-red-700 dark:text-red-300">Embassy/Consulate</p>
                        <p className="font-bold text-red-900 dark:text-red-200">{localEmergencyNumbers.embassy}</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Your Emergency Contacts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Emergency Contacts</h3>
                <Button
                  size="sm"
                  onClick={() => setIsAdding(true)}
                  leftIcon={<Plus size={16} />}
                  disabled={isAdding}
                >
                  Add Contact
                </Button>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.length > 0 ? (
                    contacts.map(contact => (
                      <Card key={contact.id}>
                        <CardBody className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                  {contact.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium text-gray-900 dark:text-white">{contact.name}</h4>
                                  {contact.relationship && (
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                      ({contact.relationship})
                                    </span>
                                  )}
                                  {contact.isLocal && (
                                    <span className="ml-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">
                                      Local
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 space-y-1 text-sm">
                                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <Phone className="w-4 h-4 mr-1" />
                                    <span>{contact.phone}</span>
                                  </div>
                                  {contact.email && (
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                      <Mail className="w-4 h-4 mr-1" />
                                      <span>{contact.email}</span>
                                    </div>
                                  )}
                                  {contact.address && (
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      <span>{contact.address}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
                              leftIcon={<Trash2 size={14} />}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Delete
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Contacts Added
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Add emergency contacts for your trip
                      </p>
                      <Button
                        onClick={() => setIsAdding(true)}
                        leftIcon={<Plus size={16} />}
                      >
                        Add First Contact
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Add Contact Form */}
            {isAdding && (
              <div className="mt-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Contact</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAdding(false);
                      resetForm();
                    }}
                    leftIcon={<X size={16} />}
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      required
                    />
                    <Input
                      label="Relationship"
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleInputChange}
                      placeholder="e.g., Family, Friend, Colleague"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Include country code"
                      required
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <Input
                    label="Address (Optional)"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Contact's address"
                  />
                  
                  <div className="flex items-center">
                    <input
                      id="isLocal"
                      name="isLocal"
                      type="checkbox"
                      checked={formData.isLocal}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isLocal" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      This is a local contact at my destination
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional information about this contact"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddContact}
                      leftIcon={<Plus size={16} />}
                    >
                      Add Contact
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Emergency Contact Tips
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>• Include at least one contact who speaks the local language</li>
                    <li>• Save emergency contacts in your phone and keep a printed copy</li>
                    <li>• Share your travel itinerary with your emergency contacts</li>
                    <li>• Consider adding your accommodation and university/workplace contacts</li>
                    <li>• Update contact information if it changes during your stay</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactModal;