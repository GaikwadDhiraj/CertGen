import React from 'react'
import { Calendar, Users, MapPin, Clock } from 'lucide-react'

export default function EventsPage() {
  const events = [
    {
      id: 1,
      title: "Web Development Workshop",
      date: "2024-03-15",
      time: "10:00 AM - 2:00 PM",
      location: "Computer Lab - Block A",
      description: "Learn modern web development with React and Next.js",
      category: "Workshop",
      attendees: 45,
      maxCapacity: 50
    },
    {
      id: 2,
      title: "Annual Tech Fest",
      date: "2024-03-20",
      time: "9:00 AM - 5:00 PM",
      location: "Main Auditorium",
      description: "Annual technology festival with competitions and talks",
      category: "Fest",
      attendees: 200,
      maxCapacity: 300
    },
    {
      id: 3,
      title: "AI & Machine Learning Seminar",
      date: "2024-03-25",
      time: "2:00 PM - 4:00 PM",
      location: "Seminar Hall - Block B",
      description: "Introduction to AI and ML concepts for beginners",
      category: "Seminar",
      attendees: 80,
      maxCapacity: 100
    }
  ]

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

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                {/* Event Category */}
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                  {event.category}
                </div>
                
                {/* Event Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {event.title}
                </h3>
                
                {/* Event Description */}
                <p className="text-gray-600 mb-6">
                  {event.description}
                </p>
                
                {/* Event Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    <span>{event.time}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    <span>{event.attendees} / {event.maxCapacity} registered</span>
                  </div>
                </div>
                
                {/* Register Button */}
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                  Register for Event
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}