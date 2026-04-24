import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const ProjectDetail = ({ project, onClose, assetsAllowed = true }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [activeSlide, setActiveSlide] = useState(0);
  const mouseRaf = useRef(null);



  const handleMouseMove = (e) => {
    if (mouseRaf.current || isMobile) return;
    mouseRaf.current = requestAnimationFrame(() => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
      mouseRaf.current = null;
    });
  };

  const resizeTimerRef = useRef(null);

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
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
      clearTimeout(resizeTimerRef.current);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      if (mouseRaf.current) cancelAnimationFrame(mouseRaf.current);
    };
  }, []);

  const handleClose = () => {
    setIsRendered(false);
    setTimeout(onClose, 500);
  };

  if (!project) return null;

  const modalContent = (
    <div
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isRendered ? 'opacity-100 backdrop-blur-xl' : 'opacity-0 backdrop-blur-none'}`}
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#0a0a12]/95">
        {!isMobile && (
          <div
            className="absolute inset-0 z-[2] transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(99, 102, 241, 0.15) 0%, transparent 40%)`,
              opacity: isRendered ? 1 : 0
            }}
          />
        )}
        <div className="project-grid-lines relative z-[1] opacity-30" />
      </div>

      <div className="absolute inset-0 cursor-pointer" onClick={handleClose}></div>

      {/* Header / Back Button (Outside scroll container) */}
      <div className={`absolute top-6 left-6 md:top-8 md:left-12 z-[250] transition-all duration-700 ${isRendered ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <button
          onClick={handleClose}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-mono text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          BACK
        </button>
      </div>

      {/* FULL SCREEN CONTAINER */}
      <div
        className={`relative w-full h-full overflow-y-auto md:overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isRendered ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-10 scale-105 opacity-0'}`}
      >

        <div className="flex flex-col md:flex-row min-h-full md:h-full pt-24 pb-12 px-6 md:px-20 gap-8 max-w-[1600px] mx-auto md:items-center">
          {/* LEFT: TEXT CONTENT */}
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
                    <span key={tag} className="text-xs font-mono text-white/70 uppercase tracking-wider">
                      {tag}
                    </span>
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

          {/* RIGHT: PRESENTATION SLIDESHOW */}
          <div className="w-full md:w-[60%] h-[40vh] min-h-[300px] md:h-full relative z-20 flex items-center justify-center opacity-0 animate-[fade-in-up_0.7s_ease-out_0.5s_forwards] overflow-visible">
             <div className="relative w-full h-full md:h-[85%] max-h-[650px] perspective-1000">
               {[0, 1, 2].map((slideIndex) => {
                 let isActive = activeSlide === slideIndex;
                 let isPrev = activeSlide === (slideIndex + 1) % 3;
                 
                 // Calculate styles for a 3D deck effect or smooth horizontal slide
                 let slideStyle = {
                   opacity: isActive ? 1 : 0,
                   transform: isActive 
                     ? 'translateX(0) scale(1) rotateY(0deg)' 
                     : isPrev 
                       ? 'translateX(-10%) scale(0.95)' 
                       : 'translateX(10%) scale(0.95)',
                   transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
                   zIndex: isActive ? 30 : 10,
                   pointerEvents: isActive ? 'auto' : 'none',
                 };

                 return (
                   <div key={slideIndex} className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#0a0a12]/80 to-white/5 border border-white/10 rounded-[1.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden flex items-center justify-center group" style={slideStyle}>
                      <div className="absolute inset-0 bg-radial-vignette opacity-50 z-0 pointer-events-none"></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none"></div>

                      {slideIndex === 0 && assetsAllowed && (
                        <img
                          src={project.image}
                          alt={project.title}
                          className={`w-[80%] h-[80%] object-contain relative z-10 transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${project.invertLogo ? 'brightness-0 invert opacity-90' : ''}`}
                        />
                      )}

                      {slideIndex === 1 && (
                        project.slides?.[1] ? (
                          <div className="absolute inset-0 w-full h-full z-10">
                            <video
                              autoPlay
                              loop
                              muted
                              playsInline
                              preload="auto"
                              className="w-full h-full object-cover"
                            >
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
                      )}

                      {/* Decorative UI elements on the card */}
                      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 opacity-50">
                         <div className="w-2 h-2 rounded-full bg-white"></div>
                         <span className="text-[10px] font-mono text-white tracking-widest uppercase">
                           {slideIndex === 0 ? 'Live Demo Asset' : slideIndex === 1 ? 'Project Brief' : 'Tech Spec'}
                         </span>
                      </div>
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                         {[0, 1, 2].map(dot => (
                           <button 
                             key={dot}
                             onClick={(e) => { e.stopPropagation(); setActiveSlide(dot); }}
                             className={`h-1.5 rounded-full transition-all duration-300 ${dot === activeSlide ? 'w-6 bg-primary' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                           />
                         ))}
                      </div>
                   </div>
                 );
               })}
             </div>
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
