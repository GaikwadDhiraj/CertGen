// app/components/CertificateGenerator.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, Mail, Award, Loader } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface CertificateGeneratorProps {
  eventId: number;
  template: any; // The template with fields
  participants: any[]; // List of participants who attended
  onComplete?: () => void;
}

export default function CertificateGenerator({ 
  eventId, 
  template, 
  participants,
  onComplete 
}: CertificateGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate a single certificate - FIX: Make it async
  const generateCertificate = async (participant: any) => {
    return new Promise(async (resolve) => {  // Make the Promise callback async
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load background image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {  // Make onload async
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw background
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Draw each field
        template.fields.forEach((field: any) => {
          // Get the value for this field
          let value = '';
          switch(field.field_key) {
            case 'name':
              value = participant.user_name;
              break;
            case 'email':
              value = participant.user_email;
              break;
            case 'college':
              value = participant.user_college;
              break;
            case 'department':
              value = participant.user_department;
              break;
            case 'event_name':
              value = template.event_name || 'Event';
              break;
            case 'event_date':
              value = new Date().toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              });
              break;
            case 'result':
              value = 'Participant'; // You can customize this
              break;
            case 'custom':
              value = field.defaultValue || '';
              break;
            default:
              value = '';
          }

          // Set text styles
          ctx.font = `${field.fontWeight || 'normal'} ${field.fontSize || 16}px ${field.fontFamily || 'Arial'}`;
          ctx.fillStyle = field.color || '#000000';
          ctx.textAlign = field.textAlign || 'left';
          
          // Calculate position (center if needed)
          let x = field.x;
          if (field.textAlign === 'center') {
            x = field.x + (field.width / 2);
          } else if (field.textAlign === 'right') {
            x = field.x + field.width;
          }
          
          // Draw text
          ctx.fillText(value, x, field.y + (field.height / 2) + (field.fontSize / 3));
        });

        // Convert canvas to data URL
        const certificateUrl = canvas.toDataURL('image/png');
        
        // Save to database
        const { data, error } = await supabase  // This await is now in an async function
          .from('issued_certificates')
          .insert({
            event_id: eventId,
            template_id: template.id,
            registration_id: participant.id,
            participant_name: participant.user_name,
            certificate_url: certificateUrl,
            generated_at: new Date().toISOString()
          })
          .select();

        if (!error) {
          setGenerated(prev => [...prev, { participant, url: certificateUrl }]);
        }
        
        resolve(true);
      };

      img.src = template.background_url;
    });
  };

  // Generate all certificates
  const generateAll = async () => {
    setGenerating(true);
    setProgress(0);
    
    for (let i = 0; i < participants.length; i++) {
      await generateCertificate(participants[i]);
      setProgress(Math.round(((i + 1) / participants.length) * 100));
    }
    
    setGenerating(false);
    if (onComplete) onComplete();
  };

  // Download a single certificate
  const downloadCertificate = (url: string, participantName: string) => {
    const link = document.createElement('a');
    link.download = `certificate-${participantName.replace(/\s+/g, '-')}.png`;
    link.href = url;
    link.click();
  };

  // Download all as zip (simplified - in production use JSZip)
  const downloadAll = () => {
    generated.forEach((item, index) => {
      setTimeout(() => {
        downloadCertificate(item.url, item.participant.user_name);
      }, index * 500);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Generate Certificates</h3>
          <p className="text-sm text-gray-600">
            Template: {template?.name} • {participants.length} participants
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={generateAll}
            disabled={generating || participants.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating... {progress}%
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                Generate All
              </>
            )}
          </button>
          
          {generated.length > 0 && (
            <button
              onClick={downloadAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download All ({generated.length})
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {generating && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Generated {generated.length} of {participants.length} certificates
          </p>
        </div>
      )}

      {/* Generated Certificates List */}
      {generated.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Generated Certificates</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {generated.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.participant.user_name}</p>
                  <p className="text-xs text-gray-600">{item.participant.user_email}</p>
                </div>
                <button
                  onClick={() => downloadCertificate(item.url, item.participant.user_name)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}