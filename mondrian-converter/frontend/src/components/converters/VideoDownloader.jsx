import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Play, Music, Disc, Music2 } from 'lucide-react';

const VideoDownloader = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const iconProps = { color: 'white', style: { position: 'absolute', opacity: 0, filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))' } };

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#F5F1E8', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        /* ... styles are the same ... */
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');
        @keyframes pulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.02); } }
        @keyframes spinAndPulse { 0% { transform: scale(1) rotate(0deg); } 25% { transform: scale(1.05) rotate(90deg); } 50% { transform: scale(1) rotate(180deg); } 75% { transform: scale(0.95) rotate(270deg); } 100% { transform: scale(1) rotate(360deg); } }
        @keyframes floatUp { 0% { transform: translateY(0); opacity: 0; } 20%, 80% { opacity: 0.5; } 100% { transform: translateY(-250px); opacity: 0; } }
      `}</style>
      <div style={{ position: 'absolute', left: '12vw', top: '15vh', width: '35px', height: '35px', background: '#0047AB', border: '3px solid black', animation: 'spinAndPulse 18s linear infinite alternate' }}></div>
      <div style={{ position: 'absolute', left: '20vw', top: '70vh', width: '40px', height: '40px', background: '#F7D002', border: '3px solid black', borderRadius: '50%', animation: 'spinAndPulse 25s linear infinite' }}></div>
      <div style={{ position: 'absolute', left: '8vw', top: '60vh', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: '35px solid #D21404', filter: 'drop-shadow(2px 2px 0 black)', animation: 'spinAndPulse 22s linear infinite reverse' }}></div>
      <div style={{ position: 'absolute', left: '25vw', top: '20vh', width: '25px', height: '25px', background: '#D21404', border: '3px solid black', animation: 'spinAndPulse 15s linear infinite' }}></div>
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 100 }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Audiowide', letterSpacing: '2px' }}>
          <ArrowLeft size={28} strokeWidth={3} /> {t('videoDownloader.back')}
        </button>
      </div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '900px', height: '600px' }}>
        <div style={{ position: 'absolute', left: '200px', top: '-20px', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: '35px solid #D21404', transform: 'rotate(25deg)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', right: '180px', top: '-10px', width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderBottom: '30px solid #F7D002', transform: 'rotate(-15deg)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', right: '100px', top: '10px', width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderBottom: '35px solid #0047AB', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', left: '50px', top: '120px', width: '140px', height: '220px', transform: 'skewY(-8deg) rotate(5deg)', zIndex: 5, overflow: 'hidden', border: '5px solid black', background: '#0047AB' }}>
          <Music {...iconProps} size={30} style={{ ...iconProps.style, bottom: -40, left: 20, animation: 'floatUp 8s linear 0s infinite' }} /><Disc {...iconProps} size={35} style={{ ...iconProps.style, bottom: -40, left: 80, animation: 'floatUp 9s linear 2s infinite' }} /><Music2 {...iconProps} size={30} style={{ ...iconProps.style, bottom: -40, left: 50, animation: 'floatUp 7s linear 5s infinite' }} />
        </div>
        <div style={{ position: 'absolute', left: '120px', top: '80px', width: '160px', height: '280px', background: '#F7D002', border: '6px solid black', transform: 'skewY(6deg) rotate(-8deg)', zIndex: 4 }}></div>
        <div style={{ position: 'absolute', left: '100px', top: '300px', width: '100px', height: '80px', background: '#D21404', border: '4px solid black', transform: 'rotate(-3deg)', zIndex: 3 }}></div>
        <div onClick={() => navigate('/media-machine/convert-media')} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '420px', height: '380px', zIndex: 40, animation: 'pulse 3s ease-in-out infinite', cursor: 'pointer' }}>
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '0px', width: 0, height: 0, borderLeft: '170px solid transparent', borderRight: '170px solid transparent', borderBottom: '150px solid #D21404', filter: 'drop-shadow(0px 6px 0px black)' }}></div>
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '140px', width: '160px', height: '240px', background: '#D21404', border: '8px solid black', borderTop: 'none', boxShadow: '10px 10px 0 rgba(0,0,0,0.25)' }}></div>
          <div style={{ position: 'absolute', left: '50%', top: '78px', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 45, pointerEvents: 'none' }}>
            <div style={{ fontSize: '2.6rem', color: 'white', textTransform: 'uppercase', textShadow: '3px 3px 0px rgba(0,0,0,0.3)', letterSpacing: '2px', fontFamily: 'Audiowide', fontWeight: 700 }}>{t('videoDownloader.convertVideo').split(' ')[0]}</div>
          </div>
          <div style={{ position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center', left: '50%', top: '190px', width: '160px', height: '180px', transform: 'translateX(-50%)', zIndex: 45, pointerEvents: 'none' }}>
            <div style={{ filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.3))' }}><Play size={70} strokeWidth={2.5} fill="white" color="white" /></div>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '80px', top: '100px', width: '150px', height: '240px', transform: 'skewY(10deg) rotate(-10deg)', zIndex: 6, overflow: 'hidden', border: '5px solid black', background: '#0047AB' }}>
          <Disc {...iconProps} size={40} style={{ ...iconProps.style, bottom: -40, left: 10, animation: 'floatUp 10s linear 1s infinite' }} /><Music {...iconProps} size={30} style={{ ...iconProps.style, bottom: -40, left: 90, animation: 'floatUp 7s linear 3s infinite' }} /><Music2 {...iconProps} size={35} style={{ ...iconProps.style, bottom: -40, left: 45, animation: 'floatUp 8s linear 6s infinite' }} />
        </div>
        <div style={{ position: 'absolute', right: '150px', top: '60px', width: '180px', height: '290px', background: '#F7D002', border: '6px solid black', transform: 'skewY(-8deg) rotate(12deg)', zIndex: 5 }}></div>
        <div style={{ position: 'absolute', right: '-20px', top: '280px', width: '300px', height: '65px', background: '#F7D002', border: '5px solid black', transform: 'rotate(-8deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, boxShadow: '6px 6px 0 rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize: '1.5rem', color: 'black', letterSpacing: '1px', fontFamily: 'Audiowide' }}>{t('videoDownloader.mp3Extraction')}</span>
        </div>
        <div style={{ position: 'absolute', left: '90px', top: '150px', width: '130px', height: '3px', background: 'black', transform: 'rotate(-38deg)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', right: '140px', top: '380px', width: '150px', height: '3px', background: 'black', transform: 'rotate(35deg)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', left: '160px', top: '115px', width: '22px', height: '22px', borderRadius: '50%', background: '#0047AB', border: '3px solid black', zIndex: 8 }}></div>
        <div style={{ position: 'absolute', right: '50px', bottom: '80px', width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderBottom: '28px solid #D21404', transform: 'rotate(-35deg)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', left: '80px', bottom: '60px', width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderBottom: '25px solid #D21404', transform: 'rotate(15deg)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', left: '250px', bottom: '-40px', width: '200px', height: '4px', background: '#D21404', transform: 'rotate(-2deg)' }}></div>
      </div>
      <div onClick={() => navigate('/media-machine/download-youtube')} style={{ position: 'absolute', left: '50%', bottom: '60px', transform: 'translateX(-50%) skewX(-4deg)', width: '500px', height: '90px', background: 'black', border: '6px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, boxShadow: '10px 10px 0 rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-50%) skewX(-4deg) scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) skewX(-4deg) scale(1)'}>
        <span style={{ fontSize: '2.8rem', color: 'white', transform: 'skewX(4deg)', letterSpacing: '2px', fontFamily: 'Audiowide' }}>{t('videoDownloader.orYoutube')}</span>
      </div>
      <div style={{ position: 'absolute', right: '120px', top: '140px', width: '32px', height: '32px', background: '#F7D002', transform: 'rotate(45deg)', border: '3px solid black', zIndex: 1 }}></div>
      <div style={{ position: 'absolute', left: '180px', bottom: '120px', width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderBottom: '28px solid #0047AB', transform: 'rotate(55deg)', zIndex: 1 }}></div>
    </div>
  );
};
export default VideoDownloader;