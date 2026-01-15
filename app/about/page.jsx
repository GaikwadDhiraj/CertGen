import React from 'react'
import { Target, Users, Award, Zap } from 'lucide-react'

export default function AboutPage() {
  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Our Mission",
      description: "To streamline event management and certificate generation for educational institutions, making the process efficient and error-free."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "For Students",
      description: "Easy event registration, attendance tracking, and instant certificate download for your participation."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "For Organizers",
      description: "Comprehensive event management tools, automated certificate generation, and participant tracking."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Efficiency",
      description: "Save hours of manual work with our automated systems for registration and certificate management."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About CertGen
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive platform designed to revolutionize how colleges manage events and distribute certificates.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl mb-6">
                <div className="text-blue-600">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Events Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Certificates Issued</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Colleges Using</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-blue-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Vision</h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            We envision a future where every educational institution can effortlessly manage their events and recognize student achievements through automated, verifiable digital certificates. Our platform combines cutting-edge technology with user-friendly design to create a seamless experience for both organizers and participants.
          </p>
        </div>
      </div>
    </div>
  )
}