export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizer: string;
  max_participants: number;
  current_participants: number;
  status: 'upcoming' | 'active' | 'completed';
  certificate_ready: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: number;
  event_id: number;
  user_id: string;
  user_name: string;
  user_email: string;
  user_college: string;
  user_department: string;
  registration_date: string;
  status: 'registered' | 'attended' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export type EventFormData = Omit<Event, 'id' | 'created_at' | 'updated_at'>;

// Add to your existing types/event.ts
export interface CertificateTemplate {
  id: number;
  event_id: number;
  name: string;
  background_url: string;
  elements: CertificateElement[];
  created_at: string;
  updated_at: string;
}

export interface CertificateElement {
  id: string;
  type: 'text' | 'image' | 'rectangle' | 'circle' | 'line';
  content: string;
  left: number;
  top: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fill?: string;
  width?: number;
  height?: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface CertificateIssue {
  id: number;
  certificate_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  issued_date: string;
  issued_by: string;
  certificate_url: string;
  status: 'pending' | 'issued' | 'sent';
}