'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Clock, Search, Filter, AlertCircle } from 'lucide-react';
import { fetchEvents } from '@/lib/supabaseClient';
import { Event } from '@/types/event';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch events from Supabase
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'All' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['All', ...new Set(events.map(event => event.category))];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate registration percentage
  const calculatePercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upcoming Events
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover and register for exciting college events. Get certificates for your participation!
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by title, description, or location..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : (
          <>
            {/* Events Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredEvents.length}</span> of <span className="font-semibold">{events.length}</span> events
              </p>
              <button
                onClick={loadEvents}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />  {/* ✅ Added here */}
                Refresh
              </button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try a different search term' : 'No events scheduled yet'}
                  </p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                    {/* Event Image */}
                    {event.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Event Category & Status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.category === 'Workshop' ? 'bg-blue-100 text-blue-800' :
                            event.category === 'Seminar' ? 'bg-green-100 text-green-800' :
                            event.category === 'Fest' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {event.category}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            event.status === 'active' ? 'bg-green-100 text-green-800' :
                            event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        
                        {event.certificate_ready && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Certificate
                          </span>
                        )}
                      </div>
                      
                      {/* Event Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {event.title}
                      </h3>
                      
                      {/* Event Description */}
                      <p className="text-gray-600 mb-6 line-clamp-2">
                        {event.description}
                      </p>
                      
                      {/* Event Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-start text-gray-700">
                          <Calendar className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            {formatDate(event.date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <Clock className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                          <span className="text-sm">{event.time}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <MapPin className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <Users className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                          <span className="text-sm">
                            {event.current_participants} / {event.max_participants} registered
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Registration Progress</span>
                          <span>{calculatePercentage(event.current_participants, event.max_participants)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              calculatePercentage(event.current_participants, event.max_participants) > 90 ? 'bg-red-500' :
                              calculatePercentage(event.current_participants, event.max_participants) > 70 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${calculatePercentage(event.current_participants, event.max_participants)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Register Button */}
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow hover:shadow-lg flex items-center justify-center gap-2">
                        <span>Register for Event</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                      
                      {/* Organizer Info */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                          Organized by: <span className="font-medium text-gray-700">{event.organizer}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ✅ Add this RefreshCw component at the BOTTOM of the file (after the main component)
function RefreshCw({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}