// app/components/CertificateTemplateDesigner.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, Save, Download, Trash2, Plus, X, Move, 
  Type, Calendar, QrCode, PenTool, ChevronLeft,
  Grid, Maximize2, Minimize2, Eye, EyeOff, Settings,
  FileText, Image as ImageIcon, Sparkles, ExternalLink
} from 'lucide-react';
import CertificateFieldMarker from './CertificateFieldMarker';

export default function CertificateTemplateDesigner({ 
  template, 
  onSave, 
  onClose 
}) {
  const router = useRouter();
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [backgroundUrl, setBackgroundUrl] = useState(template?.background_url || '');
  const [backgroundType, setBackgroundType] = useState(template?.background_type || 'image');
  const [fields, setFields] = useState(template?.fields || []);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ 
    width: template?.width || 800, 
    height: template?.height || 600 
  });
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, GIF, WEBP) or PDF');
      return;
    }

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
      if (file.type === 'application/pdf') {
        // For PDFs, we'll use a default size
        setCanvasSize({
          width: 800,
          height: 600
        });
        setBackgroundUrl(event.target?.result);
        setBackgroundType('pdf');
        setImageLoaded(true);
        
        setTimeout(() => {
          clearInterval(interval);
          setUploadProgress(100);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
        }, 500);
      } else {
        // For images, get actual dimensions
        const img = new Image();
        img.onload = () => {
          setCanvasSize({
            width: img.width,
            height: img.height
          });
          setBackgroundUrl(event.target?.result);
          setBackgroundType('image');
          setImageLoaded(true);
          
          setTimeout(() => {
            clearInterval(interval);
            setUploadProgress(100);
            setTimeout(() => {
              setIsUploading(false);
              setUploadProgress(0);
            }, 500);
          }, 500);
        };
        img.src = event.target?.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Add new field
  const addField = (type) => {
    if (!backgroundUrl) {
      alert('Please upload a certificate image first');
      return;
    }

    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      label: type === 'text' ? 'New Field' : 'New Field',
      field_key: 'name',
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : 80,
      height: type === 'text' ? 40 : 80,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      textAlign: 'center',
      required: true
    };
    
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  // Update field
  const updateField = (fieldId, updates) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  // Delete field
  const deleteField = (fieldId) => {
    setFields(fields.filter(field => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      if (!name) {
        alert('Please enter a template name');
        return;
      }
      
      if (!backgroundUrl) {
        alert('Please upload a certificate image');
        return;
      }

      if (fields.length === 0) {
        alert('Please add at least one field');
        return;
      }

      const templateData = {
        name,
        description,
        background_url: backgroundUrl,
        background_type: backgroundType,
        width: canvasSize.width,
        height: canvasSize.height,
        fields: fields,
        updated_at: new Date().toISOString()
      };

      await onSave(templateData);
    } catch (error) {
      console.error('Error in handleSave:', error);
      alert('Error saving template: ' + (error.message || 'Unknown error'));
    }
  };

  // Get sample preview data for a field
  const getPreviewData = (field) => {
    switch(field.field_key) {
      case 'name': return 'John Doe';
      case 'email': return 'john.doe@example.com';
      case 'college': return 'SVERI College of Engineering';
      case 'department': return 'Computer Science';
      case 'event_name': return 'SPIRIT 2K24';
      case 'event_date': return '04 April 2024';
      case 'event_time': return '10:00 AM';
      case 'event_location': return 'Main Auditorium';
      case 'event_category': return 'Technical Event';
      case 'event_organizer': return 'Department of CSE';
      case 'result': return 'Winner';
      case 'position': return '1st';
      case 'certificate_id': return 'CERT-2024-001';
      case 'issue_date': return new Date().toLocaleDateString();
      case 'custom': return field.defaultValue || 'Custom Text';
      default: return 'Sample Text';
    }
  };

  // Navigate to Certificate Creator
  const openCertificateCreator = () => {
    // You can pass template data as query params if needed
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (backgroundUrl) params.append('backgroundUrl', backgroundUrl);
    if (fields.length) params.append('hasFields', 'true');
    
    router.push(`/admin/certificates/creator${params.toString() ? `?${params.toString()}` : ''}`);
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
              placeholder="Template Name (e.g., SPIRIT 2K24 Certificate)"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm text-gray-600 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-1 mt-1 w-full"
              placeholder="Description (optional)"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 hover:bg-white rounded">
              <Minimize2 className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 hover:bg-white rounded">
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
                disabled={!backgroundUrl}
                className={`p-3 border rounded-lg transition-colors flex flex-col items-center gap-1 ${
                  backgroundUrl 
                    ? 'border-gray-200 hover:bg-blue-50 hover:border-blue-300' 
                    : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                }`}
              >
                <Type className="w-5 h-5" />
                <span className="text-xs">Text</span>
              </button>
              <button
                onClick={() => addField('qr')}
                disabled={!backgroundUrl}
                className={`p-3 border rounded-lg transition-colors flex flex-col items-center gap-1 ${
                  backgroundUrl 
                    ? 'border-gray-200 hover:bg-blue-50 hover:border-blue-300' 
                    : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs">QR Code</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-medium text-gray-900 mb-3">Fields List</h3>
            {fields.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No fields added yet.<br/>Click above to add fields.
              </p>
            ) : (
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
                        {field.type === 'qr' && <QrCode className="w-4 h-4" />}
                        <span className="text-sm font-medium truncate">{field.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{field.field_key}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center - Canvas Area */}
        <div 
          ref={containerRef}
          className="flex-1 p-8 overflow-auto bg-gray-100 flex items-center justify-center"
          onClick={() => setSelectedFieldId(null)}
        >
          <div 
            ref={canvasRef}
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
                alt="Certificate Template"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ pointerEvents: 'none' }}
              />
            ) : (
              <div className="absolute inset-0 bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Upload your certificate image</p>
                  <p className="text-gray-400 text-sm">Click the upload button on the right</p>
                </div>
              </div>
            )}

            {/* Grid Overlay */}
            {showGrid && backgroundUrl && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(0,0,255,0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,255,0.1) 1px, transparent 1px)
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
                backgroundImage={backgroundUrl}
              />
            ))}

            {/* Preview Mode */}
            {previewMode && fields.map((field) => (
              <div
                key={field.id}
                className="absolute pointer-events-none bg-white bg-opacity-30 border border-dashed border-blue-500"
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
                  color: field.color || '#000000',
                  textAlign: field.textAlign || 'center',
                  padding: '4px'
                }}
              >
                {getPreviewData(field)}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Upload & Settings */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          {/* Certificate Creator Button */}
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900 mb-3">✨ Advanced Designer</h3>
            <button
              onClick={openCertificateCreator}
              className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Open Certificate Creator</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Create beautiful certificates with drag-and-drop editor
            </p>
          </div>

          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900 mb-3">1. Upload Certificate</h3>
            
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
                if (file) {
                  const input = fileInputRef.current;
                  if (input) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                    handleFileUpload({ target: { files: input.files } });
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
                  <p className="text-sm text-green-600">✓ Image uploaded</p>
                  <p className="text-xs text-gray-500">{backgroundType.toUpperCase()} • {canvasSize.width} x {canvasSize.height}px</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBackgroundUrl('');
                      setImageLoaded(false);
                      setFields([]);
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
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WEBP, PDF up to 10MB</p>
                </>
              )}
            </div>
          </div>

          {/* Field Mapping Guide */}
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900 mb-3">2. Mark Blank Spaces</h3>
            <p className="text-sm text-gray-600 mb-3">
              Click "Text Field" to add a marker over each blank space.
            </p>
            
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <h4 className="font-medium text-blue-900 text-sm mb-2">📋 Available Data Fields</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="font-medium text-blue-800">👤 Participant Info:</p>
                  <p className="text-blue-600 ml-2">name, email, college, department</p>
                </div>
                <div>
                  <p className="font-medium text-blue-800">🎉 Event Info:</p>
                  <p className="text-blue-600 ml-2">event_name, event_date, event_time, event_location, event_category, event_organizer</p>
                </div>
                <div>
                  <p className="font-medium text-blue-800">🏆 Result:</p>
                  <p className="text-blue-600 ml-2">result, position</p>
                </div>
                <div>
                  <p className="font-medium text-blue-800">🔢 Certificate:</p>
                  <p className="text-blue-600 ml-2">certificate_id, issue_date</p>
                </div>
                <div>
                  <p className="font-medium text-blue-800">✏️ Custom:</p>
                  <p className="text-blue-600 ml-2">custom (static text you define)</p>
                </div>
              </div>
            </div>
            
            <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
              <li>Drag markers to position them over blanks</li>
              <li>Click settings ⚙️ to choose what data goes there</li>
              <li>Select from the available data fields above</li>
              <li>For static text, select "Custom Text"</li>
              <li>Use preview mode to see how it will look</li>
            </ul>
          </div>

          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">3. Field Settings</h3>
            <p className="text-sm text-gray-600 mb-3">
              Click on any field and then the ⚙️ icon to configure:
            </p>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-medium">Display Label</p>
                <p className="text-xs text-gray-600">Name shown on the field</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-medium">Data Field</p>
                <p className="text-xs text-gray-600">What information to fill</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-medium">Font Settings</p>
                <p className="text-xs text-gray-600">Size, family, color, alignment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}