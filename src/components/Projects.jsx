import React, { useState, useEffect, useRef } from 'react';
import ProjectDetail from './ProjectDetail';
import { projectsData as projects } from '../data/projects';

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


  const handleMouseMove = (e) => {
    if (isMobile || !containerRef.current || mouseRaf.current) return;
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    mouseRaf.current = requestAnimationFrame(() => {
      containerRef.current.style.setProperty('--mouse-x', `${x}%`);
      containerRef.current.style.setProperty('--mouse-y', `${y}%`);
      mouseRaf.current = null;
    });
  };

  useEffect(() => {
    return () => {
      if (mouseRaf.current) cancelAnimationFrame(mouseRaf.current);
    }
  }, []);


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
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-[2]" />
          <div className="absolute inset-0 bg-radial-vignette opacity-30 z-[3]" />
        </div>

        {/* Header */}
        <div className="absolute top-14 left-0 right-0 z-30 px-5 flex items-center justify-between">
          <span className="text-[9px] font-mono text-primary/60 border-l-2 border-primary/40 pl-2 uppercase tracking-[0.25em]">
            Projects Ecosystem
          </span>
          <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
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
                className={`relative flex flex-col justify-end ${i === activeIndex ? 'cursor-pointer' : ''}`}
                style={{ width: `${100 / projects.length}%`, height: '100%' }}
                onClick={() => { if (i === activeIndex) setSelectedProject(p); }}
              >
                {/* Square Card image container - Adjusted to be more centered vertically */}
                <div className="absolute top-[32%] left-1/2 -translate-x-1/2 w-[65vw] max-w-[240px] aspect-square z-0 bg-[#16161e] rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/5 flex items-center justify-center p-12 mt-4 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] pointer-events-none"></div>
                  {assetsAllowed && (
                    <img
                      src={p.image}
                      alt={p.title}
                      className={`w-full h-full object-contain relative z-10 ${p.invertLogo ? 'brightness-0 invert drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] opacity-90' : 'drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]'}`}
                      style={{
                        filter: i === activeIndex ? 'grayscale(0)' : 'grayscale(1) opacity(0.3)',
                        transition: 'all 0.5s ease',
                      }}
                    />
                  )}
                  <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/5 pointer-events-none z-20" />
                </div>

                {/* Card content */}
                <div
                  className="relative z-10 px-6 pb-28"
                  style={{
                    opacity: i === activeIndex ? 1 : 0,
                    transform: i === activeIndex ? 'translateY(0)' : 'translateY(12px)',
                    transition: 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s',
                    pointerEvents: i === activeIndex ? 'auto' : 'none',
                  }}
                >
                  <div className="flex flex-col gap-3 mb-2">
                    <h2 className="text-4xl sm:text-5xl font-display font-black text-white italic uppercase leading-none tracking-tight mb-1">
                      {p.title}
                    </h2>
                  </div>
                  <h3 className="text-base font-display font-light text-primary/70 italic uppercase tracking-[0.2em] mb-4">
                    {p.subtitle}
                  </h3>
                  <p className="text-sm text-slate-400 font-body font-light leading-relaxed mb-5 max-w-xs">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-mono border border-primary/30 px-3 py-1 rounded-sm text-primary/80 bg-primary/5 uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedProject(p); }}
                    className="mt-6 px-5 py-2 border border-primary/50 text-white font-mono text-xs uppercase tracking-wider hover:bg-primary/20 transition-colors w-full backdrop-blur-sm shadow-[0_0_15px_rgba(var(--color-primary),0.2)]"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom navigation dots + swipe hint */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex flex-col items-center gap-4">
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

  // ─── DESKTOP LAYOUT (Original) ───
  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      className="w-screen h-screen flex items-center relative overflow-hidden flex-shrink-0"
    >
      {/* Clean Dark Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#080810]">
        {/* Cursor Spotlight Overlay (Desktop only) */}
        {!isMobile && (
          <div
            className="absolute inset-0 z-[2]"
            style={{
              background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.08) 0%, transparent 40%)`,
            }}
          />
        )}

        <div className="absolute inset-0 bg-black/5 mix-blend-multiply" />
        <div className="project-grid-lines relative z-[1]" />
        <div className="absolute inset-0 pointer-events-none z-[5] opacity-5 mix-blend-overlay grain-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-transparent to-transparent z-[7]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-[8]"></div>
        <div className="absolute inset-0 bg-radial-vignette opacity-25 z-[9]"></div>
      </div>

      <div className="w-full h-full relative z-20 flex flex-col justify-center">
        {/* Dynamic Project Metadata HUD (Left Side) — title & subtitle */}
        <div className="absolute top-[28%] left-24 z-30 max-w-sm pointer-events-none">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-mono text-primary border-l-2 border-primary pl-2 uppercase tracking-[0.2em]">Project Detail</span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
          </div>

          {/* Fixed-height title block — prevents layout shift during typewriter */}
          <div className="flex items-center gap-4 mb-2" style={{ minHeight: '80px' }}>
            <h2 className="text-5xl lg:text-6xl font-display font-black text-white italic leading-none uppercase tracking-tight">
              <TypewriterText text={projects[activeIndex].title} speed={55} />
            </h2>
          </div>

          {/* Fixed-height subtitle block */}
          <div style={{ minHeight: '48px' }}>
            <h3 className="text-2xl font-display font-light text-primary/80 italic uppercase tracking-[0.15em] mt-2">
              <TypewriterText text={projects[activeIndex].subtitle} speed={45} />
            </h3>
          </div>
        </div>

        {/* Explore Project Button — separate fixed position, never moves */}
        <div className="absolute z-30 pointer-events-none" style={{ top: 'calc(28% + 280px)', left: '6rem' }}>
          <button
            className="pointer-events-auto flex items-center gap-3 px-6 py-3 border border-primary/50 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-primary/20 hover:border-primary transition-all group"
            onClick={() => setSelectedProject(projects[activeIndex])}
          >
            <span>Explore Project</span>
            <div className="w-4 h-px bg-primary group-hover:w-8 transition-all duration-300"></div>
          </button>

          <div className="mt-8 flex items-center gap-4 text-white/20">
            <div className="text-[9px] font-mono">0{activeIndex + 1} / 0{projects.length}</div>
            <div className="h-[2px] w-24 bg-white/5 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-primary transition-transform duration-700 ease-out origin-left"
                style={{ transform: `scaleX(${(activeIndex + 1) / projects.length})` }}
              ></div>
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
                {/* Perfect Square App-Icon Stage */}
                <div className={`relative z-20 w-full ${activeIndex === i ? 'max-w-[260px]' : 'max-w-[240px]'} aspect-square rounded-[2rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.9)] bg-[#0f0f13] border border-white/10 flex items-center justify-center p-8
                  ${activeIndex === i ? 'ring-[2px] ring-primary/40 scale-100' : 'ring-1 ring-primary/10 scale-95'}
                `}
                  style={{ transition: 'transform 0.5s ease, box-shadow 0.5s ease, --tw-ring-color 0.5s ease' }}>

                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none"></div>

                  {assetsAllowed && (
                    <img
                      src={p.image}
                      alt={p.title}
                      className={`w-full h-full object-contain grayscale-[0.05] group-hover:grayscale-0 scale-100 group-hover:scale-105 relative z-10 ${p.invertLogo ? 'brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] opacity-90' : 'drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]'}`}
                      style={{ transition: 'filter 0.5s ease, transform 0.5s ease' }}
                    />
                  )}
                  <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10 pointer-events-none z-20"></div>

                  <div
                    className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none
                      ${activeIndex === i ? 'opacity-0' : 'opacity-20'}
                    `}
                    style={{ transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                  >
                    <h3 className="text-4xl font-display font-black text-white italic leading-tight uppercase tracking-tight drop-shadow-2xl">
                      {p.title}
                    </h3>
                  </div>
                </div>


              </div>
            </div>
          ))}
        </div>

        <div
          className="absolute top-12 right-24 z-30 pointer-events-none text-right"
        >
          <div className="text-[13px] font-mono text-white/60 tracking-[0.3em] uppercase mb-2">NODE_00{activeIndex + 1}</div>
          <div className="h-px bg-white/20 w-full" />
        </div>

        {/* Tech Stack Tags — Bottom Right Corner of Screen */}
        <div
          className="absolute bottom-12 right-24 z-30 pointer-events-none text-right"
        >
          <div className="flex items-center justify-end gap-2 mb-3">
            <div className="h-px w-10 bg-primary/40" />
            <span className="text-[10px] font-mono text-primary/70 uppercase tracking-[0.25em]">Stack</span>
          </div>
          <div key={activeIndex} className="flex flex-col gap-[7px]">
            {projects[activeIndex].tags.map((tag, ti) => (
              <span
                key={tag}
                className="text-[13px] font-mono uppercase tracking-[0.18em] text-white/70"
              >
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

      {/* Detail Overlay */}
      {selectedProject && <ProjectDetail project={selectedProject} assetsAllowed={assetsAllowed} onClose={() => setSelectedProject(null)} />}
    </div>
  );
};

export default React.memo(Projects);
