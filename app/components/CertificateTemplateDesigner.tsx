'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Save, Download, Trash2, Plus, X, Move, 
  Type, Calendar, QrCode, Image, PenTool, Hash,
  ChevronLeft, ChevronRight, Grid, Maximize2, Minimize2,
  Copy, Eye, EyeOff, Settings, FileText, Users, Mail,
  Check, AlertCircle, Clock
} from 'lucide-react';
import CertificateFieldMarker from './CertificateFieldMarker';
import { CertificateTemplate, CertificateField } from '@/types/event';

interface TemplateDesignerProps {
  template?: CertificateTemplate | null;
  onSave: (template: Partial<CertificateTemplate>) => void;
  onClose: () => void;
}

export default function CertificateTemplateDesigner({ 
  template, 
  onSave, 
  onClose 
}: TemplateDesignerProps) {
  const [name, setName] = useState(template?.name || 'New Certificate Template');
  const [description, setDescription] = useState(template?.description || '');
  const [backgroundUrl, setBackgroundUrl] = useState(template?.background_url || '');
  const [backgroundType, setBackgroundType] = useState<'image' | 'pdf'>(template?.background_type || 'image');
  const [fields, setFields] = useState<CertificateField[]>(template?.fields || []);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ 
    width: template?.width || 800, 
    height: template?.height || 600 
  });
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'fields' | 'settings' | 'preview'>('fields');
  const [previewMode, setPreviewMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setCanvasSize({
          width: img.width,
          height: img.height
        });
        setBackgroundUrl(event.target?.result as string);
        setBackgroundType(file.type === 'application/pdf' ? 'pdf' : 'image');
        
        setTimeout(() => {
          clearInterval(interval);
          setUploadProgress(100);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
        }, 1000);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Add new field
  const addField = (type: string) => {
    const newField: CertificateField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      label: `New ${type} field`,
      placeholder: type === 'text' ? 'Enter text' : '',
      field_key: 'name',
      x: 100,
      y: 100,
      width: 200,
      height: type === 'text' ? 40 : 80,
      fontSize: type === 'text' ? 24 : undefined,
      fontFamily: type === 'text' ? 'Arial' : undefined,
      fontWeight: type === 'text' ? 'normal' : undefined,
      color: type === 'text' ? '#000000' : undefined,
      textAlign: type === 'text' ? 'center' : undefined,
      required: true,
    };
    
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  // Update field
  const updateField = (fieldId: string, updates: Partial<CertificateField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  // Delete field
  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  // Handle save
  const handleSave = () => {
    if (!name) {
      alert('Please enter a template name');
      return;
    }
    
    if (!backgroundUrl) {
      alert('Please upload a certificate background');
      return;
    }

    const templateData: Partial<CertificateTemplate> = {
      name,
      description,
      background_url: backgroundUrl,
      background_type: backgroundType,
      width: canvasSize.width,
      height: canvasSize.height,
      fields,
      updated_at: new Date().toISOString()
    };

    onSave(templateData);
  };

  // Generate preview data
  const getPreviewData = (field: CertificateField) => {
    switch (field.field_key) {
      case 'name': return 'John Doe';
      case 'email': return 'john@example.com';
      case 'event_name': return 'Tech Conference 2024';
      case 'event_date': return 'March 15, 2024';
      case 'issue_date': return new Date().toLocaleDateString();
      case 'certificate_id': return 'CERT-2024-001';
      case 'custom': return field.default_value || 'Custom Text';
      default: return field.placeholder || 'Sample Text';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-1"
              placeholder="Template Name"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm text-gray-600 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-1 mt-1 w-full"
              placeholder="Template Description (optional)"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 hover:bg-white rounded"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 hover:bg-white rounded"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg ${showGrid ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <Grid className="w-5 h-5" />
          </button>

          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`p-2 rounded-lg ${previewMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {previewMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Template
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Field Tools */}
        <div className="w-64 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900 mb-3">Add Fields</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addField('text')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center gap-1"
              >
                <Type className="w-5 h-5" />
                <span className="text-xs">Text</span>
              </button>
              <button
                onClick={() => addField('date')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center gap-1"
              >
                <Calendar className="w-5 h-5" />
                <span className="text-xs">Date</span>
              </button>
              <button
                onClick={() => addField('qr')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center gap-1"
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs">QR Code</span>
              </button>
              <button
                onClick={() => addField('signature')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center gap-1"
              >
                <PenTool className="w-5 h-5" />
                <span className="text-xs">Signature</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-medium text-gray-900 mb-3">Fields List</h3>
            <div className="space-y-2">
              {fields.map((field) => (
                <button
                  key={field.id}
                  onClick={() => setSelectedFieldId(field.id)}
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${
                    selectedFieldId === field.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {field.type === 'text' && <Type className="w-4 h-4" />}
                      {field.type === 'date' && <Calendar className="w-4 h-4" />}
                      {field.type === 'qr' && <QrCode className="w-4 h-4" />}
                      {field.type === 'signature' && <PenTool className="w-4 h-4" />}
                      <span className="text-sm font-medium">{field.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{field.field_key}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Canvas Area */}
        <div 
          ref={canvasRef}
          className="flex-1 p-8 overflow-auto bg-gray-100 flex items-center justify-center"
          onClick={() => setSelectedFieldId(null)}
        >
          <div 
            className="relative bg-white shadow-2xl"
            style={{
              width: canvasSize.width * zoom,
              height: canvasSize.height * zoom,
              transform: `scale(${zoom})`,
              transformOrigin: 'center'
            }}
          >
            {/* Background Image */}
            {backgroundUrl ? (
              <img
                src={backgroundUrl}
                alt="Certificate Background"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ pointerEvents: 'none' }}
              />
            ) : (
              <div className="absolute inset-0 bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Upload Certificate Background</p>
                  <p className="text-gray-400 text-sm">Click the upload button on the right</p>
                </div>
              </div>
            )}

            {/* Grid Overlay */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />
            )}

            {/* Field Markers */}
            {!previewMode && fields.map((field) => (
              <CertificateFieldMarker
                key={field.id}
                field={field}
                isSelected={selectedFieldId === field.id}
                onSelect={() => setSelectedFieldId(field.id)}
                onUpdate={(updates) => updateField(field.id, updates)}
                onDelete={() => deleteField(field.id)}
                canvasWidth={canvasSize.width}
                canvasHeight={canvasSize.height}
              />
            ))}

            {/* Preview Mode */}
            {previewMode && fields.map((field) => (
              <div
                key={field.id}
                className="absolute pointer-events-none"
                style={{
                  left: field.x,
                  top: field.y,
                  width: field.width,
                  height: field.height,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: field.textAlign || 'center',
                  fontSize: field.fontSize || 16,
                  fontFamily: field.fontFamily || 'Arial',
                  fontWeight: field.fontWeight || 'normal',
                  color: field.color || '#000000',
                  textAlign: field.textAlign || 'center',
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  border: '1px dashed #ccc'
                }}
              >
                {getPreviewData(field)}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Upload & Settings */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900 mb-3">Certificate Background</h3>
            
            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
                  const input = fileInputRef.current;
                  if (input) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                    handleFileUpload({ target: { files: input.files } } as any);
                  }
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {isUploading ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : backgroundUrl ? (
                <div className="space-y-3">
                  <img 
                    src={backgroundUrl} 
                    alt="Preview" 
                    className="max-h-32 mx-auto rounded border"
                  />
                  <p className="text-sm text-green-600">✓ Background uploaded</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBackgroundUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click or drag to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
                </>
              )}
            </div>

            {/* Canvas Size Info */}
            {backgroundUrl && (
              <div className="mt-3 text-xs text-gray-500">
                <p>Size: {canvasSize.width} x {canvasSize.height} px</p>
                <p>Type: {backgroundType.toUpperCase()}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('fields')}
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === 'fields' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
                }`}
              >
                Fields
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
                }`}
              >
                Settings
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'fields' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Field Statistics</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{fields.length}</p>
                    <p className="text-xs text-gray-600">Total Fields</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {fields.filter(f => f.required).length}
                    </p>
                    <p className="text-xs text-gray-600">Required</p>
                  </div>
                </div>

                <h4 className="font-medium text-gray-900 mt-4">Field Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Text Fields</span>
                    <span className="font-medium">{fields.filter(f => f.type === 'text').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Date Fields</span>
                    <span className="font-medium">{fields.filter(f => f.type === 'date').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>QR Code Fields</span>
                    <span className="font-medium">{fields.filter(f => f.type === 'qr').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Signature Fields</span>
                    <span className="font-medium">{fields.filter(f => f.type === 'signature').length}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Font
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Arial</option>
                    <option>Times New Roman</option>
                    <option>Courier New</option>
                    <option>Georgia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Text Color
                  </label>
                  <input
                    type="color"
                    className="w-full h-10 border rounded-lg"
                    defaultValue="#000000"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Generate QR Codes
                  </label>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    defaultChecked
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Include Certificate ID
                  </label>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    defaultChecked
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}