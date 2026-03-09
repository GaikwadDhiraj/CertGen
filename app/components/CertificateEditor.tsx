'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { ChromePicker } from 'react-color';
import { 
  Type, Image as ImageIcon, Square, Circle, Minus,
  Trash2, Save, Download, Upload, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, Layers,
  MoveUp, MoveDown, Copy, Undo, Redo,
  Eye, EyeOff, Lock, Unlock, ZoomIn, ZoomOut,
  Maximize2, Minimize2, Grid, Grid3X3, MousePointer,
  Palette, Sparkles, FileText, User, Calendar, Award,
  AlignJustify, Underline, ChevronLeft, ChevronRight,
  Plus, Search, Settings, Sun, Moon, Star, Heart,
  MoreHorizontal, X, Check, ArrowLeft, ArrowRight,
  RotateCw, FlipHorizontal, FlipVertical, Crop,
  Play, Pause, Volume2, VolumeX, Hash, Link,
  Mail, Phone, MapPin, Globe, Clock, Users,
  DownloadCloud, Share2, Printer, Bookmark,
  ThumbsUp, MessageCircle, Copy as CopyIcon,
  Scissors, Bold as BoldIcon, Italic as ItalicIcon,
  Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Indent, Outdent,
  AlignLeft as AlignLeftIcon, AlignCenter as AlignCenterIcon,
  AlignRight as AlignRightIcon, AlignJustify as AlignJustifyIcon
} from 'lucide-react';
import { CertificateElement } from '@/types/event';

interface CertificateEditorProps {
  eventId: number;
  eventName: string;
  onSave: (elements: CertificateElement[], backgroundUrl: string) => void;
  initialElements?: CertificateElement[];
  initialBackgroundUrl?: string;
}

