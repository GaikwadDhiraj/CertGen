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
  const settingsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  // Get container on mount
  useEffect(() => {
    if (markerRef.current) {
      containerRef.current = markerRef.current.parentElement;
    }
  }, []);

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node) &&
          markerRef.current && !markerRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.button !== 0) return; // Only left click
    if (showSettings) return; // Don't drag if settings is open
    
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
    if (showSettings) return;
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
  const fieldKeyOptions = [
    // Participant Information
    { value: 'name', label: '👤 Participant Full Name' },
    { value: 'email', label: '📧 Email Address' },
    { value: 'college', label: '🏫 College/University Name' },
    { value: 'department', label: '📚 Department/Branch' },
    
    // Event Information
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

  // Handle settings button click
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSettings(!showSettings);
  };

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      onUpdate({ [name]: checked });
    } else if (name === 'fontSize') {
      onUpdate({ [name]: parseInt(value) || 16 });
    } else {
      onUpdate({ [name]: value });
    }
  };

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
          onClick={handleSettingsClick}
          className="absolute top-0 right-0 -mt-2 -mr-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 border border-gray-200 z-30"
          style={{ pointerEvents: 'auto' }}
        >
          <Settings className="w-3 h-3" />
        </button>
      )}

      {/* Delete Button */}
      {isSelected && (
        <button
          onClick={handleDeleteClick}
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
        <div 
          ref={settingsRef}
          className="absolute left-full top-0 ml-2 w-72 bg-white rounded-lg shadow-xl border z-50 p-4"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Field Settings</h4>
            <button 
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Field Label */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Display Label
              </label>
              <input
                type="text"
                name="label"
                value={field.label || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Participant Name"
              />
            </div>

            {/* Field Key - Dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Data Field
              </label>
              <select
                name="field_key"
                value={field.field_key || 'name'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {fieldKeyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select what data should appear in this field
              </p>
            </div>

            {/* Custom value for custom field */}
            {field.field_key === 'custom' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Custom Text
                </label>
                <input
                  type="text"
                  name="defaultValue"
                  value={field.defaultValue || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter static text"
                />
              </div>
            )}

            {/* Font settings for text fields */}
            {field.type === 'text' && (
              <>
                {/* Font Size */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Font Size: {field.fontSize || 16}px
                  </label>
                  <input
                    type="range"
                    name="fontSize"
                    min="8"
                    max="72"
                    value={field.fontSize || 16}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Font Family
                  </label>
                  <select
                    name="fontFamily"
                    value={field.fontFamily || 'Arial'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Helvetica">Helvetica</option>
                  </select>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="color"
                      value={field.color || '#000000'}
                      onChange={handleInputChange}
                      className="w-10 h-8 border rounded"
                    />
                    <input
                      type="text"
                      name="color"
                      value={field.color || '#000000'}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Text Alignment */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Alignment
                  </label>
                  <select
                    name="textAlign"
                    value={field.textAlign || 'left'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                {/* Font Weight */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Font Weight
                  </label>
                  <select
                    name="fontWeight"
                    value={field.fontWeight || 'normal'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="lighter">Light</option>
                  </select>
                </div>
              </>
            )}

            {/* Required Toggle */}
            <div className="flex items-center justify-between pt-2 border-t">
              <label className="text-xs font-medium text-gray-700">
                Required Field
              </label>
              <input
                type="checkbox"
                name="required"
                checked={field.required || false}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Position Info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <p>Position: X={Math.round(field.x)}, Y={Math.round(field.y)}</p>
              <p>Size: {Math.round(field.width)} x {Math.round(field.height)}px</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}