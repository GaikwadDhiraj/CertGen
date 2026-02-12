'use client';

import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { ChromePicker } from 'react-color';
import { 
  Type, Image as ImageIcon, Square, Circle, Minus,
  Trash2, Save, Download, Upload, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, Layers,
  MoveUp, MoveDown, Copy, Undo, Redo,
  Eye, EyeOff, Lock, Unlock
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
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState(initialBackgroundUrl);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [color, setColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textContent, setTextContent] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'image' | 'rectangle' | 'circle' | 'line'>('select');

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff'
      });
      
      fabricCanvasRef.current = fabricCanvas;
      setCanvas(fabricCanvas);

      // Load initial background if exists
      if (initialBackgroundUrl) {
        loadBackground(initialBackgroundUrl);
      }

      // Load initial elements
      if (initialElements.length > 0) {
        loadElements(initialElements);
      }

      // Add event listeners
      fabricCanvas.on('selection:created', handleSelection);
      fabricCanvas.on('selection:updated', handleSelection);
      fabricCanvas.on('selection:cleared', handleDeselection);
      fabricCanvas.on('object:modified', saveToHistory);

      // Save initial state to history
      saveToHistory();
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Update selected object properties when they change
  useEffect(() => {
    if (selectedObject && canvas) {
      if (selectedObject.type === 'textbox') {
        const textObject = selectedObject as fabric.Textbox;
        setFontSize(textObject.fontSize || 24);
        setFontFamily(textObject.fontFamily || 'Arial');
        setColor(textObject.fill?.toString() || '#000000');
        setTextContent(textObject.text || '');
      } else if (selectedObject.type === 'rect' || selectedObject.type === 'circle' || selectedObject.type === 'line') {
        setColor(selectedObject.fill?.toString() || '#000000');
      }
    }
  }, [selectedObject]);

  const handleSelection = (e: fabric.IEvent) => {
    if (e.selected && e.selected.length > 0) {
      setSelectedObject(e.selected[0]);
    }
  };

  const handleDeselection = () => {
    setSelectedObject(null);
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
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      canvas?.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
      });
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      canvas?.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
      });
      setHistoryIndex(newIndex);
    }
  };

  const loadBackground = (url: string) => {
    if (!canvas) return;
    
    fabric.Image.fromURL(url, (img) => {
      img.scaleToWidth(canvas.width || 800);
      img.scaleToHeight(canvas.height || 600);
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      canvas.renderAll();
    });
  };

  const loadElements = (elements: CertificateElement[]) => {
    if (!canvas) return;
    
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
            scaleY: element.scaleY || 1
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
            scaleY: element.scaleY || 1
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
            scaleY: element.scaleY || 1
          });
          canvas.add(circle);
          break;
          
        case 'line':
          const line = new fabric.Line([element.left || 0, element.top || 0, 
                                       (element.left || 0) + (element.width || 100), 
                                       (element.top || 0) + (element.height || 0)], {
            stroke: element.fill || '#000000',
            strokeWidth: 2,
            angle: element.angle || 0,
            scaleX: element.scaleX || 1,
            scaleY: element.scaleY || 1
          });
          canvas.add(line);
          break;
      }
    });
    
    canvas.renderAll();
    saveToHistory();
  };

  const addText = () => {
    if (!canvas) return;
    
    const text = new fabric.Textbox('Edit Text', {
      left: 100,
      top: 100,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      width: 200
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveToHistory();
  };

  const addRectangle = () => {
    if (!canvas) return;
    
    const rect = new fabric.Rect({
      left: 150,
      top: 150,
      width: 100,
      height: 60,
      fill: '#3498db'
    });
    
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    saveToHistory();
  };

  const addCircle = () => {
    if (!canvas) return;
    
    const circle = new fabric.Circle({
      left: 200,
      top: 200,
      radius: 30,
      fill: '#e74c3c'
    });
    
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
    saveToHistory();
  };

  const addLine = () => {
    if (!canvas) return;
    
    const line = new fabric.Line([100, 100, 200, 100], {
      stroke: '#2ecc71',
      strokeWidth: 2
    });
    
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
    saveToHistory();
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
          fabric.Image.fromURL(event.target?.result as string, (img) => {
            img.scaleToWidth(100);
            img.left = 100;
            img.top = 100;
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

  const deleteSelected = () => {
    if (!canvas) return;
    
    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach(obj => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
    saveToHistory();
  };

  const duplicateSelected = () => {
    if (!canvas || !selectedObject) return;
    
    selectedObject.clone((cloned: fabric.Object) => {
      cloned.left = (cloned.left || 0) + 20;
      cloned.top = (cloned.top || 0) + 20;
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      saveToHistory();
    });
  };

  const bringForward = () => {
    if (!canvas || !selectedObject) return;
    
    canvas.bringForward(selectedObject);
    canvas.renderAll();
    saveToHistory();
  };

  const sendBackward = () => {
    if (!canvas || !selectedObject) return;
    
    canvas.sendBackwards(selectedObject);
    canvas.renderAll();
    saveToHistory();
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
    
    selectedObject.set('fill', newColor);
    canvas.renderAll();
    saveToHistory();
  };

  const toggleBold = () => {
    if (!canvas || !selectedObject || selectedObject.type !== 'textbox') return;
    
    const textObject = selectedObject as fabric.Textbox;
    const currentWeight = textObject.fontWeight;
    textObject.set('fontWeight', currentWeight === 'bold' ? 'normal' : 'bold');
    canvas.renderAll();
    saveToHistory();
  };

  const toggleItalic = () => {
    if (!canvas || !selectedObject || selectedObject.type !== 'textbox') return;
    
    const textObject = selectedObject as fabric.Textbox;
    const currentStyle = textObject.fontStyle;
    textObject.set('fontStyle', currentStyle === 'italic' ? 'normal' : 'italic');
    canvas.renderAll();
    saveToHistory();
  };

  const updateTextAlign = (align: 'left' | 'center' | 'right') => {
    if (!canvas || !selectedObject || selectedObject.type !== 'textbox') return;
    
    const textObject = selectedObject as fabric.Textbox;
    textObject.set('textAlign', align);
    canvas.renderAll();
    saveToHistory();
  };

  const handleSave = () => {
    if (!canvas) return;
    
    const elements: CertificateElement[] = [];
    canvas.getObjects().forEach((obj, index) => {
      if (obj.type === 'textbox') {
        const textObj = obj as fabric.Textbox;
        elements.push({
          id: `text_${index}`,
          type: 'text',
          content: textObj.text || '',
          left: textObj.left || 0,
          top: textObj.top || 0,
          fontSize: textObj.fontSize,
          fontFamily: textObj.fontFamily,
          fontWeight: textObj.fontWeight as string,
          fill: textObj.fill?.toString() || '#000000',
          width: textObj.width,
          angle: textObj.angle,
          scaleX: textObj.scaleX,
          scaleY: textObj.scaleY
        });
      } else if (obj.type === 'rect') {
        const rectObj = obj as fabric.Rect;
        elements.push({
          id: `rect_${index}`,
          type: 'rectangle',
          content: '',
          left: rectObj.left || 0,
          top: rectObj.top || 0,
          width: rectObj.width,
          height: rectObj.height,
          fill: rectObj.fill?.toString() || '#000000',
          angle: rectObj.angle,
          scaleX: rectObj.scaleX,
          scaleY: rectObj.scaleY
        });
      } else if (obj.type === 'circle') {
        const circleObj = obj as fabric.Circle;
        elements.push({
          id: `circle_${index}`,
          type: 'circle',
          content: '',
          left: circleObj.left || 0,
          top: circleObj.top || 0,
          width: (circleObj.radius || 0) * 2,
          height: (circleObj.radius || 0) * 2,
          fill: circleObj.fill?.toString() || '#000000',
          angle: circleObj.angle,
          scaleX: circleObj.scaleX,
          scaleY: circleObj.scaleY
        });
      } else if (obj.type === 'line') {
        const lineObj = obj as fabric.Line;
        elements.push({
          id: `line_${index}`,
          type: 'line',
          content: '',
          left: lineObj.left || 0,
          top: lineObj.top || 0,
          width: Math.abs((lineObj.x2 || 0) - (lineObj.x1 || 0)),
          height: Math.abs((lineObj.y2 || 0) - (lineObj.y1 || 0)),
          fill: lineObj.stroke?.toString() || '#000000',
          angle: lineObj.angle,
          scaleX: lineObj.scaleX,
          scaleY: lineObj.scaleY
        });
      }
    });
    
    onSave(elements, backgroundUrl);
  };

  const handleDownload = () => {
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1
    });
    
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `certificate-template-${eventName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Certificate Editor</h2>
          <p className="text-sm text-gray-600">Event: {eventName}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Redo className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Template
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-16 bg-gray-50 border-r flex flex-col items-center py-4 space-y-4">
          <button
            onClick={() => setActiveTool('select')}
            className={`p-3 rounded-lg ${activeTool === 'select' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            title="Select Tool"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={addText}
            className="p-3 hover:bg-gray-100 rounded-lg"
            title="Add Text"
          >
            <Type className="w-5 h-5" />
          </button>
          <button
            onClick={addImage}
            className="p-3 hover:bg-gray-100 rounded-lg"
            title="Add Image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            onClick={addRectangle}
            className="p-3 hover:bg-gray-100 rounded-lg"
            title="Add Rectangle"
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={addCircle}
            className="p-3 hover:bg-gray-100 rounded-lg"
            title="Add Circle"
          >
            <Circle className="w-5 h-5" />
          </button>
          <button
            onClick={addLine}
            className="p-3 hover:bg-gray-100 rounded-lg"
            title="Add Line"
          >
            <Minus className="w-5 h-5" />
          </button>
          <div className="border-t w-full my-2"></div>
          <button
            onClick={duplicateSelected}
            disabled={!selectedObject}
            className="p-3 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            title="Duplicate"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button
            onClick={deleteSelected}
            disabled={!selectedObject}
            className="p-3 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-4 overflow-auto bg-gray-100">
          <div className="bg-white rounded-lg shadow-lg p-4 inline-block">
            <canvas ref={canvasRef} className="border border-gray-300" />
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white border-l p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Background Section */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Background</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Upload Background Image
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="hidden"
                      id="background-upload"
                    />
                    <label
                      htmlFor="background-upload"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center"
                    >
                      <Upload className="w-4 h-4 inline mr-2" />
                      Choose Image
                    </label>
                  </div>
                </div>
                {backgroundUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Current Background:</p>
                    <img 
                      src={backgroundUrl} 
                      alt="Background" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Selected Object Properties */}
            {selectedObject && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Properties</h3>
                
                {selectedObject.type === 'textbox' && (
                  <div className="space-y-4">
                    {/* Text Content */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Text Content
                      </label>
                      <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        onBlur={updateTextContent}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Font Size */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Font Size: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="72"
                        value={fontSize}
                        onChange={(e) => {
                          const newSize = parseInt(e.target.value);
                          setFontSize(newSize);
                          updateFontSize(newSize);
                        }}
                        className="w-full"
                      />
                    </div>

                    {/* Font Family */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Font Family
                      </label>
                      <select
                        value={fontFamily}
                        onChange={(e) => {
                          setFontFamily(e.target.value);
                          updateFontFamily(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                      </select>
                    </div>

                    {/* Text Formatting */}
                    <div className="flex gap-2">
                      <button
                        onClick={toggleBold}
                        className={`px-3 py-2 rounded-lg ${(selectedObject as fabric.Textbox).fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        onClick={toggleItalic}
                        className={`px-3 py-2 rounded-lg ${(selectedObject as fabric.Textbox).fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Text Alignment */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Text Alignment
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateTextAlign('left')}
                          className={`px-3 py-2 rounded-lg ${(selectedObject as fabric.Textbox).textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateTextAlign('center')}
                          className={`px-3 py-2 rounded-lg ${(selectedObject as fabric.Textbox).textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateTextAlign('right')}
                          className={`px-3 py-2 rounded-lg ${(selectedObject as fabric.Textbox).textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                          <AlignRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Color Picker */}
                <div className="mt-4">
                  <label className="block text-sm text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-full h-10 rounded-lg border border-gray-300 flex items-center justify-between px-3"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm">{color}</span>
                      </div>
                      <div className="w-4 h-4 rounded border" style={{ backgroundColor: color }} />
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

                {/* Layer Management */}
                <div className="mt-6">
                  <label className="block text-sm text-gray-700 mb-2">
                    Layer Management
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={bringForward}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2"
                    >
                      <MoveUp className="w-4 h-4" />
                      <span className="text-sm">Bring Forward</span>
                    </button>
                    <button
                      onClick={sendBackward}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2"
                    >
                      <MoveDown className="w-4 h-4" />
                      <span className="text-sm">Send Backward</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Help Text */}
            {!selectedObject && (
              <div className="text-center py-8 text-gray-500">
                <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select an object to edit its properties</p>
                <p className="text-sm mt-2">Click on any text, shape, or image to customize it</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
