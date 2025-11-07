// src/components/AboutPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Github } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="h-screen w-screen bg-[#e2e2e2] flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
        .mondrian-font { font-family: 'Audiowide', sans-serif; }
        
        /* --- NEW ANIMATION KEYFRAMES --- */
        @keyframes move-v1 { 0% { top: -10%; } 100% { top: 110%; } }
        @keyframes move-v2 { 0% { top: 110%; } 100% { top: -10%; } }
        @keyframes move-h1 { 0% { left: -10%; } 100% { left: 110%; } }
        @keyframes move-h2 { 0% { left: 110%; } 100% { left: -10%; } }
      `}</style>
      
      {/* Main container. It's black and will serve as the animation canvas. */}
      <div className="w-full max-w-4xl h-full max-h-[600px] bg-black p-2.5 flex flex-col gap-2.5 relative overflow-hidden">
        
        {/* --- NEW: Animation Container for the "Traffic" --- */}
        <div className="absolute inset-0 z-0">
          {/* Vertical Traffic */}
          <div className="absolute bg-yellow-400 w-4 h-4" style={{ left: '10%', animation: 'move-v1 10s linear infinite 8s' }}></div>
          <div className="absolute bg-red-500 w-3 h-3" style={{ left: '25%', animation: 'move-v2 12s linear infinite 3s' }}></div>
          <div className="absolute bg-blue-500 w-5 h-5" style={{ left: '60%', animation: 'move-v1 8s linear infinite 1s' }}></div>
          <div className="absolute bg-yellow-400 w-2 h-2" style={{ left: '80%', animation: 'move-v2 15s linear infinite 5s' }}></div>
          
          {/* Horizontal Traffic */}
          <div className="absolute bg-blue-500 w-4 h-4" style={{ top: '15%', animation: 'move-h1 14s linear infinite 2s' }}></div>
          <div className="absolute bg-red-500 w-6 h-6" style={{ top: '40%', animation: 'move-h2 11s linear infinite 6s' }}></div>
          <div className="absolute bg-yellow-400 w-3 h-3" style={{ top: '70%', animation: 'move-h1 9s linear infinite' }}></div>
          <div className="absolute bg-white w-2 h-2" style={{ top: '90%', animation: 'move-h2 18s linear infinite 4s' }}></div>
        </div>

        {/* Header - Sits on top of the animation */}
        <header className="bg-white flex-shrink-0 flex items-center relative p-4 z-10">
          <Link to="/" className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-md border-2 border-black mondrian-font text-base">
            <ArrowLeft size={20} />
            Back
          </Link>
          <h1 className="mondrian-font text-3xl text-black absolute left-1/2 -translate-x-1/2">
            ABOUT
          </h1>
        </header>

        {/* Main Content Grid - Also sits on top of the animation */}
        <div className="grid grid-cols-5 grid-rows-4 flex-grow gap-2.5 relative z-10">
          {/* Profile Picture Box */}
          <div className="bg-white col-span-2 row-span-3 p-2.5">
            <img 
              src="/img/profile.png" 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Decorative Blocks */}
          <div className="bg-[#D21404] col-span-1 row-span-2"></div>
          <div className="bg-[#F7D002] col-span-2 row-span-4 col-start-4"></div>
          <div className="bg-white col-span-1 row-span-2 col-start-3 row-start-3"></div>

          {/* Links and Info Box */}
          <div className="bg-white col-span-3 row-span-1 row-start-4 p-4 flex flex-col justify-center items-start">
            <a 
              href="https://github.com/euteryu"
              target="_blank" 
              rel="noopener noreferrer" 
              className="mondrian-font text-xl text-black hover:underline flex items-center gap-2 mb-3"
            >
              <Github size={24} />
              GitHub Profile
            </a>
            <a 
              href="https://keats.kcl.ac.uk/my/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mondrian-font text-xl text-blue-600 hover:text-blue-800 hover:underline"
            >
              KEATS
            </a>
          </div>

          {/* Bottom Blue Block */}
          <div className="bg-[#0047AB] col-span-1 row-span-2 col-start-3 row-start-1"></div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;