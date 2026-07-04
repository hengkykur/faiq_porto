import React, { useState, useEffect, useRef } from 'react';
import ProjectDetail from './ProjectDetail';
import { projectsData as projects } from '../data/projects';
import HeroBackground from './HeroBackground';

// Typewriter animation — re-runs every time `text` changes
const TypewriterText = React.memo(({ text, speed = 22, className = '' }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="inline-block w-[2px] h-[0.85em] bg-current align-middle ml-[2px] animate-pulse opacity-60" />}
    </span>
  );
});

const Projects = ({ active, assetsAllowed }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const scrollRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const scrollTimeout = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const mouseRaf = useRef(null);
  const containerRef = useRef(null);
  const resizeTimerRef = useRef(null);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);
  const AUTO_PLAY_DURATION = 6000; // 6 seconds per slide
  const bgVideoRef = useRef(null);
  const bgVideoMobileRef = useRef(null);

  const customCursorRef = useRef(null);

  const handleMouseMove = (e) => {
    if (isMobile || !containerRef.current) return;

    if (customCursorRef.current) {
      customCursorRef.current.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`;
      const isRight = e.clientX > window.innerWidth / 2;
      const svg = customCursorRef.current.querySelector('svg');
      if (svg) {
        svg.style.transform = isRight ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    }

    if (mouseRaf.current) return;
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    mouseRaf.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${x}%`);
        containerRef.current.style.setProperty('--mouse-y', `${y}%`);
      }
      mouseRaf.current = null;
    });
  };

  const handleGlobalClick = (e) => {
    if (isMobile || e.target.closest('button') || e.target.closest('a') || e.target.closest('.project-node') || e.target.closest('.no-custom-click')) return;
    
    const isRight = e.clientX > window.innerWidth / 2;
    if (isRight && activeIndex < projects.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else if (!isRight && activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    return () => {
      if (mouseRaf.current) cancelAnimationFrame(mouseRaf.current);
    }
  }, []);

  // Pause/resume background videos based on active state
  useEffect(() => {
    const vid = isMobile ? bgVideoMobileRef.current : bgVideoRef.current;
    if (!vid) return;
    if (active) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [active, isMobile]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => setIsMobile(window.innerWidth < 768), 150);
    };
    setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(resizeTimerRef.current);
    };
  }, []);

  // Keyboard navigation (Desktop only)
  useEffect(() => {
    if (!active || isMobile || selectedProject) return;

    let animationTimeout = null;
    const handleAnimationState = () => {
      setIsScrolling(true);
      if (animationTimeout) clearTimeout(animationTimeout);
      animationTimeout = setTimeout(() => setIsScrolling(false), 850);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && activeIndex < projects.length - 1) {
        setActiveIndex(prev => prev + 1);
        handleAnimationState();
      } else if (e.key === 'ArrowLeft' && activeIndex > 0) {
        setActiveIndex(prev => prev - 1);
        handleAnimationState();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animationTimeout) clearTimeout(animationTimeout);
    };
  }, [active, activeIndex, projects.length, isMobile]);

  // Desktop scroll handler
  const handleWheel = (e) => {
    if (isMobile || selectedProject) return;
    if (Math.abs(e.deltaY) < 30) return;

    if (e.deltaY > 0 && activeIndex < projects.length - 1) {
      setActiveIndex(prev => prev + 1);
      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 850);
    } else if (e.deltaY < 0 && activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 850);
    }
    e.stopPropagation();
  };

  // Mobile touch swipe handlers
  const handleTouchStart = (e) => {
    if (selectedProject) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (selectedProject || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    // Horizontal swipe intent
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0 && activeIndex < projects.length - 1) {
        setActiveIndex(prev => prev + 1);
      } else if (dx > 0 && activeIndex > 0) {
        setActiveIndex(prev => prev - 1);
      }
      e.stopPropagation();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // ─── AUTO-PLAY LOGIC ─── (100ms tick)
  useEffect(() => {
    if (!active || selectedProject) {
      setAutoPlayProgress(0);
      return;
    }

    const TICK = 100;
    const step = 100 / (AUTO_PLAY_DURATION / TICK);
    const interval = setInterval(() => {
      setAutoPlayProgress(prev => {
        if (prev >= 100) {
          setActiveIndex(current => (current + 1) % projects.length);
          return 0;
        }
        return prev + step;
      });
    }, TICK);

    return () => clearInterval(interval);
  }, [active, selectedProject, projects.length]);

  // Reset progress when activeIndex changes (manual navigation)
  useEffect(() => {
    setAutoPlayProgress(0);
  }, [activeIndex]);

  // ─── MOBILE LAYOUT ───
  if (isMobile) {
    return (
      <div
        className="w-screen h-screen flex-shrink-0 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-[#080810] overflow-hidden">
          <HeroBackground active={active} />
          {assetsAllowed && (
            <video
              ref={bgVideoMobileRef}
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              onCanPlay={(e) => { e.target.style.opacity = '0.3'; }}
              className="absolute inset-0 w-full h-full object-cover z-0"
              style={{ opacity: 0, transition: 'opacity 1s ease' }}
            >
              <source src="https://a7i5ct7oqefyp3zm.public.blob.vercel-storage.com/Video%20Project%2012%20%282%29.mp4" type="video/mp4" />
            </video>
          )}
          {/* Extra dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#080810]/60 via-transparent to-[#080810]/90 z-[1]" />
        </div>

        {/* Header */}
        <div className="absolute top-14 left-0 right-0 z-30 px-5 flex flex-col items-start gap-2">
          <span className="text-[9px] font-mono text-primary/60 border-l-2 border-primary/40 pl-2 uppercase tracking-[0.25em]">
            Projects Ecosystem
          </span>
          <span className="text-[9px] font-mono text-white/30 pl-[10px] uppercase tracking-widest">
            {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
          </span>
        </div>

        {/* Full-screen card slider */}
        <div className="absolute inset-0 z-10">
          <div
            className="flex h-full"
            style={{
              width: `${projects.length * 100}%`,
              transform: `translateX(-${activeIndex * (100 / projects.length)}%)`,
              transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {projects.map((p, i) => (
              <div
                key={i}
                className={`relative flex flex-col items-center justify-center ${i === activeIndex ? 'cursor-pointer' : ''}`}
                style={{ width: `${100 / projects.length}%`, height: '100%' }}
                onClick={() => { if (i === activeIndex) setSelectedProject(p); }}
              >
                {/* Logo - Centered in middle but slightly higher */}
                <div className="relative z-10 flex items-center justify-center w-full max-w-[220px] aspect-square -translate-y-16">
                  {assetsAllowed && (
                    <div 
                      className="w-full h-full flex items-center justify-center transition-all duration-700" 
                      style={{ 
                        opacity: i === activeIndex ? 1 : 0.2,
                        transform: i === activeIndex ? 'scale(1)' : 'scale(0.7)',
                        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      <img
                        src={p.image}
                        alt={p.title}
                        className={`w-full h-full object-contain ${p.invertLogo ? 'brightness-0 invert drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] opacity-90' : 'drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]'}`}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Title & Subtitle (Fixed position, with Typewriter) */}
        <div className="absolute bottom-28 left-6 z-20 pointer-events-none text-left max-w-[80vw]">
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white italic uppercase leading-none tracking-[0.1em] drop-shadow-lg mb-1 min-h-[36px]">
            <TypewriterText text={projects[activeIndex].title} speed={90} />
          </h2>
          <h3 className="text-[10px] font-mono text-primary/80 uppercase tracking-widest min-h-[16px]">
            <TypewriterText text={projects[activeIndex].subtitle} speed={70} />
          </h3>
        </div>

        {/* Bottom navigation dots + swipe hint */}
        <div className="absolute bottom-8 left-6 z-30 flex flex-col items-start gap-4">
          {/* Auto-play Progress Bar */}
          <div className="h-[2px] w-32 bg-white/10 relative overflow-hidden mb-1">
             <div 
               className="absolute inset-0 bg-primary/80 origin-left"
               style={{ transform: `scaleX(${autoPlayProgress / 100})` }}
             />
          </div>
          <div className="flex items-center gap-3">
            {projects.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className="transition-all duration-300"
                style={{
                  width: i === activeIndex ? '24px' : '6px',
                  height: '6px',
                  borderRadius: i === activeIndex ? '3px' : '50%',
                  backgroundColor: i === activeIndex ? 'oklch(65% 0.25 260)' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
          <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">
            Swipe to explore
          </p>
        </div>

        {/* Detail Overlay */}
        {selectedProject && <ProjectDetail project={selectedProject} assetsAllowed={assetsAllowed} onClose={() => setSelectedProject(null)} />}
      </div>
    );
  }

  // ─── DESKTOP LAYOUT ───
  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onClick={handleGlobalClick}
      className="w-screen h-screen flex items-center relative overflow-hidden flex-shrink-0 cursor-none"
    >
      {(() => {
        const isLight = projects[activeIndex].heroTheme === 'light';
        const isDarkBlueprint = projects[activeIndex].heroTheme === 'dark-blueprint';
        const isEditorial = isLight || isDarkBlueprint;

        return (
          <>
            {/* Custom Horizontal Scroll Cursor */}
            <div 
              ref={customCursorRef} 
              className="absolute top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center transition-transform duration-75 ease-out"
              style={{ transform: 'translate3d(-100px, -100px, 0)' }}
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full border transition-colors duration-500"
                style={{
                  borderColor: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)',
                  backgroundColor: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)',
                  color: isLight ? '#000' : '#fff',
                  boxShadow: '0 0 15px rgba(255,255,255,0.2)',
                }}
              >
                <svg className="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* ── BACKGROUND ── */}
            <div
              className="absolute inset-0 z-0 overflow-hidden"
              style={{
                backgroundColor: isLight ? '#f5f5f0' : (isDarkBlueprint ? '#000000' : '#080810'),
                transition: 'background-color 0.7s ease',
              }}
            >
              {!isLight && <HeroBackground active={active} />}
              {/* Dark theme: video background (only when NOT editorial layout) */}
              {assetsAllowed && !isEditorial && (
                <div className="absolute top-0 right-0 h-full w-[75vw] z-[1] overflow-hidden">
                  <video
                    ref={bgVideoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="none"
                    onCanPlay={(e) => { e.target.style.opacity = '0.6'; }}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: 0, transition: 'opacity 1.2s ease' }}
                  >
                    <source src="https://a7i5ct7oqefyp3zm.public.blob.vercel-storage.com/Video%20Project%2012%20%282%29.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#080810] to-transparent z-[2]" />
                </div>
              )}

              {/* Editorial theme: blueprint grid (light or dark depending on theme) */}
              {isEditorial && (
                <div
                  className="absolute inset-0 z-[1] pointer-events-none"
                  style={{
                    backgroundImage: isLight
                      ? `
                        linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px)
                      `
                      : `
                        linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)
                      `,
                    backgroundSize: '52px 52px',
                  }}
                />
              )}

              {/* RIGHT: hero assets — Diletakkan di z-0 agar mix-blend-mode menyatu secara visual */}
              {isEditorial && assetsAllowed && (
                <div
                  className="absolute right-0 top-0 h-full pointer-events-none flex items-center justify-end z-[2] transform translate-y-[6vh]"
                  style={{
                    width: '66%',
                    mixBlendMode: isLight ? 'multiply' : 'screen',
                  }}
                >
                  {projects.map((p, idx) => {
                    if (!p.heroAsset) return null;
                    const isProjLight = p.heroTheme === 'light';
                    return (
                      <img
                        key={idx}
                        src={p.heroAsset}
                        alt={p.title + ' asset'}
                        className="absolute inset-0 w-full h-full object-contain select-none transition-opacity duration-700 ease-in-out"
                        style={{
                          opacity: idx === activeIndex ? (isProjLight ? 0.85 : 0.95) : 0,
                          filter: isProjLight
                            ? (p.invertAsset ? 'grayscale(1) contrast(4.2) brightness(1.18)' : 'invert(1) grayscale(1) contrast(4.2) brightness(1.18)')
                            : (p.invertAsset ? 'invert(1) grayscale(1) contrast(4.5) brightness(1.15)' : 'grayscale(1) contrast(4.5) brightness(1.15)'),
                          paddingRight: '1vw',
                          paddingTop: '2vh',
                          paddingBottom: '2vh',
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Cursor spotlight (dark theme only) */}
              {!isEditorial && (
                <div
                  className="absolute inset-0 z-[2]"
                  style={{
                    background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.15) 0%, transparent 40%)`,
                  }}
                />
              )}

              <div className={`project-grid-lines relative z-[4] opacity-20 ${!active ? 'animation-paused' : ''} ${isEditorial ? 'hidden' : ''}`} />
              <div className="absolute inset-0 pointer-events-none z-[5] opacity-5 mix-blend-overlay grain-overlay"></div>
            </div>

            {/* ── EDITORIAL LAYOUT (Light Monolith / Dark Blueprint) ── */}
            {isEditorial ? (
              <div className={`w-full h-full relative z-20 flex flex-col justify-center ${isLight ? 'text-black' : 'text-white'}`} key={`editorial-${activeIndex}`}>

                {/* Top bar */}
                <div className="absolute top-12 left-16 pointer-events-none">
                  <span className={`text-[10px] font-mono uppercase tracking-[0.35em] ${isLight ? 'text-black/40' : 'text-white/40'}`}>Projects Ecosystem</span>
                </div>
                <div className="absolute top-12 right-16 z-30 pointer-events-none text-right">
                  <div className={`text-[11px] font-mono tracking-[0.3em] uppercase ${isLight ? 'text-black/40' : 'text-white/40'}`}>NODE_00{activeIndex + 1}</div>
                  <div className={`h-px w-full mt-1 ${isLight ? 'bg-black/15' : 'bg-white/15'}`} />
                </div>

                {/* Main content */}
                <div className="absolute inset-0 flex items-center px-16 transform translate-y-[6vh]">

                  {/* LEFT: Text content */}
                  <div className="flex flex-col justify-center z-20" style={{ maxWidth: '72%' }}>

                    {/* Title + circular logo badge (Logo on the left, title on the right, allowed to wrap) */}
                    <div className="flex items-center gap-6 md:gap-8 mb-4">
                      {assetsAllowed && projects[activeIndex].image && (
                        <div
                          className={`flex-shrink-0 rounded-full border-2 overflow-hidden flex items-center justify-center shadow-md ${isLight ? 'border-black/90 bg-white' : 'border-white/40 bg-black/60'}`}
                          style={{ width: '4.8rem', height: '4.8rem' }}
                        >
                          <img
                            src={projects[activeIndex].image}
                            alt={projects[activeIndex].title}
                            className={`w-[85%] h-[85%] object-contain ${!isLight ? 'brightness-0 invert opacity-90' : ''}`}
                          />
                        </div>
                      )}
                      <h2
                        className={`font-black uppercase leading-[1.05] select-none ${isLight ? 'text-black' : 'text-white'}`}
                        style={{
                          fontSize: 'clamp(2.5rem, 5.2vw, 4.8rem)',
                          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                          letterSpacing: '-0.03em',
                        }}
                      >
                        <TypewriterText text={projects[activeIndex].title} speed={38} />
                      </h2>
                    </div>

                    {/* Subtitle (Italic, split lines if needed) */}
                    <p
                      className={`uppercase font-medium tracking-[0.14em] mb-9 ${isLight ? 'text-black/85' : 'text-white/80'}`}
                      style={{
                        fontSize: 'clamp(0.72rem, 1.1vw, 0.95rem)',
                        fontFamily: "'Inter', sans-serif",
                        lineHeight: '1.4',
                        fontStyle: 'italic',
                      }}
                    >
                      {projects[activeIndex].subtitle.split('&').map((part, idx, arr) => (
                        <React.Fragment key={idx}>
                          {part.trim()}
                          {idx < arr.length - 1 && (
                            <>
                              <br />
                              &amp;{' '}
                            </>
                          )}
                        </React.Fragment>
                      ))}
                    </p>

                    {/* CTA Button */}
                    <button
                      className={`pointer-events-auto inline-flex items-center gap-5 px-7 py-3 font-mono text-[10px] uppercase tracking-[0.25em] transition-all duration-300 group w-fit ${
                        isLight 
                          ? 'bg-black text-white hover:bg-black/85' 
                          : 'bg-transparent border border-white/40 text-white hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedProject(projects[activeIndex])}
                    >
                      <span>Explore Project</span>
                      <span className="text-[14px] transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                    </button>

                    {/* Progress + counter */}
                    <div className="mt-9 flex flex-col gap-2">
                      <div className={`h-[1px] w-36 relative overflow-hidden ${isLight ? 'bg-black/15' : 'bg-white/15'}`}>
                        <div
                          className={`absolute inset-0 origin-left ${isLight ? 'bg-black/60' : 'bg-primary/80'}`}
                          style={{ transform: `scaleX(${autoPlayProgress / 100})` }}
                        />
                      </div>
                      <span className={`text-[10px] font-mono tracking-[0.2em] ${isLight ? 'text-black/40' : 'text-white/40'}`}>
                        {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom right: Stack tags */}
                <div className="absolute bottom-12 right-16 z-30 pointer-events-none text-right">
                  <div className="flex items-center justify-end gap-2 mb-3">
                    <div className={`h-px w-8 ${isLight ? 'bg-black/25' : 'bg-white/25'}`} />
                    <span className={`text-[10px] font-mono uppercase tracking-[0.25em] ${isLight ? 'text-black/45' : 'text-white/45'}`}>Stack</span>
                  </div>
                  <div key={activeIndex} className="flex flex-col gap-[6px]">
                    {projects[activeIndex].tags.map((tag, ti) => (
                      <span key={tag} className={`text-[13px] font-mono uppercase tracking-[0.18em] ${isLight ? 'text-black/60' : 'text-white/60'}`}>
                        <TypewriterText text={tag} speed={65 + ti * 15} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom center: nav hint */}
                <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none ${isLight ? 'opacity-25' : 'opacity-20'}`}>
                  <div className={`border rounded px-2 py-1 text-[9px] font-mono ${isLight ? 'border-black/40 text-black' : 'border-white/30 text-white'}`}>←</div>
                  <span className={`text-[9px] font-mono uppercase tracking-widest ${isLight ? 'text-black' : 'text-white'}`}>Navigate</span>
                  <div className={`border rounded px-2 py-1 text-[9px] font-mono ${isLight ? 'border-black/40 text-black' : 'border-white/30 text-white'}`}>→</div>
                </div>
              </div>

            ) : (
              /* ── DARK THEME LAYOUT (Original) ── */
              <div className="w-full h-full relative z-20 flex flex-col justify-center">

                {/* Dynamic Project Metadata HUD (Left Side) */}
                <div className="absolute top-[28%] left-24 z-30 max-w-sm pointer-events-none">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-mono text-primary border-l-2 border-primary pl-2 uppercase tracking-[0.2em]">Project Detail</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
                  </div>
                  <div className="flex items-center gap-4 mb-2" style={{ minHeight: '80px' }}>
                    <h2 className="text-5xl lg:text-6xl font-display font-black text-white italic leading-none uppercase tracking-tight">
                      <TypewriterText text={projects[activeIndex].title} speed={55} />
                    </h2>
                  </div>
                  <div style={{ minHeight: '48px' }}>
                    <h3 className="text-2xl font-display font-light text-primary/80 italic uppercase tracking-[0.15em] mt-2">
                      <TypewriterText text={projects[activeIndex].subtitle} speed={45} />
                    </h3>
                  </div>
                </div>

                {/* Explore Project Button */}
                <div className="absolute z-30 pointer-events-none" style={{ top: 'calc(28% + 280px)', left: '6rem' }}>
                  <button
                    className="pointer-events-auto flex items-center gap-3 px-6 py-3 border border-primary/50 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-primary/20 hover:border-primary transition-all group"
                    onClick={() => setSelectedProject(projects[activeIndex])}
                  >
                    <span>Explore Project</span>
                    <div className="w-4 h-px bg-primary group-hover:w-8 transition-all duration-300"></div>
                  </button>
                  <div className="mt-8 flex flex-col items-center gap-4 text-white/20">
                    <div className="h-[2px] w-48 bg-white/10 relative overflow-hidden mb-2">
                      <div
                        className="absolute inset-0 bg-primary/80 origin-left"
                        style={{ transform: `scaleX(${autoPlayProgress / 100})` }}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-[9px] font-mono">0{activeIndex + 1} / 0{projects.length}</div>
                      <div className="h-[2px] w-24 bg-white/5 relative overflow-hidden">
                        <div
                          className="absolute inset-0 bg-primary transition-transform duration-700 ease-out origin-left"
                          style={{ transform: `scaleX(${(activeIndex + 1) / projects.length})` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Global Context Info */}
                <div className="absolute top-12 left-24 pointer-events-none">
                  <h2 className="text-primary/50 font-bold tracking-[0.5em] uppercase text-[9px]">Projects Ecosystem</h2>
                </div>

                {/* Artistic Horizontal Stage */}
                <div
                  ref={scrollRef}
                  className="flex flex-row items-center gap-[2vw] h-[60vh]"
                  style={{
                    transform: `translate3d(calc(54vw - (${activeIndex} * (42vw + 2vw)) - 21vw), 0, 0)`,
                    transition: 'transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)',
                  }}
                >
                  {projects.map((p, i) => (
                    <div
                      key={i}
                      onClick={() => { if (activeIndex === i) setSelectedProject(p); }}
                      className={`project-node flex-shrink-0 w-[42vw] h-full flex items-center justify-center group select-none pointer-events-auto
                        ${activeIndex === i ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}
                      `}
                      style={{
                        transform: activeIndex === i ? 'scale(1.1)' : 'scale(0.9)',
                        transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                      }}
                    >
                      <div className="relative w-full flex items-center justify-center">
                        <div className={`relative z-20 w-full ${activeIndex === i ? 'max-w-[260px]' : 'max-w-[240px]'} aspect-square flex items-center justify-center p-8 overflow-visible ${activeIndex === i ? 'scale-110' : 'scale-95'}`}
                          style={{ transition: 'transform 0.5s ease' }}>
                          {assetsAllowed && (
                            <div className="w-full h-full flex items-center justify-center transition-transform duration-500" style={{ transform: `scale(${p.imageScale || 1})` }}>
                              <img
                                src={p.image}
                                alt={p.title}
                                className={`w-full h-full object-contain grayscale-[0.05] group-hover:grayscale-0 relative z-10 
                                  scale-[1.3] group-hover:scale-[1.4] -translate-y-2 group-hover:-translate-y-4 translate-x-16 group-hover:translate-x-16 ${p.invertLogo ? 'brightness-0 invert opacity-90 drop-shadow-[0_20px_30px_rgba(255,255,255,0.3)]' : 'drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]'}
                                `}
                                style={{ transition: 'filter 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute top-12 right-24 z-30 pointer-events-none text-right">
                  <div className="text-[13px] font-mono text-white/60 tracking-[0.3em] uppercase mb-2">NODE_00{activeIndex + 1}</div>
                  <div className="h-px bg-white/20 w-full" />
                </div>

                {/* Tech Stack Tags */}
                <div className="absolute bottom-12 right-24 z-30 pointer-events-none text-right">
                  <div className="flex items-center justify-end gap-2 mb-3">
                    <div className="h-px w-10 bg-primary/40" />
                    <span className="text-[10px] font-mono text-primary/70 uppercase tracking-[0.25em]">Stack</span>
                  </div>
                  <div key={activeIndex} className="flex flex-col gap-[7px]">
                    {projects[activeIndex].tags.map((tag, ti) => (
                      <span key={tag} className={`text-[13px] font-mono uppercase tracking-[0.18em] text-white/70`}>
                        <TypewriterText text={tag} speed={65 + ti * 15} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-12 left-0 right-0 px-24 flex justify-between items-end pointer-events-none">
                  <div>
                    <div className="text-[10px] font-mono text-slate-700 tracking-[0.4em] mb-2 uppercase">Collections</div>
                  </div>
                  <div className="text-right opacity-10">
                    <div className="text-4xl font-display font-black uppercase italic tracking-tighter">Faiq_a.m</div>
                    <div className="text-[8px] font-mono uppercase tracking-[0.5em]">Creative Developer Exhibit</div>
                  </div>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-20 pointer-events-none">
                  <div className="border border-white/30 rounded px-2 py-1 text-[9px] font-mono text-white">←</div>
                  <span className="text-[9px] font-mono text-white uppercase tracking-widest">Navigate</span>
                  <div className="border border-white/30 rounded px-2 py-1 text-[9px] font-mono text-white">→</div>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* Detail Overlay */}
      {selectedProject && <ProjectDetail project={selectedProject} assetsAllowed={assetsAllowed} onClose={() => setSelectedProject(null)} />}
    </div>
  );
};

export default React.memo(Projects);
