import { createClient } from '@supabase/supabase-js'
import { Event, EventFormData } from '@/types/event'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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