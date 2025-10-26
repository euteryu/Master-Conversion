// src/components/converters/YoutubeDownloader.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';

const YoutubeDownloader = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4_video'); // 'mp4_video', 'mkv_video', 'mp3_audio'

  const handleDownload = () => {
    if (!url) {
      alert('Please paste a URL first.');
      return;
    }
    console.log(`Downloading URL: ${url} as ${format}`);
    // Future: Add actual download logic here
  };

  const formatOptions = [
    { id: 'mp4_video', text: 'MP4 - VIDEO', color: '#D21404' },
    { id: 'mkv_video', text: 'MKV - VIDEO', color: '#0047AB' },
    { id: 'mp3_audio', text: 'MP3 AUDIO ONLY', color: '#F7D002', textColor: '#000' }
  ];

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: '#F5F1E8',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Audiowide, sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
        @keyframes sparkle {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>

      {/* Back Button */}
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 100 }}>
        <button onClick={() => navigate('/media-machine')} style={{
          background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 700,
          fontFamily: 'Audiowide', letterSpacing: '2px', color: 'black'
        }}>
          <ArrowLeft size={28} strokeWidth={3} />
          Back
        </button>
      </div>
      
      {/* Decorative Elements */}
      <div style={{ position: 'absolute', top: '15%', right: '18%', width: '90px', height: '120px', background: '#F7D002', transform: 'skewX(-20deg) rotate(15deg)' }}></div>
      <div style={{ position: 'absolute', top: '20%', right: '22%', width: '80px', height: '25px', background: '#0047AB', transform: 'rotate(15deg)' }}></div>
      <div style={{ position: 'absolute', top: '18%', right: '16%', width: 0, height: 0, borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderBottom: '25px solid #D21404' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', left: '15%', width: '130px', height: '90px', background: '#0047AB', transform: 'skewY(20deg) rotate(-25deg)', border: '4px solid black' }}></div>
      <div style={{ position: 'absolute', bottom: '14%', left: '20%', width: '100px', height: '20px', background: '#D21404', transform: 'rotate(-25deg)' }}></div>
      <div style={{ position: 'absolute', bottom: '20%', left: '16%', width: '15px', height: '15px', background: 'black', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', top: '25%', left: '30%', width: '8px', height: '8px', color: 'white', fontSize: '2rem', animation: 'sparkle 2s ease-in-out infinite' }}>✦</div>
      <div style={{ position: 'absolute', bottom: '22%', right: '25%', width: '10px', height: '10px', color: 'white', fontSize: '2.5rem', animation: 'sparkle 2s ease-in-out 1s infinite' }}>✦</div>
      

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        zIndex: 10
      }}>
        <h1 style={{ fontSize: '4.5rem', fontWeight: 'bold', color: 'black', letterSpacing: '4px', textShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}>
          DOWNLOAD YOUTUBE
        </h1>

        {/* Input Bar */}
        <div style={{ display: 'flex', width: '700px', border: '5px solid black', boxShadow: '8px 8px 0 rgba(0,0,0,0.15)' }}>
          <div style={{ flexGrow: 1, background: '#F7D002', padding: '5px' }}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="TYPE OR PASTE HERE"
              style={{
                width: '100%',
                height: '60px',
                background: '#282828',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                padding: '0 20px',
                fontFamily: 'Audiowide, sans-serif',
                outline: 'none',
                letterSpacing: '2px',
              }}
            />
          </div>
          <button onClick={handleDownload} style={{
            width: '80px',
            background: '#D21404',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E53E3E'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#D21404'}
          >
            <Download size={36} color="white" strokeWidth={3} />
          </button>
        </div>

        {/* Format Selection Buttons */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
          {formatOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setFormat(opt.id)}
              style={{
                background: opt.color,
                color: opt.textColor || 'white',
                border: '4px solid black',
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                letterSpacing: '1px',
                cursor: 'pointer',
                boxShadow: '6px 6px 0 rgba(0,0,0,0.15)',
                transform: format === opt.id ? 'translate(3px, 3px)' : 'none',
                boxShadow: format === opt.id ? '3px 3px 0 rgba(0,0,0,0.2)' : '6px 6px 0 rgba(0,0,0,0.15)',
                transition: 'all 0.1s ease-in-out',
              }}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YoutubeDownloader;