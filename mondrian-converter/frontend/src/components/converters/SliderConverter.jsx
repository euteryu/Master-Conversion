// src/components/converters/SliderConverter.jsx
import React, { useState, useEffect, useRef } from 'react';
// --- NEW: Re-importing Link and ArrowLeft for the back button ---
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Settings, Download, AlertTriangle } from 'lucide-react';
import { aiService } from '../../services/aiService';

const SliderConverter = () => {
  const [isUnderConstruction] = useState(true);

  const titleWords = [
    { text: 'POWERPOINT', color: '#D21404' },
    { text: 'POSTER', color: '#0047AB' },
    { text: 'FLASHCARD', color: '#F7D002' },
  ];
  // ... (All other state and logic remains the same) ...
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generationStatus, setGenerationStatus] = useState({ message: '' });
  const [error, setError] = useState(null);
  const [outputFilename, setOutputFilename] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState('Revision Theme');
  const [outputFormat, setOutputFormat] = useState('powerpoint');
  const themes = ['Revision Theme', 'Minutes Theme', 'Upload Custom Theme'];
  const pollingInterval = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % titleWords.length);
    }, 5000);
    return () => {
      clearInterval(intervalId);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [titleWords.length]);

  const handleCreateClick = async () => { /* ... existing function ... */ };


  return (
    <div className="h-screen w-screen bg-[#e2e2e2] flex items-center justify-center p-4 relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
        .mondrian-font { font-family: 'Audiowide', sans-serif; }
        .animated-word {
            display: inline-block;
            transition: color 1.5s ease-in-out;
            color: ${titleWords[currentWordIndex].color};
        }
        
        @keyframes pulse-animation {
          0% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
          50% { transform: scale(1.03); box-shadow: 0 0 30px rgba(255, 255, 255, 0.3); }
          100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
        }
        .pulsing-sign {
          animation: pulse-animation 2.5s ease-in-out infinite;
        }
      `}</style>
      
      {isUnderConstruction && (
        <div className="absolute inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
          
          {/* --- NEW: Pulsing Back Button added to the overlay --- */}
          <Link 
            to="/" 
            className="absolute top-8 left-8 flex items-center gap-2 bg-white text-black py-2 px-4 rounded-md border-2 border-black mondrian-font pulsing-sign hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={24} />
            Back to Menu
          </Link>
          
          <div className="w-[500px] h-[300px] bg-black p-2.5 grid grid-cols-4 grid-rows-3 gap-2.5 pulsing-sign border-4 border-white">
              <div className="bg-[#F7D002] col-span-1 row-span-1"></div>
              <div 
                className="bg-white col-span-3 row-span-2 flex flex-col items-center justify-center text-center p-4"
              >
                  <h2 className="mondrian-font text-3xl font-bold text-black">Page Under</h2>
                  <h2 className="mondrian-font text-3xl font-bold text-black">Construction</h2>
              </div>
              <div className="bg-[#D21404] col-span-1 row-span-2"></div>
              <div className="bg-white col-span-2 row-span-1 col-start-2"></div>
              <div className="bg-[#0047AB] col-span-1 row-span-1 col-start-4"></div>
          </div>
        </div>
      )}

      {/* The original page content remains below, visually obscured but still rendered */}
      <div className="w-full max-w-7xl h-full max-h-[700px] bg-black p-[12px] flex flex-col gap-[12px] relative overflow-hidden">
        {/* Header (will be visible underneath the overlay) */}
        <header className="bg-white flex-shrink-0 flex items-center justify-between relative p-4">
          <div className="w-20"></div> 
          <h1 className="mondrian-font text-3xl lg:text-4xl text-black font-bold absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
            <span>AI&nbsp;</span>
            <span className="animated-word">{titleWords[currentWordIndex].text}</span>
            <span>&nbsp;GENERATOR</span>
          </h1>
          <div className="w-20"></div>
        </header>

        {/* Main Grid (will be visible underneath the overlay) */}
        <div className="grid grid-cols-12 grid-rows-12 flex-grow gap-[12px] relative">
          <div className="col-span-6 row-span-8 col-start-3 bg-white p-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-full text-lg p-4 border-[3px] border-gray-300 focus:border-black focus:outline-none resize-none bg-gray-50 mondrian-font"
              placeholder="I want a slide deck to summarise key learnings from today's lecture..."
              disabled={isLoading}
            ></textarea>
          </div>
          {/* ... All other grid cells and buttons remain the same and will be obscured by the overlay ... */}
        </div>
      </div>
    </div>
  );
};

export default SliderConverter;