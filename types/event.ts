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