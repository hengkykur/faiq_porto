import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Dual-video crossfade using direct DOM manipulation — no React re-renders
 * during the crossfade so no risk of video elements unmounting.
 * Video A and B are always mounted; we only toggle style.opacity directly.
 */
const HeroVideo = ({ src, onReady }) => {
  const vidARef = useRef(null);
  const vidBRef = useRef(null);
  const [ready, setReady] = useState(false);
  const activeRef = useRef('A');     // tracks which video is "live"
  const swappingRef = useRef(false); // lock to prevent double-trigger
  const intervalRef = useRef(null);

  const CROSSFADE = 0.8; // seconds before loop end to start crossfade

  const doFade = useCallback((outEl, inEl) => {
    if (!outEl || !inEl) return;
    // Fade in B
    inEl.style.transition = `opacity ${CROSSFADE}s ease-in-out`;
    inEl.style.opacity = '0.75';
    // Fade out A
    outEl.style.transition = `opacity ${CROSSFADE}s ease-in-out`;
    outEl.style.opacity = '0';
  }, []);

  // Called once video A has loaded enough to play
  const handleCanPlay = useCallback(() => {
    if (ready) return;
    const vid = vidARef.current;
    if (!vid) return;
    vid.play().catch(() => { });
    // Set initial opacity directly
    vid.style.opacity = '0.75';
    setReady(true);
    if (onReady) onReady();
  }, [ready, onReady]);

  // Crossfade loop checker — runs via setInterval (lightweight, not RAF)
  useEffect(() => {
    if (!ready) return;

    intervalRef.current = setInterval(() => {
      const a = vidARef.current;
      const b = vidBRef.current;
      if (!a || !b || swappingRef.current) return;

      const active = activeRef.current === 'A' ? a : b;
      const next = activeRef.current === 'A' ? b : a;

      if (!active.duration) return;
      const timeLeft = active.duration - active.currentTime;

      if (timeLeft <= CROSSFADE && timeLeft > 0) {
        swappingRef.current = true;
        // Prepare next video
        next.currentTime = 0;
        next.play().catch(() => { });
        doFade(active, next);

        // After crossfade completes, swap references and unlock
        setTimeout(() => {
          activeRef.current = activeRef.current === 'A' ? 'B' : 'A';
          swappingRef.current = false;
          // Reset the old one so it's ready for next crossfade
          active.currentTime = 0;
          active.pause();
        }, CROSSFADE * 1000 + 50);
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [ready, doFade]);

  const vidStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    mixBlendMode: 'screen',
    opacity: 0,
    willChange: 'opacity',
  };

  return (
    <>
      <video
        ref={vidARef}
        muted
        playsInline
        preload="auto"
        onCanPlayThrough={handleCanPlay}
        style={vidStyle}
      >
        <source src={src} type="video/mp4" />
      </video>
      <video
        ref={vidBRef}
        muted
        playsInline
        preload="auto"
        style={{ ...vidStyle, opacity: 0 }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </>
  );
};

const Hero = ({ active, onReady }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeSpeed, setTypeSpeed] = useState(150);
  const [videoReady, setVideoReady] = useState(false);

  const wordConfigs = [
    { text: 'Digital Art', font: "'Cormorant Garamond', serif", italic: true, weight: 300 },
    { text: 'Sleek Code', font: "'Space Grotesk', sans-serif", italic: false, weight: 400 },
    { text: 'Architecture', font: "'Outfit', sans-serif", italic: true, weight: 600 },
    { text: 'Simplicity', font: "'Plus Jakarta Sans', sans-serif", italic: false, weight: 300 },
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
          className="relative"
          style={{
            width: 'min(75vw, 480px)',
            height: 'min(75vw, 480px)',
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 0.8s ease-out',
          }}
        >
          {/* Circular mask wrapper */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 75%)',
              maskImage: 'radial-gradient(circle at center, black 45%, transparent 75%)',
            }}
          >
            <HeroVideo
              src="/vidiohomebulet.mp4"
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

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold leading-[1.1] mb-5 text-white tracking-tight">
            <span className="italic">Engineering </span>
            <span className="text-white italic">Sleek</span>
            <span className="italic"> Digital</span>
            <br />
            <span
              className="text-glow inline-block min-w-[120px] sm:min-w-[200px] pr-4 sm:pr-6"
              style={{
                fontFamily: config.font,
                fontStyle: config.italic ? 'italic' : 'normal',
                fontWeight: config.weight,
                transition: 'font-family 0.4s, font-style 0.4s, font-weight 0.4s',
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
