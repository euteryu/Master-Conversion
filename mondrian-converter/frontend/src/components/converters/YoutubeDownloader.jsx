// src/components/converters/YoutubeDownloader.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
// FIX 1: Import the entire service object, not a specific function
import { conversionService } from '../../services/conversionService';

const API_URL = 'http://127.0.0.1:5000'; // For constructing download links

const YoutubeDownloader = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4_video');
  
  // State for managing UI stages
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadInfo, setDownloadInfo] = useState(null);

  const handleDownload = async () => {
    if (!url) {
      alert('Please paste a URL first.');
      return;
    }
    
    // Reset state and enter Stage 2 (Loading)
    setIsLoading(true);
    setError(null);
    setDownloadInfo(null);
    
    try {
      // FIX 2: Call the function as a method of the imported service object
      const result = await conversionService.downloadYoutubeVideo(url, format);
      // Enter Stage 3 (Complete)
      setDownloadInfo(result);
    } catch (err) {
      setError(err.message || 'Download failed. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetDownloader = () => {
    setUrl('');
    setDownloadInfo(null);
    setError(null);
    setIsLoading(false);
  }

  const formatOptions = [
    { id: 'mp4_video', text: 'MP4 - VIDEO', color: '#D21404' },
    { id: 'mkv_video', text: 'MKV - VIDEO', color: '#0047AB' },
    { id: 'mp3_audio', text: 'MP3 AUDIO ONLY', color: '#F7D002', textColor: '#000' }
  ];

  return (
    <div style={{
      height: '100vh', width: '100vw', background: '#F5F1E8',
      position: 'relative', overflow: 'hidden', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Audiowide, sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
        @keyframes sparkle { 
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        .progress-bar {
          width: 100%; height: 10px; background-color: #444; overflow: hidden;
        }
        .progress-bar-inner {
          width: 100%; height: 100%; background-color: #F7D002;
          animation: loading-progress 2s linear infinite;
        }
        @keyframes loading-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
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

      {/* Decorative Elements (same as before) */}
      <div style={{ position: 'absolute', top: '15%', right: '18%', width: '90px', height: '120px', background: '#F7D002', transform: 'skewX(-20deg) rotate(15deg)' }}></div>
      {/* ... other decorations ... */}

      {/* Main Content */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '2rem', zIndex: 10, width: '700px'
      }}>
        <h1 style={{ fontSize: '4.5rem', fontWeight: 'bold', color: 'black', letterSpacing: '4px', textShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}>
          DOWNLOAD YOUTUBE
        </h1>

        {/* CONDITIONAL UI RENDERING */}
        
        {isLoading ? ( // STAGE 2: LOADING
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem', letterSpacing: '2px' }}>PROCESSING...</div>
            <div className="progress-bar" style={{border: '4px solid black'}}>
                <div className="progress-bar-inner"></div>
            </div>
          </div>
        ) : error ? ( // STAGE 3: ERROR
          <div style={{ textAlign: 'center', background: '#D21404', color: 'white', padding: '20px', border: '4px solid black' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>ERROR</div>
            <p style={{ margin: '10px 0' }}>{error}</p>
            <button onClick={resetDownloader} style={{ background: 'black', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', fontSize: '1rem' }}>TRY AGAIN</button>
          </div>
        ) : downloadInfo ? ( // STAGE 3: SUCCESS
           <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ fontSize: '1.5rem' }}>Your file is ready!</div>
            <a href={`${API_URL}/api/download/${downloadInfo.filename}`} download style={{
                textDecoration: 'none', background: '#F7D002', color: 'black',
                border: '4px solid black', padding: '15px 30px', fontSize: '1.5rem',
                fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer',
                boxShadow: '6px 6px 0 rgba(0,0,0,0.15)',
            }}>
                DOWNLOAD FILE
            </a>
            <button onClick={resetDownloader} style={{background: 'none', border: 'none', color: 'black', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem'}}>Download another</button>
           </div>
        ) : ( // STAGE 1: INPUT
          <>
            <div style={{ display: 'flex', width: '100%', border: '5px solid black', boxShadow: '8px 8px 0 rgba(0,0,0,0.15)' }}>
              <div style={{ flexGrow: 1, background: '#F7D002', padding: '5px' }}>
                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="TYPE OR PASTE HERE" style={{
                    width: '100%', height: '60px', background: '#282828', border: 'none', color: 'white',
                    fontSize: '1.5rem', padding: '0 20px', fontFamily: 'Audiowide, sans-serif', outline: 'none', letterSpacing: '2px'
                }}/>
              </div>
              <button onClick={handleDownload} style={{ width: '80px', background: '#D21404', border: 'none', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s',
              }} onMouseEnter={(e) => e.currentTarget.style.background = '#E53E3E'} onMouseLeave={(e) => e.currentTarget.style.background = '#D21404'}>
                <Download size={36} color="white" strokeWidth={3} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
              {formatOptions.map(opt => ( <button key={opt.id} onClick={() => setFormat(opt.id)} style={{
                  background: opt.color, color: opt.textColor || 'white', border: '4px solid black',
                  padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px',
                  cursor: 'pointer', boxShadow: '6px 6px 0 rgba(0,0,0,0.15)',
                  transform: format === opt.id ? 'translate(3px, 3px)' : 'none',
                  boxShadow: format === opt.id ? '3px 3px 0 rgba(0,0,0,0.2)' : '6px 6px 0 rgba(0,0,0,0.15)',
                  transition: 'all 0.1s ease-in-out',
                }}>{opt.text}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default YoutubeDownloader;