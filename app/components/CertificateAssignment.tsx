// app/components/CertificateAssignment.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Users, Search, Award, Download, Mail, 
  Eye, CheckCircle, AlertCircle, Loader, Calendar,
  MapPin, Tag, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import CertificateGenerator from './CertificateGenerator';
import CertificatePreview from './CertificatePreview';

interface CertificateAssignmentProps {
  eventId: number;
  eventName: string;
  templateId: number;
  onComplete: () => void;
  onClose: () => void;
}

export default function CertificateAssignment({
  eventId,
  eventName,
  templateId,
  onComplete,
  onClose
}: CertificateAssignmentProps) {
  const [participants, setParticipants] = useState<any[]>([]);
  const [template, setTemplate] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showFieldMapping, setShowFieldMapping] = useState(false);
  const [selectedParticipantForPreview, setSelectedParticipantForPreview] = useState<any>(null);
  const [generatedCertificates, setGeneratedCertificates] = useState<any[]>([]);
  const [showCertificates, setShowCertificates] = useState(false);

  // In CertificateAssignment.tsx, ensure the participant data is loaded correctly

useEffect(() => {
  if (eventId && templateId) {
    loadData();
    loadGeneratedCertificates();
  }
}, [eventId, templateId]);

const loadData = async () => {
  setLoading(true);
  try {
    // Load template
    const { data: templateData, error: templateError } = await supabase
      .from('certificate_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // Load event details
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;

    // Load participants who attended
    const { data: participantsData, error: participantsError } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'attended');

    if (participantsError) throw participantsError;

    setTemplate(templateData);
    setEvent(eventData);
    setParticipants(participantsData || []);
    
    console.log('Loaded participants:', participantsData); // Debug log
  } catch (error) {
    console.error('Error loading data:', error);
    alert('Error loading data');
  } finally {
    setLoading(false);
  }
};

  const loadGeneratedCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('issued_certificates')
        .select('*')
        .eq('event_id', eventId)
        .eq('template_id', templateId)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setGeneratedCertificates(data || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  const filteredParticipants = participants.filter(p => 
    p.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user_college?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateClick = () => {
    if (selectedParticipants.length === 0) {
      alert('Please select at least one participant');
      return;
    }
    setShowGenerator(true);
  };

  const downloadCertificate = (url: string, participantName: string) => {
    const link = document.createElement('a');
    link.download = `certificate-${participantName.replace(/\s+/g, '-')}.png`;
    link.href = url;
    link.click();
  };

  // Function to show field mapping example
  const getFieldMappingExample = () => {
    const exampleParticipant = {
      user_name: 'John Doe',
      user_email: 'john.doe@example.com',
      user_college: 'SVERI College of Engineering',
      user_department: 'Computer Science'
    };

    return (
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-blue-900">📋 Field Mapping Example</h4>
          <button
            onClick={() => setShowFieldMapping(!showFieldMapping)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {showFieldMapping ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {showFieldMapping && (
          <>
            <p className="text-sm text-blue-700 mb-3">
              When you generate certificates, fields will be filled like this:
            </p>
            <div className="space-y-2 text-sm max-h-60 overflow-y-auto">
              {template?.fields?.map((field: any, index: number) => {
                let exampleValue = '';
                switch(field.field_key) {
                  case 'name': exampleValue = exampleParticipant.user_name; break;
                  case 'email': exampleValue = exampleParticipant.user_email; break;
                  case 'college': exampleValue = exampleParticipant.user_college; break;
                  case 'department': exampleValue = exampleParticipant.user_department; break;
                  case 'event_name': exampleValue = eventName; break;
                  case 'event_date': exampleValue = new Date(event?.date).toLocaleDateString(); break;
                  case 'event_time': exampleValue = event?.time; break;
                  case 'event_location': exampleValue = event?.location; break;
                  case 'event_category': exampleValue = event?.category; break;
                  case 'result': exampleValue = 'Winner'; break;
                  case 'certificate_id': exampleValue = `CERT-${eventId}-001`; break;
                  case 'issue_date': exampleValue = new Date().toLocaleDateString(); break;
                  case 'custom': exampleValue = field.defaultValue || 'Custom Text'; break;
                  default: exampleValue = '[Data will appear here]';
                }
                
                return (
                  <div key={field.id} className="flex items-start gap-2 border-b border-blue-100 pb-1">
                    <span className="font-medium w-32 text-blue-800">{field.label || field.field_key}:</span>
                    <span className="text-blue-600">→</span>
                    <span className="text-green-600 flex-1">{exampleValue}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading participants...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Certificate Management</h2>
            <p className="text-gray-600">Event: {eventName}</p>
            {template && (
              <p className="text-sm text-blue-600 mt-1">
                Template: {template.name} • {template.fields?.length || 0} fields
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mt-4 border-b">
          <button
            onClick={() => setShowGenerator(false)}
            className={`px-4 py-2 text-sm font-medium ${
              !showGenerator ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
            }`}
          >
            Participants
          </button>
          <button
            onClick={() => setShowCertificates(!showCertificates)}
            className={`px-4 py-2 text-sm font-medium ${
              showCertificates ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
            }`}
          >
            Generated Certificates ({generatedCertificates.length})
          </button>
        </div>
      </div>

      {showGenerator ? (
        <CertificateGenerator
  eventId={eventId}
  template={template}
  participants={participants.filter(p => selectedParticipants.includes(p.id))}
  event={event} // Pass the event data
  onComplete={() => {
    setShowGenerator(false);
    loadGeneratedCertificates();
    onComplete();
  }}
/>
      ) : showCertificates ? (
        <div className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">Generated Certificates</h3>
          {generatedCertificates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No certificates generated yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generatedCertificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{cert.participant_name}</p>
                    <p className="text-sm text-gray-600">{cert.participant_email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Generated: {new Date(cert.generated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const participant = participants.find(p => p.id === cert.registration_id);
                        setSelectedParticipantForPreview(participant || {
                          user_name: cert.participant_name,
                          user_email: cert.participant_email
                        });
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      title="View Certificate"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {cert.certificate_url && (
                      <button
                        onClick={() => downloadCertificate(cert.certificate_url, cert.participant_name)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Search and Info */}
          <div className="px-6 py-4 border-b">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search participants by name, email, or college..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Field Mapping Example */}
            {getFieldMappingExample()}
            
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                Total Participants: <span className="font-bold">{participants.length}</span>
              </span>
              <span className="text-gray-600">
                Selected: <span className="font-bold text-blue-600">{selectedParticipants.length}</span>
              </span>
            </div>
          </div>

          {/* Participants List */}
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No participants found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchQuery ? 'Try a different search' : 'No one has attended this event yet'}
                </p>
              </div>
            ) : (
              <>
                {/* Select All */}
                <div className="px-6 py-3 bg-gray-50 border-b">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.length === filteredParticipants.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedParticipants(filteredParticipants.map(p => p.id));
                        } else {
                          setSelectedParticipants([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Select All</span>
                  </label>
                </div>

                {/* Participant List */}
                {filteredParticipants.map((participant) => {
                  const hasCertificate = generatedCertificates.some(c => c.registration_id === participant.id);
                  
                  return (
                    <div key={participant.id} className="px-6 py-4 hover:bg-gray-50 border-b">
                      <div className="flex items-start justify-between">
                        <label className="flex items-start gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(participant.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedParticipants([...selectedParticipants, participant.id]);
                              } else {
                                setSelectedParticipants(selectedParticipants.filter(id => id !== participant.id));
                              }
                            }}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{participant.user_name}</p>
                              {hasCertificate && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                  Certificate Ready
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{participant.user_email}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>{participant.user_college}</span>
                              {participant.user_department && (
                                <>
                                  <span>•</span>
                                  <span>{participant.user_department}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </label>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedParticipantForPreview(participant)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                            title="Preview Certificate"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {hasCertificate && (
                            <button
                              onClick={() => {
                                const cert = generatedCertificates.find(c => c.registration_id === participant.id);
                                if (cert?.certificate_url) {
                                  downloadCertificate(cert.certificate_url, participant.user_name);
                                }
                              }}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                              title="Download Certificate"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedParticipants.length} participant{selectedParticipants.length !== 1 ? 's' : ''} selected
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateClick}
                  disabled={selectedParticipants.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Generate Certificates
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Preview Modal */}
      {selectedParticipantForPreview && template && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Certificate Preview</h3>
                <p className="text-sm text-gray-600">
                  {selectedParticipantForPreview.user_name} • {selectedParticipantForPreview.user_email}
                </p>
              </div>
              <button
                onClick={() => setSelectedParticipantForPreview(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <CertificatePreview 
                template={{...template, event_name: eventName, event}} 
                participant={selectedParticipantForPreview}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}