// src/components/converters/VideoConverter.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { ArrowLeft, Film, ArrowRight } from 'lucide-react';
import { videoConversionService } from '../../services/videoConversionService';

const VideoConverter = () => {
  const navigate = useNavigate();

  // State Management
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sourceFile, setSourceFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('mkv');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [resultFile, setResultFile] = useState(null);
  
  const [newFilename, setNewFilename] = useState('');
  const [fileExtension, setFileExtension] = useState('');

  useEffect(() => {
    if (resultFile && resultFile.filename) {
      const parts = resultFile.filename.split('.');
      const ext = parts.pop();
      const baseName = sourceFile?.name.split('.').slice(0, -1).join('.') || parts.join('.');
      setFileExtension(ext);
      setNewFilename(baseName.replace(/[<>:"/\\|?*]/g, '_'));
    }
  }, [resultFile, sourceFile]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0 || status !== 'idle') return;
    const file = acceptedFiles[0];
    setSourceFile(file);
    setStatus('uploading');
    try {
      const uploadResult = await videoConversionService.uploadFile(file);
      setUploadedFile(uploadResult);
      setStatus('ready');
    } catch (err) {
      setError('File upload failed. Please try again.');
      setStatus('error');
    }
  }, [status]);

  // --- FIX IS HERE: `open` is renamed to `openFileDialog` ---
  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    multiple: false,
  });

  const handleConvert = async () => {
    if (!uploadedFile) return;
    setStatus('converting');
    try {
      const convertResult = await videoConversionService.convertLocalVideo(uploadedFile.filename, targetFormat);
      setResultFile(convertResult);
      setStatus('success');
    } catch (err) {
      setError('Conversion failed. The format may not be supported.');
      setStatus('error');
    }
  };
  
  const handleFinalDownload = async () => {
    try {
        const response = await fetch(`http://localhost:5000/api/download/${resultFile.filename}`);
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

  const resetState = () => {
    setUploadedFile(null);
    setSourceFile(null);
    setTargetFormat('mkv');
    setStatus('idle');
    setError('');
    setResultFile(null);
  };

  const formatOptions = ['mkv', 'mov', 'avi', 'mp3'];

  let dotsClassName = "filmstrip-v-border";
  if (status === 'idle') {
    dotsClassName += " dots-idle";
  } else if (status === 'uploading' || status === 'converting') {
    dotsClassName += " dots-converting";
  } else if (status === 'success' || status === 'error') {
    dotsClassName += " dots-success";
  }

  return (
    <div style={{
      height: '100vh', width: '100vw', background: '#F5F1E8',
      position: 'relative', overflow: 'hidden', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Audiowide, sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
        .filmstrip-v-border {
          background: black; width: 50px;
          background-image: radial-gradient(white 8px, transparent 9px);
          background-size: 30px 30px; background-position: center 0;
          background-repeat: repeat-y;
        }
        .progress-bar-inner {
            width: 100%; height: 100%;
            background: linear-gradient(to right, #F7D002 50%, #32CD32 50%);
            background-size: 200% 100%; background-position: 100% 0;
            animation: fillAndColorChange 20s linear forwards;
        }
        @keyframes fillAndColorChange { from { background-position: 100% 0; } to { background-position: 0 0; } }
        
        @keyframes scroll-dots {
          from { background-position-y: 0; }
          to { background-position-y: -60px; }
        }
        .dots-idle { animation: scroll-dots 10s linear infinite; }
        .dots-converting { animation: scroll-dots 3s linear infinite; }
        .dots-success { animation: scroll-dots 0.8s linear infinite; }
      `}</style>

      {status === 'idle' && (
        <div {...getRootProps({
          style: {
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: 10, cursor: 'pointer',
            background: isDragActive ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
            transition: 'background-color 0.2s ease'
          }
        })}>
          <input {...getInputProps()} />
        </div>
      )}
      
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 20 }}>
        <button onClick={(e) => {
          e.stopPropagation();
          navigate('/media-machine');
        }} style={{
          background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 700, color: 'black'
        }}>
          <ArrowLeft size={28} strokeWidth={3} /> Back
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', zIndex: 15, pointerEvents: 'none' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', textShadow: '3px 3px 0px rgba(0,0,0,0.1)' }}>CONVERT VIDEO</h1>
        <div style={{ display: 'flex', boxShadow: '10px 10px 0 rgba(0,0,0,0.15)' }}>
          <div className={dotsClassName}></div>
          <div style={{ background: 'white', padding: '2rem', borderTop: '10px solid black', borderBottom: '10px solid black', width: '700px' }}>
            
            {status === 'idle' && (
              <div style={{
                border: '3px dashed black', padding: '3rem', textAlign: 'center',
                background: isDragActive ? '#e0e0e0' : 'transparent', transition: 'background-color 0.2s ease'
              }}>
                <p style={{ fontSize: '1.5rem', margin: 0 }}>DRAG-N-DROP OR CLICK</p>
                <div style={{ pointerEvents: 'auto' }}>
                  {/* --- FIX IS HERE: using `openFileDialog` instead of `open` --- */}
                  <button onClick={(e) => { e.stopPropagation(); openFileDialog(); }} style={{
                    background: '#D21404', color: 'white', border: '2px solid black',
                    padding: '10px 20px', marginTop: '1rem', fontSize: '1rem', cursor: 'pointer'
                  }}>CHOOSE FILE</button>
                </div>
              </div>
            )}

            {(status === 'uploading' || status === 'ready') && (
              <div>
                <div style={{ background: '#282828', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{sourceFile?.name}</span>
                  <span style={{ opacity: 0.7 }}>CURRENT FORMAT: {sourceFile?.name.split('.').pop().toUpperCase()}</span>
                </div>
                {status === 'uploading' && <p style={{textAlign: 'center', marginTop: '1rem'}}>Uploading...</p>}
              </div>
            )}
            
            {(status === 'converting' || status === 'success' || status === 'error') && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    {status === 'converting' && (
                        <>
                            <p style={{ fontSize: '1.5rem', letterSpacing: '2px' }}>CONVERTING...</p>
                            <div style={{ width: '100%', height: '10px', backgroundColor: '#444', border: '2px solid black' }}>
                                <div className="progress-bar-inner"></div>
                            </div>
                        </>
                    )}
                    {status === 'success' && (
                        <div style={{pointerEvents: 'auto'}}>
                           <p style={{ fontSize: '1.5rem' }}>CONVERSION COMPLETE!</p>
                           <div style={{ display: 'flex', width: '100%', border: '4px solid black', margin: '1.5rem 0' }}>
                              <input type="text" value={newFilename} onChange={(e) => setNewFilename(e.target.value)} style={{ flexGrow: 1, height: '50px', background: '#fff', border: 'none', fontSize: '1.2rem', padding: '0 15px', fontFamily: 'Audiowide, sans-serif', outline: 'none' }}/>
                              <span style={{padding: '0 15px', display: 'flex', alignItems: 'center', background: '#ccc', fontSize: '1.2rem' }}>.{fileExtension}</span>
                           </div>
                           <button onClick={handleFinalDownload} style={{ textDecoration: 'none', background: '#F7D002', color: 'black', border: '4px solid black', padding: '15px 30px', fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '6px 6px 0 rgba(0,0,0,0.15)', cursor: 'pointer' }}>DOWNLOAD FILE</button>
                           <button onClick={resetState} style={{textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', marginTop: '2rem' }}>Convert another</button>
                        </div>
                    )}
                    {status === 'error' && (
                        <div style={{pointerEvents: 'auto'}}>
                           <p style={{ fontSize: '1.5rem', color: '#D21404' }}>ERROR</p>
                           <p>{error}</p>
                           <button onClick={resetState} style={{ background: 'black', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer'}}>TRY AGAIN</button>
                        </div>
                    )}
                </div>
            )}
          </div>
          <div className={dotsClassName}></div>
        </div>

        {status === 'ready' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '800px', pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>CHOOSE OUTPUT FORMAT:</span>
              <Film size={28} />
            </div>
            <div style={{ flexGrow: 1, background: '#0047AB', color: 'white', padding: '10px', display: 'flex', alignItems: 'center', gap: '1rem', border: '4px solid black' }}>
              {formatOptions.map(format => (
                <button key={format} onClick={() => setTargetFormat(format)} style={{ background: targetFormat === format ? 'white' : 'transparent', color: targetFormat === format ? 'black' : 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>{format.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={handleConvert} style={{ background: '#D21404', color: 'white', border: '4px solid black', padding: '15px 25px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '6px 6px 0 rgba(0,0,0,0.15)' }}>
              CONVERT <ArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoConverter;