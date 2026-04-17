import React, { useState, useRef, useEffect, useCallback } from 'react';
import SpaceInvaders from './SpaceInvaders';

/**
 * LazyVideo Component
 * Only loads and plays the video when scrolled into viewport via IntersectionObserver.
 */
const LazyVideo = ({ src, className }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pause/resume based on visibility
  useEffect(() => {
    if (!shouldLoad) return;
    const el = containerRef.current;
    const vid = videoRef.current;
    if (!el || !vid) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          vid.play().catch(() => { });
        } else {
          vid.pause();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#060608]">
      {shouldLoad && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className={className}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
};

/**
 * Dual-video crossfade using direct DOM manipulation — no React re-renders
 * during the crossfade so no risk of video elements unmounting.
 * Video A and B are always mounted; we only toggle style.opacity directly.
 */
const HeroVideo = ({ src, onReady, active = true }) => {
  const vidARef = useRef(null);
  const vidBRef = useRef(null);
  const posterRef = useRef(null);
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

  // Called once video A can play — fade poster out & show video
  const handleCanPlay = useCallback(() => {
    if (ready) return;
    const vid = vidARef.current;
    if (!vid) return;
    vid.play().catch(() => { });
    // Reveal video instantly
    vid.style.transition = 'opacity 0.4s ease-out';
    vid.style.opacity = '0.75';
    // Fade out the poster image so video takes over
    if (posterRef.current) {
      posterRef.current.style.transition = 'opacity 0.4s ease-out';
      posterRef.current.style.opacity = '0';
    }
    setReady(true);
    if (onReady) onReady();
  }, [ready, onReady]);

  // Crossfade loop checker — runs via setInterval (lightweight, not RAF)
  useEffect(() => {
    if (!ready) return;

    const a = vidARef.current;
    const b = vidBRef.current;
    const initialActive = activeRef.current === 'A' ? a : b;

    // Pause video if user scrolls away to save resources
    if (!active) {
      if (initialActive) initialActive.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    } else {
      if (initialActive) {
        if (initialActive.ended || (initialActive.duration && initialActive.currentTime >= initialActive.duration - 0.5)) {
          initialActive.currentTime = 0;
        }
        initialActive.play().catch(() => { });
      }
    }

    intervalRef.current = setInterval(() => {
      if (!a || !b || swappingRef.current) return;

      const currentActiveVid = activeRef.current === 'A' ? a : b;
      const nextVid = activeRef.current === 'A' ? b : a;

      if (!currentActiveVid.duration) return;
      const timeLeft = currentActiveVid.duration - currentActiveVid.currentTime;

      if (timeLeft <= CROSSFADE && timeLeft > 0) {
        swappingRef.current = true;
        if (!nextVid.currentSrc) {
          nextVid.innerHTML = `
             <source src="${src}" type="video/mp4" />
           `;
          nextVid.load();
        }
        nextVid.currentTime = 0;
        nextVid.play().catch(() => { });
        doFade(currentActiveVid, nextVid);

        setTimeout(() => {
          activeRef.current = activeRef.current === 'A' ? 'B' : 'A';
          swappingRef.current = false;
          currentActiveVid.currentTime = 0;
          currentActiveVid.pause();
        }, CROSSFADE * 1000 + 50);
      }
    }, 250);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [ready, active, doFade, src]);

  const vidStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    mixBlendMode: 'screen',
    opacity: 0,
  };

  return (
    <>
      {/* ── LCP-critical poster: renders immediately, visible without JS ── */}
      <img
        ref={posterRef}
        src="/vidiohome_poster.webp"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          mixBlendMode: 'screen',
          opacity: 0.75,
          pointerEvents: 'none',
        }}
      />
      {/* ── Video A (active) ── */}
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
      {/* ── Video B (crossfade reserve) ── */}
      <video
        ref={vidBRef}
        muted
        playsInline
        preload="none"
        style={{ ...vidStyle, opacity: 0 }}
      >
        {/* Source injected dynamically to avoid duplicate parallel fetch */}
      </video>
    </>
  );
};

// --- Shared IntersectionObserver for highly optimized scroll reveals ---
let sharedObserver = null;
const observationMap = new Map();

const getSharedObserver = () => {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const callback = observationMap.get(entry.target);
          if (callback) callback();
          sharedObserver.unobserve(entry.target);
          observationMap.delete(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -15% 0px' });
  }
  return sharedObserver;
};

const RevealOnScroll = ({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const ref = domRef.current;
    if (!ref) return;

    const observer = getSharedObserver();
    observationMap.set(ref, () => setIsVisible(true));
    observer.observe(ref);

    return () => {
      if (ref && observationMap.has(ref)) {
        observer.unobserve(ref);
        observationMap.delete(ref);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        transition: `opacity 1s ease-out ${delay}ms, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
        /* Removed willChange to free GPU memory */
      }}
    >
      {children}
    </div>
  );
};

const TypewriterText = React.memo(() => {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeSpeed, setTypeSpeed] = useState(150);

  const wordConfigs = React.useMemo(() => [
    { text: 'Digital Art', font: "'Cormorant Garamond', serif", italic: true, weight: 300 },
    { text: 'Sleek Code', font: "'Space Grotesk', sans-serif", italic: false, weight: 400 },
    { text: 'Architecture', font: "'Outfit', sans-serif", italic: true, weight: 600 },
    { text: 'Simplicity', font: "'Plus Jakarta Sans', sans-serif", italic: false, weight: 300 },
  ], []);

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
  }, [currentText, isDeleting, wordIndex, typeSpeed, wordConfigs]);

  const config = wordConfigs[wordIndex];

  return (
    <span className="relative inline-block align-middle overflow-hidden pr-4 sm:pr-8" style={{ contain: 'layout paint' }}>
      {/* ── Ghost Loader (Pre-measures widest word across all fonts to prevent CLS) ── */}
      <span className="invisible h-0 block overflow-hidden select-none pointer-events-none" aria-hidden="true" style={{ fontSize: 'inherit' }}>
        {wordConfigs.map((w, i) => (
          <span
            key={i}
            className="block"
            style={{
              fontFamily: w.font,
              fontStyle: w.italic ? 'italic' : 'normal',
              fontWeight: w.weight,
              height: 0,
            }}
          >
            {w.text}
          </span>
        ))}
      </span>

      {/* ── Actual Typewriter ── */}
      <span
        className="text-glow inline-block transition-[font-family,font-weight,font-style] duration-500 ease-in-out"
        style={{
          fontFamily: config.font,
          fontStyle: config.italic ? 'italic' : 'normal',
          fontWeight: config.weight,
          whiteSpace: 'nowrap'
        }}
      >
        {currentText}
        {/* Blinking Cursor */}
        <span className="animate-pulse border-r-[3px] border-primary ml-0.5 inline-block h-[0.85em] align-middle" />
      </span>
    </span>
  );
});

const Hero = React.memo(({ active, onReady }) => {

  return (
    <div className="w-screen h-screen overflow-y-auto overflow-x-hidden bg-[#060608] flex-shrink-0 no-scrollbar scroll-smooth">

      {/* ── Hero First Fold (100vh) ── */}
      <div className="w-full h-screen flex items-center relative overflow-hidden bg-black flex-shrink-0">

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
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10" />
          {/* Bottom vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/40 to-transparent z-10" />
        </div>

        {/* ── Seamless Looping Video (right half) ── */}
        <div className="absolute top-0 right-0 w-full md:w-[55%] h-full z-10 pointer-events-none flex items-center justify-center overflow-hidden">
          <div
            className="relative"
            style={{
              width: 'min(75vw, 480px)',
              height: 'min(75vw, 480px)',
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
                active={active}
                onReady={() => {
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
              <TypewriterText />
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

        {/* Scroll down indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <span className="text-white/70 text-[10px] tracking-[0.3em] uppercase font-light">Discover</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary/80 to-transparent animate-pulse"></div>
        </div>

        {/* AI Asset Disclaimer */}
        <div className="absolute bottom-4 left-6 z-30 pointer-events-none opacity-40 hidden md:block">
          <p className="text-[9px] text-white/50 font-body uppercase tracking-[0.05em] leading-relaxed">
            Visual assets generated with AI to enhance user experience<br />while focusing on core development.
          </p>
        </div>
        <div className="absolute bottom-3 left-0 w-full text-center z-30 pointer-events-none opacity-40 md:hidden">
          <p className="text-[8px] text-white/50 font-body uppercase tracking-[0.05em] px-4 leading-relaxed">
            Visual assets generated with AI to enhance user experience<br />while focusing on core development.
          </p>
        </div>
      </div>

      {/* ── Aesthetic Gallery Section (Scrollable Area) ── */}
      <div className="w-full relative z-10 bg-gradient-to-b from-black to-[#060608] py-32 px-6">

        {/* Subdued grain overlay for gallery */}
        <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay grain-overlay" />

        <div className="container mx-auto max-w-6xl relative z-10">

          {/* Section Header */}
          <RevealOnScroll className="mb-32 flex flex-col items-center text-center">
            <p className="text-primary tracking-[0.3em] text-[10px] uppercase font-medium mb-4">Exhibition</p>
            <h2 className="text-4xl md:text-6xl font-display font-light text-white mb-6">
              Visual <span className="italic text-slate-300">Symphony</span>
            </h2>
            <p className="text-slate-400 max-w-xl font-light leading-relaxed text-sm md:text-base">
              A curated expression of digital esthetics. Where rigid logic gracefully transitions into boundless visual form.
            </p>
          </RevealOnScroll>

          {/* Gallery Rows */}
          <div className="space-y-32 md:space-y-48">

            {/* Gallery Item 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-center">
              <RevealOnScroll delay={100} className="md:col-span-5 space-y-6 order-2 md:order-1 pt-8 md:pt-0">
                <span className="text-white/40 tracking-[0.2em] text-[10px] uppercase font-medium line-through decoration-primary/50">01</span>
                <h3 className="text-3xl md:text-5xl font-display text-white">Monolithic Setup</h3>
                <div className="w-12 h-[1px] bg-primary/50 my-6"></div>
                <p className="text-slate-400 font-light leading-relaxed text-sm md:text-base pr-0 md:pr-12">
                  Exploring the boundaries between rigid geometry and fluid motion.
                  The synthesis of light and shadow defines the invisible weight of a minimalist digital workspace.
                </p>
              </RevealOnScroll>
              <RevealOnScroll delay={300} className="md:col-span-7 relative group order-1 md:order-2">
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#060608] ring-1 ring-white/10 rounded-sm relative">
                  <SpaceInvaders />
                </div>
                <div className="absolute -inset-4 border border-primary/20 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-1000 pointer-events-none rounded-sm"></div>
              </RevealOnScroll>
            </div>

            {/* Gallery Item 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-center">
              <RevealOnScroll delay={100} className="md:col-span-7 relative group">
                <div className="aspect-square md:aspect-[4/5] w-full overflow-hidden bg-white/5 ring-1 ring-white/10 rounded-sm">
                  <LazyVideo
                    src="/lukisan.mp4"
                    className="w-full h-full object-cover opacity-60 grayscale-[50%] group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-[1.5s] ease-[cubic-bezier(0.19,1,0.22,1)]"
                  />
                </div>
              </RevealOnScroll>
              <RevealOnScroll delay={300} className="md:col-span-5 space-y-6 md:pl-16 relative z-10 pt-8 md:pt-0">
                <span className="text-white/40 tracking-[0.2em] text-[10px] uppercase font-medium line-through decoration-primary/50">02</span>
                <h3 className="text-3xl md:text-5xl font-display text-white italic">Negative Space</h3>
                <div className="w-12 h-[1px] bg-primary/50 my-6"></div>
                <p className="text-slate-400 font-light leading-relaxed text-sm md:text-base">
                  Silence is as vital as the notes being played. By giving elements room to breathe, the true silhouette of the digital experience begins to emerge from the void.
                </p>
              </RevealOnScroll>
            </div>

            {/* Gallery Item 3 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-center">
              <RevealOnScroll delay={100} className="md:col-span-4 space-y-6 order-2 md:order-1 pt-8 md:pt-0">
                <span className="text-white/40 tracking-[0.2em] text-[10px] uppercase font-medium line-through decoration-primary/50">03</span>
                <h3 className="text-3xl md:text-5xl font-display text-white">Sleek Automata</h3>
                <div className="w-12 h-[1px] bg-primary/50 my-6"></div>
                <p className="text-slate-400 font-light leading-relaxed text-sm md:text-base">
                  Embracing the cold, calculated precision of interfaces. Translating raw brutalist concepts into elegant, functional digital surfaces that demand attention.
                </p>
              </RevealOnScroll>
              <RevealOnScroll delay={300} className="md:col-span-8 relative group order-1 md:order-2">
                <div className="aspect-[16/9] w-full overflow-hidden bg-white/5 ring-1 ring-white/10 rounded-sm">
                  <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=700&auto=format&fit=crop" alt="Retro Tech" className="w-full h-full object-cover opacity-60 grayscale-[50%] group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-[1.5s] ease-[cubic-bezier(0.19,1,0.22,1)]" loading="lazy" />
                </div>
                <div className="absolute -inset-4 border border-primary/20 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-1000 pointer-events-none rounded-sm"></div>
              </RevealOnScroll>
            </div>

          </div>

          {/* Footer of Gallery to provide spacing */}
          <RevealOnScroll delay={200} className="h-32 w-full flex items-center justify-center mt-32">
            <div className="w-[1px] h-32 bg-gradient-to-t from-primary/50 to-transparent"></div>
          </RevealOnScroll>

        </div>
      </div>

    </div>
  );
});

export default Hero;
