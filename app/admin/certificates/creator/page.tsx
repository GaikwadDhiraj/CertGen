// app/admin/certificates/creator/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Download, Undo, Redo, ZoomIn, ZoomOut,
  Type, Image, Square, Circle, Minus, Star, Heart,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Trash2, Copy, Move, Layers, Grid, Eye, EyeOff,
  Plus, X, Upload, Sparkles, Palette, Play, MoveUp,
  Maximize2, Minimize2, ChevronLeft, ChevronRight,
  Menu, PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen,
  FileText, User, Calendar, Award, Mail, MapPin, Clock, Hash,
  AlignJustify, Highlighter, Link, RotateCw, FlipHorizontal, FlipVertical,
  Crop, Scissors, PenTool, Brush, CircleDot, Triangle, Hexagon, 
  Pentagon, Cloud, Sun, Moon, Music, Zap, Flag, Shield, 
  Gift, Coffee, HeartHandshake, Sparkle, Crown, Diamond
} from 'lucide-react';
import { ChromePicker } from 'react-color';
import { supabase } from '@/lib/supabaseClient';

let fabric: any;

// Available font families
const fontFamilies = [
  'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 
  'Helvetica', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black',
  'Palatino Linotype', 'Book Antiqua', 'Tahoma', 'Century Gothic',
  'Franklin Gothic Medium', 'Lucida Sans', 'Segoe UI', 'Roboto', 'Open Sans'
];

// Google Fonts (will be loaded dynamically)
const googleFonts = [
  'Poppins', 'Montserrat', 'Lato', 'Raleway', 'Oswald', 'Nunito', 'Playfair Display',
  'Merriweather', 'Source Sans Pro', 'Roboto Slab', 'Pacifico', 'Dancing Script',
  'Great Vibes', 'Cormorant Garamond', 'Josefin Sans', 'Quicksand', 'Comfortaa'
];

// Rich elements library
const elementCategories = {
  basic: [
    { type: 'rectangle', name: 'Rectangle', icon: Square, color: '#3b82f6' },
    { type: 'circle', name: 'Circle', icon: Circle, color: '#ef4444' },
    { type: 'triangle', name: 'Triangle', icon: Triangle, color: '#10b981' },
    { type: 'hexagon', name: 'Hexagon', icon: Hexagon, color: '#8b5cf6' },
    { type: 'pentagon', name: 'Pentagon', icon: Pentagon, color: '#f59e0b' },
    { type: 'line', name: 'Line', icon: Minus, color: '#6b7280' },
  ],
  decorative: [
    { type: 'star', name: 'Star', icon: Star, color: '#fbbf24' },
    { type: 'heart', name: 'Heart', icon: Heart, color: '#ec4899' },
    { type: 'crown', name: 'Crown', icon: Crown, color: '#eab308' },
    { type: 'diamond', name: 'Diamond', icon: Diamond, color: '#06b6d4' },
    { type: 'sparkle', name: 'Sparkle', icon: Sparkle, color: '#f97316' },
    { type: 'cloud', name: 'Cloud', icon: Cloud, color: '#9ca3af' },
    { type: 'sun', name: 'Sun', icon: Sun, color: '#fbbf24' },
    { type: 'moon', name: 'Moon', icon: Moon, color: '#6366f1' },
  ],
  badges: [
    { type: 'award', name: 'Award', icon: Award, color: '#fbbf24' },
    { type: 'medal', name: 'Medal', icon: Award, color: '#ef4444' },
    { type: 'ribbon', name: 'Ribbon', icon: Gift, color: '#ec4899' },
    { type: 'seal', name: 'Seal', icon: Shield, color: '#3b82f6' },
  ],
  nature: [
    { type: 'leaf', name: 'Leaf', icon: Sparkles, color: '#10b981' },
    { type: 'flower', name: 'Flower', icon: Heart, color: '#f43f5e' },
    { type: 'tree', name: 'Tree', icon: Zap, color: '#059669' },
    { type: 'mountain', name: 'Mountain', icon: Play, color: '#475569' },
  ]
};

