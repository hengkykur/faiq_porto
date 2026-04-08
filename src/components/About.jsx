import React, { useState, useEffect, useRef } from 'react';
// import skillVid from '../assets/skillvid.mp4';
import academic3d from '../assets/academic_3d.png';
import kayabaLogo from '../assets/kayaba.webp';
import himasisLogo from '../assets/himasis.png';
import academicTech from '../assets/academic_tech.png';

const About = ({ active, prewarm }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [isZone2Active, setIsZone2Active] = useState(false);
  const [isZone3Active, setIsZone3Active] = useState(false);
  const [isZone4Active, setIsZone4Active] = useState(false);
  const [isZone5Active, setIsZone5Active] = useState(false);
  const [isZone6Active, setIsZone6Active] = useState(false);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Lazy load video when component becomes active or prewarmed
  useEffect(() => {
    if ((active || prewarm) && !hasStartedLoading) {
      setHasStartedLoading(true);
    }
  }, [active, prewarm, hasStartedLoading]);

  // Carousel State
  const [expIndex, setExpIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFastSpin, setIsFastSpin] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [hasSpunIntro, setHasSpunIntro] = useState(false);

  // 3D Tilt State
  const techRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const experiences = [
    {
      date: "January 2026 — Present",
      title: "FULL-STACK DEVELOPER INTERN ",
      company: "PT. KAYABA INDONESIA",
      logo: kayabaLogo,
      isLightLogo: true,
      description: "Designing and developing an integrated software ecosystem to automate the monitoring and reporting of product delivery abnormalities in a manufacturing environment.",
      achievements: []
    },
    {
      date: "August 2025 — December 2025",
      title: "HEAD OF HRD UNIT",
      company: "HIMASIS STMI JAKARTA",
      logo: himasisLogo,
      description: "Managing human resource development and internal organizational growth within the Information Systems Student Association.",
      achievements: [

      ]
    },
    {
      date: "August 2023 — 2024",
      title: "BUSINESS DEVELOPMENT ASSOCIATE",
      company: "HIMASIS STMI JAKARTA",
      logo: himasisLogo,
      description: "Driving organizational growth through strategic partnerships, sponsorship acquisition, and professional networking initiatives.",
      achievements: []
    }
  ];

  // Roulette Intro Sequence
  useEffect(() => {
    if (isZone5Active && !hasSpunIntro) {
      const runRoulette = async () => {
        setIsSpinning(true);
        setIsFastSpin(true);
        const sequence = [1, 2, 0, 1, 2]; // Shortened for faster intro
        for (let i = 0; i < sequence.length; i++) {
          setExpIndex(sequence[i]);
          await new Promise(r => setTimeout(r, 150));
          if (i === sequence.length - 2) setIsFastSpin(false);
        }
        setTimeout(() => {
          setIsSpinning(false);
          setShowFlash(true);
          setHasSpunIntro(true);
          setTimeout(() => setShowFlash(false), 500);
        }, 1200);
      };
      runRoulette();
    }
  }, [isZone5Active, hasSpunIntro]);

  const handleNavigate = (newIndex) => {
    if (isSpinning) return;
    setIsFastSpin(false);
    setExpIndex(newIndex);
  };

  const handleTechMouseMove = (e) => {
    if (!techRef.current) return;
    const { left, top, width, height } = techRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    // Calculate rotation (-15 to 15 degrees)
    const rotateY = (x - 0.5) * 30;
    const rotateX = (y - 0.5) * -30;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleTechMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.85;
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const currentScroll = Math.max(0, scrollTop);
    const maxScroll = scrollHeight - clientHeight;
    const progress = currentScroll / (maxScroll || 1);
    setScrollProgress(progress);

    // Contiguous thresholds to prevent "flickering" or "dead zones"
    setIsZone2Active(progress > 0.08 && progress <= 0.38);
    setIsZone3Active(progress > 0.38 && progress <= 0.55);
    setIsZone4Active(progress > 0.55 && progress <= 0.75);
    setIsZone5Active(progress > 0.75 && progress <= 0.92);
    setIsZone6Active(progress > 0.92);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration > 0) {
      if (currentTime > duration - 0.8) {
        setVideoOpacity(Math.max(0.4, (duration - currentTime) / 0.8));
      } else if (currentTime < 0.8) {
        setVideoOpacity(Math.max(0.4, currentTime / 0.8));
      } else {
        setVideoOpacity(1);
      }
    }
  };

  const Icons = {
    Web: () => (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    Mobile: () => (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    AI: () => (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    Ribbon: () => (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.703 2.703 0 01-3 0 2.703 2.703 0 01-3 0 2.703 2.703 0 01-3 0 2.703 2.703 0 01-3 0 2.604 2.604 0 01-1.5-.454V4.4a2.4 2.4 0 011.95-2.35 15.65 15.65 0 0110.1 0 2.4 2.4 0 011.95 2.35v11.146zM15.5 12a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
      </svg>
    ),
    ChevronLeft: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    ),
    ChevronRight: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    )
  };

  const currentYear = new Date().getFullYear();

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="w-screen h-screen flex-shrink-0 relative overflow-y-auto no-scrollbar select-none snap-y snap-proximity"
    >
      {/* Background Video */}
      <div
        className="sticky top-0 w-full h-full z-0 overflow-hidden bg-black transition-opacity duration-1000"
        style={{
          opacity: scrollProgress > 0.38 && scrollProgress <= 0.62 ? 0 :
            scrollProgress > 0.62 ? 0.4 : 1
        }}
      >
        {/* Visual Placeholder for About Video with Cinematic Shimmer */}
        <div
          className={`absolute inset-0 bg-[#0a0a0c] transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(129, 140, 248, 0.05) 0%, transparent 50%)',
          }}
        >
          {/* Shimmer Effect */}
          {!videoLoaded && (
            <div className="absolute inset-0 overflow-hidden opacity-50">
              <div className="absolute inset-0 bg-transparent animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]"></div>
            </div>
          )}
        </div>

        {hasStartedLoading && (
          <video
            ref={videoRef}
            src="/skillvid.mp4"
            autoPlay
            muted={true}
            defaultMuted
            loop
            playsInline
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedData={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${videoLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'}`}
            style={{ opacity: videoLoaded ? (videoOpacity * 0.7) : 0 }}
          />
        )}
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        
        {/* Aesthetic Camouflage Layers */}
        <div className="absolute inset-0 pointer-events-none z-[11] opacity-20 mix-blend-overlay grain-overlay"></div>
        <div className="absolute inset-0 pointer-events-none z-[12] opacity-10 scanlines"></div>
      </div>

      <div className="absolute top-0 left-0 z-10 w-full" style={{ height: '700vh' }}>

        {/* Zone 1: Intro */}
        <div className="h-screen w-full flex items-center justify-center relative snap-start">
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-2 transition-all duration-1000" style={{ opacity: scrollProgress < 0.1 ? 1 : 0, visibility: scrollProgress < 0.1 ? 'visible' : 'hidden' }}>
            <span className="text-[11px] uppercase tracking-[0.4em] text-white/50 font-medium">Scroll to explore</span>
            <div className="w-px h-16 bg-gradient-to-b from-primary to-transparent"></div>
          </div>
        </div>

        {/* Zone 2: Cinematic Drawing (200vh) */}
        <div className="h-[200vh] w-full relative">
          <div className="sticky top-0 h-screen w-full flex items-center justify-center px-6 pointer-events-none">
            <div className="text-center w-full max-w-5xl">
              <h2 className="text-primary font-semibold mb-8 tracking-[0.5em] uppercase text-xs transition-all duration-1000" style={{ opacity: isZone2Active ? 1 : 0, transform: `translateY(${isZone2Active ? 0 : 20}px)`, filter: `blur(${isZone2Active ? 0 : 10}px)` }}>Mastering the Craft</h2>
              <svg viewBox="0 0 1000 300" className="w-full h-auto drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-1000 ease-out" style={{ opacity: isZone2Active ? 1 : 0, transform: `scale(${isZone2Active ? 1 : 0.95}) translateY(${isZone2Active ? 0 : -20}px)`, filter: `blur(${isZone2Active ? 0 : 20}px)` }}>
                <defs><linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="#818cf8" /></linearGradient></defs>
                <text x="50%" y="35%" textAnchor="middle" className="font-display font-black italic tracking-tighter" style={{ fontSize: '120px', fill: 'white', fillOpacity: isZone2Active ? 1 : 0, stroke: 'white', strokeWidth: '1.2', strokeDasharray: '1000', strokeDashoffset: isZone2Active ? 0 : 1000, transition: isZone2Active ? 'stroke-dashoffset 2.5s cubic-bezier(0.4, 0, 0.2, 1), fill-opacity 1s ease-out 1.5s' : 'stroke-dashoffset 1.2s ease-in, fill-opacity 0.5s ease-in' }}>FAIQ</text>
                <text x="50%" y="75%" textAnchor="middle" className="font-display font-black italic tracking-tighter" style={{ fontSize: '120px', fill: 'url(#textGradient)', fillOpacity: isZone2Active ? 1 : 0, stroke: 'url(#textGradient)', strokeWidth: '1.2', strokeDasharray: '1000', strokeDashoffset: isZone2Active ? 0 : 1000, transition: isZone2Active ? 'stroke-dashoffset 2.5s cubic-bezier(0.4, 0, 0.2, 1) 0.5s, fill-opacity 1s ease-out 1.8s' : 'stroke-dashoffset 1.2s ease-in, fill-opacity 0.5s ease-in' }}>ADIMULYO</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Zone 3: About Me */}
        <div className="h-screen w-full flex items-center pt-24 pb-20 px-6 md:px-24 bg-transparent snap-start overflow-hidden">
          <div className="w-full max-w-7xl mx-auto transition-all duration-1000 ease-out grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" style={{ opacity: isZone3Active ? 1 : 0, transform: `translateY(${isZone3Active ? 0 : 60}px) scale(${isZone3Active ? 1 : 0.98})`, filter: `blur(${isZone3Active ? 0 : 10}px)` }}>
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 drop-shadow-2xl text-white text-left italic">About <span className="text-glow">Me</span></h2>
              <p className="text-slate-300 mb-8 leading-relaxed text-base md:text-lg font-light drop-shadow-lg max-w-2xl whitespace-pre-wrap text-left">
                As a Software Developer, my vision is to create meaningful and impactful technological solutions. My expertise lies in building robust Web and Android applications, enhanced by AI integration for maximum efficiency.{"\n\n"}
                I thrive on problem-solving and constantly strive to bring fresh ideas and precise technical execution to every project.
              </p>

              {/* 3D Interactive Tech Visualization */}
              <div
                ref={techRef}
                onMouseMove={handleTechMouseMove}
                onMouseLeave={handleTechMouseLeave}
                className="relative mt-8 w-full max-w-md group transition-all duration-300 ease-out animate-float"
                style={{
                  perspective: '1200px',
                  animationDelay: '1s'
                }}
              >
                <div
                  className="relative w-full aspect-[16/9] transition-transform duration-200 ease-out"
                  style={{
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Layer 0: Deep Glow */}
                  <div className="absolute -inset-4 bg-primary/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ transform: 'translateZ(-50px) skewX(-16deg) rotate(-4deg)' }}></div>

                  {/* Layer 1: The Glass Frame */}
                  <div
                    className="absolute inset-0 bg-white/5 border border-white/20 shadow-2xl backdrop-blur-sm"
                    style={{
                      transform: 'translateZ(0px) skewX(-16deg) rotate(-4deg)',
                      borderRadius: '32px',
                      boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05), 0 20px 50px rgba(0,0,0,0.5)'
                    }}
                  ></div>

                  {/* Layer 2: Image Content */}
                  <div className="absolute inset-[2px] overflow-hidden"
                    style={{
                      transform: 'translateZ(20px) skewX(-16deg) rotate(-4deg)',
                      borderRadius: '30px'
                    }}
                  >
                    <div className="absolute inset-0 w-full h-full animate-[scroll_25s_ease-in-out_infinite]">
                      <div className="w-full h-full" style={{ transform: 'rotate(4deg) skewX(16deg) scale(1.1)' }}>
                        <img
                          src={academicTech}
                          alt="Technical Skills Visualization"
                          loading="lazy"
                          className="w-full h-full object-cover mix-blend-screen opacity-60 group-hover:opacity-90 transition-all duration-700 filter saturate-[1.2] brightness-[1.1]"
                        />
                      </div>
                    </div>
                    {/* Inner HUD Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                  </div>

                  {/* Layer 3: Floating UI HUD */}
                  <div className="absolute top-8 right-12 text-[11px] font-mono font-bold text-primary tracking-[0.2em] uppercase opacity-40 group-hover:opacity-100 group-hover:text-glow transition-all"
                    style={{ transform: 'translateZ(60px)' }}>
                    sys.3D_render_active
                  </div>

                  <div className="absolute bottom-10 left-16 group/hud" style={{ transform: 'translateZ(80px)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                      <span className="text-[11px] font-[900] font-mono text-white tracking-[0.3em] uppercase drop-shadow-glow">Visual Schema v2.1</span>
                    </div>
                    <div className="h-[2px] w-32 bg-gradient-to-r from-primary to-transparent group-hover/hud:w-48 transition-all duration-700"></div>
                  </div>

                  {/* Decorative Tech Corners */}
                  <div className="absolute top-6 left-12 w-6 h-6 border-t-2 border-l-2 border-white/20" style={{ transform: 'translateZ(40px)' }}></div>
                  <div className="absolute bottom-6 right-12 w-6 h-6 border-b-2 border-r-2 border-white/20" style={{ transform: 'translateZ(40px)' }}></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              {[{ title: "Web Development", desc: "Building modern, scalable web ecosystems.", icon: Icons.Web }, { title: "Android App", desc: "Developing native-feel mobile experiences.", icon: Icons.Mobile }, { title: "AI Integration", desc: "Implementing intelligent automation solutions.", icon: Icons.AI }].map((cap, i) => (
                <div key={cap.title} className="glass group p-6 rounded-2xl border border-white/10 hover:border-primary/40 transition-all duration-500 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-glow shadow-primary/20"><cap.icon /></div>
                  <div><h3 className="text-white font-semibold text-xl mb-1 tracking-tight">{cap.title}</h3><p className="text-slate-400 text-sm leading-relaxed font-light">{cap.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone 4: Academic Background */}
        <div className="h-screen w-full flex items-center px-6 md:px-24 bg-transparent snap-start overflow-hidden">
          <div className="w-full max-w-7xl mx-auto transition-all duration-1000 ease-out grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-center" style={{ opacity: isZone4Active ? 1 : 0, transform: `translateY(${isZone4Active ? 0 : 80}px) scale(${isZone4Active ? 1 : 0.95})`, filter: `blur(${isZone4Active ? 0 : 15}px)` }}>
            <div>
              <div className="flex items-center gap-3 mb-6"><Icons.Ribbon /><span className="text-primary font-bold tracking-[0.4em] uppercase text-xs">Academic Background</span></div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-white mb-10 leading-none tracking-tight uppercase italic drop-shadow-2xl">POLITEKNIK STMI <br /> <span className="text-glow">JAKARTA</span></h1>
              <div className="flex flex-col md:flex-row md:items-center gap-8 mb-12">
                <div className="pl-6 border-l-2 border-primary/40"><h3 className="text-white font-bold text-2xl uppercase tracking-tighter mb-1">Information System</h3></div>
                <div className="flex gap-8 text-slate-400 font-medium text-sm md:text-base uppercase tracking-[0.2em]"><div>GPA: <span className="text-white">- / 4.00</span></div><div>Class of <span className="text-white">2023</span></div></div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-64 h-64 md:w-96 md:h-96 group animate-float">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-[100px] group-hover:bg-primary/30 transition-all duration-1000"></div>
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img src={academic3d} alt="Graduate" loading="lazy" className="w-full h-full object-contain scale-125 select-none pointer-events-none" style={{ mixBlendMode: 'screen', maskImage: 'radial-gradient(circle, black 50%, transparent 95%)', WebkitMaskImage: 'radial-gradient(circle, black 50%, transparent 95%)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone 5: Experience Log Carousel */}
        <div className="h-screen w-full flex items-center justify-center px-6 md:px-24 bg-transparent snap-start snap-always overflow-hidden z-20">
          <div className="w-full max-w-5xl mx-auto transition-all duration-1000 ease-out" style={{ opacity: isZone5Active ? 1 : 0, transform: `translateY(${isZone5Active ? 0 : 80}px)`, filter: `blur(${isZone5Active ? 0 : 15}px)` }}>
            <div className="flex items-center gap-3 mb-8 group cursor-default">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-white/10 shadow-glow"><span className="text-primary font-black text-xl group-hover:animate-glitch">05</span></div>
              <h2 className="text-2xl md:text-3xl font-display font-bold italic text-white uppercase tracking-tight group-hover:animate-glitch">Experience <span className="text-glow animate-glitch-heavy">Log</span></h2>
            </div>
            <div className="relative group/carousel">
              {/* Navigation Buttons - RESTORED and OPTIMIZED */}
              <div className="absolute -left-12 md:-left-20 top-1/2 -translate-y-1/2 z-[100] pointer-events-auto">
                <button
                  onClick={() => handleNavigate((expIndex - 1 + experiences.length) % experiences.length)}
                  className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-primary/50 hover:bg-primary/10 transition-all active:scale-95 shadow-xl backdrop-blur-xl"
                  aria-label="Previous Project"
                >
                  <Icons.ChevronLeft />
                </button>
              </div>

              <div className="absolute -right-12 md:-right-20 top-1/2 -translate-y-1/2 z-[100] pointer-events-auto">
                <button
                  onClick={() => handleNavigate((expIndex + 1) % experiences.length)}
                  className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-primary/50 hover:bg-primary/10 transition-all active:scale-95 shadow-xl backdrop-blur-xl"
                  aria-label="Next Project"
                >
                  <Icons.ChevronRight />
                </button>
              </div>

              {/* Carousel Viewport */}
              <div className="relative w-full h-[380px] md:h-[420px] overflow-hidden rounded-[40px] glass border border-white/20 z-10 pointer-events-auto">
                <div className={`flex h-full ${isSpinning ? 'slot-blur-h' : ''} ${isFastSpin ? 'slot-track-fast' : 'slot-track-h'}`} style={{ transform: `translateX(-${expIndex * 100}%)`, transitionProperty: 'transform' }}>
                  {experiences.map((exp, i) => (
                    <div key={i} className="min-w-full h-full p-8 md:p-14 flex flex-col justify-center relative overflow-hidden group/item">
                      {/* Industrial HUD Background Pattern */}
                      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-[scan_8s_linear_infinite]"></div>
                        <div className="absolute top-10 left-10 text-[8px] font-mono text-slate-700 uppercase tracking-[0.4em]">Coord_X: 00.{i + 1} <br /> Coord_Y: 00.A7</div>
                        <div className="absolute bottom-10 right-10 text-[8px] font-mono text-slate-700 uppercase tracking-[0.4em]">Sector_7G <br /> Node: LVL_0{i}</div>
                      </div>

                      <div className={`absolute top-4 right-4 md:top-8 md:right-10 w-28 h-28 md:w-48 md:h-48 rounded-3xl p-6 flex items-center justify-center transition-all duration-500 overflow-hidden z-10 ${exp.isLightLogo ? 'bg-white/95 shadow-[0_0_30px_rgba(255,255,255,0.4)]' : 'glass opacity-90'}`}>
                        <img src={exp.logo} alt={exp.company} loading="lazy" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-primary font-bold tracking-[0.2em] text-[10px] md:text-xs mb-3 uppercase flex items-center gap-2 z-10">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        {exp.date}
                        {exp.date.includes('Present') && (
                          <span className="ml-4 px-2 py-0.5 rounded border border-primary/40 text-[8px] font-black text-primary animate-pulse">
                            [ STATUS: ACTIVE ]
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl md:text-5xl font-display font-black leading-tight text-white mb-2 italic uppercase max-w-[80%] group-hover/item:animate-glitch-heavy z-10">{exp.title}</h3>
                      <div className="text-lg md:text-2xl text-slate-400 font-semibold uppercase tracking-widest mb-8 z-10">{exp.company}</div>
                      {exp.achievements.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                          {exp.achievements.map((ach, j) => (
                            <div key={j} className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div><div className="text-slate-300 text-[11px] md:text-sm leading-relaxed"><span className="text-white font-bold italic uppercase">{ach.rank}</span> — {ach.name}</div></div>
                          ))}
                        </div>
                      ) : (<p className="text-slate-300 text-sm md:text-lg font-light leading-relaxed italic">"{exp.description}"</p>)}
                    </div>
                  ))}
                </div>
                {showFlash && <div className="absolute inset-0 bg-white pointer-events-none z-50 animate-impact"></div>}
              </div>
            </div>
          </div>
        </div>

        {/* Zone 6: PROGRAMMER FOOTER */}
        <div className="h-screen w-full flex items-center justify-center px-6 md:px-24 bg-black snap-start snap-always relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-[0.07] transition-all duration-1000" style={{ transform: `scale(${isZone6Active ? 1 : 1.1})`, filter: `blur(${isZone6Active ? 0 : 20}px)` }}>
            <div className="absolute top-0 left-0 text-[30vw] font-display font-black text-slate-700 -translate-x-1/4 -translate-y-1/4">{"{"}</div>
            <div className="absolute bottom-0 right-0 text-[35vw] font-display font-black text-slate-700 translate-x-1/4 translate-y-1/4">{"}"}</div>
          </div>

          <div className="container mx-auto relative z-10 w-full h-full flex flex-col justify-between py-12 md:py-20 transition-all duration-1000" style={{ opacity: isZone6Active ? 1 : 0, transform: `translateY(${isZone6Active ? 0 : 50}px)` }}>
            <div className="max-w-5xl mt-20">
              <h2 className="text-5xl md:text-[7.5rem] font-display font-bold text-white leading-[0.85] tracking-tighter mb-12 italic uppercase group">
                TELL ME WHAT <br />
                YOU'RE <span className="text-glow animate-glitch-heavy inline-block">BUILDING</span><br />
                <span className="group-hover:animate-glitch-heavy inline-block">I'LL MAKE IT SHINE</span>
              </h2>

              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-glow shadow-green-500/50"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-mono text-sm tracking-tighter uppercase font-bold animate-glitch-heavy">SYSTEM STATUS: OPTIMIZED</span>
                  <span className="text-slate-500 font-mono text-[10px] uppercase tracking-widest text-glow">Latency: 0.001ms (RT)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pt-16 border-t border-white/5 mt-auto">
              <div className="flex flex-col gap-4">
                <h4 className="text-white/60 font-mono text-[10px] font-bold tracking-widest uppercase animate-glitch-heavy inline-block w-fit">Portfolio Version One</h4>
                <p className="text-slate-600 font-mono text-[9px] leading-relaxed max-w-[220px] uppercase">Built with high-precision tools and modern ecosystems for maximum narrative impact.</p>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-white/60 font-mono text-[10px] font-bold tracking-widest uppercase animate-glitch-heavy inline-block w-fit">Engineered for Performance</h4>
                <p className="text-slate-600 font-mono text-[9px] leading-relaxed max-w-[220px] uppercase">Using cutting-edge tools to ensure a seamless and high-precision digital narrative.</p>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-white/60 font-mono text-[10px] font-bold tracking-widest uppercase animate-glitch-heavy inline-block w-fit">Published Info</h4>
                <p className="text-primary font-mono text-[9px] uppercase tracking-widest font-bold text-glow">MARCH 10TH {currentYear}</p>
                <p className="text-slate-600 font-mono text-[9px] uppercase tracking-tighter">ALL RIGHTS RESERVED — Faiq_a.m</p>
              </div>
              <div className="flex flex-col items-start md:items-end justify-end">
                <div className="text-white font-display font-black text-4xl italic tracking-tighter opacity-10 hover:opacity-100 hover:animate-glitch-heavy transition-all cursor-default">Faiq_a.m</div>
                <div className="flex gap-4 mt-2">
                  <span className="text-[10px] text-white/20 font-mono tracking-widest uppercase animate-pulse">Swipe to Connect</span>
                  <Icons.ChevronRight />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
