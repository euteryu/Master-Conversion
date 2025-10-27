// src/components/converters/TextToSpeechConverter.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { ArrowLeft, MessageSquare, Volume2, Volume1 } from 'lucide-react';
import { videoConversionService } from '../../services/videoConversionService'; // Reuse video service

const TextToSpeechConverter = () => {
  const navigate = useNavigate();
  const WORD_LIMIT = 20;

  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('en-female');
  const [pitch, setPitch] = useState(50);

  // --- STATE FOR MANAGING UI STAGES ---
  const [status, setStatus] = useState('idle'); // idle | converting | success | error
  const [error, setError] = useState('');
  const [audioFile, setAudioFile] = useState(null);

  const handleTextChange = (e) => {
    const words = e.target.value.split(/\s+/).filter(Boolean); // Remove empty strings
    if (words.length > WORD_LIMIT) {
      setText(words.slice(0, WORD_LIMIT).join(' '));
    } else {
      setText(e.target.value);
    }
  };

  // Handler to send the data to the backend to make mp3!
  const handleConvertToSpeech = async () => {
    if (!text) {
      setError('Please enter or paste text.');
      return;
    }
    setStatus('converting');
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/text-to-speech', { // Replace with your backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          language: 'en',  // Fixed to English for now per requirements
          voice: 'en-female'  // Fixed to English female voice for now.
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Conversion failed.');
      }

      const data = await response.json();
      setAudioFile(data);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Conversion failed.');
      setStatus('error');
    }
  };

  const resetState = () => {
    setUrl('');
    setText('');
    setAudioFile(null);
    setStatus('idle');
    setError('');
  };

  return (
    <div style={{
      height: '100vh', width: '100vw', background: '#F5F1E8',
      position: 'relative', overflow: 'hidden', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Audiowide, sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
        .tts-input, .tts-textarea {
          width: 100%; border: 3px solid black; padding: 0.75rem;
          font-family: sans-serif; font-size: 1rem;
        }
        .tts-textarea {
          height: 150px; resize: none;
        }
        .tts-label {
          background: black; color: white; padding: 0.5rem 1rem;
          display: inline-block; margin-bottom: 0.5rem; letter-spacing: 1px;
        }
        .pitch-slider {
          -webkit-appearance: none; appearance: none; width: 100%; height: 8px;
          background: #333; outline: none; border: 2px solid black;
        }
        .pitch-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 20px; height: 20px;
          background: white; cursor: pointer; border-radius: 50%; border: 2px solid black;
        }
        /* -- CSS for overlay and progress indicator -- */
        .overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background-color: rgba(0, 0, 0, 0.7); /* Translucent black */
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 25;
        }
        .loader {
          border: 8px solid #f3f3f3; /* Light grey */
          border-top: 8px solid #3498db; /* Blue */
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Back Button */}
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 100 }}>
        <button onClick={() => navigate('/')} style={{
          background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 700, color: 'black'
        }}>
          <ArrowLeft size={28} strokeWidth={3} /> Back
        </button>
      </div>

      {/* Overlay for converting stage */}
      {status === 'converting' && (
        <div className="overlay">
          <div className="loader"></div>
        </div>
      )}

      {/* Main Container */}
      <div style={{ width: '900px' }}>
        {/* Header */}
        <div style={{
          background: 'black', color: 'white', display: 'flex', alignItems: 'center',
          gap: '1rem', padding: '1rem', border: '8px solid black',
          borderBottom: 'none', letterSpacing: '2px'
        }}>
          <div style={{ background: '#D21404', padding: '0.5rem', border: '2px solid black' }}>
            <MessageSquare size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>TEXT-TO-SPEECH CONVERTER</h1>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', border: '8px solid black' }}>
          {/* Left Column */}
          <div style={{ flex: 2, background: 'white', padding: '1.5rem', borderRight: '8px solid black', display: 'flex', flexDirection: 'column', gap: '1.5rem', pointerEvents: status === 'converting' ? 'none' : 'auto'  /* Disable interactions during conversion */}}>
            <div>
              <div className="tts-label">PASTE ARTICLE LINK</div>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://news.com/article..." className="tts-input" disabled={status === 'converting'}/>
            </div>
            <div>
              <div className="tts-label">OR PASTE TEXT BELOW</div>
              <textarea value={text} onChange={handleTextChange} placeholder="Copy and paste paragraphs or sentences here..." className="tts-textarea" disabled={status === 'converting'}/>
            </div>
            {status === 'idle' && (
              <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                <button style={{ flex: 1, background: '#0047AB', color: 'white', border: '4px solid black', padding: '0.75rem', fontSize: '1rem', fontWeight: 'bold' }}>OUTPUT FORMAT: MP3</button>
                <button onClick={handleConvertToSpeech} style={{ flex: 1, background: '#F7D002', color: 'black', border: '4px solid black', padding: '0.75rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>PLAY PREVIEW</button>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#D21404', padding: '1.5rem', borderBottom: '8px solid black', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button style={{ background: 'black', color: 'white', border: '4px solid white', padding: '0.75rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>ANALYZE LINK</button>
              {/* Conditionally render the convert button */}
              {status === 'ready' || status === 'idle' && (
                <button onClick={handleConvertToSpeech} style={{ background: 'white', color: 'black', border: '4px solid black', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', pointerEvents: status === 'converting' ? 'none' : 'auto'  // Disable button during conversion
                 }}>CONVERT TO SPEECH</button>
              )}
              {/* Display audio if ready */}
              {status === 'success' && (
                <audio controls src={`http://localhost:5000/api/download/${audioFile.filename}`} style={{ marginTop: '1rem' }}></audio>
              )}
              {/* Voice Settings (unchanged) */}
              <div style={{
                background: 'white', color: 'black', border: '4px solid black',
                padding: '1rem', marginTop: '1rem', transform: 'translateX(10px)',
                boxShadow: '-6px 6px 0px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>VOICE SETTINGS</div>
                <select value={voice} onChange={e => setVoice(e.target.value)} style={{ width: '100%', border: '3px solid black', padding: '0.5rem', fontFamily: 'Audiowide' }}>
                  <option value="en-female">English Female</option>
                  <option value="en-male">English Male</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <Volume1 />
                  <input type="range" value={pitch} onChange={e => setPitch(e.target.value)} className="pitch-slider" />
                  <Volume2 />
                </div>
              </div>
            </div>
            <div style={{ flexGrow: 1, display: 'flex' }}>
              <div style={{ flex: 1, background: 'white' }}></div>
              <div style={{ flex: 1, background: '#0047AB' }}></div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ background: 'black', color: 'white', padding: '0.75rem', border: '8px solid black', borderTop: 'none', textAlign: 'center', fontSize: '0.9rem' }}>
          Files are temporarily stored for 24 hours. Voice synthesis by advanced AI.
        </div>
      </div>
      
      {/* Decorative elements */}
      <div style={{position: 'absolute', top: '10%', left: '15%', width: '30px', height: '3px', background: 'black', transform: 'rotate(45deg)'}}></div>
      <div style={{position: 'absolute', bottom: '8%', right: '12%', width: '40px', height: '4px', background: 'black', transform: 'rotate(-30deg)'}}></div>
      <div style={{position: 'absolute', top: '12%', right: '20%', width: '20px', height: '20px', background: '#F7D002', border: '3px solid black'}}></div>
      <div style={{position: 'absolute', bottom: '15%', left: '22%', width: '25px', height: '25px', background: '#D21404', border: '3px solid black'}}></div>

    </div>
  );
};

export default TextToSpeechConverter;