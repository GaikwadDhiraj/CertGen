// app/components/CertificatePreview.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { Download } from 'lucide-react';

interface CertificatePreviewProps {
  template: any;
  participant: any;
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
          // Get the value for this field
          let value = '';
          
          switch(field.field_key) {
            // Participant Information
            case 'name':
              value = participant.user_name || 'John Doe';
              break;
            case 'email':
              value = participant.user_email || 'john@example.com';
              break;
            case 'college':
              value = participant.user_college || 'SVERI College';
              break;
            case 'department':
              value = participant.user_department || 'Computer Science';
              break;
            
            // Event Information
            case 'event_name':
              value = template.event_name || 'SPIRIT 2K24';
              break;
            case 'event_date':
              value = template.event?.date 
                ? new Date(template.event.date).toLocaleDateString('en-US', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })
                : '04 April 2024';
              break;
            case 'event_time':
              value = template.event?.time || '10:00 AM';
              break;
            case 'event_location':
              value = template.event?.location || 'Main Auditorium';
              break;
            case 'event_category':
              value = template.event?.category || 'Technical Event';
              break;
            case 'event_organizer':
              value = template.event?.organizer || 'Department of CSE';
              break;
            
            // Result Information
            case 'result':
              value = 'Participant'; // You can make this dynamic
              break;
            case 'position':
              value = '';
              break;
            
            // Certificate Information
            case 'certificate_id':
              value = `CERT-${template.event?.id || '000'}-${participant.id || '001'}`;
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
          
          // Draw text with word wrap
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

  const downloadCertificate = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `certificate-${participant.user_name?.replace(/\s+/g, '-') || 'participant'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  if (!template || !participant) return null;

  return (
    <div className="bg-white rounded-lg">
      <div className="mb-4 flex justify-end">
        <button
          onClick={downloadCertificate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Preview
        </button>
      </div>
      <canvas 
        ref={canvasRef} 
        className="w-full border rounded-lg shadow-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}