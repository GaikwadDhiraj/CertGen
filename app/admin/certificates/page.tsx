'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, FileText, Edit, Trash2, Download, Copy, 
  Calendar, Users, Clock, Search, Filter, MoreHorizontal,
  Award, Mail, Eye, Settings, Upload, Image as ImageIcon,
  CheckCircle, XCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import CertificateTemplateDesigner from '@/app/components/CertificateTemplateDesigner';
import CertificateAssignment from '@/app/components/CertificateAssignment';

export default function CertificateManagementPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDesigner, setShowDesigner] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'templates' | 'assigned' | 'issued'>('templates');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load templates
      const { data: templatesData } = await supabase
        .from('certificate_templates')
        .select('*')
        .order('created_at', { ascending: false });

      // Load events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      setTemplates(templatesData || []);
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (templateData: any) => {
    try {
      if (selectedTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('certificate_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id);

        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from('certificate_templates')
          .insert([{
            ...templateData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      alert('Template saved successfully!');
      setShowDesigner(false);
      setSelectedTemplate(null);
      loadData();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('certificate_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      
      alert('Template deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    }
  };

  const handleAssignTemplate = (template: any) => {
    setSelectedTemplate(template);
    // Show event selection modal
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Certificate Management</h1>
              <p className="text-gray-600 mt-2">Create and manage certificate templates</p>
            </div>
            <button
              onClick={() => {
                setSelectedTemplate(null);
                setShowDesigner(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Template
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-6 border-b">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'assigned'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Assigned to Events
            </button>
            <button
              onClick={() => setActiveTab('issued')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'issued'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Issued Certificates
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'templates' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
                <p className="text-gray-600 mb-6">Create your first certificate template to get started</p>
                <button
                  onClick={() => {
                    setSelectedTemplate(null);
                    setShowDesigner(true);
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Template Preview */}
                    <div className="h-48 bg-gray-100 relative">
                      {template.background_url ? (
                        <img
                          src={template.background_url}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {template.fields?.length || 0} fields
                        </span>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(template.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {template.background_type}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowDesigner(true);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleAssignTemplate(template)}
                          className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center justify-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          Assign
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'assigned' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600">Templates assigned to events will appear here.</p>
          </div>
        )}

        {activeTab === 'issued' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600">Issued certificates will appear here.</p>
          </div>
        )}
      </div>

      {/* Template Designer Modal */}
      {showDesigner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <CertificateTemplateDesigner
            template={selectedTemplate}
            onSave={handleSaveTemplate}
            onClose={() => {
              setShowDesigner(false);
              setSelectedTemplate(null);
            }}
          />
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignment && selectedTemplate && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CertificateAssignment
              eventId={selectedEvent.id}
              eventName={selectedEvent.title}
              templateId={selectedTemplate.id}
              onComplete={() => {
                setShowAssignment(false);
                setSelectedTemplate(null);
                setSelectedEvent(null);
              }}
              onClose={() => {
                setShowAssignment(false);
                setSelectedTemplate(null);
                setSelectedEvent(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}