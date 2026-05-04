import React, { useState, useEffect, useRef } from 'react';

const Contact = ({ active, assetsAllowed }) => {
  const currentYear = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(false);
  const [isFooterActive, setIsFooterActive] = useState(false);
  const [isAutoGlitching, setIsAutoGlitching] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const resizeTimerRef = useRef(null);
  const scrollRafId = useRef(null);

  // Random ambient glitch: fires briefly every 5-12 seconds
  useEffect(() => {
    let timeout;
    const scheduleGlitch = () => {
      const delay = 5000 + Math.random() * 7000; // 5–12s
      timeout = setTimeout(() => {
        setIsAutoGlitching(true);
        setTimeout(() => {
          setIsAutoGlitching(false);
          scheduleGlitch();
        }, 350); // glitch lasts 350ms
      }, delay);
    };
    scheduleGlitch();
    return () => clearTimeout(timeout);
  }, []);

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

  const handleScroll = () => {
    if (scrollRafId.current) return;
    scrollRafId.current = requestAnimationFrame(() => {
      if (!containerRef.current) { scrollRafId.current = null; return; }
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const progress = scrollTop / (scrollHeight - clientHeight || 1);
      setIsFooterActive(progress > 0.4);
      scrollRafId.current = null;
    });
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="w-screen h-screen flex-shrink-0 relative overflow-y-auto no-scrollbar select-none"
    >
      {/* ===== ZONE 1: Hero sticky (stays behind) ===== */}
      <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden bg-black" style={{ zIndex: 1 }}>

        {/* Background Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Robot — centered, behind text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 5 }}>
          {(active || assetsAllowed) && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              style={{
                width: isMobile ? '380px' : '600px',
                height: isMobile ? '500px' : '750px',
                objectFit: 'contain',
                objectPosition: 'center',
                opacity: 1,
                mixBlendMode: 'screen',
                filter: 'contrast(1.1) brightness(1.25)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 75%, transparent 100%)',
                maskImage: 'radial-gradient(ellipse at center, black 75%, transparent 100%)',
                clipPath: 'inset(0px 0px 6% 0px)',
                animation: 'robotFloat 6s ease-in-out infinite',
              }}
            >
              <source src="https://a7i5ct7oqefyp3zm.public.blob.vercel-storage.com/Robot.mp4" type="video/mp4" />
            </video>
          )}
        </div>

        {/* Dark band behind heading */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: '50%',
            transform: 'translateY(-50%)',
            height: '260px',
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.65) 20%, rgba(0,0,0,0.65) 80%, transparent 100%)',
            zIndex: 8,
          }}
        />

        {/* Centered Heading */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6">
          <h2
            className={`glitch-text text-5xl md:text-7xl lg:text-8xl font-display font-light text-white tracking-tighter uppercase leading-[0.9] pointer-events-auto text-center ${isAutoGlitching ? 'glitch-active' : ''}`}
            data-text="Let's connect and work together"
            style={{ textShadow: '-2px -2px 12px rgba(0,0,0,0.9), 2px -2px 12px rgba(0,0,0,0.9), -2px 2px 12px rgba(0,0,0,0.9), 2px 2px 12px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.8)' }}
          >
            Let's connect and<br /> work together
          </h2>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
          <div className="px-5 py-2.5 bg-white rounded-full flex items-center gap-4 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => containerRef.current?.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}>
            <svg className="w-3.5 h-3.5 text-black animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-black font-display font-bold whitespace-nowrap">
              Continue to scroll
            </span>
            <svg className="w-3.5 h-3.5 text-black animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* ===== ZONE 2: Footer (slides up like a curtain over hero) ===== */}
      <div className="relative w-full min-h-screen bg-black flex items-center overflow-hidden" style={{ zIndex: 10 }}>

        {/* Background decorative chars */}
        <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-[0.07] transition-all duration-1000 ${isFooterActive ? 'scale-100 blur-none' : 'scale-110 blur-xl'}`}>
          <div className="absolute top-0 left-0 text-[30vw] font-display font-black text-slate-700 -translate-x-1/4 -translate-y-1/4">{"{"}</div>
          <div className="absolute bottom-0 right-0 text-[35vw] font-display font-black text-slate-700 translate-x-1/4 translate-y-1/4">{"}"}</div>
        </div>

        <div className={`container mx-auto px-6 md:px-24 relative z-10 w-full flex flex-col justify-between py-20 md:py-28 gap-12 md:gap-16 transition-all duration-1000 ${isFooterActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

          {/* Big CTA email */}
          <div className="max-w-5xl">
            <p className="text-primary font-mono text-[10px] tracking-[0.4em] uppercase mb-4">Get in touch</p>
            <a
              href="mailto:adimulyo2005@gmail.com"
              className="block text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold text-primary leading-[0.9] tracking-tighter italic uppercase transition-all duration-300 drop-shadow-[0_0_20px_rgba(129,140,248,0.4)]"
            >
              <span className="glitch-text block mb-2" data-text="ADIMULYO2005">
                {"ADIMULYO2005".split("").map((char, i) => (
                  <span
                    key={i}
                    className={`inline-block transition-all duration-700 ease-out ${isFooterActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    style={{ transitionDelay: `${i * 30}ms` }}
                  >
                    {char}
                  </span>
                ))}
              </span>
              <span className="glitch-text block text-primary/60" data-text="@GMAIL.COM">
                {"@GMAIL.COM".split("").map((char, i) => (
                  <span
                    key={i}
                    className={`inline-block transition-all duration-700 ease-out ${isFooterActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    style={{ transitionDelay: `${(12 + i) * 30}ms` }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            </a>
          </div>

          {/* Bottom grid: columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 pt-8 md:pt-12 border-t border-white/5">
            <div className="flex flex-col gap-3">
              <h4 className="text-white/50 font-mono text-[10px] font-bold tracking-widest uppercase">Connect</h4>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'GitHub', url: 'https://github.com/hengkykur' },
                  { name: 'LinkedIn', url: '#' },
                  { name: 'Instagram', url: 'https://instagram.com/faiqadimulyo_04' },
                  { name: 'Twitter', url: '#' },
                ].map(s => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 font-mono text-[11px] uppercase tracking-widest hover:text-primary transition-colors"
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-white/50 font-mono text-[10px] font-bold tracking-widest uppercase">Portfolio</h4>
              <p className="text-slate-600 font-mono text-[9px] leading-relaxed uppercase">Built with high-precision tools and modern ecosystems for maximum narrative impact.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-white/50 font-mono text-[10px] font-bold tracking-widest uppercase">Published</h4>
              <p className="text-primary font-mono text-[9px] uppercase tracking-widest font-bold">MARCH 10TH {currentYear}</p>
              <p className="text-slate-600 font-mono text-[9px] uppercase tracking-tighter">ALL RIGHTS RESERVED — Faiq_a.m</p>
            </div>

            <div className="flex flex-col items-start md:items-end justify-end">
              <div className="text-white font-display font-black text-4xl italic tracking-tighter opacity-10 hover:opacity-100 transition-all cursor-default">Faiq_a.m</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .glitch-text {
          position: relative;
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          pointer-events: none;
        }
        .glitch-text::before {
          color: #ff00ea;
          clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%);
        }
        .glitch-text::after {
          color: #00f7ff;
          clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
        }
        .glitch-text:hover::before,
        .glitch-active::before {
          opacity: 1;
          animation: glitch-before 0.4s steps(2) infinite;
        }
        .glitch-text:hover::after,
        .glitch-active::after {
          opacity: 1;
          animation: glitch-after 0.4s steps(2) infinite;
        }
        @keyframes glitch-before {
          0%   { transform: translate(-3px, -2px); clip-path: polygon(0 15%, 100% 15%, 100% 35%, 0 35%); }
          25%  { transform: translate(3px, 1px);  clip-path: polygon(0 50%, 100% 50%, 100% 65%, 0 65%); }
          50%  { transform: translate(-4px, 2px); clip-path: polygon(0 5%,  100% 5%,  100% 25%, 0 25%); }
          75%  { transform: translate(2px, -3px); clip-path: polygon(0 70%, 100% 70%, 100% 85%, 0 85%); }
          100% { transform: translate(-3px, -2px); clip-path: polygon(0 15%, 100% 15%, 100% 35%, 0 35%); }
        }
        @keyframes glitch-after {
          0%   { transform: translate(3px, 2px);  clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); }
          25%  { transform: translate(-3px, -1px); clip-path: polygon(0 30%, 100% 30%, 100% 50%, 0 50%); }
          50%  { transform: translate(4px, -2px); clip-path: polygon(0 75%, 100% 75%, 100% 90%, 0 90%); }
          75%  { transform: translate(-2px, 3px); clip-path: polygon(0 10%, 100% 10%, 100% 30%, 0 30%); }
          100% { transform: translate(3px, 2px);  clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); }
        }
      `}</style>
    </div>
  );
};

export default Contact;
