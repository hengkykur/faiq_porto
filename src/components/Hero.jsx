import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Dual-video crossfade component for seamless looping.
 * Two video elements crossfade at the loop boundary to eliminate "patah".
 */
const SeamlessVideo = ({ src, className, style, onReady }) => {
  const vidA = useRef(null);
  const vidB = useRef(null);
  const [activeVid, setActiveVid] = useState('A'); // which is "primary"
  const [ready, setReady] = useState(false);
  const crossfadeRef = useRef(null);
  const durationRef = useRef(0);

  // Setup once video metadata known
  const handleCanPlay = useCallback(() => {
    if (!ready) {
      setReady(true);
      if (onReady) onReady();
      // Start both, stagger B to begin near the loop boundary
      if (vidA.current) {
        vidA.current.play().catch(() => {});
      }
    }
  }, [ready, onReady]);

  const handleMeta = useCallback((e) => {
    durationRef.current = e.target.duration;
  }, []);

  useEffect(() => {
    if (!ready) return;

    const CROSSFADE_DURATION = 0.8; // seconds of overlap

    const checkLoop = () => {
      const vid = activeVid === 'A' ? vidA.current : vidB.current;
      const next = activeVid === 'A' ? vidB.current : vidA.current;
      if (!vid || !next || !durationRef.current) return;

      const timeLeft = durationRef.current - vid.currentTime;

      if (timeLeft <= CROSSFADE_DURATION && timeLeft >= 0 && !crossfadeRef.current) {
        crossfadeRef.current = true;
        // Prepare and start next video from beginning
        next.currentTime = 0;
        next.play().catch(() => {});
        // Swap active after crossfade duration
        setTimeout(() => {
          setActiveVid(prev => prev === 'A' ? 'B' : 'A');
          crossfadeRef.current = false;
        }, CROSSFADE_DURATION * 1000);
      }
    };

    const interval = setInterval(checkLoop, 100);
    return () => clearInterval(interval);
  }, [ready, activeVid]);

  const vidAOpacity = ready ? (activeVid === 'A' ? 0.75 : 0) : 0;
  const vidBOpacity = ready ? (activeVid === 'B' ? 0.75 : 0) : 0;

  return (
    <div className={className} style={style}>
      <video
        ref={vidA}
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        onLoadedMetadata={handleMeta}
        onCanPlayThrough={handleCanPlay}
        className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
        style={{
          opacity: vidAOpacity,
          transition: 'opacity 0.8s ease-in-out',
          willChange: 'opacity',
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <video
        ref={vidB}
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
        style={{
          opacity: vidBOpacity,
          transition: 'opacity 0.8s ease-in-out',
          willChange: 'opacity',
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
};

const Hero = ({ active, onReady }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeSpeed, setTypeSpeed] = useState(150);
  const [videoReady, setVideoReady] = useState(false);

  const wordConfigs = [
    { text: 'Digital Art',   font: "'Cormorant Garamond', serif",    italic: true,  weight: 300 },
    { text: 'Sleek Code',    font: "'Space Grotesk', sans-serif",     italic: false, weight: 400 },
    { text: 'Architecture',  font: "'Outfit', sans-serif",            italic: true,  weight: 600 },
    { text: 'Simplicity',    font: "'Plus Jakarta Sans', sans-serif", italic: false, weight: 300 },
  ];

  useEffect(() => {
    const config = wordConfigs[wordIndex];
    const fullWord = config.text;

    const handleTyping = () => {
      if (!isDeleting) {
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        setTypeSpeed(150);
        if (currentText === fullWord) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        setTypeSpeed(75);
        if (currentText === '') {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % wordConfigs.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typeSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIndex, typeSpeed]);

  const config = wordConfigs[wordIndex];

  return (
    <div className="w-screen h-screen flex items-center relative overflow-hidden bg-black flex-shrink-0">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-[#060608]"
          style={{ backgroundImage: 'radial-gradient(ellipse at 75% 40%, rgba(99,102,241,0.12) 0%, transparent 65%)' }}
        />
        {/* Subtle carbon texture */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}
        />
        {/* Grain overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay grain-overlay" />
        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-10 scanlines" />
        {/* Left vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        {/* Bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      {/* ── Seamless Looping Video (right half) ── */}
      <div className="absolute top-0 right-0 w-full md:w-[55%] h-full z-10 pointer-events-none flex items-center justify-center overflow-hidden">
        <div
          className="relative w-[380px] h-[380px] md:w-[480px] md:h-[480px] transition-opacity duration-1000"
          style={{ opacity: videoReady ? 1 : 0 }}
        >
          {/* Circular mask wrapper */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 75%)',
              maskImage: 'radial-gradient(circle at center, black 45%, transparent 75%)',
            }}
          >
            <SeamlessVideo
              src="/vidiohomebulet.mp4"
              className="relative w-full h-full"
              style={{ backgroundColor: 'transparent' }}
              onReady={() => {
                setVideoReady(true);
                if (onReady) onReady();
              }}
            />
          </div>
          {/* Glow ring behind video */}
          <div className="absolute inset-[-20px] rounded-full bg-primary/10 blur-3xl -z-10" />
        </div>
      </div>

      {/* ── Hero Text ── */}
      <div className="container mx-auto px-6 relative z-20 pointer-events-none">
        <div className="max-w-2xl text-left pointer-events-auto">

          <p className="text-primary font-semibold mb-4 tracking-[0.25em] uppercase text-[10px] animate-glitch-heavy inline-block">
            Creative Technical Craft
          </p>

          <h1 className="text-4xl md:text-6xl font-display font-bold leading-[1.1] mb-5 text-white tracking-tight">
            <span className="italic">Engineering </span>
            <span className="text-white italic">Sleek</span>
            <span className="italic"> Digital</span>
            <br />
            <span
              className="text-glow transition-all duration-500 ease-in-out inline-block min-w-[200px] pr-6"
              style={{
                fontFamily: config.font,
                fontStyle: config.italic ? 'italic' : 'normal',
                fontWeight: config.weight,
              }}
            >
              {currentText}<span className="animate-pulse border-r-[3px] border-primary ml-0.5 inline-block h-[0.85em] align-middle" />
            </span>
            <span className="text-white font-light">.</span>
          </h1>

          <p className="text-sm md:text-[15px] text-slate-400 max-w-md mb-8 leading-relaxed font-light font-body">
            I craft high-performance code and intelligent digital architecture.{' '}
            Connecting{' '}
            <span className="text-white font-medium border-b border-primary/40">
              Web, Mobile, and Intelligence
            </span>{' '}
            through creative technical craft.
          </p>
        </div>
      </div>

      {/* Decorative corner glow */}
      <div className="absolute bottom-0 right-0 w-[35vw] h-[35vw] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none z-10" />
    </div>
  );
};

export default Hero;
