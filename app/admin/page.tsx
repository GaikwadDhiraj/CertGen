'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings,
  CheckCircle,
  Download,
  Plus,
  BarChart3,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  TrendingUp,
  Clock,
  UserCheck,
  Mail,
  Share2,
  Printer,
  Layers,
  Award,
  Target,
  Zap,
  ExternalLink,
  MoreVertical,
  Star,
  MapPin,
  Tag
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);

  // Sample data with more details
  const [events, setEvents] = useState([
    { 
      id: 1, 
      title: 'Web Development Workshop', 
      date: '2024-03-15', 
      time: '10:00 AM - 4:00 PM',
      participants: 45, 
      maxParticipants: 50,
      status: 'active', 
      category: 'workshop',
      location: 'Computer Lab - Block A',
      description: 'Learn modern web development with React and Next.js',
      organizer: 'Tech Club',
      certificateReady: true
    },
    { 
      id: 2, 
      title: 'Annual Tech Fest 2024', 
      date: '2024-03-20', 
      time: '9:00 AM - 5:00 PM',
      participants: 200, 
      maxParticipants: 300,
      status: 'upcoming', 
      category: 'fest',
      location: 'Main Auditorium',
      description: 'Annual technology festival with competitions and talks',
      organizer: 'Student Council',
      certificateReady: false
    },
    { 
      id: 3, 
      title: 'AI & Machine Learning Seminar', 
      date: '2024-03-25', 
      time: '2:00 PM - 4:00 PM',
      participants: 80, 
      maxParticipants: 100,
      status: 'active', 
      category: 'seminar',
      location: 'Seminar Hall - Block B',
      description: 'Introduction to AI and ML concepts for beginners',
      organizer: 'AI Club',
      certificateReady: true
    },
    { 
      id: 4, 
      title: 'Hackathon Challenge', 
      date: '2024-04-05', 
      time: '6:00 PM - 6:00 AM',
      participants: 120, 
      maxParticipants: 150,
      status: 'upcoming', 
      category: 'competition',
      location: 'Innovation Center',
      description: '24-hour coding competition with exciting prizes',
      organizer: 'Coding Club',
      certificateReady: false
    },
    { 
      id: 5, 
      title: 'Leadership Workshop', 
      date: '2024-03-10', 
      time: '11:00 AM - 1:00 PM',
      participants: 65, 
      maxParticipants: 70,
      status: 'completed', 
      category: 'workshop',
      location: 'Conference Room',
      description: 'Develop leadership and management skills',
      organizer: 'Management Department',
      certificateReady: true
    },
  ]);

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

  // Interactive functions
  const handleCreateEvent = () => {
    alert('Create Event feature coming soon!');
  };

  const handleGenerateCertificates = () => {
    alert('Certificate generation starting...');
  };

  const handleSendEmails = () => {
    alert('Sending emails to all participants...');
  };

  const handleExportReports = () => {
    alert('Exporting detailed reports...');
  };

  const handleViewEvent = (id: number) => {
    alert(`Viewing event ${id}`);
  };

  const handleDeleteEvent = (id: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(event => event.id !== id));
    }
  };

  const toggleEventSelection = (id: number) => {
    setSelectedEvents(prev => 
      prev.includes(id) 
        ? prev.filter(eventId => eventId !== id)
        : [...prev, id]
    );
  };

  const selectAllEvents = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events.map(event => event.id));
    }
  };

  const handleBulkGenerateCertificates = () => {
    if (selectedEvents.length === 0) {
      alert('Please select events first');
      return;
    }
    alert(`Generating certificates for ${selectedEvents.length} selected events...`);
  };

  const handleBulkSendNotifications = () => {
    if (selectedEvents.length === 0) {
      alert('Please select events first');
      return;
    }
    alert(`Sending notifications for ${selectedEvents.length} selected events...`);
  };

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
                Manage events, certificates, and participants
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events, participants..."
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
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow hover:shadow-lg"
              >
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
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings },
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
          {[
            { title: 'Total Events', value: events.length.toString(), change: '+2', icon: Calendar, color: 'blue' },
            { title: 'Active Participants', value: events.reduce((sum, event) => sum + event.participants, 0).toString(), change: '+12%', icon: Users, color: 'green' },
            { title: 'Certificates Ready', value: events.filter(e => e.certificateReady).length.toString(), change: '+5', icon: FileText, color: 'purple' },
            { title: 'Upcoming Events', value: events.filter(e => e.status === 'upcoming').length.toString(), change: '+3', icon: TrendingUp, color: 'yellow' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              purple: 'bg-purple-100 text-purple-600',
              yellow: 'bg-yellow-100 text-yellow-600',
            }[stat.color];

            return (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${colorClasses}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions - Full Width */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
              <p className="text-gray-600 mt-1">Perform common administrative tasks quickly</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last updated: Just now
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Create Event */}
            <button 
              onClick={handleCreateEvent}
              className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-4 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 shadow-lg">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-lg mb-2">Create Event</span>
                <span className="text-sm text-gray-600">Add new college event with full details</span>
                <div className="mt-4 w-12 h-1 bg-blue-500 rounded-full group-hover:w-16 transition-all duration-300"></div>
              </div>
            </button>

            {/* Generate Certificates */}
            <button 
              onClick={handleGenerateCertificates}
              className="group p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-4 group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-lg mb-2">Generate Certificates</span>
                <span className="text-sm text-gray-600">Create certificates for event participants</span>
                <div className="mt-4 w-12 h-1 bg-green-500 rounded-full group-hover:w-16 transition-all duration-300"></div>
              </div>
            </button>

            {/* Send Emails */}
            <button 
              onClick={handleSendEmails}
              className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl mb-4 group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300 shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-lg mb-2">Send Emails</span>
                <span className="text-sm text-gray-600">Email notifications to participants</span>
                <div className="mt-4 w-12 h-1 bg-purple-500 rounded-full group-hover:w-16 transition-all duration-300"></div>
              </div>
            </button>

            {/* Export Reports */}
            <button 
              onClick={handleExportReports}
              className="group p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl hover:from-yellow-100 hover:to-yellow-200 hover:border-yellow-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl mb-4 group-hover:from-yellow-600 group-hover:to-yellow-700 transition-all duration-300 shadow-lg">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-lg mb-2">Export Reports</span>
                <span className="text-sm text-gray-600">Download event data and analytics</span>
                <div className="mt-4 w-12 h-1 bg-yellow-500 rounded-full group-hover:w-16 transition-all duration-300"></div>
              </div>
            </button>
          </div>

          {/* Bulk Actions Row */}
          {selectedEvents.length > 0 && (
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Layers className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedEvents.length} events selected</h3>
                    <p className="text-sm text-gray-600">Perform bulk actions on selected events</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBulkGenerateCertificates}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    Generate Certificates
                  </button>
                  <button
                    onClick={handleBulkSendNotifications}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Notifications
                  </button>
                  <button
                    onClick={() => setSelectedEvents([])}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Events Management - Improved UI */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Events Management</h2>
              <p className="text-gray-600 mt-1">Manage all college events and activities</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <button 
                  onClick={selectAllEvents}
                  className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {selectedEvents.length === events.length ? 'Deselect All' : 'Select All'}
                </button>
                
                <button className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                  <span className="px-1.5 py-0.5 bg-gray-300 text-xs rounded">3</span>
                </button>
              </div>
              
              <button 
                onClick={handleExportReports}
                className="text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
          
          {/* Events Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEvents.length === events.length && events.length > 0}
                      onChange={selectAllEvents}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Event Details
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Date & Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event) => (
                  <tr 
                    key={event.id} 
                    className={`hover:bg-gray-50 transition-colors ${selectedEvents.includes(event.id) ? 'bg-blue-50' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.id)}
                        onChange={() => toggleEventSelection(event.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    
                    {/* Event Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-lg ${
                          event.category === 'workshop' ? 'bg-blue-100' :
                          event.category === 'fest' ? 'bg-purple-100' :
                          event.category === 'seminar' ? 'bg-green-100' :
                          'bg-yellow-100'
                        }`}>
                          <Calendar className={`w-5 h-5 ${
                            event.category === 'workshop' ? 'text-blue-600' :
                            event.category === 'fest' ? 'text-purple-600' :
                            event.category === 'seminar' ? 'text-green-600' :
                            'text-yellow-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                            {event.certificateReady && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Cert Ready
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <Tag className="w-3 h-3 mr-1" />
                              {event.category}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <UserCheck className="w-3 h-3 mr-1" />
                              {event.organizer}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Date & Location */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(event.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-sm text-gray-500">{event.time}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{event.location}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Participants */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {event.participants}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{event.participants} registered</div>
                            <div className="text-sm text-gray-500">Max: {event.maxParticipants}</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (event.participants / event.maxParticipants) > 0.9 ? 'bg-red-500' :
                              (event.participants / event.maxParticipants) > 0.7 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                          event.status === 'active' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : event.status === 'upcoming' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {event.status === 'active' && <Zap className="w-3 h-3" />}
                          {event.status === 'upcoming' && <Clock className="w-3 h-3" />}
                          {event.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                        
                        {event.certificateReady && event.status === 'completed' && (
                          <button className="w-full text-sm bg-gradient-to-r from-green-500 to-green-600 text-white py-1.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all">
                            Download Certificates
                          </button>
                        )}
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewEvent(event.id)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Event"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="More Options"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{events.length}</span> events
              {selectedEvents.length > 0 && (
                <span className="ml-2 font-medium text-blue-600">
                  • {selectedEvents.length} selected
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Previous
                </button>
                <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg">1</span>
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}