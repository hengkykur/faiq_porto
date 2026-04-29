import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const SLIDE_COUNT = 3;
const SLIDE_LABELS = ['Live Demo Asset', 'Project Brief', 'Tech Spec'];

const ProjectDetail = ({ project, onClose, assetsAllowed = true }) => {
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
    const clamped = Math.max(0, Math.min(SLIDE_COUNT - 1, index));
    setActiveSlide(clamped);
    setDragOffset(0);
  };

  const handleWheel = (e) => {
    if (isMobile || isScrollingRef.current) return;
    if (Math.abs(e.deltaY) < 10) return;
    const cur = activeSlideRef.current;
    if (e.deltaY > 0 && cur < SLIDE_COUNT - 1) {
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

  const modalContent = (
    <div
      onMouseMove={handleMouseMoveGlobal}
      onWheel={handleWheel}
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isRendered ? 'opacity-100 backdrop-blur-xl' : 'opacity-0 backdrop-blur-none'}`}
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#0a0a12]/95">
        {!isMobile && (
          <div
            className="absolute inset-0 z-[2] transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(99, 102, 241, 0.15) 0%, transparent 40%)`,
              opacity: isRendered ? 1 : 0,
            }}
          />
        )}
        <div className="project-grid-lines relative z-[1] opacity-30" />
      </div>

      <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />

      <div className={`absolute top-6 left-6 md:top-8 md:left-12 z-[250] transition-all duration-700 ${isRendered ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <button
          onClick={handleClose}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-mono text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
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

          <div className="w-full md:w-[40%] flex flex-col justify-center relative z-30 opacity-0 animate-[fade-in-up_0.5s_ease-out_0.3s_forwards]">
            <span className="text-[9px] font-mono text-primary/70 border-l-2 border-primary/50 pl-3 uppercase tracking-[0.3em] mb-3 block">
              {project.status} • {project.year}
            </span>

            <h2 className="text-4xl md:text-5xl font-display font-black text-white italic leading-[1.1] uppercase tracking-tight mb-4">
              {project.title.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </h2>

            <h3 className="text-lg md:text-xl font-display font-light text-primary/80 italic uppercase tracking-[0.15em] mb-6">
              {project.subtitle}
            </h3>

            <div className="flex flex-col lg:flex-row gap-6 mb-10">
              <div className="flex-1">
                <p className="text-slate-400 font-body font-light leading-relaxed text-xs md:text-sm">
                  {project.description}
                </p>
              </div>
              <div className="w-40 flex-shrink-0">
                <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-4">Services / Stack</h4>
                <div className="flex flex-col gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-xs font-mono text-white/70 uppercase tracking-wider">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto md:mt-0">
              <button className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] group w-max">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                LAUNCH PROJECT
              </button>
            </div>
          </div>

          <div className="w-full md:w-[60%] h-[45vh] min-h-[320px] md:h-full relative z-20 flex flex-col items-center justify-center opacity-0 animate-[fade-in-up_0.7s_ease-out_0.5s_forwards]">

            <div className="w-full flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">
                {SLIDE_LABELS[activeSlide]}
              </span>
              <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                {String(activeSlide + 1).padStart(2, '0')} / {String(SLIDE_COUNT).padStart(2, '0')}
              </span>
            </div>

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
                {[0, 1, 2].map((slideIndex) => {
                  const offset = slideIndex - activeSlide;

                  let translateX = 0;
                  let translateY = 0;
                  let scale = 1;
                  let rotateZ = 0;
                  let opacity = 0;
                  let zIndex = 30 - Math.abs(offset);

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
                    opacity = 1 - (offset * 0.3);
                    zIndex = 30 - offset;
                  } else {
                    translateX = -window.innerWidth;
                    translateY = 0;
                    rotateZ = 0;
                    scale = 1;
                    opacity = 1;
                    zIndex = 10;
                  }

                  // Card aktif: semi-transparan (tembus ke card 2)
                  // Card ke-2 (offset 1): solid (block card 3)
                  // Card ke-3+: solid juga
                  const cardBackground = offset === 0
                    ? 'rgba(10, 10, 18, 0.45)'
                    : 'rgba(10, 10, 18, 0.98)';

                  const cardBackdropFilter = offset === 0 ? 'blur(20px)' : 'none';

                  return (
                    <div
                      key={slideIndex}
                      className="absolute w-[90%] h-[90%] md:w-[85%] md:h-[85%] border border-white/10 rounded-[2rem] overflow-hidden flex items-center justify-center group"
                      style={{
                        background: cardBackground,
                        backdropFilter: cardBackdropFilter,
                        WebkitBackdropFilter: cardBackdropFilter,
                        transform: `translate3d(${translateX}px, ${translateY}px, ${-offset * 50}px) scale(${scale}) rotateZ(${rotateZ}deg)`,
                        opacity: opacity,
                        transition: isDragging.current
                          ? 'opacity 0.2s ease, transform 0s linear'
                          : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s ease',
                        zIndex: zIndex,
                        pointerEvents: offset === 0 ? 'auto' : 'none',
                        boxShadow: offset === 0
                          ? '0 50px 120px rgba(0,0,0,0.9), 0 0 40px rgba(99, 102, 241, 0.1)'
                          : '0 20px 50px rgba(0,0,0,0.7)',
                      }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />

                      {slideIndex === 0 && assetsAllowed && (
                        <img
                          src={project.image}
                          alt={project.title}
                          className={`w-[80%] h-[80%] object-contain relative z-10 transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${project.invertLogo ? 'brightness-0 invert opacity-90' : ''}`}
                          draggable="false"
                        />
                      )}

                      {slideIndex === 1 && (
                        project.slides?.[1] ? (
                          <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center">
                            <video autoPlay loop muted playsInline preload="auto" className="w-full h-full object-contain p-4 md:p-8">
                              <source src={project.slides[1]} type="video/mp4" />
                            </video>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12]/60 via-transparent to-transparent pointer-events-none z-10" />
                          </div>
                        ) : (
                          <div className="relative z-10 flex flex-col items-center text-center p-8 animate-[fade-in-up_0.5s_ease-out_0.2s_forwards] opacity-0">
                            <h4 className="text-primary font-mono text-xs tracking-[0.3em] uppercase mb-4">Core Objective</h4>
                            <h2 className="text-3xl md:text-5xl font-display font-black text-white italic leading-tight uppercase max-w-sm drop-shadow-lg">
                              {project.title}
                            </h2>
                            <div className="w-12 h-1 bg-primary mt-6 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
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
                              <img src={project.slides[2]} alt="Technical Spec" className="w-full h-full object-contain p-4 md:p-8 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]" draggable="false" />
                            )}
                          </div>
                        ) : (
                          <div className="relative z-10 flex flex-col items-center text-center p-8 w-full animate-[fade-in-up_0.5s_ease-out_0.2s_forwards] opacity-0">
                            <h4 className="text-primary font-mono text-xs tracking-[0.3em] uppercase mb-8">Technical Stack</h4>
                            <div className="flex flex-wrap gap-4 justify-center max-w-md">
                              {project.tags.map(tag => (
                                <span key={tag} className="px-5 py-2 border border-white/20 rounded-full text-sm font-mono text-white/80 bg-white/5 uppercase tracking-widest shadow-lg hover:border-primary/50 hover:bg-primary/10 transition-colors">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      )}



                      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 opacity-50">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        <span className="text-[10px] font-mono text-white tracking-widest uppercase">
                          {SLIDE_LABELS[slideIndex]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[9px] font-mono text-white/15 uppercase tracking-[0.3em] mt-6">
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