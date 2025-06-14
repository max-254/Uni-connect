import { supabase } from '../lib/supabase';
import { 
  TravelDestination, 
  ChecklistItem, 
  EmergencyContact, 
  OrientationSession, 
  OrientationResource 
} from '../types/travel';

class TravelService {
  private static instance: TravelService;

  static getInstance(): TravelService {
    if (!TravelService.instance) {
      TravelService.instance = new TravelService();
    }
    return TravelService.instance;
  }

  async getUserDestinations(userId: string): Promise<TravelDestination[]> {
    try {
      // In a real app, this would fetch from your API
      // For demo purposes, we'll return mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return [
        {
          id: 'dest-001',
          country: 'United States',
          city: 'Boston',
          arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          purpose: 'study',
          university: 'Harvard University',
          status: 'upcoming'
        },
        {
          id: 'dest-002',
          country: 'United Kingdom',
          city: 'London',
          arrivalDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
          departureDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString(),
          purpose: 'tourism',
          status: 'upcoming'
        },
        {
          id: 'dest-003',
          country: 'Japan',
          city: 'Tokyo',
          arrivalDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
          departureDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          purpose: 'study',
          university: 'University of Tokyo',
          status: 'completed'
        }
      ];
    } catch (error) {
      console.error('Error fetching user destinations:', error);
      throw new Error('Failed to fetch destinations');
    }
  }

  async getDestinationChecklist(destinationId: string): Promise<ChecklistItem[]> {
    try {
      // In a real app, this would fetch from your API
      // For demo purposes, we'll return mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return [
        {
          id: 'item-001',
          category: 'documents',
          title: 'Valid Passport',
          description: 'Ensure your passport is valid for at least 6 months beyond your planned stay',
          required: true,
          completed: true,
          completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          documentId: 'doc-001',
          documentStatus: 'approved',
          icon: <FileText className="w-5 h-5" />
        },
        {
          id: 'item-002',
          category: 'documents',
          title: 'Visa',
          description: 'Apply for and obtain the appropriate visa for your destination and purpose of travel',
          required: true,
          completed: true,
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          documentId: 'doc-002',
          documentStatus: 'approved',
          icon: <FileText className="w-5 h-5" />
        },
        {
          id: 'item-003',
          category: 'documents',
          title: 'Flight Tickets',
          description: 'Book and confirm your flight tickets',
          required: true,
          completed: true,
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          documentId: 'doc-003',
          documentStatus: 'approved',
          icon: <Plane className="w-5 h-5" />
        },
        {
          id: 'item-004',
          category: 'housing',
          title: 'Housing Confirmation',
          description: 'Secure and confirm your housing arrangements',
          required: true,
          completed: true,
          completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          documentId: 'doc-004',
          documentStatus: 'approved',
          icon: <Home className="w-5 h-5" />
        },
        {
          id: 'item-005',
          category: 'insurance',
          title: 'Travel Insurance',
          description: 'Purchase travel insurance that covers medical emergencies, trip cancellation, and lost luggage',
          required: true,
          completed: false,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          icon: <Shield className="w-5 h-5" />
        },
        {
          id: 'item-006',
          category: 'health',
          title: 'Required Vaccinations',
          description: 'Get any required or recommended vaccinations for your destination',
          required: true,
          completed: false,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          icon: <Stethoscope className="w-5 h-5" />
        },
        {
          id: 'item-007',
          category: 'health',
          title: 'Prescription Medications',
          description: 'Ensure you have sufficient prescription medications for your stay and proper documentation',
          required: false,
          completed: false,
          icon: <Stethoscope className="w-5 h-5" />
        },
        {
          id: 'item-008',
          category: 'finance',
          title: 'Local Currency',
          description: 'Exchange some currency or ensure your cards work internationally',
          required: true,
          completed: false,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          icon: <DollarSign className="w-5 h-5" />
        },
        {
          id: 'item-009',
          category: 'finance',
          title: 'Notify Bank of Travel',
          description: 'Inform your bank and credit card companies of your travel plans to prevent card blocks',
          required: true,
          completed: false,
          icon: <DollarSign className="w-5 h-5" />
        },
        {
          id: 'item-010',
          category: 'emergency',
          title: 'Emergency Contacts',
          description: 'Prepare a list of emergency contacts, including local embassy/consulate',
          required: true,
          completed: false,
          icon: <Phone className="w-5 h-5" />
        },
        {
          id: 'item-011',
          category: 'documents',
          title: 'Acceptance Letter',
          description: 'University or program acceptance letter',
          required: true,
          completed: true,
          completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          documentId: 'doc-005',
          documentStatus: 'approved',
          icon: <FileText className="w-5 h-5" />
        },
        {
          id: 'item-012',
          category: 'other',
          title: 'International Driving Permit',
          description: 'If you plan to drive, obtain an International Driving Permit',
          required: false,
          completed: false,
          icon: <Car className="w-5 h-5" />
        }
      ];
    } catch (error) {
      console.error('Error fetching destination checklist:', error);
      throw new Error('Failed to fetch checklist');
    }
  }

  async updateChecklistItem(itemId: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem> {
    try {
      // In a real app, this would update the database
      // For demo purposes, we'll simulate an update
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // This would be the updated item from the database
      return {
        id: itemId,
        category: 'documents',
        title: 'Sample Item',
        description: 'Sample description',
        required: true,
        completed: updates.completed !== undefined ? updates.completed : false,
        completedAt: updates.completedAt,
        documentId: updates.documentId,
        documentStatus: updates.documentStatus,
        notes: updates.notes,
        icon: <FileText className="w-5 h-5" />
      };
    } catch (error) {
      console.error('Error updating checklist item:', error);
      throw new Error('Failed to update checklist item');
    }
  }

  async uploadDocument(documentData: any): Promise<string> {
    try {
      // In a real app, this would upload to storage and create a database record
      // For demo purposes, we'll simulate an upload
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return a mock document ID
      return `doc-${Date.now().toString(36)}`;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  }

  async getEmergencyContacts(destinationId: string): Promise<EmergencyContact[]> {
    try {
      // In a real app, this would fetch from your API
      // For demo purposes, we'll return mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return [
        {
          id: 'contact-001',
          name: 'John Smith',
          relationship: 'Family',
          phone: '+1 (555) 123-4567',
          email: 'john.smith@example.com',
          address: '123 Main St, Hometown, USA',
          isLocal: false
        },
        {
          id: 'contact-002',
          name: 'University International Office',
          relationship: 'University Support',
          phone: '+1 (555) 987-6543',
          email: 'international@university.edu',
          address: 'University Campus, International Center',
          isLocal: true,
          notes: 'Available 24/7 for emergency assistance'
        }
      ];
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      throw new Error('Failed to fetch emergency contacts');
    }
  }

  async addEmergencyContact(destinationId: string, contactData: Partial<EmergencyContact>): Promise<EmergencyContact> {
    try {
      // In a real app, this would create in the database
      // For demo purposes, we'll simulate creation
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        id: `contact-${Date.now().toString(36)}`,
        name: contactData.name || '',
        relationship: contactData.relationship || '',
        phone: contactData.phone || '',
        email: contactData.email || '',
        address: contactData.address || '',
        isLocal: contactData.isLocal || false,
        notes: contactData.notes
      };
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      throw new Error('Failed to add emergency contact');
    }
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    try {
      // In a real app, this would delete from the database
      // For demo purposes, we'll simulate deletion
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      throw new Error('Failed to delete emergency contact');
    }
  }

  async getLocalEmergencyInfo(destinationId: string): Promise<any> {
    try {
      // In a real app, this would fetch from your API
      // For demo purposes, we'll return mock data based on destination
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Get destination details to determine country-specific emergency numbers
      const destinations = await this.getUserDestinations('dummy-user-id');
      const destination = destinations.find(d => d.id === destinationId);
      
      if (!destination) {
        throw new Error('Destination not found');
      }
      
      // Return country-specific emergency numbers
      const emergencyNumbers: Record<string, any> = {
        'United States': {
          emergency: '911',
          police: '911',
          ambulance: '911',
          embassy: '+1 (202) 555-1234'
        },
        'United Kingdom': {
          emergency: '999',
          police: '999 or 101',
          ambulance: '999',
          embassy: '+44 20 5555 1234'
        },
        'Japan': {
          emergency: '110',
          police: '110',
          ambulance: '119',
          embassy: '+81 3 5555 1234'
        },
        'Germany': {
          emergency: '112',
          police: '110',
          ambulance: '112',
          embassy: '+49 30 5555 1234'
        },
        'France': {
          emergency: '112',
          police: '17',
          ambulance: '15',
          embassy: '+33 1 5555 1234'
        },
        'Australia': {
          emergency: '000',
          police: '000',
          ambulance: '000',
          embassy: '+61 2 5555 1234'
        }
      };
      
      return emergencyNumbers[destination.country] || {
        emergency: '112', // International emergency number
        police: '112',
        ambulance: '112',
        embassy: 'Contact your country\'s embassy'
      };
    } catch (error) {
      console.error('Error fetching local emergency info:', error);
      throw new Error('Failed to fetch local emergency information');
    }
  }

  async getOrientationSessions(destinationId: string): Promise<OrientationSession[]> {
    try {
      // In a real app, this would fetch from your API
      // For demo purposes, we'll return mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Get destination details to determine dates
      const destinations = await this.getUserDestinations('dummy-user-id');
      const destination = destinations.find(d => d.id === destinationId);
      
      if (!destination) {
        throw new Error('Destination not found');
      }
      
      const arrivalDate = new Date(destination.arrivalDate);
      
      return [
        {
          id: 'session-001',
          title: 'Pre-departure Orientation',
          description: 'Essential information to prepare for your journey and arrival',
          type: 'virtual',
          date: new Date(arrivalDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days before arrival
          time: '10:00 AM - 12:00 PM (Your local time)',
          link: 'https://zoom.us/j/example',
          required: true
        },
        {
          id: 'session-002',
          title: 'Airport Pickup & Housing Check-in',
          description: 'Meet our team at the airport for transportation to your accommodation',
          type: 'in-person',
          date: arrivalDate.toISOString(),
          time: 'Upon arrival',
          location: 'Airport Arrival Terminal',
          required: false
        },
        {
          id: 'session-003',
          title: 'Welcome Reception',
          description: 'Meet other international students and university staff',
          type: 'in-person',
          date: new Date(arrivalDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day after arrival
          time: '6:00 PM - 8:00 PM',
          location: 'University Student Center',
          required: false
        },
        {
          id: 'session-004',
          title: 'Main Orientation Session',
          description: 'Comprehensive orientation covering academic expectations, campus resources, and more',
          type: 'in-person',
          date: new Date(arrivalDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days after arrival
          time: '9:00 AM - 4:00 PM',
          location: 'University Main Hall',
          required: true
        },
        {
          id: 'session-005',
          title: 'City Tour',
          description: 'Guided tour of important locations in the city',
          type: 'in-person',
          date: new Date(arrivalDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days after arrival
          time: '10:00 AM - 2:00 PM',
          location: 'Meeting at University Main Entrance',
          required: false
        }
      ];
    } catch (error) {
      console.error('Error fetching orientation sessions:', error);
      throw new Error('Failed to fetch orientation sessions');
    }
  }

  async getOrientationResources(destinationId: string): Promise<OrientationResource[]> {
    try {
      // In a real app, this would fetch from your API
      // For demo purposes, we'll return mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return [
        {
          id: 'resource-001',
          title: 'Pre-arrival Guide',
          description: 'Comprehensive guide to prepare for your journey',
          type: 'guide',
          downloadUrl: '#',
          fileSize: '2.5 MB',
          fileType: 'PDF'
        },
        {
          id: 'resource-002',
          title: 'Campus Map',
          description: 'Interactive map of the university campus',
          type: 'map',
          externalUrl: '#',
          fileType: 'Interactive'
        },
        {
          id: 'resource-003',
          title: 'City Guide',
          description: 'Guide to local transportation, shopping, dining, and attractions',
          type: 'guide',
          downloadUrl: '#',
          fileSize: '3.8 MB',
          fileType: 'PDF'
        },
        {
          id: 'resource-004',
          title: 'Cultural Adjustment Guide',
          description: 'Tips for adapting to a new culture and managing culture shock',
          type: 'guide',
          downloadUrl: '#',
          fileSize: '1.2 MB',
          fileType: 'PDF'
        },
        {
          id: 'resource-005',
          title: 'Language Resources',
          description: 'Basic phrases and language learning resources',
          type: 'guide',
          externalUrl: '#',
          fileType: 'Web Resource'
        },
        {
          id: 'resource-006',
          title: 'Health & Safety Information',
          description: 'Important health and safety information for your destination',
          type: 'guide',
          downloadUrl: '#',
          fileSize: '1.5 MB',
          fileType: 'PDF'
        }
      ];
    } catch (error) {
      console.error('Error fetching orientation resources:', error);
      throw new Error('Failed to fetch orientation resources');
    }
  }

  async getOrientationContacts(destinationId: string): Promise<any[]> {
    try {
      // In a real app, this would fetch from your API
      // For demo purposes, we'll return mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return [
        {
          id: 'contact-001',
          name: 'International Student Office',
          role: 'Student Support',
          type: 'university',
          phone: '+1 (555) 123-4567',
          email: 'international@university.edu',
          location: 'Student Center, Room 205',
          notes: 'Main point of contact for international student concerns'
        },
        {
          id: 'contact-002',
          name: 'Housing Office',
          role: 'Housing Support',
          type: 'housing',
          phone: '+1 (555) 987-6543',
          email: 'housing@university.edu',
          location: 'Housing Building, 1st Floor',
          notes: 'Contact for any housing-related issues or questions'
        },
        {
          id: 'contact-003',
          name: 'Sarah Johnson',
          role: 'International Student Advisor',
          type: 'support',
          phone: '+1 (555) 234-5678',
          email: 'sarah.johnson@university.edu',
          location: 'Student Center, Room 207',
          notes: 'Your assigned advisor for academic and personal support'
        },
        {
          id: 'contact-004',
          name: 'Campus Security',
          role: 'Safety & Security',
          type: 'emergency',
          phone: '+1 (555) 911-0000',
          email: 'security@university.edu',
          location: 'Security Building, Main Campus',
          notes: 'Available 24/7 for campus emergencies'
        }
      ];
    } catch (error) {
      console.error('Error fetching orientation contacts:', error);
      throw new Error('Failed to fetch orientation contacts');
    }
  }
}

export const travelService = TravelService.getInstance();