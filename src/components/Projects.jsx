import React, { useState, useEffect, useRef } from 'react';

const Projects = ({ active }) => {
  const [bgVideoLoaded, setBgVideoLoaded] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);
  const videoRef = useRef(null);

  const projects = [
    {
      title: 'Nexus',
      subtitle: 'UI Kit v2.0',
      description: 'A comprehensive high-performance design system built for scalable enterprise applications.',
      image: 'https://images.unsplash.com/photo-1614850523296-d8c1c0ba0256?auto=format&fit=crop&q=60&w=1200',
      tags: ['React', 'CSS', 'System']
    },
    {
      title: 'Cyber',
      subtitle: 'Analytics',
      description: 'Real-time data visualization engine for monitoring high-traffic network protocols and security.',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=60&w=1200',
      tags: ['Vite', 'Edge', 'D3.js']
    },
    {
      title: 'Vanguard',
      subtitle: 'Eco Store',
      description: 'Zero-latency e-commerce experience optimized for sustainable product distribution.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=60&w=1200',
      tags: ['Next.js', 'Stripe', 'Node']
    },
    {
      title: 'Aether',
      subtitle: 'Mobile App',
      description: 'Cross-platform mobile solution bringing intelligent workflow management to your fingertips.',
      image: 'https://images.unsplash.com/photo-1618761760534-33c15fe7c909?auto=format&fit=crop&q=60&w=1200',
      tags: ['Flutter', 'Firebase', 'Clean']
    },
    {
      title: 'Horizon',
      subtitle: 'AI Platform',
      description: 'Advanced neural network interface designed for collaborative artificial intelligence training.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=60&w=1200',
      tags: ['Python', 'Cloud', 'PyTorch']
    },
  ];

  // Ensure video plays
  useEffect(() => {
    if (active && videoRef.current) {
      videoRef.current.play().catch(err => console.error("Video play failed:", err));
    }
  }, [active]);

  // Zero-Gravity Controlled Carousel Logic (Keyboard Only)
  useEffect(() => {
    if (!active) return;
    
    let animationTimeout = null;

    const handleAnimationState = () => {
      setIsScrolling(true);
      if (animationTimeout) clearTimeout(animationTimeout);
      animationTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 850);
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
  }, [active, activeIndex, projects.length]);

  const handleWheel = (e) => {
    // Sensitivity threshold to prevent accidental triggers
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

    // Stop propagation to prevent page scrolling while navigating projects
    e.stopPropagation();
  };

  return (
    <div
      onWheel={handleWheel}
      className="w-screen h-screen flex items-center relative overflow-hidden flex-shrink-0"
    >
      {/* Cinematic Background Video Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#0a0a0c] z-10"
            style={{ opacity: bgVideoLoaded ? 0 : 1, transition: 'opacity 0.8s ease' }}
          >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        </div>

        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover scale-105 brightness-[0.40]"
          style={{
            opacity: bgVideoLoaded ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
          onCanPlay={() => setBgVideoLoaded(true)}
        >
          <source src="/home1.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 pointer-events-none z-[5] opacity-20 mix-blend-overlay grain-overlay"></div>
        <div className="absolute inset-0 pointer-events-none z-[6] opacity-10 scanlines"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/60 to-transparent z-[7]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-[8]"></div>
        <div className="absolute inset-0 bg-radial-vignette opacity-70 z-[9]"></div>
      </div>

      <div className="w-full h-full relative z-20 flex flex-col justify-center">
        {/* Dynamic Project Metadata HUD (Left Side) - Only active project */}
        <div className="absolute top-[25%] left-6 md:left-24 z-30 max-w-sm pointer-events-none">
          <div key={activeIndex} className="animate-hud-enter">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-mono text-primary border-l-2 border-primary pl-2 uppercase tracking-[0.2em]">Project Detail</span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-black text-white italic leading-none uppercase tracking-tight mb-2">
              {projects[activeIndex].title}
            </h2>
            <h3 className="text-xl md:text-2xl font-display font-light text-primary/80 italic uppercase tracking-[0.15em] mb-6">
              {projects[activeIndex].subtitle}
            </h3>
            
            <p className="text-sm md:text-base text-slate-400 font-body font-light leading-relaxed mb-8 pr-4">
              {projects[activeIndex].description}
            </p>

            <div className="flex flex-wrap gap-2">
              {projects[activeIndex].tags.map(tag => (
                <span key={tag} className="text-[9px] font-mono border border-primary/30 px-3 py-1 rounded-sm text-primary/90 bg-primary/5 uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>

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
        <div className="absolute top-12 left-6 md:left-24 pointer-events-none">
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
              className={`project-node flex-shrink-0 w-[68vw] md:w-[42vw] h-full flex items-center justify-center group select-none pointer-events-auto
                ${activeIndex === i ? 'opacity-100' : 'opacity-70'}
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

                {/* Skewed Stage (Artistic Parallelogram) */}
                <div className={`relative z-20 w-[48vw] md:w-[32vw] aspect-[16/10] overflow-hidden skew-x-[-15deg] border-2 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[#151518]
                  ${activeIndex === i ? 'border-primary/80 shadow-primary/20' : 'border-primary/20 shadow-primary/5'}
                `}
                style={{
                  transition: 'transform 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease',
                }}>

                  {/* Inner Image (Inverse Skew to display content correctly) */}
                  <div className="absolute inset-[-15%] skew-x-[15deg] group-hover:skew-x-[12deg] transition-transform duration-700">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 scale-110 group-hover:scale-125"
                      style={{ transition: 'filter 0.5s ease, transform 0.5s ease' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  </div>

                  {/* PROJECT TEXT INSIDE FRAME - REDUCED TO GHOST STATE WHEN ACTIVE */}
                  <div 
                    className={`absolute bottom-8 left-12 z-30 skew-x-[15deg] group-hover:skew-x-[12deg] pointer-events-none
                      ${activeIndex === i ? 'opacity-0' : 'opacity-40'}
                    `}
                    style={{ transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                  >
                    <h3 className="text-3xl md:text-4xl font-display font-black text-white italic leading-tight uppercase tracking-tight drop-shadow-2xl">
                      {p.title}
                    </h3>
                  </div>

                  {/* Corner Accents */}
                  <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/40 group-hover:border-primary transition-colors"></div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/40 group-hover:border-primary transition-colors"></div>
                </div>

                {/* HUD Navigation Number */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center transition-opacity duration-500"
                  style={{
                    opacity: activeIndex === i ? 0.8 : 0.2
                  }}
                >
                  <div className="w-px h-6 bg-white/20 mb-2"></div>
                  <div className="text-[10px] font-mono text-white tracking-widest uppercase">NODE_00{i + 1}</div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Global Footer Controls (Similar to reference) */}
        <div className="absolute bottom-12 left-0 right-0 px-6 md:px-24 flex justify-between items-end pointer-events-none">
          <div className="pointer-events-auto">
            <div className="text-[10px] font-mono text-slate-700 tracking-[0.4em] mb-2 uppercase">Collections</div>
            {/*<div className="flex gap-4">
              <button className="glass px-4 py-1.5 rounded-full text-[10px] font-bold text-white/50 border-white/5 hover:border-primary/40 hover:text-white transition-all uppercase">All Works =</button>
              <button className="bg-primary/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-primary border border-primary/40 hover:bg-primary/30 transition-all uppercase italic">Selected Projects *</button>
            </div>*/}
          </div>
          <div className="text-right pointer-events-none opacity-10">
            <div className="text-4xl font-display font-black uppercase italic italic tracking-tighter">Faiq_a.m</div>
            <div className="text-[8px] font-mono uppercase tracking-[0.5em]">Creative Developer Exhibit</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Projects;
