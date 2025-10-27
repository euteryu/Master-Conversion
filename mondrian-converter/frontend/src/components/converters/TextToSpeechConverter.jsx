// src/components/converters/TextToSpeechConverter.jsx
import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Volume2, Volume1 } from 'lucide-react';
import { ttsService } from '../../services/ttsService';

const TsunamiLoader = () => {
    const squares = useMemo(() => Array.from({ length: 40 }).map((_, i) => {
        const size = Math.random() * 80 + 20;
        const slideDuration = Math.random() * 3 + 3;
        const spinDuration = Math.random() * 5 + 3;
        const delay = Math.random() * 5;

        return {
            id: i,
            style: {
                position: 'absolute',
                top: `${Math.random() * 90}vh`,
                width: `${size}px`,
                height: `${size}px`,
                background: ['#D21404', '#0047AB', '#F7D002', 'white'][Math.floor(Math.random() * 4)],
                border: '3px solid black',
                animation: `slideAcross ${slideDuration}s linear ${delay}s infinite, spin ${spinDuration}s linear infinite`
            }
        };
    }), []);
    return <>{squares.map(sq => <div key={sq.id} style={sq.style}></div>)}</>;
};

const TextToSpeechConverter = () => {
  const navigate = useNavigate();
  const WORD_LIMIT = 2000;
  
  const audioRef = useRef(null);

  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('en-female');
  const [pitch, setPitch] = useState(50);

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTextChange = (e) => {
    const words = e.target.value.split(/\s+/).filter(Boolean);
    if (words.length > WORD_LIMIT) {
      setText(words.slice(0, WORD_LIMIT).join(' '));
    } else {
      setText(e.target.value);
    }
  };

  const handleAnalyzeLink = async () => {
    if (!url) { alert('Please paste an article link first.'); return; }
    setIsAnalyzing(true);
    setError('');
    try {
      const result = await ttsService.extractTextFromUrl(url);
      setText(result.text);
    } catch (err) {
      setError(err.message);
      setStatus('error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConvertToSpeech = async () => {
    if (!text) { alert('Please paste or analyze text first.'); return; }
    setStatus('converting');
    setError('');
    try {
      const result = await ttsService.convertTextToSpeech(text, voice);
      setAudioFile(result);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };
  
  const handleFinalDownload = async () => {
    if (!audioFile) return;
    try {
        const response = await fetch(`http://localhost:5000/api/download/${audioFile.filename}`);
        if (!response.ok) throw new Error('Network response was not ok.');
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = `tts-output.wav`; // Note: Coqui outputs WAV
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
    } catch (err) {
        setError("Could not download the file. Please try again.");
        setStatus('error');
    }
  };

  const resetState = () => {
    setUrl(''); setText(''); setAudioFile(null);
    setStatus('idle'); setError('');
  };

  return (
    <div style={{
      height: '100vh', width: '100vw', background: '#F5F1E8',
      position: 'relative', overflow: 'hidden', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Audiowide, sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
        .tts-input, .tts-textarea { width: 100%; border: 3px solid black; padding: 0.75rem; font-family: sans-serif; font-size: 1rem; }
        .tts-textarea { height: 150px; resize: none; }
        .tts-label { background: black; color: white; padding: 0.5rem 1rem; display: inline-block; margin-bottom: 0.5rem; letter-spacing: 1px; }
        .pitch-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; background: #333; outline: none; border: 2px solid black; }
        .pitch-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: white; cursor: pointer; border-radius: 50%; border: 2px solid black; }
        .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); z-index: 25; overflow: hidden; }
        
        /* --- FIX: REMOVED INVALID COMMENT, KEPT VALID CSS --- */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideAcross {
          from { left: -150px; }
          to { left: 100vw; }
        }
      `}</style>

      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 100 }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 700, color: 'black' }}>
          <ArrowLeft size={28} strokeWidth={3} /> Back
        </button>
      </div>

      {status === 'converting' && (
        <div className="overlay">
          <TsunamiLoader />
        </div>
      )}

      <div style={{ width: '900px', filter: status === 'converting' ? 'blur(5px)' : 'none', transition: 'filter 0.3s ease' }}>
        <div style={{ background: 'black', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '8px solid black', borderBottom: 'none', letterSpacing: '2px' }}>
          <div style={{ background: '#D21404', padding: '0.5rem', border: '2px solid black' }}><MessageSquare size={32} /></div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>TEXT-TO-SPEECH CONVERTER</h1>
        </div>

        <div style={{ display: 'flex', border: '8px solid black' }}>
          <div style={{ flex: 2, background: 'white', padding: '1.5rem', borderRight: '8px solid black', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div className="tts-label">PASTE ARTICLE LINK</div>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://news.com/article..." className="tts-input" />
            </div>
            <div>
              <div className="tts-label">OR PASTE TEXT BELOW</div>
              <textarea value={text} onChange={handleTextChange} placeholder="Copy and paste paragraphs or sentences here..." className="tts-textarea" />
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
              <button style={{ flex: 1, background: '#0047AB', color: 'white', border: '4px solid black', padding: '0.75rem', fontSize: '1rem', fontWeight: 'bold' }}>OUTPUT FORMAT: MP3</button>
              {status === 'success' && (
                  <button onClick={handleFinalDownload} style={{ flex: 1, background: '#F7D002', color: 'black', border: '4px solid black', padding: '0.75rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>DOWNLOAD</button>
              )}
            </div>
          </div>

          <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#D21404', padding: '1.5rem', borderBottom: '8px solid black', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button onClick={handleAnalyzeLink} disabled={isAnalyzing || !url} style={{ background: 'black', color: 'white', border: '4px solid white', padding: '0.75rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', opacity: isAnalyzing ? 0.6 : 1 }}>
                {isAnalyzing ? 'ANALYZING...' : 'ANALYZE LINK'}
              </button>
              
              {status === 'success' && (
                <div style={{ padding: '0.5rem 0' }}>
                  <audio ref={audioRef} controls src={audioFile ? `http://localhost:5000/api/download/${audioFile.filename}` : ''} style={{ width: '100%' }} />
                </div>
              )}
              {status === 'error' && (
                <div style={{background: 'white', color: 'black', border: '4px solid black', padding: '1rem', textAlign: 'center'}}>
                    <p style={{margin: 0, fontWeight: 'bold'}}>ERROR</p>
                    <p style={{fontSize: '0.9rem'}}>{error}</p>
                    <button onClick={resetState} style={{background: 'black', color: 'white', border: 'none', padding: '8px 16px', cursor: 'pointer'}}>TRY AGAIN</button>
                </div>
              )}
              {(status === 'idle' || status === 'uploading') && (
                <button onClick={handleConvertToSpeech} style={{ background: 'white', color: 'black', border: '4px solid black', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>CONVERT TO SPEECH</button>
              )}
              
              <div style={{ background: 'white', color: 'black', border: '4px solid black', padding: '1rem', marginTop: '1rem', transform: 'translateX(10px)', boxShadow: '-6px 6px 0px rgba(0,0,0,0.2)' }}>
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
        
        <div style={{ background: 'black', color: 'white', padding: '0.75rem', border: '8px solid black', borderTop: 'none', textAlign: 'center', fontSize: '0.9rem' }}>
          Audio not saved unless explicitly downloaded. Voice synthesis by Google Text-to-Speech.
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechConverter;