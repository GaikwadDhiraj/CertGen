// app/components/CertificateFieldMarker.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Move, Trash2, Settings, Type, Calendar, QrCode, PenTool } from 'lucide-react';

interface FieldMarkerProps {
  field: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  canvasWidth: number;
  canvasHeight: number;
  backgroundImage?: string;
}

export default function CertificateFieldMarker({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  canvasWidth,
  canvasHeight,
  backgroundImage
}: FieldMarkerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const markerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  // Get container on mount
  useEffect(() => {
    if (markerRef.current) {
      containerRef.current = markerRef.current.parentElement;
    }
  }, []);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.button !== 0) return; // Only left click
    
    const rect = markerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    
    setIsDragging(true);
    onSelect();
  };

  // Handle mouse down for resizing
  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizeDirection(direction);
    setIsResizing(true);
  };

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      if (isDragging && markerRef.current) {
        e.preventDefault();
        
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate new position
        let newX = e.clientX - containerRect.left - dragOffset.x;
        let newY = e.clientY - containerRect.top - dragOffset.y;
        
        // Constrain to container
        newX = Math.max(0, Math.min(newX, containerRect.width - field.width));
        newY = Math.max(0, Math.min(newY, containerRect.height - field.height));
        
        // Round to nearest pixel for better performance
        newX = Math.round(newX);
        newY = Math.round(newY);
        
        onUpdate({ x: newX, y: newY });
      }
      
      if (isResizing && resizeDirection && markerRef.current) {
        e.preventDefault();
        
        const containerRect = containerRef.current.getBoundingClientRect();
        
        let newWidth = field.width;
        let newHeight = field.height;
        let newX = field.x;
        let newY = field.y;
        
        // Handle different resize directions
        const minSize = 50;
        
        if (resizeDirection.includes('right')) {
          newWidth = Math.max(minSize, e.clientX - containerRect.left - field.x);
        }
        if (resizeDirection.includes('bottom')) {
          newHeight = Math.max(minSize, e.clientY - containerRect.top - field.y);
        }
        if (resizeDirection.includes('left')) {
          const deltaX = e.clientX - containerRect.left - field.x;
          newWidth = Math.max(minSize, field.width - deltaX);
          newX = field.x + deltaX;
        }
        if (resizeDirection.includes('top')) {
          const deltaY = e.clientY - containerRect.top - field.y;
          newHeight = Math.max(minSize, field.height - deltaY);
          newY = field.y + deltaY;
        }
        
        // Round to nearest pixel
        newX = Math.round(newX);
        newY = Math.round(newY);
        newWidth = Math.round(newWidth);
        newHeight = Math.round(newHeight);
        
        onUpdate({ x: newX, y: newY, width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDragging ? 'grabbing' : 'default';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isDragging, isResizing, resizeDirection, dragOffset, field, onUpdate]);

  // Get icon based on field type
  const getFieldIcon = () => {
    switch (field.type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'qr': return <QrCode className="w-4 h-4" />;
      case 'signature': return <PenTool className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  // Get field key options
  // In CertificateFieldMarker.tsx, update fieldKeyOptions to include all registration fields

const fieldKeyOptions = [
  // Participant Information (from RegistrationModal)
  { value: 'name', label: '👤 Participant Full Name' },
  { value: 'email', label: '📧 Email Address' },
  { value: 'college', label: '🏫 College/University Name' },
  { value: 'department', label: '📚 Department/Branch' },
  
  // Event Information (from Event data)
  { value: 'event_name', label: '🎉 Event Name' },
  { value: 'event_date', label: '📅 Event Date' },
  { value: 'event_time', label: '⏰ Event Time' },
  { value: 'event_location', label: '📍 Event Location' },
  { value: 'event_category', label: '🏷️ Event Category' },
  { value: 'event_organizer', label: '👥 Event Organizer' },
  
  // Result/Achievement Information
  { value: 'result', label: '🏆 Result (Winner/Runner-up/Participant)' },
  { value: 'position', label: '🥇 Position (1st, 2nd, 3rd)' },
  
  // Certificate Information
  { value: 'certificate_id', label: '🔢 Certificate ID' },
  { value: 'issue_date', label: '📅 Issue Date' },
  
  // Custom Static Text
  { value: 'custom', label: '✏️ Custom Static Text' },
];

  return (
    <div
      ref={markerRef}
      className={`absolute border-2 rounded-lg cursor-move select-none ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 bg-opacity-30 shadow-lg' 
          : 'border-gray-400 border-dashed hover:border-blue-400 bg-transparent'
      }`}
      style={{
        left: field.x,
        top: field.y,
        width: field.width,
        height: field.height,
        zIndex: isSelected ? 20 : 10,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Field Content */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="text-center p-1 bg-white bg-opacity-90 rounded">
          <div className={`flex justify-center mb-1 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
            {getFieldIcon()}
          </div>
          <div className={`text-xs font-medium px-1 rounded ${
            isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
          }`}>
            {field.label || field.field_key}
          </div>
        </div>
      </div>

      {/* Settings Button */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSettings(!showSettings);
          }}
          className="absolute top-0 right-0 -mt-2 -mr-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 border border-gray-200 z-30"
          style={{ pointerEvents: 'auto' }}
        >
          <Settings className="w-3 h-3" />
        </button>
      )}

      {/* Delete Button */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute bottom-0 right-0 -mb-2 -mr-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 z-30"
          style={{ pointerEvents: 'auto' }}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}

      {/* Resize Handles */}
      {isSelected && (
        <>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-n-resize z-30"
            style={{ pointerEvents: 'auto' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'top')} />
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-s-resize z-30"
            style={{ pointerEvents: 'auto' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')} />
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-w-resize z-30"
            style={{ pointerEvents: 'auto' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'left')} />
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-e-resize z-30"
            style={{ pointerEvents: 'auto' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'right')} />
        </>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute left-full top-0 ml-2 w-64 bg-white rounded-lg shadow-xl border z-40 p-4"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Field Settings</h4>
            <button onClick={() => setShowSettings(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Field Label */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Display Label</label>
              <input
                type="text"
                value={field.label || ''}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-2 py-1 text-sm border rounded"
                placeholder="e.g., Participant Name"
              />
            </div>

            {/* Field Key */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Data Field</label>
              <select
                value={field.field_key}
                onChange={(e) => onUpdate({ field_key: e.target.value })}
                className="w-full px-2 py-1 text-sm border rounded"
              >
                {fieldKeyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font settings for text fields */}
            {field.type === 'text' && (
              <>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Font Size: {field.fontSize || 16}px</label>
                  <input
                    type="range"
                    min="8"
                    max="72"
                    value={field.fontSize || 16}
                    onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Font Family</label>
                  <select
                    value={field.fontFamily || 'Arial'}
                    onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                    className="w-full px-2 py-1 text-sm border rounded"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={field.color || '#000000'}
                    onChange={(e) => onUpdate({ color: e.target.value })}
                    className="w-full h-8 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Alignment</label>
                  <select
                    value={field.textAlign || 'left'}
                    onChange={(e) => onUpdate({ textAlign: e.target.value })}
                    className="w-full px-2 py-1 text-sm border rounded"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </>
            )}

            {/* Custom value */}
            {field.field_key === 'custom' && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Default Text</label>
                <input
                  type="text"
                  value={field.defaultValue || ''}
                  onChange={(e) => onUpdate({ defaultValue: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded"
                  placeholder="Enter static text"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}