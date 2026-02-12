'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchEvents, createEvent, deleteEvent, getAllRegistrations, deleteRegistration, updateRegistrationStatus, getEventParticipants } from '@/lib/supabaseClient';
import { Event } from '@/types/event';
import { 
  Calendar, Users, FileText, Settings, CheckCircle, 
  Download, Plus, BarChart3, Search, Filter, 
  Eye, Edit, Trash2, Clock, UserCheck, Mail, 
  Award, MapPin, Tag, ChevronRight, Upload,
  X, LogOut, RefreshCw, User, Building, GraduationCap
} from 'lucide-react';

// Interface for participant
interface Participant {
  id: number;
  user_name: string;
  user_email: string;
  user_college: string;
  user_department: string;
  status: string;
  registration_date: string;
  events: {
    title: string;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Event form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Workshop',
    organizer: '',
    max_participants: 100,
    current_participants: 0,
    image_url: '',
    status: 'upcoming' as 'upcoming' | 'active' | 'completed',
    certificate_ready: false
  });
  const [creatingEvent, setCreatingEvent] = useState(false);
  
  // Events data from Supabase
  const [events, setEvents] = useState<Event[]>([]);

  // Registrations data
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // Participant modal state for specific event
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventParticipants, setEventParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Check admin authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken === 'certgen-admin-2024') {
        setIsAdmin(true);
      } else {
        router.push('/');
      }
      setLoading(false);
    }
  }, [router]);

  // Fetch events from Supabase
  useEffect(() => {
    if (isAdmin) {
      loadEvents();
    }
  }, [isAdmin]);

  // Load registrations when participants tab is active
  useEffect(() => {
    if (activeTab === 'participants' && isAdmin) {
      loadRegistrations();
    }
  }, [activeTab, isAdmin]);

  const loadEvents = async () => {
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      alert('Error loading events');
    }
  };

  const loadRegistrations = async () => {
    try {
      setLoadingRegistrations(true);
      const data = await getAllRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Error loading registrations:', error);
      alert('Error loading registrations');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  // Function to load participants for a specific event
  const loadEventParticipants = async (eventId: number) => {
    setLoadingParticipants(true);
    try {
      const participants = await getEventParticipants(eventId);
      setEventParticipants(participants);
    } catch (error) {
      console.error('Error loading event participants:', error);
      alert('Error loading participants');
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Function to handle View Details button click
  const handleViewDetails = async (event: Event) => {
    setSelectedEvent(event);
    await loadEventParticipants(event.id);
    setShowParticipantsModal(true);
  };

  // Handle event form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setEventForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : name === 'max_participants' || name === 'current_participants'
        ? parseInt(value) || 0
        : value
    }));
  };

  // Create new event
  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.location) {
      alert('Please fill in all required fields');
      return;
    }

    setCreatingEvent(true);
    try {
      const newEvent = await createEvent(eventForm);
      
      if (newEvent) {
        alert('Event created successfully!');
        setShowCreateForm(false);
        setEventForm({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          category: 'Workshop',
          organizer: '',
          max_participants: 100,
          current_participants: 0,
          image_url: '',
          status: 'upcoming',
          certificate_ready: false
        });
        
        loadEvents(); // Refresh events list
      } else {
        alert('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event');
    } finally {
      setCreatingEvent(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const success = await deleteEvent(id);
      if (success) {
        alert('Event deleted successfully!');
        loadEvents();
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  // Delete registration from participants tab
  const handleDeleteRegistration = async (id: number) => {
    if (!confirm('Are you sure you want to delete this registration?')) return;

    try {
      const success = await deleteRegistration(id);
      if (success) {
        alert('Registration deleted successfully!');
        loadRegistrations();
        loadEvents(); // Refresh events to update participant count
      } else {
        alert('Failed to delete registration');
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Error deleting registration');
    }
  };

  // Delete registration from participant modal
  const handleDeleteRegistrationFromModal = async (registrationId: number) => {
    if (!confirm('Are you sure you want to delete this registration?')) return;

    try {
      const success = await deleteRegistration(registrationId);
      if (success) {
        alert('Registration deleted successfully!');
        // Refresh the participants list
        if (selectedEvent) {
          await loadEventParticipants(selectedEvent.id);
        }
        // Also refresh events list to update participant count
        loadEvents();
      } else {
        alert('Failed to delete registration');
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Error deleting registration');
    }
  };

  // Update registration status from participants tab
  const handleUpdateStatus = async (id: number, status: 'attended' | 'cancelled') => {
    try {
      const success = await updateRegistrationStatus(id, status);
      if (success) {
        alert(`Registration marked as ${status}`);
        loadRegistrations();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  // Update registration status from participant modal
  const handleUpdateStatusFromModal = async (registrationId: number, status: 'attended' | 'cancelled') => {
    try {
      const success = await updateRegistrationStatus(registrationId, status);
      if (success) {
        alert(`Registration marked as ${status}`);
        // Refresh the participants list
        if (selectedEvent) {
          await loadEventParticipants(selectedEvent.id);
        }
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  // Filter events based on search
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalEvents = events.length;
  const activeParticipants = events.reduce((sum, event) => sum + event.current_participants, 0);
  const certificatesReady = events.filter(e => e.certificate_ready).length;
  const upcomingEvents = events.filter(e => e.status === 'upcoming').length;

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading Admin Dashboard</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage events and participants
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  router.push('/');
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow hover:shadow-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto mt-6 space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'participants', label: 'Participants', icon: Users },
              { id: 'certificates', label: 'Certificates', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-green-600">+{events.length}</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{totalEvents}</h3>
            <p className="text-gray-600">Total Events</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-green-600">+12%</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{activeParticipants}</h3>
            <p className="text-gray-600">Active Participants</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-green-600">+{certificatesReady}</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{certificatesReady}</h3>
            <p className="text-gray-600">Certificates Ready</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-green-600">+{upcomingEvents}</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{upcomingEvents}</h3>
            <p className="text-gray-600">Upcoming Events</p>
          </div>
        </div>

        {/* Create Event Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Create New Event
          </button>
        </div>

        {/* Create Event Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={creatingEvent}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Title */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={eventForm.title}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Web Development Workshop"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={eventForm.category}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Fest">Fest</option>
                      <option value="Competition">Competition</option>
                      <option value="Conference">Conference</option>
                      <option value="Webinar">Webinar</option>
                    </select>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={eventForm.date}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Time *
                    </label>
                    <input
                      type="text"
                      name="time"
                      value={eventForm.time}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 10:00 AM - 2:00 PM"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={eventForm.location}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Main Auditorium"
                      required
                    />
                  </div>

                  {/* Organizer */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Organizer *
                    </label>
                    <input
                      type="text"
                      name="organizer"
                      value={eventForm.organizer}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Tech Club"
                      required
                    />
                  </div>

                  {/* Max Participants */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Maximum Participants
                    </label>
                    <input
                      type="number"
                      name="max_participants"
                      value={eventForm.max_participants}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={eventForm.status}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={eventForm.description}
                    onChange={handleFormChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your event in detail..."
                    required
                  />
                </div>

                {/* Image URL (Optional) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      name="image_url"
                      value={eventForm.image_url}
                      onChange={handleFormChange}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload
                    </button>
                  </div>
                </div>

                {/* Certificate Ready */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="certificate_ready"
                    checked={eventForm.certificate_ready}
                    onChange={handleFormChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    id="certificate-checkbox"
                  />
                  <label htmlFor="certificate-checkbox" className="text-sm text-gray-700">
                    Certificates will be available for this event
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={creatingEvent}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    disabled={creatingEvent}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow flex items-center gap-2"
                  >
                    {creatingEvent ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Create Event
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participants Modal for Specific Event */}
        {showParticipantsModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Participants for: {selectedEvent.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Total Participants: {eventParticipants.length} • 
                    Category: {selectedEvent.category} • 
                    Date: {new Date(selectedEvent.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowParticipantsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                {/* Event Summary */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Event Status</p>
                      <p className="font-medium">{selectedEvent.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{selectedEvent.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">{selectedEvent.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Organizer</p>
                      <p className="font-medium">{selectedEvent.organizer}</p>
                    </div>
                  </div>
                </div>

                {loadingParticipants ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading participants...</p>
                  </div>
                ) : eventParticipants.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No participants yet</h3>
                    <p className="text-gray-600">No one has registered for this event yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Participant Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            College & Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registration Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {eventParticipants.map((participant, index) => (
                          <tr key={participant.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900">{participant.user_name}</div>
                                  <div className="text-sm text-gray-500 flex items-center">
                                    <Mail className="w-3 h-3 mr-1" />
                                    {participant.user_email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 flex items-center">
                                <Building className="w-4 h-4 mr-2 text-blue-600" />
                                {participant.user_college}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center mt-1">
                                <GraduationCap className="w-4 h-4 mr-2 text-green-600" />
                                {participant.user_department}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {new Date(participant.registration_date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(participant.registration_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                participant.status === 'attended' ? 'bg-green-100 text-green-800' :
                                participant.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {participant.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {participant.status === 'registered' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStatusFromModal(participant.id, 'attended')}
                                      className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                                      title="Mark as Attended"
                                    >
                                      Attended
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatusFromModal(participant.id, 'cancelled')}
                                      className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
                                      title="Mark as Cancelled"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDeleteRegistrationFromModal(participant.id)}
                                  className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                                  title="Delete Registration"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Export Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      alert('Export feature coming soon!');
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export to CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">All Events</h2>
                  <p className="text-gray-600 mt-1">
                    Total: {events.length} events • Showing: {filteredEvents.length}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={loadEvents}
                    className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                  <button className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                </div>
              </div>
            </div>
            
            {/* Events Grid */}
            <div className="p-6">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600 mb-6">Create your first event to get started</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Create Event
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Event Header */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              event.category === 'Workshop' ? 'bg-blue-100 text-blue-800' :
                              event.category === 'Seminar' ? 'bg-green-100 text-green-800' :
                              event.category === 'Fest' ? 'bg-purple-100 text-purple-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {event.category}
                            </span>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                event.status === 'active' ? 'bg-green-100 text-green-800' :
                                event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {event.status}
                              </span>
                              {event.certificate_ready && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  Cert Ready
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => router.push(`/events/edit/${event.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Event Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">
                          {event.title}
                        </h3>
                        
                        {/* Event Description */}
                        <p className="text-gray-600 mb-6 line-clamp-2">
                          {event.description}
                        </p>
                        
                        {/* Event Details */}
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-700">
                            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="text-sm">
                              {new Date(event.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-gray-700">
                            <Clock className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="text-sm">{event.time}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-700">
                            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-700">
                            <Users className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="text-sm">
                              {event.current_participants} / {event.max_participants} participants
                            </span>
                          </div>
                          
                          <div className="flex items-center text-gray-700">
                            <UserCheck className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="text-sm">Organizer: {event.organizer}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Event Footer */}
                      <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-between">
                        <button
                          onClick={() => handleViewDetails(event)}
                          className="text-center text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View Participants
                        </button>
                        
                        <button
                          onClick={() => router.push(`/events/${event.id}`)}
                          className="text-center text-gray-600 hover:text-gray-800 font-medium text-sm flex items-center gap-1"
                        >
                          Event Page
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Participants Management</h2>
                <p className="text-gray-600 mt-1">
                  Total: {registrations.length} registrations
                </p>
              </div>
              <button 
                onClick={loadRegistrations}
                className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {loadingRegistrations ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading registrations...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
                <p className="text-gray-600">Participants will appear here once they register for events</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{reg.user_name}</div>
                            <div className="text-sm text-gray-500">{reg.user_email}</div>
                            <div className="text-sm text-gray-500">{reg.user_college} • {reg.user_department}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{reg.events?.title || 'Event'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(reg.registration_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(reg.registration_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            reg.status === 'attended' ? 'bg-green-100 text-green-800' :
                            reg.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {reg.status === 'registered' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(reg.id, 'attended')}
                                  className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200"
                                  title="Mark as Attended"
                                >
                                  Attended
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(reg.id, 'cancelled')}
                                  className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
                                  title="Mark as Cancelled"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteRegistration(reg.id)}
                              className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                              title="Delete Registration"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Certificate Management</h3>
              <p className="text-gray-600 mb-6">Certificate generation feature coming soon</p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <Clock className="w-4 h-4 mr-2" />
                Under Development
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}