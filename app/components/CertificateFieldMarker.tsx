'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Move, Trash2, Settings, Type, Calendar, QrCode, Image, PenTool, Hash } from 'lucide-react';
import { ChromePicker } from 'react-color';

interface FieldMarkerProps {
  field: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  canvasWidth: number;
  canvasHeight: number;
}

export default function CertificateFieldMarker({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  canvasWidth,
  canvasHeight
}: FieldMarkerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const markerRef = useRef<HTMLDivElement>(null);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
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
    e.stopPropagation();
    setResizeDirection(direction);
    setIsResizing(true);
  };

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && markerRef.current) {
        e.preventDefault();
        
        const container = markerRef.current.parentElement;
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        
        // Calculate new position
        let newX = e.clientX - containerRect.left - dragOffset.x;
        let newY = e.clientY - containerRect.top - dragOffset.y;
        
        // Constrain to container
        newX = Math.max(0, Math.min(newX, containerRect.width - field.width));
        newY = Math.max(0, Math.min(newY, containerRect.height - field.height));
        
        onUpdate({ x: newX, y: newY });
      }
      
      if (isResizing && resizeDirection && markerRef.current) {
        e.preventDefault();
        
        const container = markerRef.current.parentElement;
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        const markerRect = markerRef.current.getBoundingClientRect();
        
        let newWidth = field.width;
        let newHeight = field.height;
        let newX = field.x;
        let newY = field.y;
        
        // Handle different resize directions
        if (resizeDirection.includes('right')) {
          newWidth = Math.max(50, e.clientX - containerRect.left - field.x);
        }
        if (resizeDirection.includes('bottom')) {
          newHeight = Math.max(30, e.clientY - containerRect.top - field.y);
        }
        if (resizeDirection.includes('left')) {
          const deltaX = e.clientX - containerRect.left - field.x;
          newWidth = Math.max(50, field.width - deltaX);
          newX = field.x + deltaX;
        }
        if (resizeDirection.includes('top')) {
          const deltaY = e.clientY - containerRect.top - field.y;
          newHeight = Math.max(30, field.height - deltaY);
          newY = field.y + deltaY;
        }
        
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
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeDirection, dragOffset, field, onUpdate]);

  // Get icon based on field type
  const getFieldIcon = () => {
    switch (field.type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'qr': return <QrCode className="w-4 h-4" />;
      case 'signature': return <PenTool className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  return (
    <div
      ref={markerRef}
      className={`absolute border-2 rounded-lg cursor-move transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 bg-opacity-30 shadow-lg' 
          : 'border-gray-400 border-dashed hover:border-blue-400 bg-gray-100 bg-opacity-20'
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
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Field Icon and Label */}
        <div className="text-center p-1">
          <div className={`flex justify-center mb-1 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
            {getFieldIcon()}
          </div>
          <div className={`text-xs font-medium px-1 rounded ${
            isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
          }`}>
            {field.label || field.field_key}
          </div>
        </div>

        {/* Settings Button (visible when selected) */}
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            className="absolute top-0 right-0 -mt-2 -mr-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 border border-gray-200"
          >
            <Settings className="w-3 h-3" />
          </button>
        )}

        {/* Delete Button (visible when selected) */}
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute bottom-0 right-0 -mb-2 -mr-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Resize Handles */}
      {isSelected && (
        <>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-n-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'top')} />
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-s-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')} />
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-w-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'left')} />
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-e-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'right')} />
          <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')} />
          <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')} />
          <div className="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')} />
          <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')} />
        </>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute left-full top-0 ml-2 w-64 bg-white rounded-lg shadow-xl border z-30 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Field Settings</h4>
            <button onClick={() => setShowSettings(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Field Label */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Label</label>
              <input
                type="text"
                value={field.label || ''}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>

            {/* Field Key */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Field Key</label>
              <select
                value={field.field_key}
                onChange={(e) => onUpdate({ field_key: e.target.value })}
                className="w-full px-2 py-1 text-sm border rounded"
              >
                <option value="name">Participant Name</option>
                <option value="email">Email</option>
                <option value="event_name">Event Name</option>
                <option value="event_date">Event Date</option>
                <option value="issue_date">Issue Date</option>
                <option value="certificate_id">Certificate ID</option>
                <option value="custom">Custom Text</option>
              </select>
            </div>

            {/* Custom Value (if custom selected) */}
            {field.field_key === 'custom' && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Custom Value</label>
                <input
                  type="text"
                  value={field.default_value || ''}
                  onChange={(e) => onUpdate({ default_value: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded"
                  placeholder="Enter default text"
                />
              </div>
            )}

            {/* Font Size */}
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

                {/* Font Family */}
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

                {/* Font Weight */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
                  <select
                    value={field.fontWeight || 'normal'}
                    onChange={(e) => onUpdate({ fontWeight: e.target.value })}
                    className="w-full px-2 py-1 text-sm border rounded"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="light">Light</option>
                  </select>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Color</label>
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-full h-8 border rounded flex items-center justify-between px-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border" style={{ backgroundColor: field.color || '#000000' }} />
                      <span className="text-xs">{field.color || '#000000'}</span>
                    </div>
                  </button>
                  {showColorPicker && (
                    <div className="absolute z-40 mt-1">
                      <ChromePicker
                        color={field.color || '#000000'}
                        onChange={(color) => onUpdate({ color: color.hex })}
                      />
                    </div>
                  )}
                </div>

                {/* Text Align */}
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

            {/* Required Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-600">Required Field</label>
              <input
                type="checkbox"
                checked={field.required || false}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="rounded border-gray-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}