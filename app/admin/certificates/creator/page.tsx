'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Download, Undo, Redo, ZoomIn, ZoomOut,
  Type, Image, Square, Circle, Minus, Star, Heart,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Trash2, Copy, Move, Layers, Grid, Eye, EyeOff,
  Plus, X, Upload, Sparkles, Palette, Play, MoveUp,
  Maximize2, Minimize2, RotateCw, FlipHorizontal, FlipVertical,
  Crop, Share2, Printer, FileText, User, Calendar, Award,
  Mail, MapPin, Clock, Hash, Link, Check, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ChromePicker } from 'react-color';
import { supabase } from '@/lib/supabaseClient';

// Dynamic import for fabric to avoid SSR issues
let fabric: any;

export default function CertificateCreator() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<any>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [color, setColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [templateName, setTemplateName] = useState('New Certificate');
  const [pageSize, setPageSize] = useState({ width: 800, height: 600 });
  const [fabricLoaded, setFabricLoaded] = useState(false);

  // Pre-designed templates
  const certificateTemplates = [
    { name: 'Classic Gold', bgColor: '#fef3c7', borderColor: '#d97706', style: 'classic' },
    { name: 'Modern Blue', bgColor: '#dbeafe', borderColor: '#2563eb', style: 'modern' },
    { name: 'Elegant Green', bgColor: '#d1fae5', borderColor: '#059669', style: 'elegant' },
    { name: 'Professional', bgColor: '#f3f4f6', borderColor: '#374151', style: 'professional' },
    { name: 'Creative Red', bgColor: '#fee2e2', borderColor: '#dc2626', style: 'creative' },
    { name: 'Purple Royal', bgColor: '#ede9fe', borderColor: '#7c3aed', style: 'royal' },
  ];

  // Dynamic fields list
  const dynamicFields = [
    { label: 'Participant Name', value: '{{participant_name}}', icon: User },
    { label: 'Email', value: '{{participant_email}}', icon: Mail },
    { label: 'College', value: '{{participant_college}}', icon: MapPin },
    { label: 'Department', value: '{{participant_department}}', icon: Hash },
    { label: 'Event Name', value: '{{event_name}}', icon: Calendar },
    { label: 'Event Date', value: '{{event_date}}', icon: Clock },
    { label: 'Certificate ID', value: '{{certificate_id}}', icon: Award },
    { label: 'Issue Date', value: '{{issue_date}}', icon: Calendar },
  ];

  // Load fabric dynamically
  useEffect(() => {
    const loadFabric = async () => {
      try {
        const fabricModule = await import('fabric');
        fabric = fabricModule.default || fabricModule;
        setFabricLoaded(true);
      } catch (error) {
        console.error('Error loading fabric:', error);
      }
    };
    
    loadFabric();
    
    // Cleanup on unmount
    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
  }, []);

  // Initialize Fabric.js canvas after fabric is loaded
  useEffect(() => {
    if (!fabricLoaded || !canvasRef.current || canvas) return;

    // Check if canvas already has a fabric instance
    if (canvasRef.current.__fabric) {
      return;
    }

    try {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: pageSize.width,
        height: pageSize.height,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
        selection: true,
      });
      
      setCanvas(fabricCanvas);

      // Add grid
      if (showGrid) {
        addGrid(fabricCanvas);
      }

      // Add event listeners
      fabricCanvas.on('selection:created', (e: any) => setSelectedObject(e.selected?.[0] || null));
      fabricCanvas.on('selection:updated', (e: any) => setSelectedObject(e.selected?.[0] || null));
      fabricCanvas.on('selection:cleared', () => setSelectedObject(null));
      fabricCanvas.on('object:modified', saveToHistory);
      fabricCanvas.on('object:added', saveToHistory);

      // Add sample certificate
      addSampleCertificate(fabricCanvas);
      
      saveToHistory();
    } catch (error) {
      console.error('Error initializing fabric canvas:', error);
    }
  }, [fabricLoaded, pageSize]);

  const addGrid = (fabricCanvas: any) => {
    const gridSize = 20;
    for (let i = 0; i < pageSize.width; i += gridSize) {
      const line = new fabric.Line([i, 0, i, pageSize.height], {
        stroke: '#e5e7eb',
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
      });
      fabricCanvas.add(line);
    }
    for (let i = 0; i < pageSize.height; i += gridSize) {
      const line = new fabric.Line([0, i, pageSize.width, i], {
        stroke: '#e5e7eb',
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
      });
      fabricCanvas.add(line);
    }
  };

  const addSampleCertificate = (fabricCanvas: any) => {
    // Add decorative border
    const border = new fabric.Rect({
      left: 20,
      top: 20,
      width: pageSize.width - 40,
      height: pageSize.height - 40,
      fill: 'transparent',
      stroke: '#d97706',
      strokeWidth: 3,
      rx: 20,
      ry: 20,
    });
    fabricCanvas.add(border);

    // Add title
    const title = new fabric.Textbox('CERTIFICATE', {
      left: pageSize.width / 2,
      top: 80,
      fontSize: 48,
      fontFamily: 'Times New Roman',
      fontWeight: 'bold',
      fill: '#d97706',
      textAlign: 'center',
      originX: 'center',
      width: 400,
    });
    fabricCanvas.add(title);

    // Add subtitle
    const subtitle = new fabric.Textbox('OF ACHIEVEMENT', {
      left: pageSize.width / 2,
      top: 140,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#666666',
      textAlign: 'center',
      originX: 'center',
      width: 400,
    });
    fabricCanvas.add(subtitle);

    // Add presentation text
    const presentation = new fabric.Textbox('This certificate is proudly presented to', {
      left: pageSize.width / 2,
      top: 220,
      fontSize: 18,
      fontFamily: 'Arial',
      fill: '#333333',
      textAlign: 'center',
      originX: 'center',
      width: 500,
    });
    fabricCanvas.add(presentation);

    // Add name placeholder
    const namePlaceholder = new fabric.Textbox('{{participant_name}}', {
      left: pageSize.width / 2,
      top: 280,
      fontSize: 48,
      fontFamily: 'Times New Roman',
      fontWeight: 'bold',
      fill: '#000000',
      textAlign: 'center',
      originX: 'center',
      width: 600,
      backgroundColor: 'rgba(255,255,0,0.1)',
      stroke: '#ff0000',
      strokeWidth: 1,
    });
    fabricCanvas.add(namePlaceholder);

    // Add description
    const description = new fabric.Textbox('for demonstrating exceptional skills and dedication', {
      left: pageSize.width / 2,
      top: 360,
      fontSize: 16,
      fontFamily: 'Arial',
      fill: '#666666',
      textAlign: 'center',
      originX: 'center',
      width: 500,
    });
    fabricCanvas.add(description);

    // Add event name
    const eventName = new fabric.Textbox('{{event_name}}', {
      left: pageSize.width / 2,
      top: 420,
      fontSize: 20,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#d97706',
      textAlign: 'center',
      originX: 'center',
      width: 400,
      backgroundColor: 'rgba(255,255,0,0.1)',
    });
    fabricCanvas.add(eventName);

    // Add date
    const dateText = new fabric.Textbox('Date: {{event_date}}', {
      left: pageSize.width - 150,
      top: pageSize.height - 80,
      fontSize: 14,
      fontFamily: 'Arial',
      fill: '#666666',
      textAlign: 'right',
      originX: 'right',
      width: 200,
    });
    fabricCanvas.add(dateText);

    // Add signature
    const signature = new fabric.Textbox('{{signature}}', {
      left: 150,
      top: pageSize.height - 80,
      fontSize: 14,
      fontFamily: 'Arial',
      fill: '#666666',
      textAlign: 'left',
      width: 200,
    });
    fabricCanvas.add(signature);

    fabricCanvas.renderAll();
  };

  const saveToHistory = () => {
    if (!canvas) return;
    const json = canvas.toJSON();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0 && canvas) {
      const newIndex = historyIndex - 1;
      canvas.loadFromJSON(history[newIndex], () => canvas.renderAll());
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && canvas) {
      const newIndex = historyIndex + 1;
      canvas.loadFromJSON(history[newIndex], () => canvas.renderAll());
      setHistoryIndex(newIndex);
    }
  };

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.Textbox('Edit Text', {
      left: 100,
      top: 100,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      width: 200,
      hasControls: true,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveToHistory();
  };

  const addShape = (type: string) => {
    if (!canvas) return;
    let shape: any;
    
    switch(type) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: 100,
          top: 100,
          width: 100,
          height: 80,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 2,
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 40,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 2,
        });
        break;
      case 'line':
        shape = new fabric.Line([100, 100, 200, 100], {
          stroke: '#000000',
          strokeWidth: 2,
        });
        break;
      case 'star':
        const starPoints = [];
        const outerRadius = 40;
        const innerRadius = 20;
        const points = 5;
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * 2 * i) / (points * 2);
          const x = 100 + radius * Math.cos(angle);
          const y = 100 + radius * Math.sin(angle);
          starPoints.push({ x, y });
        }
        shape = new fabric.Polygon(starPoints, {
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 2,
        });
        break;
      case 'heart':
        const heartPath = 'M 100,100 Q 80,70 50,70 Q 20,70 20,100 Q 20,130 50,160 Q 80,190 100,200 Q 120,190 150,160 Q 180,130 180,100 Q 180,70 150,70 Q 120,70 100,100 Z';
        shape = new fabric.Path(heartPath, {
          left: 100,
          top: 100,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 2,
          scaleX: 0.3,
          scaleY: 0.3,
        });
        break;
      default:
        return;
    }
    
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    saveToHistory();
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && canvas) {
        const reader = new FileReader();
        reader.onload = (event) => {
          fabric.Image.fromURL(event.target?.result as string).then((img: any) => {
            img.scaleToWidth(150);
            img.set({ left: 100, top: 100 });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            saveToHistory();
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const applyTemplate = (template: any) => {
    if (!canvas) return;
    
    canvas.setBackgroundColor(template.bgColor, () => {
      canvas.renderAll();
    });
    
    // Update border color of existing border elements
    canvas.getObjects().forEach((obj: any) => {
      if (obj.type === 'rect' && obj.left === 20 && obj.top === 20) {
        obj.set('stroke', template.borderColor);
      }
      if (obj.type === 'textbox' && obj.text === 'CERTIFICATE') {
        obj.set('fill', template.borderColor);
      }
    });
    
    canvas.renderAll();
    saveToHistory();
  };

  const deleteSelected = () => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
    saveToHistory();
  };

  const duplicateSelected = async () => {
    if (!canvas || !selectedObject) return;
    const cloned = await selectedObject.clone();
    cloned.set({
      left: (cloned.left || 0) + 20,
      top: (cloned.top || 0) + 20,
    });
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.renderAll();
    saveToHistory();
  };

  const handleSave = async () => {
    if (!canvas) return;
    
    const elements: any[] = [];
    canvas.getObjects().forEach((obj: any, index: number) => {
      if (obj.type === 'textbox') {
        elements.push({
          id: `text_${index}`,
          type: 'text',
          content: obj.text || '',
          left: obj.left,
          top: obj.top,
          fontSize: obj.fontSize,
          fontFamily: obj.fontFamily,
          fontWeight: obj.fontWeight,
          fill: obj.fill,
          width: obj.width,
          textAlign: obj.textAlign,
        });
      } else if (obj.type === 'rect') {
        elements.push({
          id: `rect_${index}`,
          type: 'rectangle',
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height,
          fill: obj.fill,
          stroke: obj.stroke,
        });
      } else if (obj.type === 'circle') {
        elements.push({
          id: `circle_${index}`,
          type: 'circle',
          left: obj.left,
          top: obj.top,
          radius: obj.radius,
          fill: obj.fill,
          stroke: obj.stroke,
        });
      }
    });
    
    const canvasDataURL = canvas.toDataURL();
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('certificate_templates')
      .insert([{
        name: templateName,
        description: 'Created with Certificate Creator',
        background_url: canvasDataURL,
        background_type: 'image',
        width: pageSize.width,
        height: pageSize.height,
        fields: elements,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select();
      
    if (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    } else {
      alert('Template saved successfully!');
      router.push('/admin/certificates');
    }
  };

  const handleDownload = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const handleZoomIn = () => {
    if (!canvas) return;
    const newZoom = Math.min(zoom + 0.1, 3);
    setZoom(newZoom);
    canvas.setZoom(newZoom);
    canvas.renderAll();
  };

  const handleZoomOut = () => {
    if (!canvas) return;
    const newZoom = Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);
    canvas.setZoom(newZoom);
    canvas.renderAll();
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
    if (canvas) {
      // Remove existing grid lines
      canvas.getObjects().forEach((obj: any) => {
        if (obj.data?.isGrid) {
          canvas.remove(obj);
        }
      });
      if (!showGrid) {
        addGrid(canvas);
      }
    }
  };

  if (!fabricLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Certificate Creator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Toolbar */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/certificates')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="text-xl font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-1"
          />
          <div className="h-6 w-px bg-gray-300"></div>
          
          {/* Text Formatting Tools */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
              className={`p-2 rounded-lg ${fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
              className={`p-2 rounded-lg ${fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Underline className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-gray-300"></div>
          
          {/* Alignment Tools */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTextAlign('left')}
              className={`p-2 rounded-lg ${textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTextAlign('center')}
              className={`p-2 rounded-lg ${textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTextAlign('right')}
              className={`p-2 rounded-lg ${textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-gray-300"></div>
          
          {/* Font Controls */}
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>
          
          <select
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-20"
          >
            <option value="12">12</option>
            <option value="14">14</option>
            <option value="16">16</option>
            <option value="18">18</option>
            <option value="24">24</option>
            <option value="32">32</option>
            <option value="48">48</option>
            <option value="64">64</option>
          </select>
          
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center"
              style={{ backgroundColor: color }}
            />
            {showColorPicker && (
              <div className="absolute z-10 mt-2">
                <ChromePicker
                  color={color}
                  onChange={(newColor) => {
                    setColor(newColor.hex);
                    if (selectedObject) {
                      selectedObject.set('fill', newColor.hex);
                      canvas?.renderAll();
                      saveToHistory();
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={toggleGrid}
            className={`p-2 rounded-lg ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Template
          </button>
        </div>
      </div>
      
      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar - Elements */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900 mb-3">Elements</h3>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={addText}
                className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center gap-1"
              >
                <Type className="w-5 h-5" />
                <span className="text-xs">Text</span>
              </button>
              <button
                onClick={addImage}
                className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center gap-1"
              >
                <Image className="w-5 h-5" />
                <span className="text-xs">Image</span>
              </button>
              <button
                onClick={() => addShape('rectangle')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center gap-1"
              >
                <Square className="w-5 h-5" />
                <span className="text-xs">Rect</span>
              </button>
              <button
                onClick={() => addShape('circle')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center gap-1"
              >
                <Circle className="w-5 h-5" />
                <span className="text-xs">Circle</span>
              </button>
              <button
                onClick={() => addShape('line')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center gap-1"
              >
                <Minus className="w-5 h-5" />
                <span className="text-xs">Line</span>
              </button>
              <button
                onClick={() => addShape('star')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center gap-1"
              >
                <Star className="w-5 h-5" />
                <span className="text-xs">Star</span>
              </button>
              <button
                onClick={() => addShape('heart')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center gap-1"
              >
                <Heart className="w-5 h-5" />
                <span className="text-xs">Heart</span>
              </button>
            </div>
          </div>
          
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900 mb-3">Templates</h3>
            <div className="grid grid-cols-2 gap-2">
              {certificateTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => applyTemplate(template)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
                >
                  <div
                    className="h-16 rounded-lg mb-2"
                    style={{ backgroundColor: template.bgColor, border: `2px solid ${template.borderColor}` }}
                  />
                  <span className="text-xs font-medium">{template.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Dynamic Fields</h3>
            <p className="text-xs text-gray-500 mb-3">
              Use these placeholders to auto-fill participant data
            </p>
            <div className="space-y-2">
              {dynamicFields.map((field) => {
                const Icon = field.icon;
                return (
                  <button
                    key={field.value}
                    onClick={() => {
                      if (!canvas) return;
                      const text = new fabric.Textbox(field.value, {
                        left: 100,
                        top: 100,
                        fontSize: 16,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        width: 200,
                        backgroundColor: 'rgba(255,255,0,0.1)',
                        stroke: '#ff0000',
                        strokeWidth: 1,
                      });
                      canvas.add(text);
                      canvas.setActiveObject(text);
                      canvas.renderAll();
                      saveToHistory();
                    }}
                    className="w-full text-left p-2 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span>{field.label}</span>
                    <span className="text-xs text-gray-400 ml-auto">{field.value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 p-8 overflow-auto bg-gray-100 flex items-center justify-center"
        >
          <div className="relative bg-white shadow-2xl rounded-lg">
            <canvas
              ref={canvasRef}
              width={pageSize.width}
              height={pageSize.height}
              className="border border-gray-200"
            />
          </div>
        </div>
        
        {/* Right Panel - Properties */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          {selectedObject ? (
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">Properties</h3>
              
              {/* Position */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">X</label>
                    <input
                      type="number"
                      value={Math.round(selectedObject.left || 0)}
                      onChange={(e) => {
                        selectedObject.set('left', parseInt(e.target.value));
                        canvas?.renderAll();
                        saveToHistory();
                      }}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Y</label>
                    <input
                      type="number"
                      value={Math.round(selectedObject.top || 0)}
                      onChange={(e) => {
                        selectedObject.set('top', parseInt(e.target.value));
                        canvas?.renderAll();
                        saveToHistory();
                      }}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                </div>
              </div>
              
              {/* Size */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Width</label>
                    <input
                      type="number"
                      value={Math.round(selectedObject.getScaledWidth())}
                      onChange={(e) => {
                        const newWidth = parseInt(e.target.value);
                        const scale = newWidth / selectedObject.getScaledWidth();
                        selectedObject.scaleX = (selectedObject.scaleX || 1) * scale;
                        canvas?.renderAll();
                        saveToHistory();
                      }}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Height</label>
                    <input
                      type="number"
                      value={Math.round(selectedObject.getScaledHeight())}
                      onChange={(e) => {
                        const newHeight = parseInt(e.target.value);
                        const scale = newHeight / selectedObject.getScaledHeight();
                        selectedObject.scaleY = (selectedObject.scaleY || 1) * scale;
                        canvas?.renderAll();
                        saveToHistory();
                      }}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                </div>
              </div>
              
              {/* Rotation */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">Rotation: {Math.round(selectedObject.angle || 0)}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={selectedObject.angle || 0}
                  onChange={(e) => {
                    selectedObject.set('angle', parseInt(e.target.value));
                    canvas?.renderAll();
                    saveToHistory();
                  }}
                  className="w-full"
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={duplicateSelected}
                  className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={deleteSelected}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Move className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Select an element to edit its properties</p>
              <p className="text-xs mt-2">Click on any text, shape, or image to customize it</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bg-white border-t px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Page: {pageSize.width} x {pageSize.height}</span>
          <span>Elements: {canvas?.getObjects().length || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Dynamic fields highlighted in red</span>
        </div>
      </div>
    </div>
  );
}