// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainMenu from './components/MainMenu';
import PdfToPptConverter from './components/converters/PdfToPptConverter';
import VideoDownloader from './components/converters/VideoDownloader';
import YoutubeDownloader from './components/converters/YoutubeDownloader';
import VideoConverter from './components/converters/VideoConverter';
import TextToSpeechConverter from './components/converters/TextToSpeechConverter'; // <-- IMPORT NEW COMPONENT
import { statsService } from './services/statsService';

function App() {
  const [stats, setStats] = useState({ usage_count: 0, last_opened: 'Never' });
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const { i18n } = useTranslation();
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    statsService.incrementUsage()
      .then(data => setStats(data))
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
      audio.muted = isMuted;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.log("Audio autoplay was prevented."));
      }
    }
  }, [volume, isMuted]);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setLanguage(langCode);
  };

  return (
    <BrowserRouter>
      <audio ref={audioRef} src="/music/background.mp3" loop />
      <Routes>
        <Route 
          path="/" 
          element={<MainMenu 
            stats={stats} 
            volume={volume}
            setVolume={setVolume}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            language={language}
            onLanguageChange={handleLanguageChange}
          />} 
        />
        <Route path="/pdf-to-ppt" element={<PdfToPptConverter />} />
        
        {/* --- NEW ROUTE ADDED --- */}
        <Route path="/text-to-speech" element={<TextToSpeechConverter />} />

        <Route path="/media-machine" element={<VideoDownloader />} />
        <Route path="/media-machine/convert-media" element={<VideoConverter />} /> 
        <Route path="/media-machine/download-youtube" element={<YoutubeDownloader />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;