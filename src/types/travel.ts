import { ReactNode } from 'react';

export interface TravelDestination {
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

export interface ChecklistItem {
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
  icon: ReactNode;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship?: string;
  phone: string;
  email?: string;
  address?: string;
  isLocal: boolean;
  notes?: string;
}

export interface OrientationSession {
  id: string;
  title: string;
  description: string;
  type: 'virtual' | 'in-person';
  date: string;
  time: string;
  location?: string;
  link?: string;
  required: boolean;
}

export interface OrientationResource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'map' | 'video' | 'document';
  downloadUrl?: string;
  externalUrl?: string;
  fileSize?: string;
  fileType?: string;
}