// Pre-designed templates
const presetTemplates = [
  { 
    id: 'classic-gold', 
    name: 'Classic Gold', 
    bgColor: '#fef3c7', 
    borderColor: '#d97706',
    preview: 'https://via.placeholder.com/150x100/fef3c7/d97706?text=Classic+Gold'
  },
  { 
    id: 'modern-blue', 
    name: 'Modern Blue', 
    bgColor: '#dbeafe', 
    borderColor: '#2563eb',
    preview: 'https://via.placeholder.com/150x100/dbeafe/2563eb?text=Modern+Blue'
  },
  { 
    id: 'elegant-green', 
    name: 'Elegant Green', 
    bgColor: '#d1fae5', 
    borderColor: '#059669',
    preview: 'https://via.placeholder.com/150x100/d1fae5/059669?text=Elegant+Green'
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    bgColor: '#f3f4f6', 
    borderColor: '#374151',
    preview: 'https://via.placeholder.com/150x100/f3f4f6/374151?text=Professional'
  },
  { 
    id: 'creative-red', 
    name: 'Creative Red', 
    bgColor: '#fee2e2', 
    borderColor: '#dc2626',
    preview: 'https://via.placeholder.com/150x100/fee2e2/dc2626?text=Creative+Red'
  },
  { 
    id: 'purple-royal', 
    name: 'Purple Royal', 
    bgColor: '#ede9fe', 
    borderColor: '#7c3aed',
    preview: 'https://via.placeholder.com/150x100/ede9fe/7c3aed?text=Purple+Royal'
  },
];

