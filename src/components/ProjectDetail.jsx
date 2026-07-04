import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const SLIDE_LABELS = ['Live Demo Asset', 'Project Brief', 'Tech Spec'];

const ProjectDetail = ({ project, onClose, assetsAllowed = true }) => {
  const slideCount = Math.max(3, project.slides?.length || 3);
  const [isRendered, setIsRendered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [activeSlide, setActiveSlide] = useState(0);
  const mouseRaf = useRef(null);
  const resizeTimerRef = useRef(null);

  const dragStartX = useRef(null);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  const isScrollingRef = useRef(false);
  const scrollCooldown = useRef(null);

  const activeSlideRef = useRef(0);
  useEffect(() => {
    activeSlideRef.current = activeSlide;
  }, [activeSlide]);

  const goToSlide = (index) => {
    const clamped = Math.max(0, Math.min(slideCount - 1, index));
    setActiveSlide(clamped);
    setDragOffset(0);
  };

  const handleWheel = (e) => {
    if (isMobile || isScrollingRef.current) return;
    if (Math.abs(e.deltaY) < 10) return;
    const cur = activeSlideRef.current;
    if (e.deltaY > 0 && cur < slideCount - 1) {
      goToSlide(cur + 1);
    } else if (e.deltaY < 0 && cur > 0) {
      goToSlide(cur - 1);
    } else return;
    isScrollingRef.current = true;
    if (scrollCooldown.current) clearTimeout(scrollCooldown.current);
    scrollCooldown.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 400);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    dragStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseMoveGlobal = (e) => {
    if (!isDragging.current) {
      if (mouseRaf.current || isMobile) return;
      mouseRaf.current = requestAnimationFrame(() => {
        setMousePos({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
        mouseRaf.current = null;
      });
      return;
    }
    const dx = e.clientX - dragStartX.current;
    setDragOffset(dx);
  };

  const handleMouseUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 60) {
      goToSlide(dx < 0 ? activeSlideRef.current + 1 : activeSlideRef.current - 1);
    } else {
      setDragOffset(0);
    }
    dragStartX.current = null;
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      setDragOffset(0);
      dragStartX.current = null;
    }
  };

  const handleTouchStart = (e) => {
    dragStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - dragStartX.current;
    setDragOffset(dx);
  };

  const handleTouchEnd = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = e.changedTouches[0].clientX - dragStartX.current;
    if (Math.abs(dx) > 50) {
      goToSlide(dx < 0 ? activeSlideRef.current + 1 : activeSlideRef.current - 1);
    } else {
      setDragOffset(0);
    }
    dragStartX.current = null;
  };

  const handleClose = () => {
    setIsRendered(false);
    setTimeout(onClose, 500);
  };

  useEffect(() => {
    const checkMobile = () => {
      clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => setIsMobile(window.innerWidth < 768), 150);
    };
    setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);

    const timer = setTimeout(() => setIsRendered(true), 50);
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') goToSlide(activeSlideRef.current + 1);
      if (e.key === 'ArrowLeft') goToSlide(activeSlideRef.current - 1);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
      clearTimeout(resizeTimerRef.current);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      if (mouseRaf.current) cancelAnimationFrame(mouseRaf.current);
      if (scrollCooldown.current) clearTimeout(scrollCooldown.current);
    };
  }, []);

  if (!project) return null;

  // Theme Detection Helpers
  const isLight = project.heroTheme === 'light';
  const isDarkBlueprint = project.heroTheme === 'dark-blueprint';
  const isEditorial = isLight || isDarkBlueprint;

  const modalContent = (
    <div
      onMouseMove={handleMouseMoveGlobal}
      onWheel={handleWheel}
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isRendered ? 'opacity-100 backdrop-blur-xl' : 'opacity-0 backdrop-blur-none'}`}
      style={{ backgroundColor: 'transparent' }}
    >
      {/* ── BACKGROUND ── */}
      <div 
        className={`absolute inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-500 ${
          isLight 
            ? 'bg-[#f5f5f0]/95' 
            : (isDarkBlueprint ? 'bg-[#000000]/98' : 'bg-[#0a0a12]/95')
        }`}
      >
        {!isMobile && (
          <div
            className="absolute inset-0 z-[2] transition-opacity duration-1000"
            style={{
              background: isLight
                ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0, 0, 0, 0.04) 0%, transparent 40%)`
                : (isDarkBlueprint 
                    ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.04) 0%, transparent 40%)`
                    : `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(99, 102, 241, 0.15) 0%, transparent 40%)`),
              opacity: isRendered ? 1 : 0,
            }}
          />
        )}
        {/* Editorial style blueprint grid */}
        {isEditorial && (
          <div 
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              backgroundImage: isLight
                ? `
                  linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)
                `
                : `
                  linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
                `,
              backgroundSize: '52px 52px',
              opacity: 0.85,
            }}
          />
        )}
        {!isEditorial && <div className="project-grid-lines relative z-[1] opacity-30" />}
      </div>

      <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />

      {/* BACK Button */}
      <div className={`absolute top-6 left-6 md:top-8 md:left-12 z-[250] transition-all duration-700 ${isRendered ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <button
          onClick={handleClose}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm ${
            isLight 
              ? 'bg-black text-white hover:bg-black/90' 
              : (isDarkBlueprint 
                  ? 'bg-transparent border border-white/35 text-white hover:bg-white/10'
                  : 'bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.2)]')
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          BACK
        </button>
      </div>

      <div
        className={`relative w-full h-full overflow-y-auto md:overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isRendered ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-10 scale-105 opacity-0'}`}
      >
        <div className="flex flex-col md:flex-row min-h-full md:h-full pt-24 pb-12 px-6 md:px-20 gap-8 max-w-[1600px] mx-auto md:items-center">

          {/* LEFT COLUMN: Project Details */}
          <div className={`w-full md:w-[40%] flex flex-col justify-center relative z-30 opacity-0 animate-[fade-in-up_0.5s_ease-out_0.3s_forwards] ${isLight ? 'text-black' : 'text-white'}`}>
            <span className={`text-[9px] font-mono pl-3 uppercase tracking-[0.3em] mb-3 block ${
              isLight 
                ? 'text-black/60 border-l-2 border-black/40' 
                : (isDarkBlueprint ? 'text-white/60 border-l-2 border-white/30' : 'text-primary/70 border-l-2 border-primary/50')
            }`}>
              {project.status} • {project.year}
            </span>

            <h2 className={`text-4xl md:text-5xl font-display font-black italic leading-[1.1] uppercase tracking-tight mb-4 ${isLight ? 'text-black' : 'text-white'}`}>
              {project.title.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </h2>

            <h3 className={`text-lg md:text-xl font-display font-light italic uppercase tracking-[0.15em] mb-6 ${
              isLight 
                ? 'text-black/85' 
                : (isDarkBlueprint ? 'text-white/80' : 'text-primary/80')
            }`}>
              {project.subtitle}
            </h3>

            <div className="flex flex-col lg:flex-row gap-6 mb-10">
              <div className="flex-1">
                <p className={`font-body font-light leading-relaxed text-xs md:text-sm ${isLight ? 'text-black/75' : 'text-slate-400'}`}>
                  {project.description}
                </p>
              </div>
              <div className="w-40 flex-shrink-0">
                <h4 className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-4 ${isLight ? 'text-black/50' : 'text-slate-500'}`}>Services / Stack</h4>
                <div className="flex flex-col gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className={`text-xs font-mono uppercase tracking-wider ${isLight ? 'text-black/70' : 'text-white/70'}`}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto md:mt-0">
              <button 
                className={`flex items-center gap-3 px-6 py-3 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-md group w-max ${
                  isLight 
                    ? 'bg-black text-white hover:bg-black/90 shadow-none' 
                    : (isDarkBlueprint 
                        ? 'bg-transparent border border-white/40 text-white hover:bg-white/10 shadow-none'
                        : 'bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.15)]')
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLight || isDarkBlueprint ? 'bg-white' : 'bg-black'}`}></span>
                LAUNCH PROJECT
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Gallery Slider */}
          <div className="w-full md:w-[60%] h-[45vh] min-h-[320px] md:h-full relative z-20 flex flex-col items-center justify-center opacity-0 animate-[fade-in-up_0.7s_ease-out_0.5s_forwards]">



            <div
              className="relative w-full flex-1 overflow-visible cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMoveGlobal}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ perspective: '1200px' }}
              >
                {Array.from({ length: slideCount }).map((_, slideIndex) => {
                  const offset = slideIndex - activeSlide;

                  let translateX = 0;
                  let translateY = 0;
                  let scale = 1;
                  let rotateZ = 0;
                  let opacity = 0;
                  let zIndex = 30 - Math.abs(offset);

                  const activeIsPortrait = typeof project.slides?.[activeSlide] === 'string' && project.slides[activeSlide].toLowerCase().includes('poster');

                  if (offset === 0) {
                    translateX = isDragging.current ? dragOffset : 0;
                    translateY = isDragging.current ? Math.abs(dragOffset) * -0.05 : 0;
                    rotateZ = isDragging.current ? dragOffset * 0.02 : 0;
                    scale = 1;
                    opacity = 1;
                    zIndex = 40;
                  } else if (offset > 0) {
                    translateX = (offset * 30) + (isDragging.current ? -Math.abs(dragOffset) * 0.1 : 0);
                    translateY = (offset * 10);
                    scale = 1 - (offset * 0.06);
                    rotateZ = offset * 1.5;
                    opacity = activeIsPortrait ? 0 : 1 - (offset * 0.3);
                    zIndex = 30 - offset;
                  } else {
                    translateX = -window.innerWidth;
                    translateY = 0;
                    rotateZ = 0;
                    scale = 1;
                    opacity = 1;
                    zIndex = 10;
                  }

                  const isPortraitSlide = typeof project.slides?.[slideIndex] === 'string' && project.slides[slideIndex].toLowerCase().includes('poster');
                  const applyPortraitStyle = isPortraitSlide && offset === 0;

                  const cardBackground = applyPortraitStyle
                    ? 'transparent'
                    : (offset === 0 
                        ? (isLight ? '#f5f5f0' : (isDarkBlueprint ? 'rgba(12, 12, 12, 0.96)' : 'rgba(10, 10, 18, 0.75)')) 
                        : (isLight ? '#eaeaea' : (isDarkBlueprint ? 'rgba(6, 6, 6, 0.98)' : 'rgba(10, 10, 18, 0.98)')));

                  return (
                    <div
                      key={slideIndex}
                      className={`absolute ${applyPortraitStyle ? 'w-[98%] h-[98%] md:w-[95%] md:h-[95%]' : 'w-[90%] h-[90%] md:w-[85%] md:h-[85%]'} ${
                        applyPortraitStyle 
                          ? '' 
                          : (isLight 
                              ? 'border border-black/10' 
                              : (isDarkBlueprint 
                                  ? 'border border-white/10' 
                                  : 'border border-white/10'))
                      } rounded-[2rem] overflow-hidden flex items-center justify-center group`}
                      style={{
                        background: cardBackground,
                        transform: `translate3d(${translateX}px, ${translateY}px, ${-offset * 50}px) scale(${scale}) rotateZ(${rotateZ}deg)`,
                        opacity: opacity,
                        transition: isDragging.current
                          ? 'opacity 0.2s ease, transform 0s linear'
                          : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s ease',
                        zIndex: zIndex,
                        pointerEvents: offset === 0 ? 'auto' : 'none',
                        boxShadow: applyPortraitStyle ? 'none' : (offset === 0
                          ? (isLight 
                              ? '0 30px 90px rgba(0,0,0,0.1)' 
                              : (isDarkBlueprint 
                                  ? '0 40px 100px rgba(0,0,0,0.95), 0 0 1px rgba(255,255,255,0.05)'
                                  : '0 50px 120px rgba(0,0,0,0.9), 0 0 40px rgba(99, 102, 241, 0.1)'))
                          : (isLight 
                              ? '0 15px 40px rgba(0,0,0,0.05)' 
                              : '0 20px 50px rgba(0,0,0,0.7)')),
                      }}
                    >
                      <div className={`absolute inset-0 pointer-events-none ${
                        isLight 
                          ? 'bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,transparent_70%)]' 
                          : (isDarkBlueprint 
                              ? 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_70%)]' 
                              : 'bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]')
                      }`} />

                      {slideIndex === 0 && assetsAllowed && (
                        <img
                          src={project.image}
                          alt={project.title}
                          className={`w-[80%] h-[80%] object-contain relative z-10 transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${project.invertLogo && !isLight ? 'brightness-0 invert opacity-90' : ''}`}
                          draggable="false"
                        />
                      )}

                      {slideIndex === 1 && (
                        project.slides?.[1] ? (
                          <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center">
                            {project.slides[1].endsWith('.mp4') ? (
                              <video autoPlay loop muted playsInline preload="auto" className="w-full h-full object-contain p-4 md:p-8">
                                <source src={project.slides[1]} type="video/mp4" />
                              </video>
                            ) : (
                              <img src={project.slides[1]} alt="Project Brief" className="w-full h-full object-contain p-4 md:p-8 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]" draggable="false" />
                            )}
                            <div className={`absolute inset-0 pointer-events-none z-10 ${isLight ? 'bg-gradient-to-t from-[#f5f5f0]/60 via-transparent to-transparent' : 'bg-gradient-to-t from-black/60 via-transparent to-transparent'}`} />
                          </div>
                        ) : (
                          <div className="relative z-10 flex flex-col items-center text-center p-8 animate-[fade-in-up_0.5s_ease-out_0.2s_forwards] opacity-0">
                            <h4 className={`font-mono text-xs tracking-[0.3em] uppercase mb-4 ${isLight ? 'text-black/60' : (isDarkBlueprint ? 'text-white/60' : 'text-primary')}`}>Core Objective</h4>
                            <h2 className={`text-3xl md:text-5xl font-display font-black italic leading-tight uppercase max-w-sm drop-shadow-lg ${isLight ? 'text-black' : 'text-white'}`}>
                              {project.title}
                            </h2>
                            <div className={`w-12 h-1 mt-6 rounded-full ${isLight ? 'bg-black/40' : (isDarkBlueprint ? 'bg-white/40' : 'bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]')}`} />
                          </div>
                        )
                      )}

                      {slideIndex === 2 && (
                        project.slides?.[2] ? (
                          <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center">
                            {project.slides[2].endsWith('.mp4') ? (
                              <video autoPlay loop muted playsInline preload="auto" className="w-full h-full object-contain p-4 md:p-8">
                                <source src={project.slides[2]} type="video/mp4" />
                              </video>
                            ) : (
                              <img src={project.slides[2]} alt="Technical Spec" className={`w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-500 ${applyPortraitStyle ? '' : 'p-4 md:p-8'}`} draggable="false" />
                            )}
                          </div>
                        ) : (
                          <div className="relative z-10 flex flex-col items-center text-center p-8 w-full animate-[fade-in-up_0.5s_ease-out_0.2s_forwards] opacity-0">
                            <h4 className={`font-mono text-xs tracking-[0.3em] uppercase mb-8 ${isLight ? 'text-black/60' : (isDarkBlueprint ? 'text-white/60' : 'text-primary')}`}>Technical Stack</h4>
                            <div className="flex flex-wrap gap-4 justify-center max-w-md">
                              {project.tags.map(tag => (
                                <span key={tag} className={`px-5 py-2 border rounded-full text-sm font-mono uppercase tracking-widest transition-colors ${
                                  isLight 
                                    ? 'border-black/20 text-black/80 bg-black/5 hover:border-black/40 hover:bg-black/10' 
                                    : (isDarkBlueprint 
                                        ? 'border-white/20 text-white/80 bg-white/5 hover:border-white/40 hover:bg-white/10' 
                                        : 'border-white/20 text-white/80 bg-white/5 hover:border-primary/50 hover:bg-primary/10')
                                }`}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      )}

                      {slideIndex >= 3 && (
                        project.slides?.[slideIndex] ? (
                          <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center">
                            {project.slides[slideIndex].endsWith('.mp4') ? (
                              <video autoPlay loop muted playsInline preload="auto" className="w-full h-full object-contain p-4 md:p-8">
                                <source src={project.slides[slideIndex]} type="video/mp4" />
                              </video>
                            ) : (
                              <img src={project.slides[slideIndex]} alt={`Asset ${slideIndex}`} className="w-full h-full object-contain p-4 md:p-8 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]" draggable="false" />
                            )}
                          </div>
                        ) : (
                          <div className="relative z-10 flex flex-col items-center text-center p-8 w-full animate-[fade-in-up_0.5s_ease-out_0.2s_forwards] opacity-0">
                            <h4 className={`font-mono text-xs tracking-[0.3em] uppercase mb-8 ${isLight ? 'text-black/60' : 'text-white/40'}`}>Gallery</h4>
                            <h2 className="text-2xl font-display font-light text-white/40 italic uppercase drop-shadow-lg">
                              Asset Not Provided
                            </h2>
                          </div>
                        )
                      )}

                      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 opacity-50">
                        <div className={`w-2 h-2 rounded-full ${isLight ? 'bg-black/50' : 'bg-white'}`} />
                        <span className={`text-[10px] font-mono tracking-widest uppercase ${isLight ? 'text-black/60' : 'text-white'}`}>
                          {SLIDE_LABELS[slideIndex] || `Gallery Asset ${slideIndex - 2}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className={`text-[9px] font-mono uppercase tracking-[0.3em] mt-6 ${isLight ? 'text-black/30' : 'text-white/15'}`}>
              scroll or drag to explore
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProjectDetail;