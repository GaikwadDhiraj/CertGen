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

export type EventFormData = Omit<Event, 'id' | 'created_at' | 'updated_at'>;