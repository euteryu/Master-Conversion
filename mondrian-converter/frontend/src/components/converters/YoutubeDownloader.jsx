// src/components/converters/YoutubeDownloader.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { conversionService } from '../../services/conversionService';

const API_URL = 'http://127.0.0.1:5000';

const YoutubeDownloader = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4_video');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadInfo, setDownloadInfo] = useState(null);
  
  const [newFilename, setNewFilename] = useState('');
  const [fileExtension, setFileExtension] = useState('');

  useEffect(() => {
    if (downloadInfo && downloadInfo.filename) {
      const parts = downloadInfo.filename.split('.');
      const ext = parts.pop();
      const baseName = downloadInfo.originalTitle || parts.join('.');
      setFileExtension(ext);
      setNewFilename(baseName.replace(/[<>:"/\\|?*]/g, '_'));
    }
  }, [downloadInfo]);

  const handleDownloadRequest = async () => {
    if (!url) {
      alert('Please paste a URL first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setDownloadInfo(null);
    try {
      const result = await conversionService.downloadYoutubeVideo(url, format);
      setDownloadInfo(result);
    } catch (err) {
      setError(err.message || 'Download failed. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFinalDownload = async () => {
    try {
        const response = await fetch(`${API_URL}/api/download/${downloadInfo.filename}`);
        if (!response.ok) throw new Error('Network response was not ok.');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${newFilename}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (err) {
        setError("Could not download the file. Please try again.");
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
    { id: 'mp3_audio', text: 'MP3 AUDIO ONLY', color: '#F7D002', textColor: '#000' },
    { id: 'default_video', text: 'DEFAULT', color: '#282828' }
  ];

  return (
    <div style={{
      height: '100vh', width: '100vw', background: '#F5F1E8',
      position: 'relative', overflow: 'hidden', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Audiowide, sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
        .progress-bar {
          width: 100%; height: 10px; background-color: #444; overflow: hidden;
        }
        .progress-bar-inner {
          width: 100%; height: 100%;
          background: linear-gradient(to right, #F7D002 50%, #32CD32 50%);
          background-size: 200% 100%;
          background-position: 100% 0;
          animation: fillAndColorChange 15s linear forwards;
        }
        @keyframes fillAndColorChange {
          from { background-position: 100% 0; }
          to { background-position: 0 0; }
        }
        @keyframes floatAround {
          0% { transform: translate(0, 0); }
          25% { transform: translate(15px, 20px) rotate(10deg); }
          50% { transform: translate(-10px, -15px); }
          75% { transform: translate(20px, -5px) rotate(-10deg); }
          100% { transform: translate(0, 0); }
        }
      `}</style>

      {/* Back Button */}
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 100 }}>
        <button onClick={() => navigate('/media-machine')} style={{
          background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 700,
          color: 'black'
        }}>
          <ArrowLeft size={28} strokeWidth={3} /> Back
        </button>
      </div>
      
      {/* Main Content Container */}
      <div style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '2rem', zIndex: 10, width: '700px'
      }}>
        {/* -- DECORATIVE ELEMENT MODIFIED -- */}
        <div style={{ 
          position: 'absolute',
          top: '10px', right: '-100px', /* <-- Repositioned */
          width: '150px', height: '200px', /* <-- Resized */
          background: '#F7D002', 
          transform: 'skewX(-20deg) rotate(15deg)',
          overflow: 'hidden',
          zIndex: -1
        }}>
          {/* -- ICONS MADE SOLID BLACK -- */}
          <span style={{position: 'absolute', fontSize: '2.2rem', top: '10%', left: '20%', filter: 'grayscale(100%)', animation: 'floatAround 12s ease-in-out infinite alternate'}}>🎬</span>
          <span style={{position: 'absolute', fontSize: '2.8rem', top: '60%', left: '50%', filter: 'grayscale(100%)', animation: 'floatAround 15s ease-in-out infinite'}}>🎥</span>
          <span style={{position: 'absolute', fontSize: '2.2rem', top: '30%', left: '70%', filter: 'grayscale(100%)', animation: 'floatAround 10s ease-in-out infinite reverse'}}>▶️</span>
        </div>

        <h1 style={{ fontSize: '4.5rem', fontWeight: 'bold', letterSpacing: '4px', textShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}>
          DOWNLOAD YOUTUBE
        </h1>

        {isLoading ? ( // STAGE 2
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem'}}>
              <div style={{ fontSize: '1.5rem', letterSpacing: '2px' }}>PROCESSING...</div>
            </div>
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
           <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', width: '100%' }}>
            <div style={{ fontSize: '1.5rem' }}>Your file is ready!</div>
            <div style={{ display: 'flex', width: '100%', border: '4px solid black' }}>
              <input type="text" value={newFilename} onChange={(e) => setNewFilename(e.target.value)} style={{
                  flexGrow: 1, height: '50px', background: '#fff', border: 'none',
                  fontSize: '1.2rem', padding: '0 15px', fontFamily: 'Audiowide, sans-serif', outline: 'none'
              }}/>
              <span style={{padding: '0 15px', display: 'flex', alignItems: 'center', background: '#ccc', fontSize: '1.2rem' }}>.{fileExtension}</span>
            </div>
            <button onClick={handleFinalDownload} style={{
                background: '#F7D002', color: 'black', border: '4px solid black', 
                padding: '15px 30px', fontSize: '1.5rem', fontWeight: 'bold', 
                letterSpacing: '1px', cursor: 'pointer',
                boxShadow: '6px 6px 0 rgba(0,0,0,0.15)',
            }}>
                DOWNLOAD FILE
            </button>
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
              <button onClick={handleDownloadRequest} style={{ width: '80px', background: '#D21404', border: 'none', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s',
              }} onMouseEnter={(e) => e.currentTarget.style.background = '#E53E3E'} onMouseLeave={(e) => e.currentTarget.style.background = '#D21404'}>
                <Download size={36} color="white" strokeWidth={3} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {formatOptions.map(opt => ( <button key={opt.id} onClick={() => setFormat(opt.id)} style={{
                  background: opt.color, color: opt.textColor || 'white', border: '4px solid black',
                  padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px',
                  cursor: 'pointer',
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