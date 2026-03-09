// types/event.ts

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
  image_url: string;
  status: 'upcoming' | 'active' | 'completed';
  certificate_ready: boolean;
  certificate_template_id?: number; // New field
  created_at?: string;
  updated_at?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizer: string;
  max_participants: number;
  current_participants: number;
  image_url: string;
  status: 'upcoming' | 'active' | 'completed';
  certificate_ready: boolean;
}

export interface Registration {
  id: number;
  event_id: number;
  user_id: string;
  user_name: string;
  user_email: string;
  user_college: string;
  user_department: string;
  status: 'registered' | 'attended' | 'cancelled';
  registration_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface CertificateTemplate {
  id: number;
  name: string;
  description?: string;
  background_url: string;
  background_type: 'image' | 'pdf';
  width: number;
  height: number;
  fields: CertificateField[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  thumbnail_url?: string;
}

export interface CertificateField {
  id: string;
  type: 'text' | 'date' | 'qr' | 'barcode' | 'signature' | 'image';
  label: string;
  placeholder: string;
  field_key: 'name' | 'email' | 'event_name' | 'event_date' | 'issue_date' | 'certificate_id' | 'custom';
  default_value?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | 'light';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  required: boolean;
  validation?: string;
}

export interface EventCertificate {
  id: number;
  event_id: number;
  template_id: number;
  assigned_at: string;
  assigned_by: string;
  status: 'active' | 'archived';
}

export interface IssuedCertificate {
  id: number;
  certificate_id: string;
  event_id: number;
  template_id: number;
  registration_id: number;
  participant_name: string;
  participant_email: string;
  issue_date: string;
  certificate_url: string;
  status: 'generated' | 'sent' | 'downloaded';
  sent_at?: string;
  downloaded_at?: string;
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
  textAlign?: 'left' | 'center' | 'right' | 'justify' | 'justify-left' | 'justify-center' | 'justify-right';
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