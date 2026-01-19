import React from 'react'
import { Download, Eye, CheckCircle, Clock } from 'lucide-react'

export default function CertificatesPage() {
  const certificates = [
    {
      id: 1,
      title: "Web Development Workshop",
      issuedDate: "2024-03-15",
      certificateId: "CERT-2024-001",
      status: "issued",
      downloadUrl: "#",
      viewUrl: "#"
    },
    {
      id: 2,
      title: "Annual Tech Fest Participation",
      issuedDate: "2024-03-10",
      certificateId: "CERT-2024-002",
      status: "issued",
      downloadUrl: "#",
      viewUrl: "#"
    },
    {
      id: 3,
      title: "AI & Machine Learning Seminar",
      issuedDate: "2024-03-05",
      certificateId: "CERT-2024-003",
      status: "pending",
      downloadUrl: "#",
      viewUrl: "#"
    },
    {
      id: 4,
      title: "Leadership Training Program",
      issuedDate: "2024-02-28",
      certificateId: "CERT-2024-004",
      status: "issued",
      downloadUrl: "#",
      viewUrl: "#"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Certificates
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            View and download all your earned certificates from various college events.
            Certificates are issued after event completion and attendance verification.
          </p>
        </div>

        {/* Certificates List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">
              Certificate History
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {certificates.map((cert) => (
              <div key={cert.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold text-gray-900 mr-3">
                        {cert.title}
                      </h3>
                      {cert.status === "issued" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Issued
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-4 h-4 mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Certificate ID:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {cert.certificateId}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium mr-2">Issued Date:</span>
                        {new Date(cert.issuedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      <Eye className="w-5 h-5 mr-2" />
                      View
                    </button>
                    
                    {cert.status === "issued" && (
                      <button className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                        <Download className="w-5 h-5 mr-2" />
                        Download PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-2">4</div>
            <div className="text-blue-100">Total Certificates</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-2">3</div>
            <div className="text-green-100">Issued Certificates</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-2">1</div>
            <div className="text-purple-100">Pending Certificates</div>
          </div>
        </div>

        {/* Verification Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Verify Certificate
          </h2>
          <p className="text-gray-600 mb-6">
            Enter a Certificate ID to verify its authenticity and view certificate details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g., CERT-2024-001)"
              className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Verify Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}