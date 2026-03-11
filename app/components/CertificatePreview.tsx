// app/components/CertificatePreview.tsx
'use client';

import React, { useEffect, useRef } from 'react';

interface CertificatePreviewProps {
  template: any;
  participant?: any;
}

export default function CertificatePreview({ template, participant }: CertificatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!template || !participant || !canvasRef.current) return;

    const generatePreview = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load background image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw background
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Draw each field
        template.fields.forEach((field: any) => {
          // Get the value for this field based on field_key
          let value = '';
          
          // Map field_key to actual data
          switch(field.field_key) {
            // Participant Information
            case 'name':
              value = participant.user_name || 'John Doe';
              break;
            case 'email':
              value = participant.user_email || 'john@example.com';
              break;
            case 'college':
              value = participant.user_college || 'SVERI College of Engineering';
              break;
            case 'department':
              value = participant.user_department || 'Computer Science';
              break;
            
            // Event Information
            case 'event_name':
              value = template.event_name || 'SPIRIT 2K24';
              break;
            case 'event_date':
              value = new Date().toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              });
              break;
            case 'event_time':
              value = '10:00 AM - 4:00 PM';
              break;
            case 'event_location':
              value = 'Main Auditorium';
              break;
            case 'event_category':
              value = 'Technical Event';
              break;
            case 'event_organizer':
              value = 'Department of CSE';
              break;
            
            // Result Information
            case 'result':
              value = 'Winner'; // You can make this dynamic
              break;
            case 'position':
              value = '1st';
              break;
            
            // Certificate Information
            case 'certificate_id':
              value = `CERT-${Date.now()}`;
              break;
            case 'issue_date':
              value = new Date().toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              });
              break;
            
            // Custom Text
            case 'custom':
              value = field.defaultValue || 'Custom Text';
              break;
            
            default:
              value = field.defaultValue || 'Sample Text';
          }

          // Set text styles
          ctx.font = `${field.fontWeight || 'normal'} ${field.fontSize || 16}px ${field.fontFamily || 'Arial'}`;
          ctx.fillStyle = field.color || '#000000';
          ctx.textAlign = field.textAlign || 'left';
          ctx.textBaseline = 'middle';
          
          // Calculate position
          let x = field.x;
          if (field.textAlign === 'center') {
            x = field.x + (field.width / 2);
          } else if (field.textAlign === 'right') {
            x = field.x + field.width;
          }
          
          // Draw text (with word wrap if needed)
          const words = value.split(' ');
          let line = '';
          let y = field.y + (field.height / 2);
          
          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > field.width && i > 0) {
              ctx.fillText(line, x, y);
              line = words[i] + ' ';
              y += field.fontSize * 1.2;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, x, y);
        });
      };

      img.src = template.background_url;
    };

    generatePreview();
  }, [template, participant]);

  if (!template || !participant) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-bold mb-4">Certificate Preview for {participant.user_name}</h3>
      <canvas 
        ref={canvasRef} 
        className="w-full border rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}