'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Mail, Download, Send, CheckCircle, 
  XCircle, AlertCircle, Search, Filter, ChevronRight,
  Award, FileText, Clock, DownloadCloud, Printer
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

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
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [progress, setProgress] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [status, setStatus] = useState<'idle' | 'generating' | 'complete' | 'error'>('idle');

  // Load participants
  useEffect(() => {
    loadParticipants();
  }, [eventId]);

  const loadParticipants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'attended')
        .order('user_name', { ascending: true });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate certificates
  const generateCertificates = async () => {
    if (selectedParticipants.length === 0) {
      alert('Please select at least one participant');
      return;
    }

    setGenerating(true);
    setStatus('generating');
    setProgress(0);
    setGeneratedCount(0);

    const total = selectedParticipants.length;
    
    for (let i = 0; i < selectedParticipants.length; i++) {
      const participantId = selectedParticipants[i];
      const participant = participants.find(p => p.id === participantId);
      
      if (!participant) continue;

      try {
        // Here you would call your certificate generation API
        // For demo, we'll simulate generation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Insert into issued_certificates table
        await supabase
          .from('issued_certificates')
          .insert({
            event_id: eventId,
            template_id: templateId,
            registration_id: participant.id,
            participant_name: participant.user_name,
            participant_email: participant.user_email,
            certificate_id: `CERT-${eventId}-${participant.id}-${Date.now()}`,
            issue_date: new Date().toISOString(),
            status: 'generated'
          });

        setProgress(Math.round(((i + 1) / total) * 100));
        setGeneratedCount(i + 1);
      } catch (error) {
        console.error('Error generating certificate:', error);
        setStatus('error');
      }
    }

    setStatus('complete');
    setGenerating(false);
    onComplete();
  };

  // Send certificates via email
  const sendCertificates = async () => {
    // Implement email sending logic
    alert('Sending certificates via email...');
  };

  // Download certificates as zip
  const downloadAll = async () => {
    alert('Downloading all certificates...');
  };

  const filteredParticipants = participants.filter(p => 
    p.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">Generate Certificates</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600">Event: {eventName}</p>
      </div>

      {/* Progress Bar (when generating) */}
      {status === 'generating' && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">Generating certificates...</span>
            <span className="text-sm font-medium text-blue-800">{progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Generated {generatedCount} of {selectedParticipants.length} certificates
          </p>
        </div>
      )}

      {/* Success Message */}
      {status === 'complete' && (
        <div className="px-6 py-4 bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Successfully generated {generatedCount} certificates!</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error generating certificates. Please try again.</span>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search participants..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Participants List */}
      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No eligible participants found</p>
            <p className="text-sm text-gray-400 mt-1">Participants must have "attended" status</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Select All */}
            <div className="px-6 py-3 bg-gray-50">
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
                <span className="text-xs text-gray-500 ml-auto">
                  {selectedParticipants.length} selected
                </span>
              </label>
            </div>

            {/* Participant List */}
            {filteredParticipants.map((participant) => (
              <div key={participant.id} className="px-6 py-4 hover:bg-gray-50">
                <label className="flex items-start gap-3 cursor-pointer">
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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{participant.user_name}</p>
                        <p className="text-sm text-gray-600">{participant.user_email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{participant.user_college}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{participant.user_department}</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Attended
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
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
              onClick={downloadAll}
              disabled={selectedParticipants.length === 0 || generating}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download All
            </button>
            
            <button
              onClick={sendCertificates}
              disabled={selectedParticipants.length === 0 || generating}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send via Email
            </button>
            
            <button
              onClick={generateCertificates}
              disabled={selectedParticipants.length === 0 || generating}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  Generate Certificates
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}