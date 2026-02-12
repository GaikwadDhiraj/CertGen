import { createClient } from '@supabase/supabase-js'
import { Event, EventFormData, Registration } from '@/types/event'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ========== EVENT FUNCTIONS ==========

// Fetch all events
export const fetchEvents = async (): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) {
      console.error('Error fetching events:', error)
      throw error
    }
    
    return data as Event[] || []
  } catch (error) {
    console.error('Error in fetchEvents:', error)
    return []
  }
}

// Fetch single event by ID
export const fetchEventById = async (id: number): Promise<Event | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching event:', error)
      throw error
    }
    
    return data as Event
  } catch (error) {
    console.error('Error in fetchEventById:', error)
    return null
  }
}

// Create new event
export const createEvent = async (eventData: Omit<EventFormData, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        ...eventData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating event:', error)
      throw error
    }
    
    return data as Event
  } catch (error) {
    console.error('Error in createEvent:', error)
    return null
  }
}

// Update event
export const updateEvent = async (id: number, eventData: Partial<Event>): Promise<Event | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .update({
        ...eventData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating event:', error)
      throw error
    }
    
    return data as Event
  } catch (error) {
    console.error('Error in updateEvent:', error)
    return null
  }
}

// Delete event
export const deleteEvent = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting event:', error)
      throw error
    }
    
    return true
  } catch (error) {
    console.error('Error in deleteEvent:', error)
    return false
  }
}

// ========== REGISTRATION FUNCTIONS ==========

// Register user for an event
export const registerForEvent = async (
  eventId: number,
  userData: {
    name: string;
    email: string;
    college: string;
    department: string;
  }
): Promise<Registration | null> => {
  try {
    // First check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_email', userData.email)
      .single();

    if (existingRegistration) {
      throw new Error('You are already registered for this event');
    }

    // Create registration
    const { data, error } = await supabase
      .from('registrations')
      .insert([{
        event_id: eventId,
        user_id: 'anonymous',
        user_name: userData.name,
        user_email: userData.email,
        user_college: userData.college,
        user_department: userData.department,
        status: 'registered',
        registration_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Update event participant count
    const newCount = await getEventParticipantCount(eventId);
    await supabase
      .from('events')
      .update({ current_participants: newCount })
      .eq('id', eventId);

    return data as Registration;
  } catch (error) {
    console.error('Error in registerForEvent:', error);
    throw error;
  }
};

// Get participants for a specific event with their details
export const getEventParticipants = async (eventId: number): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        id,
        user_name,
        user_email,
        user_college,
        user_department,
        status,
        registration_date,
        events!inner(title)
      `)
      .eq('event_id', eventId)
      .order('registration_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getEventParticipants:', error);
    return [];
  }
};

// Get all registrations for an event
export const getEventRegistrations = async (eventId: number): Promise<Registration[]> => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('registration_date', { ascending: false });

    if (error) throw error;
    return data as Registration[] || [];
  } catch (error) {
    console.error('Error in getEventRegistrations:', error);
    return [];
  }
};

// Get all registrations (for admin)
export const getAllRegistrations = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*, events(title)')
      .order('registration_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getAllRegistrations:', error);
    return [];
  }
};

// Get registration count for an event
export const getEventParticipantCount = async (eventId: number): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'registered');

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error in getEventParticipantCount:', error);
    return 0;
  }
};

// Delete a registration
export const deleteRegistration = async (registrationId: number): Promise<boolean> => {
  try {
    // Get event ID before deleting
    const { data: registration } = await supabase
      .from('registrations')
      .select('event_id')
      .eq('id', registrationId)
      .single();

    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', registrationId);

    if (error) throw error;

    // Update event participant count
    if (registration?.event_id) {
      const newCount = await getEventParticipantCount(registration.event_id);
      await supabase
        .from('events')
        .update({ current_participants: newCount })
        .eq('id', registration.event_id);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteRegistration:', error);
    return false;
  }
};

// Update registration status (attended/cancelled)
export const updateRegistrationStatus = async (
  registrationId: number,
  status: 'attended' | 'cancelled'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('registrations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', registrationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error in updateRegistrationStatus:', error);
    return false;
  }
};