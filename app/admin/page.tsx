'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchEvents, createEvent, deleteEvent } from '@/lib/supabaseClient';
import { Event } from '@/types/event';
import { 
  Calendar, Users, FileText, Settings, CheckCircle, 
  Download, Plus, BarChart3, Search, Filter, 
  Eye, Edit, Trash2, Clock, UserCheck, Mail, 
  Award, MapPin, Tag, ChevronRight, Upload,
  X, Image as ImageIcon, LogOut, Check, AlertCircle
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  
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

  const loadEvents = async () => {
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      alert('Error loading events');
    }
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

        {/* Events List */}
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
                    <div className="px-6 py-4 bg-gray-100 border-t border-gray-200">
                      <button
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-center gap-1"
                      >
                        View Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Add RefreshCw icon import at top or create a simple refresh icon
function RefreshCw({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}