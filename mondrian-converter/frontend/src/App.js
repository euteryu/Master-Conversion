// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import PdfToPptConverter from './components/converters/PdfToPptConverter';
import VideoDownloader from './components/converters/VideoDownloader';
import YoutubeDownloader from './components/converters/YoutubeDownloader';
import VideoConverter from './components/converters/VideoConverter';
import { statsService } from './services/statsService';

function App() {
  const [stats, setStats] = useState({ usage_count: 0, last_opened: 'Never' });
  
  // --- NEW STATE FOR GLOBAL AUDIO CONTROL ---
  const [volume, setVolume] = useState(50); // Volume from 0 to 100
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null); // Ref to directly control the audio element

  useEffect(() => {
    statsService.incrementUsage()
      .then(data => setStats(data))
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

  // Effect to handle audio playback and volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100; // HTML audio volume is 0.0 to 1.0
      audio.muted = isMuted;

      // Attempt to play audio, handling browser autoplay restrictions
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Audio autoplay was prevented. User must interact with the page first.");
        });
      }
    }
  }, [volume, isMuted]);

  return (
    <BrowserRouter>
      {/* --- NEW AUDIO ELEMENT --- */}
      <audio ref={audioRef} src="/music/background.mp3" loop />

      <Routes>
        {/* Pass audio state and setters to the Main Menu */}
        <Route 
          path="/" 
          element={<MainMenu 
            stats={stats} 
            volume={volume}
            setVolume={setVolume}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />} 
        />
        
        <Route path="/pdf-to-ppt" element={<PdfToPptConverter />} />
        
        {/* Media Machine Routes */}
        <Route path="/media-machine" element={<VideoDownloader />} />
        <Route path="/media-machine/convert-media" element={<VideoConverter />} /> 
        <Route path="/media-machine/download-youtube" element={<YoutubeDownloader />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;