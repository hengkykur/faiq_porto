import React, { useState, useEffect, useRef } from 'react';
import ProjectDetail from './ProjectDetail';
import { projectsData as projects } from '../data/projects';

const Projects = ({ active, assetsAllowed }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
        {/* Background - Clean dark */}
        <div className="absolute inset-0 z-0 bg-[#080810]">
          <div className="project-grid-lines" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 z-[2]" />
          <div className="absolute inset-0 bg-radial-vignette opacity-50 z-[3]" />
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
                {/* Square Card image container */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[65vw] max-w-[240px] aspect-square z-0 bg-[#16161e] rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/5 flex items-center justify-center p-12 mt-4 overflow-hidden">
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
        {selectedProject && <ProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </div>
    );
  }

  // ─── DESKTOP LAYOUT (Original) ───
  return (
    <div
      onWheel={handleWheel}
      className="w-screen h-screen flex items-center relative overflow-hidden flex-shrink-0"
    >
      {/* Clean Dark Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#080810]">
        <div className="project-grid-lines" />
        <div className="absolute inset-0 pointer-events-none z-[5] opacity-10 mix-blend-overlay grain-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-transparent to-transparent z-[7]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-[8]"></div>
        <div className="absolute inset-0 bg-radial-vignette opacity-40 z-[9]"></div>
      </div>

      <div className="w-full h-full relative z-20 flex flex-col justify-center">
        {/* Dynamic Project Metadata HUD (Left Side) */}
        <div className="absolute top-[15%] left-24 z-30 max-w-sm pointer-events-none">
          <div key={activeIndex} className="animate-hud-enter">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-mono text-primary border-l-2 border-primary pl-2 uppercase tracking-[0.2em]">Project Detail</span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
            </div>

            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-5xl lg:text-6xl font-display font-black text-white italic leading-none uppercase tracking-tight">
                {projects[activeIndex].title}
              </h2>
            </div>
            
            <h3 className="text-2xl font-display font-light text-primary/80 italic uppercase tracking-[0.15em] mb-6 mt-2">
              {projects[activeIndex].subtitle}
            </h3>

            <p className="text-base text-slate-400 font-body font-light leading-relaxed mb-8 pr-4">
              {projects[activeIndex].description}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {projects[activeIndex].tags.map(tag => (
                <span key={tag} className="text-[9px] font-mono border border-primary/30 px-3 py-1 rounded-sm text-primary/90 bg-primary/5 uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>

            <button
              className="pointer-events-auto flex items-center gap-3 px-6 py-3 border border-primary/50 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-primary/20 hover:border-primary transition-all group"
              onClick={() => setSelectedProject(projects[activeIndex])}
            >
              <span>Explore Project</span>
              <div className="w-4 h-px bg-primary group-hover:w-8 transition-all duration-300"></div>
            </button>

            <div className="mt-12 flex items-center gap-4 text-white/20">
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
            transform: `translate3d(calc(75vw - (${activeIndex} * (42vw + 2vw)) - 21vw), 0, 0)`,
            transition: 'transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)',
            willChange: 'transform',
          }}
        >
          {projects.map((p, i) => (
            <div
              key={i}
              onClick={() => { if (activeIndex === i) setSelectedProject(p); }}
              className={`project-node flex-shrink-0 w-[42vw] h-full flex items-center justify-center group select-none pointer-events-auto
                ${activeIndex === i ? 'opacity-100 cursor-pointer' : 'opacity-70'}
              `}
              style={{
                transform: activeIndex === i ? 'scale(1.1)' : 'scale(0.8)',
                filter: isScrolling
                  ? (activeIndex === i ? 'none' : 'blur(5px) brightness(0.8)')
                  : (activeIndex === i ? 'none' : 'blur(3.5px) brightness(0.9)'),
                transition: 'filter 0.3s ease-out, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease',
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

                {/* HUD Navigation Number */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center transition-opacity duration-500"
                  style={{ opacity: activeIndex === i ? 0.8 : 0.2 }}
                >
                  <div className="w-px h-6 bg-white/20 mb-2"></div>
                  <div className="text-[10px] font-mono text-white tracking-widest uppercase">NODE_00{i + 1}</div>
                </div>
              </div>
            </div>
          ))}
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
      {selectedProject && <ProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
};

export default Projects;
