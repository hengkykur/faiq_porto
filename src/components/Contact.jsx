import React, { useState, useEffect, useRef } from 'react';

const Contact = ({ active, assetsAllowed }) => {
  const currentYear = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const resizeTimerRef = useRef(null);

  useEffect(() => {
    const check = () => {
      clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => setIsMobile(window.innerWidth < 768), 150);
    };
    setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('resize', check);
      clearTimeout(resizeTimerRef.current);
    };
  }, []);

  // Pause/resume robot video based on active state
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (active) {
      vid.play().catch(() => { });
    } else {
      vid.pause();
    }
  }, [active]);

  const robotStyle = isMobile
    ? {
      // Mobile: di belakang konten (zIndex 5 < z-10 konten), pojok kanan bawah
      position: 'absolute',
      bottom: '0px',
      right: '0px',
      width: '180px',
      height: '290px',
      zIndex: 5,
      overflow: 'hidden',
      mixBlendMode: 'screen',
      filter: 'contrast(1.1) brightness(1.05)',
      animation: 'robotFloat 6s ease-in-out infinite',
      /* willChange removed to free GPU layer */
      pointerEvents: 'none',
      WebkitMaskImage: 'radial-gradient(ellipse at center, black 45%, transparent 85%)',
      maskImage: 'radial-gradient(ellipse at center, black 45%, transparent 85%)',
    }
    : {
      // Desktop: ukuran normal
      position: 'absolute',
      bottom: '10px',
      right: '24px',
      width: '240px',
      height: '385px',
      zIndex: 20,
      overflow: 'hidden',
      mixBlendMode: 'screen',
      filter: 'contrast(1.1) brightness(1.1)',
      animation: 'robotFloat 6s ease-in-out infinite',
      /* willChange removed to free GPU layer */
      pointerEvents: 'none',
      WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)',
      maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)',
    };

  return (
    <div className="w-screen h-screen flex items-center justify-center flex-shrink-0 relative overflow-hidden bg-black select-none">

      {/* Minimalist Background Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-block mb-6 px-4 py-1 border border-primary/30 rounded-full">
          <span className="text-primary font-mono text-[10px] tracking-[0.4em] uppercase">Ready for Deployment</span>
        </div>

        <h2 className="text-6xl md:text-9xl font-display font-bold text-white mb-12 italic tracking-tighter text-glow uppercase">
          Let's Connect
        </h2>

        <div className="flex flex-col items-center gap-12 mt-12">
          <a
            href="mailto:adimulyo2005@gmail.com"
            className="text-2xl md:text-5xl font-display font-bold text-slate-300 hover:text-white transition-all hover:scale-105 border-b-2 border-white/10 hover:border-primary pb-2"
          >
            ADIMULYO2005@GMAIL.COM
          </a>

          <div className="flex flex-wrap justify-center gap-4 md:gap-12">
            {[
              { name: 'GitHub', url: 'https://github.com/hengkykur' },
              { name: 'LinkedIn', url: '#' },
              { name: 'Instagram', url: 'https://instagram.com/faiqadimulyo_04' },
              { name: 'Twitter', url: '#' }
            ].map(social => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs md:text-sm font-mono text-slate-500 hover:text-primary tracking-widest uppercase transition-colors"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-32 opacity-20 hover:opacity-50 transition-opacity cursor-default">
          <div className="font-display font-black text-2xl text-white italic tracking-tighter">Faiq_a.m — {currentYear}</div>
        </div>
      </div>

      {/* Robot Video — Always visible, mobile: behind content (z:5), desktop: foreground (z:20) */}
      <div className={`absolute ${isMobile ? 'bottom-0 right-0 w-[180px] h-[290px] z-[4]' : 'bottom-[10px] right-[24px] w-[240px] h-[385px] z-[19]'} pointer-events-none flex items-center justify-center`}>
        {/* Static GPU-friendly Glow replacing the extremely expensive drop-shadow */}
        <div className="w-[60%] h-[60%] bg-[#63b3ed] rounded-full blur-[40px] opacity-20"></div>
      </div>

      <div style={robotStyle}>
        {(active || assetsAllowed) && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            style={{
              width: '115%',
              height: '115%',
              objectFit: 'cover',
              objectPosition: 'center 5%',
              opacity: 0.95,
            }}
          >
            <source src="/Robot.webm" type="video/webm" />
            <source src="/Robot.mp4" type="video/mp4" />
          </video>
        )}
      </div>

      <style>{`
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default Contact;
