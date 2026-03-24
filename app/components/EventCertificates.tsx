// app/components/EventCertificates.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, Download, Eye, Calendar, Users, 
  Search, X, CheckCircle, Clock, FileText,
  Mail, User
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface EventCertificatesProps {
  eventId: number;
  participants: any[];
}

export default function EventCertificates({ eventId, participants }: EventCertificatesProps) {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, [eventId]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('issued_certificates')
        .select('*')
        .eq('event_id', eventId)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = (url: string, participantName: string) => {
    const link = document.createElement('a');
    link.download = `certificate-${participantName.replace(/\s+/g, '-')}.png`;
    link.href = url;
    link.click();
  };

  const getParticipantStatus = (participantId: number) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.status || 'unknown';
  };

  const filteredCertificates = certificates.filter(cert => 
    cert.participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.participant_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Search and Stats */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search certificates by participant name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 mt-4 text-sm">
          <span className="text-gray-600">
            Total Certificates: <span className="font-bold">{certificates.length}</span>
          </span>
          <span className="text-gray-600">
            Generated: <span className="font-bold text-green-600">
              {certificates.filter(c => c.status === 'generated').length}
            </span>
          </span>
        </div>
      </div>

      {/* Certificates List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Generated</h3>
          <p className="text-gray-600">
            No certificates have been generated for this event yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredCertificates.map((cert) => {
            const participantStatus = getParticipantStatus(cert.registration_id);
            
            return (
              <div
                key={cert.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900">{cert.participant_name}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        participantStatus === 'attended' ? 'bg-green-100 text-green-800' :
                        participantStatus === 'registered' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {participantStatus}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <Mail className="w-3 h-3" />
                      <span>{cert.participant_email}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Generated: {new Date(cert.generated_at).toLocaleString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        cert.status === 'generated' ? 'bg-green-100 text-green-800' :
                        cert.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {cert.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCertificate(cert);
                        setShowPreview(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      title="Preview Certificate"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    {cert.certificate_url && (
                      <button
                        onClick={() => downloadCertificate(cert.certificate_url, cert.participant_name)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                        title="Download Certificate"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Certificate Preview</h3>
                <p className="text-sm text-gray-600">
                  {selectedCertificate.participant_name}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {selectedCertificate.certificate_url ? (
                <img 
                  src={selectedCertificate.certificate_url} 
                  alt={`Certificate for ${selectedCertificate.participant_name}`}
                  className="w-full border rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">Certificate image not available</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    downloadCertificate(selectedCertificate.certificate_url, selectedCertificate.participant_name);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}