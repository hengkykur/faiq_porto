import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const ProjectDetail = ({ project, onClose, assetsAllowed = true }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
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
    // Detect mobile (debounced)
    const checkMobile = () => {
      clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => setIsMobile(window.innerWidth < 768), 150);
    };
    setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);

    const timer = setTimeout(() => setIsRendered(true), 50);

    // Prevent scrolling on body when open
    document.body.style.overflow = 'hidden';

    // Keyboard listener for Escape key
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
    setTimeout(onClose, 500); // Wait for exit animation
  };

  if (!project) return null;

  const modalContent = (
    <div
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isRendered ? 'opacity-100 backdrop-blur-md' : 'opacity-0 backdrop-blur-none'
        }`}
      style={{
        backgroundColor: 'transparent'
      }}
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#080810]">
        {/* Cursor Spotlight Overlay (Desktop only) */}
        {!isMobile && (
          <div
            className="absolute inset-0 z-[2] transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(99, 102, 241, 0.08) 0%, transparent 40%)`,
              opacity: isRendered ? 1 : 0
            }}
          />
        )}

        <div className="absolute inset-0 bg-black/5 mix-blend-multiply" />
        <div className="project-grid-lines relative z-[1]" />
        <div className="absolute inset-0 bg-radial-vignette opacity-20 z-[3]" />
      </div>

      {/* Background close area */}
      <div className="absolute inset-0 cursor-pointer" onClick={handleClose}></div>

      {/* Main Content Container */}
      <div
        className={`relative w-[90vw] md:w-[75vw] h-[85vh] bg-[#0c0c14] border border-white/5 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isRendered ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-10 scale-95 opacity-0'
          }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all group"
        >
          <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Image Section */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden group bg-black/50">
            {/* Blurry Background */}
            <img
              src={project.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl grayscale"
            />
            <div className="absolute inset-0 bg-primary/20 mix-blend-color-burn z-10 pointer-events-none transition-opacity duration-700 group-hover:opacity-0"></div>

            {/* Unified Dark Badge App-Icon Frame */}
            <div className="absolute inset-0 z-0 flex items-center justify-center p-8 md:p-12">
              <div className="relative w-full max-w-[280px] aspect-square bg-[#0f0f13] rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.9)] border border-white/5 p-12 flex items-center justify-center scale-105 group-hover:scale-100 transition-transform duration-700 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none"></div>
                <img
                  src={project.image}
                  alt={project.title}
                  className={`w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] relative z-10 ${project.invertLogo ? 'brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] opacity-90' : ''}`}
                />
                <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10 pointer-events-none z-20"></div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#0c0c14] z-20 pointer-events-none"></div>

            {/* Project Status Badge */}
            <div className="absolute top-6 left-6 z-30">
              <span className="text-[10px] font-mono border border-primary/30 px-3 py-1 rounded-sm text-primary bg-black/50 backdrop-blur-sm uppercase tracking-wider shadow-[0_0_15px_rgba(var(--color-primary),0.3)]">
                {project.status} • {project.year}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-12 lg:p-16 flex flex-col overflow-y-auto relative z-30 thin-scrollbar">
            <div className="flex items-center gap-3 mb-6 opacity-0 animate-[fade-in-up_0.5s_ease-out_0.3s_forwards]">
              <span className="text-[10px] font-mono text-primary border-l-2 border-primary pl-2 uppercase tracking-[0.2em]">Detailed Record</span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white italic leading-none uppercase tracking-tight mb-2 opacity-0 animate-[fade-in-up_0.5s_ease-out_0.4s_forwards]">
              {project.title}
            </h2>
            <h3 className="text-xl md:text-2xl font-display font-light text-primary/80 italic uppercase tracking-[0.15em] mb-8 opacity-0 animate-[fade-in-up_0.5s_ease-out_0.5s_forwards]">
              {project.subtitle}
            </h3>

            <div className="prose prose-invert prose-sm md:prose-base font-body font-light text-slate-300 leading-relaxed mb-10 opacity-0 animate-[fade-in-up_0.5s_ease-out_0.6s_forwards]">
              <p>{project.description}</p>
              <p className="mt-4 text-slate-400">
                This project represents a culmination of dedicated effort and advanced architectural planning. Focusing strongly on user experience and robust performance metrics, {project.title} was designed from the ground up to address complex systemic challenges.
              </p>
            </div>

            <div className="mt-auto opacity-0 animate-[fade-in-up_0.5s_ease-out_0.7s_forwards]">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-4">Technology Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span key={tag} className="text-xs font-mono border border-white/10 px-4 py-2 rounded-sm text-white/70 bg-white/5 uppercase tracking-wider hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* View Project Button (Dummy) */}
            <div className="mt-10 opacity-0 animate-[fade-in-up_0.5s_ease-out_0.8s_forwards]">
              <a href="#" className="inline-flex items-center gap-3 px-6 py-3 border border-primary/50 text-white font-mono text-xs uppercase tracking-widest hover:bg-primary/10 hover:border-primary transition-all group">
                <span>View Live Initiative</span>
                <span className="block w-4 h-px bg-primary group-hover:w-8 transition-all duration-300"></span>
              </a>
            </div>
          </div>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/30 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/30 pointer-events-none"></div>
      </div>

      {/* Required keyframes style tag for bespoke animations in this component */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .thin-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .thin-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .thin-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProjectDetail;