// Dynamic fields list
const dynamicFields = [
  { label: 'Participant Name', value: '{{participant_name}}', icon: User, preview: 'John Doe' },
  { label: 'Email', value: '{{participant_email}}', icon: Mail, preview: 'john@example.com' },
  { label: 'College', value: '{{participant_college}}', icon: MapPin, preview: 'SVERI College' },
  { label: 'Department', value: '{{participant_department}}', icon: Hash, preview: 'Computer Science' },
  { label: 'Event Name', value: '{{event_name}}', icon: Calendar, preview: 'SPIRIT 2K24' },
  { label: 'Event Date', value: '{{event_date}}', icon: Clock, preview: '04 April 2024' },
  { label: 'Certificate ID', value: '{{certificate_id}}', icon: Award, preview: 'CERT-2024-001' },
  { label: 'Issue Date', value: '{{issue_date}}', icon: Calendar, preview: new Date().toLocaleDateString() },
];

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
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('center');
  const [lineHeight, setLineHeight] = useState(1.5);
  const [charSpacing, setCharSpacing] = useState(0);
  const [underline, setUnderline] = useState(false);
  const [overline, setOverline] = useState(false);
  const [strikethrough, setStrikethrough] = useState(false);
  const [textBackgroundColor, setTextBackgroundColor] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [templateName, setTemplateName] = useState('New Certificate');
  const [pageSize, setPageSize] = useState({ width: 800, height: 600 });
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [activeTextElement, setActiveTextElement] = useState<any>(null);
  const [isUploadingEPS, setIsUploadingEPS] = useState(false);
  
  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState<'elements' | 'templates' | 'fields'>('elements');
  
  // Templates state
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [showTemplateUpload, setShowTemplateUpload] = useState(false);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('basic');

  // Load fabric dynamically and setup Google Fonts
  useEffect(() => {
    const loadFabric = async () => {
      try {
        const fabricModule = await import('fabric');
        fabric = fabricModule.default || fabricModule;
        
        // Load Google Fonts
        const googleFontsLink = document.createElement('link');
        googleFontsLink.href = `https://fonts.googleapis.com/css2?family=${googleFonts.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;
        googleFontsLink.rel = 'stylesheet';
        document.head.appendChild(googleFontsLink);
        
        setFabricLoaded(true);
      } catch (error) {
        console.error('Error loading fabric:', error);
      }
    };
    
    loadFabric();
    
    // Load custom templates from localStorage
    const savedTemplates = localStorage.getItem('certificate_templates');
    if (savedTemplates) {
      setCustomTemplates(JSON.parse(savedTemplates));
    }
    
    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
  }, []);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!fabricLoaded || !canvasRef.current || canvas) return;

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
      fabricCanvas.on('selection:created', (e: any) => {
        const obj = e.selected?.[0];
        setSelectedObject(obj);
        if (obj && obj.type === 'textbox') {
          setActiveTextElement(obj);
          updateTextPropertiesFromObject(obj);
        }
      });
      fabricCanvas.on('selection:updated', (e: any) => {
        const obj = e.selected?.[0];
        setSelectedObject(obj);
        if (obj && obj.type === 'textbox') {
          setActiveTextElement(obj);
          updateTextPropertiesFromObject(obj);
        }
      });
      fabricCanvas.on('selection:cleared', () => {
        setSelectedObject(null);
        setActiveTextElement(null);
      });
      fabricCanvas.on('object:modified', saveToHistory);
      fabricCanvas.on('object:added', saveToHistory);

      // Add default sample
      addDefaultDesign(fabricCanvas);
      
      saveToHistory();
    } catch (error) {
      console.error('Error initializing fabric canvas:', error);
    }
  }, [fabricLoaded]);

  const updateTextPropertiesFromObject = (obj: any) => {
    setFontSize(obj.fontSize || 24);
    setFontFamily(obj.fontFamily || 'Arial');
    setColor(obj.fill || '#000000');
    setFontWeight(obj.fontWeight === 'bold' ? 'bold' : 'normal');
    setFontStyle(obj.fontStyle === 'italic' ? 'italic' : 'normal');
    setTextAlign(obj.textAlign || 'center');
    setLineHeight(obj.lineHeight || 1.5);
    setCharSpacing(obj.charSpacing || 0);
    setUnderline(obj.underline || false);
    setOverline(obj.overline || false);
    setStrikethrough(obj.linethrough || false);
    setTextBackgroundColor(obj.textBackgroundColor || '');
  };

  const applyTextProperties = () => {
    if (!canvas || !activeTextElement) return;
    
    activeTextElement.set({
      fontSize,
      fontFamily,
      fill: color,
      fontWeight,
      fontStyle,
      textAlign,
      lineHeight,
      charSpacing,
      underline,
      overline,
      linethrough: strikethrough,
      textBackgroundColor: textBackgroundColor || undefined,
    });
    
    canvas.renderAll();
    saveToHistory();
  };

  // Update text properties when they change
  useEffect(() => {
    if (activeTextElement) {
      applyTextProperties();
    }
  }, [fontSize, fontFamily, color, fontWeight, fontStyle, textAlign, lineHeight, charSpacing, underline, overline, strikethrough, textBackgroundColor]);

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

  const addDefaultDesign = (fabricCanvas: any) => {
    // Decorative border
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

    // Title
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

    // Name placeholder
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

    fabricCanvas.renderAll();
  };

  // EPS File handling - Convert to image using backend service
  const handleEPSUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingEPS(true);
    
    // For EPS files, we need to convert them to PNG/JPEG
    // Since EPS conversion requires server-side processing, we'll use a free API or local conversion
    // Option 1: Use a free conversion API (example using CloudConvert or Zamzar)
    // Option 2: Instruct users to convert EPS to PNG before uploading
    
    try {
      // Show info modal about EPS conversion
      const confirmConvert = confirm(
        'EPS files need to be converted to images first.\n\n' +
        'Would you like to:\n' +
        '• Click "OK" to use an online converter\n' +
        '• Click "Cancel" to upload a PNG/JPG directly'
      );
      
      if (confirmConvert) {
        window.open('https://convertio.co/epsv-converter/', '_blank');
        alert('Please convert your EPS file to PNG/PDF using the opened converter, then upload the converted file.');
      }
      
      setIsUploadingEPS(false);
    } catch (error) {
      console.error('Error processing EPS:', error);
      alert('Error processing EPS file. Please convert it to PNG or JPG first.');
      setIsUploadingEPS(false);
    }
  };

  // Create custom shape (Polygon)
  const createPolygon = (points: { x: number; y: number }[], color: string) => {
    return new fabric.Polygon(points, {
      left: 100,
      top: 100,
      fill: color,
      stroke: '#333333',
      strokeWidth: 1,
    });
  };

  // Create Star shape
  const createStar = (outerRadius: number, innerRadius: number, points: number, color: string) => {
    const starPoints = [];
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI * 2 * i) / (points * 2);
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      starPoints.push({ x, y });
    }
    return new fabric.Polygon(starPoints, {
      left: 100,
      top: 100,
      fill: color,
      stroke: '#333333',
      strokeWidth: 1,
    });
  };

  // Create Heart shape
  const createHeart = (color: string) => {
    const heartPath = 'M 0,-10 A 10,10 0 0,0 -20,0 Q -20,10 0,25 Q 20,10 20,0 A 10,10 0 0,0 0,-10 Z';
    return new fabric.Path(heartPath, {
      left: 100,
      top: 100,
      fill: color,
      stroke: '#333333',
      strokeWidth: 1,
      scaleX: 2,
      scaleY: 2,
    });
  };

  // Create Ribbon shape
  const createRibbon = (color: string) => {
    const ribbonPath = 'M 0,0 L 20,-10 L 40,0 L 40,20 L 20,10 L 0,20 Z';
    return new fabric.Path(ribbonPath, {
      left: 100,
      top: 100,
      fill: color,
      stroke: '#333333',
      strokeWidth: 1,
    });
  };

  // Add enhanced shape based on type
  const addEnhancedShape = (type: string, color: string) => {
    if (!canvas) return;
    let shape: any;

    switch(type) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: 100,
          top: 100,
          width: 120,
          height: 80,
          fill: color,
          stroke: '#333333',
          strokeWidth: 1,
          rx: 8,
          ry: 8,
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 40,
          fill: color,
          stroke: '#333333',
          strokeWidth: 1,
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle({
          left: 100,
          top: 100,
          width: 80,
          height: 80,
          fill: color,
          stroke: '#333333',
          strokeWidth: 1,
        });
        break;
      case 'hexagon':
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i) / 6;
          const x = 40 * Math.cos(angle);
          const y = 40 * Math.sin(angle);
          hexPoints.push({ x, y });
        }
        shape = createPolygon(hexPoints, color);
        break;
      case 'pentagon':
        const pentPoints = [];
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x = 40 * Math.cos(angle);
          const y = 40 * Math.sin(angle);
          pentPoints.push({ x, y });
        }
        shape = createPolygon(pentPoints, color);
        break;
      case 'star':
        shape = createStar(40, 18, 5, color);
        break;
      case 'heart':
        shape = createHeart(color);
        break;
      case 'crown':
        const crownPoints = [
          { x: 0, y: 30 }, { x: 10, y: 0 }, { x: 20, y: 15 },
          { x: 30, y: 0 }, { x: 40, y: 30 }, { x: 20, y: 25 }
        ];
        shape = createPolygon(crownPoints, color);
        break;
      case 'diamond':
        const diamondPoints = [
          { x: 30, y: 0 }, { x: 60, y: 30 }, { x: 30, y: 60 }, { x: 0, y: 30 }
        ];
        shape = createPolygon(diamondPoints, color);
        break;
      case 'sparkle':
        const sparklePoints = [
          { x: 20, y: 0 }, { x: 25, y: 15 }, { x: 40, y: 20 },
          { x: 25, y: 25 }, { x: 20, y: 40 }, { x: 15, y: 25 },
          { x: 0, y: 20 }, { x: 15, y: 15 }
        ];
        shape = createPolygon(sparklePoints, color);
        break;
      default:
        shape = new fabric.Rect({
          left: 100,
          top: 100,
          width: 80,
          height: 80,
          fill: color,
          stroke: '#333333',
          strokeWidth: 1,
        });
    }
    
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    saveToHistory();
  };

  const addRichText = () => {
    if (!canvas) return;
    const text = new fabric.Textbox('Edit Text', {
      left: 100,
      top: 100,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      width: 300,
      hasControls: true,
      lineHeight: 1.5,
      charSpacing: 0,
      textAlign: 'center',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    setActiveTextElement(text);
    canvas.renderAll();
    saveToHistory();
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.eps';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && canvas) {
        if (file.name.endsWith('.eps')) {
          handleEPSUpload({ target: { files: [file] } } as any);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          fabric.Image.fromURL(event.target?.result as string).then((img: any) => {
            img.scaleToWidth(200);
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

  const addDynamicField = (field: any) => {
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
      textAlign: 'center',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveToHistory();
  };

  const applyTemplateToCanvas = async (template: any) => {
    if (!canvas) return;
    
    if (template.imageUrl) {
      fabric.Image.fromURL(template.imageUrl).then((img: any) => {
        const scale = Math.min(
          pageSize.width / img.width,
          pageSize.height / img.height
        );
        img.scale(scale);
        img.set({
          left: (pageSize.width - img.getScaledWidth()) / 2,
          top: (pageSize.height - img.getScaledHeight()) / 2,
        });
        
        canvas.clear();
        canvas.add(img);
        canvas.setBackgroundColor('#ffffff');
        canvas.renderAll();
        saveToHistory();
      });
    } else {
      canvas.setBackgroundColor(template.bgColor, () => {
        canvas.renderAll();
      });
      
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
    }
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTemplate(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const newTemplate = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        imageUrl: imageUrl,
        preview: imageUrl,
        createdAt: new Date().toISOString(),
      };
      
      const updatedTemplates = [...customTemplates, newTemplate];
      setCustomTemplates(updatedTemplates);
      localStorage.setItem('certificate_templates', JSON.stringify(updatedTemplates));
      setUploadingTemplate(false);
      setShowTemplateUpload(false);
      
      applyTemplateToCanvas(newTemplate);
    };
    reader.readAsDataURL(file);
  };

  const deleteCustomTemplate = (templateId: string) => {
    const updatedTemplates = customTemplates.filter(t => t.id !== templateId);
    setCustomTemplates(updatedTemplates);
    localStorage.setItem('certificate_templates', JSON.stringify(updatedTemplates));
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

  const deleteSelected = () => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
    setActiveTextElement(null);
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

  const bringToFront = () => {
    if (!canvas || !selectedObject) return;
    canvas.bringToFront(selectedObject);
    canvas.renderAll();
    saveToHistory();
  };

  const sendToBack = () => {
    if (!canvas || !selectedObject) return;
    canvas.sendToBack(selectedObject);
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
          lineHeight: obj.lineHeight,
          charSpacing: obj.charSpacing,
          underline: obj.underline,
          overline: obj.overline,
          linethrough: obj.linethrough,
          textBackgroundColor: obj.textBackgroundColor,
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
          rx: obj.rx,
          ry: obj.ry,
        });
      } else if (obj.type === 'circle') {
        elements.push({
          id: `circle_${index}`,
          type: 'circle',
          left: obj.left,
          top: obj.top,
          radius: obj.radius,
          fill: obj.fill,
        });
      } else if (obj.type === 'polygon') {
        elements.push({
          id: `polygon_${index}`,
          type: 'polygon',
          left: obj.left,
          top: obj.top,
          points: obj.points,
          fill: obj.fill,
        });
      } else if (obj.type === 'path') {
        elements.push({
          id: `path_${index}`,
          type: 'path',
          left: obj.left,
          top: obj.top,
          path: obj.path,
          fill: obj.fill,
        });
      }
    });
    
    const canvasDataURL = canvas.toDataURL();
    
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
      const gridLines = canvas.getObjects().filter((obj: any) => obj.stroke === '#e5e7eb');
      gridLines.forEach((line: any) => canvas.remove(line));
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
      {/* Top Toolbar - Enhanced */}
      <div className="bg-white border-b px-2 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => router.push('/admin/certificates')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="text-lg sm:text-xl font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 w-40 sm:w-auto"
          />
          
          <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
          
          {/* Text Formatting Toolbar */}
          <div className="flex items-center gap-1">
            <button onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded-lg ${fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
              <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')} className={`p-2 rounded-lg ${fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
              <Italic className="w-4 h-4" />
            </button>
            <button onClick={() => setUnderline(!underline)} className={`p-2 rounded-lg ${underline ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
              <Underline className="w-4 h-4" />
            </button>
            <button onClick={() => setStrikethrough(!strikethrough)} className={`p-2 rounded-lg ${strikethrough ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
              <Highlighter className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
          
          {/* Alignment */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => setTextAlign('left')} className={`p-2 rounded-lg ${textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
              <AlignLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setTextAlign('center')} className={`p-2 rounded-lg ${textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
              <AlignCenter className="w-4 h-4" />
            </button>
            <button onClick={() => setTextAlign('right')} className={`p-2 rounded-lg ${textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
              <AlignRight className="w-4 h-4" />
            </button>
            <button onClick={() => setTextAlign('justify')} className={`p-2 rounded-lg ${textAlign === 'justify' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>
          
          <div className="hidden lg:flex items-center gap-2">
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="border rounded-lg px-2 py-1.5 text-sm">
              <optgroup label="System Fonts">
                {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
              </optgroup>
              <optgroup label="Google Fonts">
                {googleFonts.map(f => <option key={f} value={f}>{f}</option>)}
              </optgroup>
            </select>
            
            <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="border rounded-lg px-2 py-1.5 text-sm w-16">
              <option value="12">12</option><option value="16">16</option><option value="20">20</option>
              <option value="24">24</option><option value="32">32</option><option value="48">48</option>
              <option value="64">64</option><option value="72">72</option><option value="96">96</option>
            </select>
          </div>
          
          <div className="relative">
            <button onClick={() => setShowColorPicker(!showColorPicker)} className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ backgroundColor: color }} />
            {showColorPicker && (
              <div className="absolute z-10 mt-2">
                <ChromePicker color={color} onChange={(newColor) => setColor(newColor.hex)} />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={undo} className="p-2 hover:bg-gray-100 rounded-lg"><Undo className="w-4 h-4" /></button>
          <button onClick={redo} className="p-2 hover:bg-gray-100 rounded-lg"><Redo className="w-4 h-4" /></button>
          <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-lg"><ZoomOut className="w-4 h-4" /></button>
          <span className="text-sm hidden sm:inline">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-lg"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={toggleGrid} className={`p-2 rounded-lg ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
            <Grid className="w-4 h-4" />
          </button>
          <button onClick={handleDownload} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={handleSave} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            <Save className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>
      
      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Enhanced Elements */}
        <div className={`${leftSidebarOpen ? 'w-80' : 'w-12'} bg-white border-r transition-all duration-300 flex flex-col`}>
          <div className="p-2 border-b flex items-center justify-between">
            <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              {leftSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            {leftSidebarOpen && (
              <div className="flex gap-1">
                <button onClick={() => setActiveLeftTab('elements')} className={`px-3 py-1 text-sm rounded-lg ${activeLeftTab === 'elements' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
                  Elements
                </button>
                <button onClick={() => setActiveLeftTab('templates')} className={`px-3 py-1 text-sm rounded-lg ${activeLeftTab === 'templates' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
                  Templates
                </button>
                <button onClick={() => setActiveLeftTab('fields')} className={`px-3 py-1 text-sm rounded-lg ${activeLeftTab === 'fields' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
                  Fields
                </button>
              </div>
            )}
          </div>
          
          {leftSidebarOpen && (
            <div className="flex-1 overflow-y-auto p-4">
              {activeLeftTab === 'elements' && (
                <div>
                  {/* Category Tabs */}
                  <div className="flex gap-2 mb-4 border-b pb-2">
                    {Object.keys(elementCategories).map(cat => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 text-xs rounded-lg capitalize ${selectedCategory === cat ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  
                  {/* Shapes Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {elementCategories[selectedCategory as keyof typeof elementCategories].map((element) => {
                      const Icon = element.icon;
                      return (
                        <button
                          key={element.type}
                          onClick={() => addEnhancedShape(element.type, element.color)}
                          className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all flex flex-col items-center gap-1"
                          style={{ borderColor: element.color }}
                        >
                          <Icon className="w-6 h-6" style={{ color: element.color }} />
                          <span className="text-xs">{element.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Text Elements</h4>
                    <button onClick={addRichText} className="w-full p-3 border rounded-lg hover:bg-blue-50 flex items-center gap-2">
                      <Type className="w-5 h-5 text-blue-600" />
                      <span>Add Text Box</span>
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Image & Media</h4>
                    <button onClick={addImage} className="w-full p-3 border rounded-lg hover:bg-blue-50 flex items-center gap-2">
                      <Image className="w-5 h-5 text-green-600" />
                      <span>Upload Image</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported: PNG, JPG, GIF, SVG. For EPS files, please convert first.
                    </p>
                  </div>
                </div>
              )}
              
              {activeLeftTab === 'templates' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Templates</h3>
                    <button onClick={() => setShowTemplateUpload(true)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Preset Templates */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Preset Templates</p>
                    <div className="grid grid-cols-2 gap-2">
                      {presetTemplates.map((template) => (
                        <button key={template.id} onClick={() => applyTemplateToCanvas(template)} className="p-2 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center">
                          <div className="h-16 rounded-lg mb-1" style={{ backgroundColor: template.bgColor, border: `2px solid ${template.borderColor}` }} />
                          <span className="text-xs">{template.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom Templates */}
                  {customTemplates.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Your Templates</p>
                      <div className="space-y-2">
                        {customTemplates.map((template) => (
                          <div key={template.id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                            <button onClick={() => applyTemplateToCanvas(template)} className="flex-1 text-left flex items-center gap-2">
                              <img src={template.preview} alt={template.name} className="w-12 h-12 object-cover rounded" />
                              <span className="text-sm truncate">{template.name}</span>
                            </button>
                            <button onClick={() => deleteCustomTemplate(template.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeLeftTab === 'fields' && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Dynamic Fields</h3>
                  <p className="text-xs text-gray-500 mb-3">Auto-fill with participant data</p>
                  <div className="space-y-2">
                    {dynamicFields.map((field) => {
                      const Icon = field.icon;
                      return (
                        <button key={field.value} onClick={() => addDynamicField(field)} className="w-full text-left p-2 border rounded-lg hover:bg-blue-50 flex items-center gap-2 text-sm">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span>{field.label}</span>
                          <span className="text-xs text-gray-400 ml-auto">{field.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Canvas Area */}
        <div ref={containerRef} className="flex-1 p-4 overflow-auto bg-gray-100 flex items-center justify-center">
          <div className="relative bg-white shadow-2xl rounded-lg overflow-auto" style={{ maxWidth: '100%', maxHeight: '100%' }}>
            <canvas ref={canvasRef} width={pageSize.width} height={pageSize.height} className="border border-gray-200" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        </div>
        
        {/* Right Sidebar - Properties with Enhanced Text Controls */}
        <div className={`${rightSidebarOpen ? 'w-80' : 'w-12'} bg-white border-l transition-all duration-300 overflow-y-auto`}>
          <div className="p-2 border-b flex justify-end">
            <button onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              {rightSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
            </button>
          </div>
          
          {rightSidebarOpen && (
            <div className="p-4">
              {selectedObject ? (
                <>
                  <h3 className="font-medium text-gray-900 mb-4">Properties</h3>
                  
                  {/* Position */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Position</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-xs text-gray-500">X</label>
                        <input type="number" value={Math.round(selectedObject.left || 0)} onChange={(e) => { selectedObject.set('left', parseInt(e.target.value)); canvas?.renderAll(); saveToHistory(); }} className="w-full px-2 py-1 text-sm border rounded" />
                      </div>
                      <div><label className="text-xs text-gray-500">Y</label>
                        <input type="number" value={Math.round(selectedObject.top || 0)} onChange={(e) => { selectedObject.set('top', parseInt(e.target.value)); canvas?.renderAll(); saveToHistory(); }} className="w-full px-2 py-1 text-sm border rounded" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Size */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Size</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-xs text-gray-500">Width</label>
                        <input type="number" value={Math.round(selectedObject.getScaledWidth())} onChange={(e) => { const newWidth = parseInt(e.target.value); const scale = newWidth / selectedObject.getScaledWidth(); selectedObject.scaleX = (selectedObject.scaleX || 1) * scale; canvas?.renderAll(); saveToHistory(); }} className="w-full px-2 py-1 text-sm border rounded" />
                      </div>
                      <div><label className="text-xs text-gray-500">Height</label>
                        <input type="number" value={Math.round(selectedObject.getScaledHeight())} onChange={(e) => { const newHeight = parseInt(e.target.value); const scale = newHeight / selectedObject.getScaledHeight(); selectedObject.scaleY = (selectedObject.scaleY || 1) * scale; canvas?.renderAll(); saveToHistory(); }} className="w-full px-2 py-1 text-sm border rounded" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Rotation */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Rotation: {Math.round(selectedObject.angle || 0)}°</label>
                    <input type="range" min="0" max="360" value={selectedObject.angle || 0} onChange={(e) => { selectedObject.set('angle', parseInt(e.target.value)); canvas?.renderAll(); saveToHistory(); }} className="w-full" />
                  </div>
                  
                  {/* Text-specific properties */}
                  {selectedObject.type === 'textbox' && (
                    <>
                      <div className="mb-4 pt-2 border-t">
                        <label className="block text-sm text-gray-700 mb-2">Line Height: {lineHeight}</label>
                        <input type="range" min="0.8" max="3" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(parseFloat(e.target.value))} className="w-full" />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm text-gray-700 mb-2">Character Spacing: {charSpacing}px</label>
                        <input type="range" min="-50" max="200" value={charSpacing} onChange={(e) => setCharSpacing(parseInt(e.target.value))} className="w-full" />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm text-gray-700 mb-2">Text Background</label>
                        <div className="flex gap-2 items-center">
                          <button onClick={() => setTextBackgroundColor('')} className="p-2 border rounded-lg hover:bg-gray-100">Clear</button>
                          <input type="color" value={textBackgroundColor || '#ffffff'} onChange={(e) => setTextBackgroundColor(e.target.value)} className="w-10 h-8 rounded border" />
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Color Picker for any element */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Color</label>
                    <div className="relative">
                      <button onClick={() => setShowColorPicker(!showColorPicker)} className="w-full h-10 rounded-lg border flex items-center justify-between px-3">
                        <div className="flex items-center gap-3"><div className="w-6 h-6 rounded border" style={{ backgroundColor: color }} /><span className="text-sm">{color}</span></div>
                      </button>
                      {showColorPicker && <div className="absolute z-10 mt-2"><ChromePicker color={color} onChange={(newColor) => { setColor(newColor.hex); if (selectedObject) { selectedObject.set('fill', newColor.hex); canvas?.renderAll(); saveToHistory(); } }} /></div>}
                    </div>
                  </div>
                  
                  {/* Layer controls */}
                  <div className="mb-4 pt-2 border-t">
                    <label className="block text-sm text-gray-700 mb-2">Layer</label>
                    <div className="flex gap-2">
                      <button onClick={bringToFront} className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2">Bring to Front</button>
                      <button onClick={sendToBack} className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2">Send to Back</button>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button onClick={duplicateSelected} className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2">
                      <Copy className="w-4 h-4" /> Duplicate
                    </button>
                    <button onClick={deleteSelected} className="flex-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Move className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Select an element to edit</p>
                  <p className="text-xs mt-2">Click on any text, shape, or image</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Template Upload Modal */}
      {showTemplateUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Upload Template</h3>
              <button onClick={() => setShowTemplateUpload(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Upload a certificate template</p>
              <p className="text-xs text-gray-400 mb-4">PNG, JPG, GIF, PDF up to 10MB</p>
              <p className="text-xs text-orange-500 mb-4">For EPS files: Please convert to PNG/PDF first</p>
              <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                Choose File
                <input type="file" accept="image/*,.pdf" onChange={handleTemplateUpload} className="hidden" disabled={uploadingTemplate} />
              </label>
              {uploadingTemplate && (<div className="mt-3"><div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mx-auto"></div><p className="text-sm text-gray-500 mt-1">Uploading...</p></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}