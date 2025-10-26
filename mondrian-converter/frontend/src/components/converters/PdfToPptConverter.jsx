// src/components/converters/PdfToPptConverter.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { conversionService } from '../../services/conversionService';

const PdfToPptConverter = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [conversions, setConversions] = useState({});
  const [dragging, setDragging] = useState(false);
  const dropZoneRef = useRef(null);

  const handleFiles = async (fileList) => {
    const newFiles = Array.from(fileList).filter(f => f.type === 'application/pdf');
    
    for (const file of newFiles) {
      try {
        const data = await conversionService.uploadFile(file);
        setFiles(prev => [...prev, {
          id: Date.now() + Math.random(),
          file: file,
          uploadedFilename: data.filename,
          status: 'ready',
          progress: 0,
          outputFilename: null,
          error: null
        }]);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files?.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const startConversion = async (fileItem) => {
    const fileId = fileItem.id;
    setFiles(prev => prev.map(f => f.id === fileId ? {...f, status: 'converting', progress: 0} : f));
    
    try {
      const data = await conversionService.convert({
        filename: fileItem.uploadedFilename,
        from_format: 'PDF',
        to_format: 'PPT',
        mode: 'hybrid',
        quality: 'good'
      });
      
      // Poll for progress
      const interval = setInterval(async () => {
        try {
          const status = await conversionService.getStatus(data.conversion_id);
          if (status.total > 0) {
            const prog = Math.round((status.progress / status.total) * 100);
            setFiles(prev => prev.map(f => f.id === fileId ? {...f, progress: prog} : f));
          }
          
          if (status.status === 'completed') {
            setFiles(prev => prev.map(f => f.id === fileId ? {...f, status: 'completed', outputFilename: status.output_file} : f));
            clearInterval(interval);
          } else if (status.status === 'error') {
            setFiles(prev => prev.map(f => f.id === fileId ? {...f, status: 'error', error: status.error} : f));
            clearInterval(interval);
          }
        } catch (err) {
          clearInterval(interval);
        }
      }, 500);
    } catch (err) {
      setFiles(prev => prev.map(f => f.id === fileId ? {...f, status: 'error', error: err.message} : f));
    }
  };

  const downloadFile = (fileItem) => {
    if (fileItem.outputFilename) {
      conversionService.downloadFile(fileItem.outputFilename);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const triggerFileInput = () => {
    document.getElementById('file-input').click();
  };

  return (
    <div 
      ref={dropZoneRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={triggerFileInput}
      style={{ 
        height: '100vh', 
        width: '100vw',
        background: '#F5F1E8', 
        position: 'relative', 
        overflow: 'hidden',
        cursor: files.length === 0 ? 'pointer' : 'default'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
        
        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
        }
        
        .bauhaus-btn {
          font-family: 'Audiowide', sans-serif;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
      `}</style>

      {/* Header - Only Back Button */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          zIndex: 100
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            fontWeight: 700,
            padding: '0.5rem 1rem',
            fontFamily: 'Audiowide'
          }}
        >
          <ArrowLeft size={24} strokeWidth={3} />
          Back
        </button>
      </div>

      {/* Title */}
      <div style={{ 
        position: 'absolute',
        top: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        pointerEvents: 'none'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontFamily: 'Anton, sans-serif',
          fontWeight: 900,
          margin: 0,
          letterSpacing: '2px'
        }}>
          File Converter
        </h1>
      </div>

      {/* STAGE 1: No files - Show Bauhaus Upload Design */}
      {files.length === 0 && (
        <div className="noise-bg" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          position: 'relative',
          pointerEvents: 'none'
        }}>
          <div style={{ position: 'relative', width: '900px', height: '450px', left: '80px' }}>
            
            {/* Drag-n-drop dashed box - NOW VISIBLE */}
            <div style={{ 
              position: 'absolute', 
              left: '-150px', 
              top: '120px', 
              width: '280px', 
              height: '200px', 
              border: '3px dashed #333', 
              transform: 'rotate(-8deg)', 
              zIndex: 5 
            }}>
              <div style={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(15deg)',
                fontSize: '1.6rem',
                fontFamily: 'Audiowide',
                fontWeight: 900,
                color: '#000',
                textTransform: 'lowercase'
              }}>
                drag-n-drop
              </div>
            </div>

            {/* Accent triangles - left side */}
            <div style={{ position: 'absolute', left: '20px', top: '80px', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: '35px solid #E63946', transform: 'rotate(45deg)', zIndex: 4 }}></div>
            <div style={{ position: 'absolute', left: '150px', top: '60px', width: 0, height: 0, borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderBottom: '25px solid #4A90E2', transform: 'rotate(-20deg)', zIndex: 4 }}></div>
            <div style={{ position: 'absolute', left: '80px', top: '320px', width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderBottom: '30px solid #F4A261', transform: 'rotate(70deg)', zIndex: 4 }}></div>
            
            {/* Black lines */}
            <div style={{ position: 'absolute', left: '120px', top: '100px', width: '150px', height: '2px', background: '#000', transform: 'rotate(-25deg)', zIndex: 4 }}></div>
            <div style={{ position: 'absolute', left: '50px', top: '270px', width: '180px', height: '3px', background: '#000', transform: 'rotate(35deg)', zIndex: 4 }}></div>

            {/* SHIFTED RIGHT: Yellow background */}
            <div style={{ position: 'absolute', left: '200px', top: '80px', width: '480px', height: '320px', background: '#F4A261', transform: 'skewY(-3deg)', zIndex: 2 }}></div>

            {/* SHIFTED RIGHT: Blue background */}
            <div style={{ position: 'absolute', left: '320px', top: '180px', width: '430px', height: '250px', background: '#4A90E2', transform: 'skewY(2deg)', zIndex: 3 }}></div>

            {/* SHIFTED RIGHT: Main RED button */}
            <div style={{ 
              position: 'absolute',
              left: '300px',
              top: '100px',
              width: '520px',
              height: '270px',
              background: '#E63946',
              transform: 'perspective(800px) rotateY(-5deg) skewY(-2deg)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
              border: '4px solid #000',
              boxShadow: '8px 8px 0 rgba(0,0,0,0.2)',
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}>
              <svg width="55" height="65" viewBox="0 0 60 70">
                <path d="M10 0 L40 0 L50 10 L50 70 L10 70 Z" fill="#FFF" stroke="#000" strokeWidth="2"/>
                <path d="M40 0 L40 10 L50 10" fill="#E8E8E8" stroke="#000" strokeWidth="2"/>
                <rect x="18" y="25" width="24" height="3" fill="#999"/>
                <rect x="18" y="35" width="24" height="3" fill="#999"/>
              </svg>

              <div style={{ 
                fontFamily: 'Anton, sans-serif',
                fontSize: '4rem',
                fontWeight: 900,
                color: '#000',
                lineHeight: 0.85,
                textAlign: 'center',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                <div>CHOOSE</div>
                <div>FILES</div>
              </div>
            </div>

            {/* Right side triangles */}
            <div style={{ position: 'absolute', right: '80px', top: '130px', width: 0, height: 0, borderLeft: '25px solid transparent', borderRight: '25px solid transparent', borderBottom: '40px solid #E63946', transform: 'rotate(-30deg)', zIndex: 4 }}></div>
            <div style={{ position: 'absolute', right: '30px', top: '230px', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: '35px solid #F4A261', transform: 'rotate(15deg)', zIndex: 4 }}></div>
            <div style={{ position: 'absolute', right: '160px', bottom: '60px', width: 0, height: 0, borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderBottom: '25px solid #4A90E2', transform: 'rotate(-45deg)', zIndex: 4 }}></div>

            {/* Right side lines */}
            <div style={{ position: 'absolute', right: '130px', top: '80px', width: '180px', height: '3px', background: '#000', transform: 'rotate(55deg)', zIndex: 4 }}></div>
            <div style={{ position: 'absolute', right: '80px', bottom: '120px', width: '220px', height: '2px', background: '#000', transform: 'rotate(-40deg)', zIndex: 4 }}></div>
          </div>
        </div>
      )}

      {/* STAGE 2+: Files List */}
      {files.length > 0 && (
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{ 
            position: 'absolute',
            top: '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '900px',
            maxHeight: 'calc(100vh - 140px)',
            overflowY: 'auto',
            padding: '1rem'
          }}
        >
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <button
              onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
              className="bauhaus-btn"
              style={{
                padding: '0.75rem 2rem',
                background: '#4A90E2',
                color: '#FFF',
                border: '3px solid #000',
                fontSize: '1.2rem',
                cursor: 'pointer',
                boxShadow: '4px 4px 0 #000',
                fontFamily: 'Audiowide'
              }}
            >
              + Add More Files
            </button>
          </div>

          {files.map(fileItem => (
            <div key={fileItem.id} style={{ 
              background: '#FFF', 
              border: '4px solid #000', 
              padding: '1.5rem', 
              marginBottom: '1rem',
              boxShadow: '6px 6px 0 #E63946',
              position: 'relative'
            }}>
              <button
                onClick={() => removeFile(fileItem.id)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={24} />
              </button>

              <div style={{ fontFamily: 'Audiowide', fontSize: '1.3rem', marginBottom: '0.5rem', paddingRight: '3rem' }}>
                {fileItem.file.name}
              </div>
              <div style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {(fileItem.file.size / (1024 * 1024)).toFixed(2)} MB
              </div>

              {fileItem.status === 'ready' && (
                <button
                  onClick={() => startConversion(fileItem)}
                  className="bauhaus-btn"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: '#6B8E23',
                    color: '#FFF',
                    border: '3px solid #000',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    boxShadow: '4px 4px 0 #000',
                    fontFamily: 'Audiowide'
                  }}
                >
                  Convert →
                </button>
              )}

              {fileItem.status === 'converting' && (
                <div style={{ background: '#E8E8E8', height: '40px', border: '3px solid #000', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ 
                    position: 'absolute',
                    height: '100%',
                    width: `${fileItem.progress}%`,
                    background: 'linear-gradient(90deg, #E63946, #F4A261, #4A90E2)',
                    transition: 'width 0.3s'
                  }}></div>
                  <div style={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontFamily: 'Audiowide',
                    fontSize: '1.2rem',
                    mixBlendMode: 'difference',
                    color: '#FFF'
                  }}>
                    {fileItem.progress}%
                  </div>
                </div>
              )}

              {fileItem.status === 'completed' && (
                <button
                  onClick={() => downloadFile(fileItem)}
                  className="bauhaus-btn"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: '#6B8E23',
                    color: '#FFF',
                    border: '3px solid #000',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    boxShadow: '4px 4px 0 #000',
                    fontFamily: 'Audiowide'
                  }}
                >
                  ✓ Download
                </button>
              )}

              {fileItem.status === 'error' && (
                <div style={{ padding: '1rem', background: '#E63946', color: '#FFF', border: '3px solid #000', fontFamily: 'Audiowide' }}>
                  Error: {fileItem.error || 'Conversion failed'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        id="file-input"
        type="file"
        onChange={handleFileSelect}
        accept=".pdf"
        multiple
        style={{ display: 'none' }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Drag overlay */}
      {dragging && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(74, 144, 226, 0.2)',
          border: '8px dashed #4A90E2',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            fontFamily: 'Audiowide',
            fontSize: '4rem',
            color: '#4A90E2',
            textShadow: '4px 4px 0 #000'
          }}>
            DROP FILES HERE
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfToPptConverter;