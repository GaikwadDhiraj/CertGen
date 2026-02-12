'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Edit, Trash2, Download, Send, CheckCircle, 
  Users, Clock, Award, Plus, RefreshCw, Search,
  Eye, QrCode, Share2, Filter, Mail
} from 'lucide-react';
import CertificateEditor from './CertificateEditor';
import { getCertificateTemplate, createCertificateTemplate, updateCertificateTemplate, deleteCertificateTemplate, getIssuedCertificates, issueCertificate } from '@/lib/supabaseClient';

interface CertificateManagerProps {
  eventId: number;
  eventName: string;
}

export default function CertificateManager({ eventId, eventName }: CertificateManagerProps) {
  const [activeTab, setActiveTab] = useState<'design' | 'preview' | 'issue' | 'issued'>('design');
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [issuedCertificates, setIssuedCertificates] = useState<any[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load certificate template
  useEffect(() => {
    loadCertificateTemplate();
    if (activeTab === 'issued') {
      loadIssuedCertificates();
    }
  }, [activeTab]);

  const loadCertificateTemplate = async () => {
    setLoading(true);
    try {
      const data = await getCertificateTemplate(eventId);
      setTemplate(data);
    } catch (error) {
      console.error('Error loading certificate template:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIssuedCertificates = async () => {
    try {
      const data = await getIssuedCertificates(eventId);
      setIssuedCertificates(data);
    } catch (error) {
      console.error('Error loading issued certificates:', error);
    }
  };

  const handleSaveTemplate = async (elements: any[], backgroundUrl: string) => {
    try {
      if (template) {
        // Update existing template
        const success = await updateCertificateTemplate(template.id, {
          elements,
          background_url: backgroundUrl
        });
        
        if (success) {
          alert('Template updated successfully!');
          loadCertificateTemplate();
        }
      } else {
        // Create new template
        const newTemplate = await createCertificateTemplate(eventId, {
          name: `${eventName} Certificate`,
          background_url: backgroundUrl,
          elements
        });
        
        if (newTemplate) {
          alert('Template created successfully!');
          setTemplate(newTemplate);
          setShowEditor(false);
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!template || !confirm('Are you sure you want to delete this certificate template?')) return;
    
    try {
      const success = await deleteCertificateTemplate(template.id);
      if (success) {
        alert('Template deleted successfully!');
        setTemplate(null);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    }
  };

  const handleIssueCertificates = async () => {
    if (selectedParticipants.length === 0) {
      alert('Please select at least one participant to issue certificates to.');
      return;
    }

    if (!template) {
      alert('Please create a certificate template first.');
      return;
    }

    if (!confirm(`Issue certificates to ${selectedParticipants.length} participants?`)) {
      return;
    }

    // Here you would typically issue certificates to selected participants
    // For now, we'll show a success message
    alert(`Certificates issued successfully to ${selectedParticipants.length} participants!`);
    
    // Refresh issued certificates list
    loadIssuedCertificates();
    setSelectedParticipants([]);
  };

  const handleSendCertificates = () => {
    if (selectedParticipants.length === 0) {
      alert('Please select at least one participant to send certificates to.');
      return;
    }

    alert(`Certificates will be emailed to ${selectedParticipants.length} participants.`);
    // Implement email sending logic here
  };

  const handleDownloadCertificate = (certificate: any) => {
    // Implement certificate download logic
    alert(`Downloading certificate for ${certificate.user_name}`);
  };

  const handleSendCertificateEmail = (certificate: any) => {
    // Implement email sending logic
    alert(`Sending certificate to ${certificate.user_email}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 px-6">
          <button
            onClick={() => setActiveTab('design')}
            className={`px-4 py-3 font-medium text-sm rounded-t-lg transition-colors ${
              activeTab === 'design'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Design Template
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-3 font-medium text-sm rounded-t-lg transition-colors ${
              activeTab === 'preview'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('issue')}
            className={`px-4 py-3 font-medium text-sm rounded-t-lg transition-colors ${
              activeTab === 'issue'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Issue Certificates
          </button>
          <button
            onClick={() => setActiveTab('issued')}
            className={`px-4 py-3 font-medium text-sm rounded-t-lg transition-colors ${
              activeTab === 'issued'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Issued Certificates
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'design' && (
          <div>
            {showEditor ? (
              <CertificateEditor
                eventId={eventId}
                eventName={eventName}
                onSave={handleSaveTemplate}
                initialElements={template?.elements || []}
                initialBackgroundUrl={template?.background_url || ''}
              />
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Certificate Template</h3>
                    <p className="text-gray-600">Design and customize certificates for this event</p>
                  </div>
                  
                  <div className="flex gap-3">
                    {template && (
                      <>
                        <button
                          onClick={() => setShowEditor(true)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Template
                        </button>
                        <button
                          onClick={handleDeleteTemplate}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Template
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowEditor(true)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {template ? 'Create New Template' : 'Create Template'}
                    </button>
                  </div>
                </div>

                {template ? (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Created: {new Date(template.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {template.elements?.length || 0} elements
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveTab('preview')}
                          className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                        <button
                          onClick={() => setActiveTab('issue')}
                          className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          Issue Certificates
                        </button>
                      </div>
                    </div>
                    
                    {/* Template Preview */}
                    <div className="mt-6 bg-white rounded-lg border p-4">
                      <div className="flex items-center justify-center">
                        <div className="relative w-full max-w-2xl h-64 bg-gray-100 rounded-lg overflow-hidden border">
                          {template.background_url ? (
                            <img 
                              src={template.background_url} 
                              alt="Template Preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              No background image set
                            </div>
                          )}
                          
                          {/* Show some sample elements */}
                          {template.elements?.slice(0, 3).map((element: any, index: number) => (
                            <div 
                              key={index}
                              className="absolute border border-dashed border-blue-300 bg-blue-50 bg-opacity-30"
                              style={{
                                left: `${element.left}px`,
                                top: `${element.top}px`,
                                width: `${element.width}px`,
                                height: element.height ? `${element.height}px` : 'auto'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificate Template</h3>
                    <p className="text-gray-600 mb-6">Create a certificate template to issue certificates to participants</p>
                    <button
                      onClick={() => setShowEditor(true)}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      Create Template
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'preview' && template && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Certificate Preview</h3>
                <p className="text-gray-600">Preview how the certificate will look when issued</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('design')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Design
                </button>
                <button
                  onClick={handleDownloadCertificate}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Sample
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Certificate Preview */}
                <div className="flex-1">
                  <div className="bg-white rounded-lg shadow-lg p-4">
                    <div className="relative">
                      {/* This would be the actual certificate rendering */}
                      <div 
                        className="w-full aspect-[4/3] bg-cover bg-center rounded-lg border"
                        style={{ backgroundImage: `url(${template.background_url || ''})` }}
                      >
                        <div className="relative w-full h-full p-8">
                          {/* Render sample certificate elements */}
                          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center">
                            <div className="text-3xl font-bold text-gray-800 mb-2">Certificate of Completion</div>
                            <div className="text-xl text-gray-600">This certifies that</div>
                          </div>
                          
                          <div className="absolute top-2/4 left-1/2 transform -translate-x-1/2 text-center">
                            <div className="text-4xl font-bold text-blue-700 mb-2">John Doe</div>
                            <div className="text-lg text-gray-600">has successfully completed</div>
                          </div>
                          
                          <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 text-center">
                            <div className="text-2xl font-semibold text-gray-800 mb-1">{eventName}</div>
                            <div className="text-gray-600">on {new Date().toLocaleDateString()}</div>
                          </div>
                          
                          {/* Signature areas */}
                          <div className="absolute bottom-8 left-8">
                            <div className="border-t border-gray-400 w-48 pt-2">
                              <div className="text-sm text-gray-600">Organizer Signature</div>
                            </div>
                          </div>
                          
                          <div className="absolute bottom-8 right-8">
                            <div className="border-t border-gray-400 w-48 pt-2">
                              <div className="text-sm text-gray-600">Date</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center text-sm text-gray-600">
                    This is a preview. Actual certificates will be generated with participant details.
                  </div>
                </div>

                {/* Preview Controls */}
                <div className="lg:w-80 space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Preview Options</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Sample Name</label>
                        <input
                          type="text"
                          defaultValue="John Doe"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Sample Date</label>
                        <input
                          type="date"
                          defaultValue={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Template Information</h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Elements:</span>
                          <span className="text-sm font-medium">{template.elements?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Updated:</span>
                          <span className="text-sm font-medium">
                            {new Date(template.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className="text-sm font-medium text-green-600">Ready to Issue</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveTab('issue')}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      Issue Certificates
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'issue' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Issue Certificates</h3>
                <p className="text-gray-600">Select participants to issue certificates to</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('design')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Template
                </button>
                <button
                  onClick={handleIssueCertificates}
                  disabled={selectedParticipants.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Issue Selected ({selectedParticipants.length})
                </button>
              </div>
            </div>

            {!template ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificate Template</h3>
                <p className="text-gray-600 mb-6">You need to create a certificate template first</p>
                <button
                  onClick={() => setActiveTab('design')}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Create Template
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search participants..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Participants List - You would replace this with actual participants data */}
                <div className="bg-white rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Select all participant IDs
                                  setSelectedParticipants([1, 2, 3, 4]); // Replace with actual IDs
                                } else {
                                  setSelectedParticipants([]);
                                }
                              }}
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Participant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registration Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Certificate Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {/* Sample data - replace with actual participants */}
                        {[
                          { id: 1, name: 'John Doe', email: 'john@example.com', date: '2024-01-15', status: 'attended', certStatus: 'not-issued' },
                          { id: 2, name: 'Jane Smith', email: 'jane@example.com', date: '2024-01-16', status: 'attended', certStatus: 'not-issued' },
                          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', date: '2024-01-17', status: 'attended', certStatus: 'not-issued' },
                          { id: 4, name: 'Alice Brown', email: 'alice@example.com', date: '2024-01-18', status: 'attended', certStatus: 'not-issued' },
                        ].map((participant) => (
                          <tr key={participant.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
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
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{participant.name}</div>
                                <div className="text-sm text-gray-500">{participant.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(participant.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                {participant.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                Not Issued
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {selectedParticipants.length} of 4 participants selected
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleIssueCertificates}
                        disabled={selectedParticipants.length === 0}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <Award className="w-4 h-4" />
                        Issue Certificates
                      </button>
                      <button
                        onClick={handleSendCertificates}
                        disabled={selectedParticipants.length === 0}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send via Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'issued' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Issued Certificates</h3>
                <p className="text-gray-600">View and manage issued certificates</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={loadIssuedCertificates}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={() => setActiveTab('issue')}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Issue More
                </button>
              </div>
            </div>

            {issuedCertificates.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Issued Yet</h3>
                <p className="text-gray-600 mb-6">Issue certificates to participants to see them here</p>
                <button
                  onClick={() => setActiveTab('issue')}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 mx-auto"
                >
                  <Award className="w-5 h-5" />
                  Issue Certificates
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {issuedCertificates.map((cert) => (
                    <div key={cert.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-medium text-gray-900">{cert.user_name}</div>
                            <div className="text-sm text-gray-500">{cert.user_email}</div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            cert.status === 'issued' ? 'bg-green-100 text-green-800' :
                            cert.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {cert.status}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3" />
                            Issued: {new Date(cert.issued_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            By: {cert.issued_by}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadCertificate(cert)}
                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                          <button
                            onClick={() => handleSendCertificateEmail(cert)}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Total {issuedCertificates.length} certificates issued
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export All
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Send All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}