export default function CertificateEditor({ 
  eventId, 
  eventName, 
  onSave,
  initialElements = [],
  initialBackgroundUrl = ''
}: CertificateEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | undefined>(undefined);
  const [backgroundUrl, setBackgroundUrl] = useState(initialBackgroundUrl);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [color, setColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textContent, setTextContent] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [activeTab, setActiveTab] = useState<'text' | 'elements' | 'background' | 'upload'>('text');
  const [showEffects, setShowEffects] = useState(false);
  const [showAnimate, setShowAnimate] = useState(false);
  const [showPosition, setShowPosition] = useState(false);
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [textDecoration, setTextDecoration] = useState<'none' | 'underline' | 'line-through'>('none');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [elementsList, setElementsList] = useState<any[]>([]);
  const [showElementsPanel, setShowElementsPanel] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Text templates
  const textTemplates = [
    { text: 'Certificate of Achievement', font: 'Arial', size: 36, weight: 'bold' },
    { text: 'Certificate of Appreciation', font: 'Arial', size: 36, weight: 'bold' },
    { text: 'This certificate is awarded to', font: 'Arial', size: 18 },
    { text: '{{name}}', font: 'Times New Roman', size: 48, weight: 'bold' },
    { text: 'For successfully completing', font: 'Arial', size: 20 },
    { text: '{{event}}', font: 'Arial', size: 30, weight: 'bold' },
    { text: 'Date: {{date}}', font: 'Arial', size: 16 },
    { text: 'Director', font: 'Arial', size: 14 },
    { text: 'Manager', font: 'Arial', size: 14 },
  ];

  // Element templates
  const elementTemplates = [
    { type: 'line', icon: Minus, label: 'Line' },
    { type: 'rectangle', icon: Square, label: 'Rectangle' },
    { type: 'circle', icon: Circle, label: 'Circle' },
    { type: 'star', icon: Star, label: 'Star' },
    { type: 'heart', icon: Heart, label: 'Heart' },
  ];

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 500,
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true,
      });
      
      fabricCanvasRef.current = fabricCanvas;
      setCanvas(fabricCanvas);

      // Load initial background if exists
      if (initialBackgroundUrl) {
        setTimeout(() => {
          loadBackground(initialBackgroundUrl);
        }, 100);
      }

      // Load initial elements or add sample
      if (initialElements.length > 0) {
        setTimeout(() => {
          loadElements(initialElements);
        }, 200);
      } else {
        setTimeout(() => {
          addSampleCertificate();
        }, 200);
      }

      // Add event listeners
      fabricCanvas.on('selection:created', handleSelection);
      fabricCanvas.on('selection:updated', handleSelection);
      fabricCanvas.on('selection:cleared', handleDeselection);
      fabricCanvas.on('object:modified', saveToHistory);
      fabricCanvas.on('object:added', saveToHistory);
      fabricCanvas.on('object:removed', saveToHistory);

      setTimeout(() => saveToHistory(), 300);
      setTimeout(() => updateElementsList(), 300);
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Update selected object properties
  useEffect(() => {
    if (selectedObject && canvas) {
      if (selectedObject.type === 'textbox') {
        const textObject = selectedObject as fabric.Textbox;
        setFontSize(textObject.fontSize || 24);
        setFontFamily(textObject.fontFamily || 'Arial');
        setColor(textObject.fill?.toString() || '#000000');
        setTextContent(textObject.text || '');
        setFontWeight(textObject.fontWeight === 'bold' ? 'bold' : 'normal');
        setFontStyle(textObject.fontStyle === 'italic' ? 'italic' : 'normal');
        setTextAlign((textObject.textAlign as any) || 'left');
      } else {
        setColor(selectedObject.fill?.toString() || '#000000');
      }
    }
  }, [selectedObject]);

  const handleSelection = (e: any) => {
    if (e?.selected && e.selected.length > 0) {
      setSelectedObject(e.selected[0]);
    }
  };

  const handleDeselection = () => {
    setSelectedObject(undefined);
    setTextContent('');
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
      canvas.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
        updateElementsList();
      });
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && canvas) {
      const newIndex = historyIndex + 1;
      canvas.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
        updateElementsList();
      });
      setHistoryIndex(newIndex);
    }
  };

  const updateElementsList = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    setElementsList(objects);
  };

  const loadBackground = (url: string) => {
    if (!canvas) return;
    
    fabric.Image.fromURL(url).then((img) => {
      const scale = Math.min(
        (canvas.width || 800) / (img.width || 1),
        (canvas.height || 500) / (img.height || 1)
      );
      
      img.scale(scale);
      img.set({
        left: ((canvas.width || 800) - img.getScaledWidth()) / 2,
        top: ((canvas.height || 500) - img.getScaledHeight()) / 2,
      });
      
      canvas.backgroundImage = img;
      canvas.backgroundColor = '';
      canvas.renderAll();
    }).catch(console.error);
  };

  const addSampleCertificate = () => {
    if (!canvas) return;

    // Add Dream Avenue title
    const title = new fabric.Textbox('Dream Avenue', {
      left: 50,
      top: 30,
      width: 700,
      fontSize: 32,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#000000',
      textAlign: 'left',
    });
    canvas.add(title);

    // Add Certificate text
    const certText = new fabric.Textbox('Certificate', {
      left: 50,
      top: 100,
      width: 700,
      fontSize: 48,
      fontFamily: 'Times New Roman',
      fontWeight: 'bold',
      fill: '#000000',
      textAlign: 'center',
    });
    canvas.add(certText);

    // Add OF APPRECIATION
    const subText = new fabric.Textbox('OF APPRECIATION', {
      left: 50,
      top: 160,
      width: 700,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#666666',
      textAlign: 'center',
    });
    canvas.add(subText);

    // Add "This Certificate is going to:"
    const toText = new fabric.Textbox('This Certificate is going to:', {
      left: 50,
      top: 220,
      width: 700,
      fontSize: 18,
      fontFamily: 'Arial',
      fill: '#333333',
      textAlign: 'center',
    });
    canvas.add(toText);

    // Add name placeholder
    const nameText = new fabric.Textbox('{{name}}', {
      left: 50,
      top: 260,
      width: 700,
      fontSize: 36,
      fontFamily: 'Times New Roman',
      fontWeight: 'bold',
      fill: '#000000',
      textAlign: 'center',
    });
    canvas.add(nameText);

    // Add course text
    const courseText = new fabric.Textbox('for completing the online real estate course', {
      left: 50,
      top: 320,
      width: 700,
      fontSize: 18,
      fontFamily: 'Arial',
      fill: '#333333',
      textAlign: 'center',
    });
    canvas.add(courseText);

    // Add OLIVIA WILSON signature
    const signature1 = new fabric.Textbox('OLIVIA WILSON', {
      left: 100,
      top: 380,
      width: 200,
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#000000',
      textAlign: 'left',
    });
    canvas.add(signature1);

    const directorText = new fabric.Textbox('Director', {
      left: 100,
      top: 400,
      width: 200,
      fontSize: 14,
      fontFamily: 'Arial',
      fill: '#666666',
      textAlign: 'left',
    });
    canvas.add(directorText);

    // Add ISABEL MENDADO signature
    const signature2 = new fabric.Textbox('ISABEL MENDADO', {
      left: 500,
      top: 380,
      width: 200,
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#000000',
      textAlign: 'right',
    });
    canvas.add(signature2);

    const managerText = new fabric.Textbox('Manager', {
      left: 500,
      top: 400,
      width: 200,
      fontSize: 14,
      fontFamily: 'Arial',
      fill: '#666666',
      textAlign: 'right',
    });
    canvas.add(managerText);

    canvas.renderAll();
  };

  const loadElements = (elements: CertificateElement[]) => {
    if (!canvas) return;
    
    canvas.clear();
    
    elements.forEach(element => {
      switch (element.type) {
        case 'text':
          const text = new fabric.Textbox(element.content || 'Edit Text', {
            left: element.left,
            top: element.top,
            fontSize: element.fontSize || 24,
            fontFamily: element.fontFamily || 'Arial',
            fontWeight: element.fontWeight || 'normal',
            fill: element.fill || '#000000',
            width: element.width || 200,
            angle: element.angle || 0,
            scaleX: element.scaleX || 1,
            scaleY: element.scaleY || 1,
            textAlign: element.textAlign || 'left',
          });
          canvas.add(text);
          break;
          
        case 'rectangle':
          const rect = new fabric.Rect({
            left: element.left,
            top: element.top,
            width: element.width || 100,
            height: element.height || 60,
            fill: element.fill || '#000000',
            angle: element.angle || 0,
            scaleX: element.scaleX || 1,
            scaleY: element.scaleY || 1,
          });
          canvas.add(rect);
          break;
          
        case 'circle':
          const circle = new fabric.Circle({
            left: element.left,
            top: element.top,
            radius: (element.width || 50) / 2,
            fill: element.fill || '#000000',
            angle: element.angle || 0,
            scaleX: element.scaleX || 1,
            scaleY: element.scaleY || 1,
          });
          canvas.add(circle);
          break;
          
        case 'line':
          const line = new fabric.Line([
            element.left || 0, 
            element.top || 0, 
            (element.left || 0) + (element.width || 100), 
            (element.top || 0)
          ], {
            stroke: element.fill || '#000000',
            strokeWidth: 2,
            angle: element.angle || 0,
            scaleX: element.scaleX || 1,
            scaleY: element.scaleY || 1,
          });
          canvas.add(line);
          break;
      }
    });
    
    canvas.renderAll();
    saveToHistory();
    updateElementsList();
  };

  const addText = (template?: any) => {
    if (!canvas) return;
    
    const text = new fabric.Textbox(template?.text || 'Edit Text', {
      left: 100,
      top: 100,
      fontSize: template?.size || 24,
      fontFamily: template?.font || 'Arial',
      fontWeight: template?.weight || 'normal',
      fill: '#000000',
      width: 300,
      textAlign: 'left',
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveToHistory();
    updateElementsList();
  };

  const addElement = (type: string) => {
    if (!canvas) return;
    
    switch(type) {
      case 'line':
        const line = new fabric.Line([100, 100, 200, 100], {
          stroke: '#000000',
          strokeWidth: 2,
        });
        canvas.add(line);
        canvas.setActiveObject(line);
        break;
        
      case 'rectangle':
        const rect = new fabric.Rect({
          left: 100,
          top: 100,
          width: 100,
          height: 60,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 1,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        break;
        
      case 'circle':
        const circle = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 30,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 1,
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
        break;
        
      case 'star':
        // Simple star approximation using polygon
        const star = new fabric.Polygon([
          { x: 100, y: 0 },
          { x: 122, y: 38 },
          { x: 167, y: 44 },
          { x: 134, y: 75 },
          { x: 142, y: 120 },
          { x: 100, y: 99 },
          { x: 58, y: 120 },
          { x: 66, y: 75 },
          { x: 33, y: 44 },
          { x: 78, y: 38 }
        ], {
          left: 100,
          top: 100,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 1,
        });
        canvas.add(star);
        canvas.setActiveObject(star);
        break;
        
      case 'heart':
        // Simple heart approximation
        const heart = new fabric.Path('M 100,100 Q 80,70 50,70 Q 20,70 20,100 Q 20,130 50,160 Q 80,190 100,200 Q 120,190 150,160 Q 180,130 180,100 Q 180,70 150,70 Q 120,70 100,100 Z', {
          left: 100,
          top: 100,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 1,
        });
        canvas.add(heart);
        canvas.setActiveObject(heart);
        break;
    }
    
    canvas.renderAll();
    saveToHistory();
    updateElementsList();
  };

  const addImage = () => {
    if (!canvas) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          fabric.Image.fromURL(event.target?.result as string).then((img) => {
            img.scaleToWidth(150);
            img.set({ left: 100, top: 100 });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            saveToHistory();
            updateElementsList();
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const deleteSelected = () => {
    if (!canvas) return;
    
    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach(obj => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
    saveToHistory();
    updateElementsList();
    setSelectedObject(undefined);
  };

  const duplicateSelected = async () => {
    if (!canvas || !selectedObject) return;
    
    try {
      const cloned = await selectedObject.clone();
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      saveToHistory();
      updateElementsList();
    } catch (error) {
      console.error('Error duplicating object:', error);
    }
  };

  const updateTextContent = () => {
    if (!canvas || !selectedObject || selectedObject.type !== 'textbox') return;
    
    const textObject = selectedObject as fabric.Textbox;
    textObject.set('text', textContent);
    canvas.renderAll();
    saveToHistory();
  };

  const updateFontSize = (size: number) => {
    if (!canvas || !selectedObject || selectedObject.type !== 'textbox') return;
    
    const textObject = selectedObject as fabric.Textbox;
    textObject.set('fontSize', size);
    canvas.renderAll();
    saveToHistory();
  };

  const updateFontFamily = (family: string) => {
    if (!canvas || !selectedObject || selectedObject.type !== 'textbox') return;
    
    const textObject = selectedObject as fabric.Textbox;
    textObject.set('fontFamily', family);
    canvas.renderAll();
    saveToHistory();
  };

  const updateColor = (newColor: string) => {
    if (!canvas || !selectedObject) return;
    
    if (selectedObject.type === 'textbox' || selectedObject.type === 'rect' || selectedObject.type === 'circle') {
      selectedObject.set('fill', newColor);
    } else if (selectedObject.type === 'line' || selectedObject.type === 'path') {
      selectedObject.set('stroke', newColor);
    }
    canvas.renderAll();
    saveToHistory();
  };

  const toggleBold = () => {
    if (!canvas || !selectedObject || selectedObject.type !== 'textbox') return;
    
    const newWeight = fontWeight === 'bold' ? 'normal' : 'bold';
    setFontWeight(newWeight);
    (selectedObject as fabric.Textbox).set('fontWeight', newWeight);
    canvas.renderAll();
    saveToHistory();
  };

  const toggleItalic = () => {
    if (!canvas || !selectedObject || selectedObject.type !== 'textbox') return;
    
    const newStyle = fontStyle === 'italic' ? 'normal' : 'italic';
    setFontStyle(newStyle);
    (selectedObject as fabric.Textbox).set('fontStyle', newStyle);
    canvas.renderAll();
    saveToHistory();
  };

  const toggleUnderline = () => {
    if (!canvas || !selectedObject || selectedObject.type !== 'textbox') return;
    
    const newDecoration = textDecoration === 'underline' ? 'none' : 'underline';
    setTextDecoration(newDecoration);
    (selectedObject as fabric.Textbox).set('underline', newDecoration === 'underline');
    canvas.renderAll();
    saveToHistory();
  };

  const updateTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (!canvas || !selectedObject || selectedObject.type !== 'textbox') return;
    
    setTextAlign(align);
    (selectedObject as fabric.Textbox).set('textAlign', align);
    canvas.renderAll();
    saveToHistory();
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

  const handleSave = () => {
    if (!canvas) return;
    
    const elements: CertificateElement[] = [];
    canvas.getObjects().forEach((obj, index) => {
      if (obj.type === 'textbox') {
        const textObj = obj as fabric.Textbox;
        elements.push({
          id: `text_${index}_${Date.now()}`,
          type: 'text',
          content: textObj.text || '',
          left: textObj.left || 0,
          top: textObj.top || 0,
          fontSize: textObj.fontSize,
          fontFamily: textObj.fontFamily,
          fontWeight: textObj.fontWeight as string,
          fill: textObj.fill?.toString() || '#000000',
          width: textObj.width,
          height: textObj.height,
          angle: textObj.angle,
          scaleX: textObj.scaleX,
          scaleY: textObj.scaleY,
          textAlign: textObj.textAlign as any,
        });
      } else if (obj.type === 'rect') {
        const rectObj = obj as fabric.Rect;
        elements.push({
          id: `rect_${index}_${Date.now()}`,
          type: 'rectangle',
          content: '',
          left: rectObj.left || 0,
          top: rectObj.top || 0,
          width: rectObj.width,
          height: rectObj.height,
          fill: rectObj.fill?.toString() || '#000000',
          angle: rectObj.angle,
          scaleX: rectObj.scaleX,
          scaleY: rectObj.scaleY,
        });
      } else if (obj.type === 'circle') {
        const circleObj = obj as fabric.Circle;
        elements.push({
          id: `circle_${index}_${Date.now()}`,
          type: 'circle',
          content: '',
          left: circleObj.left || 0,
          top: circleObj.top || 0,
          width: (circleObj.radius || 0) * 2,
          height: (circleObj.radius || 0) * 2,
          fill: circleObj.fill?.toString() || '#000000',
          angle: circleObj.angle,
          scaleX: circleObj.scaleX,
          scaleY: circleObj.scaleY,
        });
      } else if (obj.type === 'line') {
        const lineObj = obj as fabric.Line;
        elements.push({
          id: `line_${index}_${Date.now()}`,
          type: 'line',
          content: '',
          left: lineObj.left || 0,
          top: lineObj.top || 0,
          width: Math.abs((lineObj.x2 || 0) - (lineObj.x1 || 0)),
          height: 1,
          fill: lineObj.stroke?.toString() || '#000000',
          angle: lineObj.angle,
          scaleX: lineObj.scaleX,
          scaleY: lineObj.scaleY,
        });
      } else if (obj.type === 'path') {
        elements.push({
          id: `shape_${index}_${Date.now()}`,
          type: 'rectangle', // Default to rectangle for custom shapes
          content: '',
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 50,
          height: obj.height || 50,
          fill: obj.fill?.toString() || '#000000',
          angle: obj.angle,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
        });
      }
    });
    
    onSave(elements, backgroundUrl);
    alert('Template saved successfully!');
  };

  const handleDownload = () => {
    if (!canvas) return;
    
    canvas.discardActiveObject();
    canvas.renderAll();
    
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `certificate-${eventName.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.click();
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canvas) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setBackgroundUrl(url);
        loadBackground(url);
        saveToHistory();
      };
      reader.readAsDataURL(file);
    }
  };

  const addPage = () => {
    setPageCount(prev => prev + 1);
    // In a real app, you'd create a new canvas or page
    alert('New page added! In a full implementation, this would create a multi-page certificate.');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Toolbar - Like in the image */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">Dream Avenue</h1>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bold className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Italic className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Underline className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Strikethrough className="w-5 h-5" />
            </button>
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <AlignLeft className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <AlignCenter className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <AlignRight className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <AlignJustify className="w-5 h-5" />
            </button>
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
            <option>Arial</option>
            <option>Times New Roman</option>
            <option>Courier New</option>
            <option>Georgia</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-20">
            <option>24</option>
            <option>18</option>
            <option>12</option>
            <option>36</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Share
          </button>
        </div>
      </div>

      {/* Second Toolbar - Effects, Animate, Position */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-6">
        <button 
          onClick={() => setShowEffects(!showEffects)}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${showEffects ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
        >
          <Sparkles className="w-4 h-4" />
          Effects
        </button>
        <button 
          onClick={() => setShowAnimate(!showAnimate)}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${showAnimate ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
        >
          <Play className="w-4 h-4" />
          Animate
        </button>
        <button 
          onClick={() => setShowPosition(!showPosition)}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${showPosition ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
        >
          <MoveUp className="w-4 h-4" />
          Position
        </button>
      </div>

      {/* Main Editor Area - 3 Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tabs (Text, Elements, Background, Upload) */}
        <div className="w-72 bg-white border-r flex flex-col">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'text' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Text
            </button>
            <button
              onClick={() => setActiveTab('elements')}
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'elements' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Elements
            </button>
            <button
              onClick={() => setActiveTab('background')}
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'background' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Background
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Upload
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'text' && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Add Text</h3>
                <div className="space-y-2">
                  {textTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => addText(template)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="text-sm font-medium" style={{ fontFamily: template.font, fontSize: template.size * 0.5 }}>
                        {template.text}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{template.font}, {template.size}px</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'elements' && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Shapes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {elementTemplates.map((element, index) => {
                    const Icon = element.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => addElement(element.type)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center gap-2"
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs">{element.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                <h3 className="font-medium text-gray-900 mt-4">Lines</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => addElement('line')}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Minus className="w-5 h-5" />
                    <span>Straight Line</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Background Color</h3>
                <div className="grid grid-cols-5 gap-2">
                  {['#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0'].map((bgColor, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (canvas) {
                          canvas.backgroundColor = bgColor;
                          canvas.backgroundImage = undefined;
                          canvas.renderAll();
                          saveToHistory();
                        }
                      }}
                      className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-blue-500"
                      style={{ backgroundColor: bgColor }}
                    />
                  ))}
                </div>
                
                <h3 className="font-medium text-gray-900 mt-4">Background Images</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const input = document.getElementById('bg-upload') as HTMLInputElement;
                      input.click();
                    }}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">Upload Image</span>
                  </button>
                  <input
                    id="bg-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Upload Images</h3>
                <button
                  onClick={addImage}
                  className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload images</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center - Canvas Area */}
        <div 
          ref={containerRef}
          className="flex-1 p-8 overflow-auto bg-gray-100 flex items-center justify-center"
        >
          <div className="relative">
            <div className="bg-white rounded-lg shadow-2xl">
              <canvas 
                ref={canvasRef} 
                className="border border-gray-200"
                style={{ width: 800, height: 500 }}
              />
            </div>
            
            {/* Page Navigation - Like in the image */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white rounded-lg shadow-lg px-3 py-2">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium">Page {currentPage} of {pageCount}</span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-gray-300 mx-1"></div>
              <button 
                onClick={addPage}
                className="p-1 hover:bg-gray-100 rounded flex items-center gap-1 text-sm text-blue-600"
              >
                <Plus className="w-4 h-4" />
                Add page
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          {selectedObject ? (
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">Properties</h3>
              
              {selectedObject.type === 'textbox' && (
                <>
                  {/* Text Content */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Text</label>
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      onBlur={updateTextContent}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Font Family */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Font</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => updateFontFamily(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Helvetica">Helvetica</option>
                    </select>
                  </div>

                  {/* Font Size */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Size: {fontSize}px</label>
                    <input
                      type="range"
                      min="8"
                      max="120"
                      value={fontSize}
                      onChange={(e) => updateFontSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Text Style */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Style</label>
                    <div className="flex gap-2">
                      <button
                        onClick={toggleBold}
                        className={`p-2 rounded-lg ${fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        onClick={toggleItalic}
                        className={`p-2 rounded-lg ${fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        onClick={toggleUnderline}
                        className={`p-2 rounded-lg ${textDecoration === 'underline' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Alignment */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Alignment</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateTextAlign('left')}
                        className={`p-2 rounded-lg ${textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateTextAlign('center')}
                        className={`p-2 rounded-lg ${textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateTextAlign('right')}
                        className={`p-2 rounded-lg ${textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateTextAlign('justify')}
                        className={`p-2 rounded-lg ${textAlign === 'justify' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <AlignJustify className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Color Picker */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">Color</label>
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-full h-10 rounded-lg border border-gray-300 flex items-center justify-between px-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded border" style={{ backgroundColor: color }} />
                      <span className="text-sm">{color}</span>
                    </div>
                  </button>
                  
                  {showColorPicker && (
                    <div className="absolute z-10 mt-2">
                      <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                      <ChromePicker
                        color={color}
                        onChange={(newColor) => {
                          setColor(newColor.hex);
                          updateColor(newColor.hex);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

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
                        selectedObject.set('left', parseInt(e.target.value) || 0);
                        canvas?.renderAll();
                        saveToHistory();
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Y</label>
                    <input
                      type="number"
                      value={Math.round(selectedObject.top || 0)}
                      onChange={(e) => {
                        selectedObject.set('top', parseInt(e.target.value) || 0);
                        canvas?.renderAll();
                        saveToHistory();
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Size */}
              {(selectedObject.type === 'textbox' || selectedObject.type === 'rect' || selectedObject.type === 'circle') && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-2">Size</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Width</label>
                      <input
                        type="number"
                        value={Math.round(selectedObject.getScaledWidth())}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value) || 1;
                          const scale = newWidth / selectedObject.getScaledWidth();
                          selectedObject.scaleX = (selectedObject.scaleX || 1) * scale;
                          canvas?.renderAll();
                          saveToHistory();
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Height</label>
                      <input
                        type="number"
                        value={Math.round(selectedObject.getScaledHeight())}
                        onChange={(e) => {
                          const newHeight = parseInt(e.target.value) || 1;
                          const scale = newHeight / selectedObject.getScaledHeight();
                          selectedObject.scaleY = (selectedObject.scaleY || 1) * scale;
                          canvas?.renderAll();
                          saveToHistory();
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

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
              <MousePointer className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Select an element to edit its properties</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-white border-t px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <button onClick={undo} className="p-1 hover:bg-gray-100 rounded" title="Undo">
            <Undo className="w-4 h-4" />
          </button>
          <button onClick={redo} className="p-1 hover:bg-gray-100 rounded" title="Redo">
            <Redo className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-gray-300"></div>
          <button onClick={handleZoomOut} className="p-1 hover:bg-gray-100 rounded">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="p-1 hover:bg-gray-100 rounded">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Save
          </button>
          <button onClick={handleDownload} className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Download
          </button>
        </div>
      </div>
    </div>
  );
}