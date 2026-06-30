import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import SpaceInvaders from './SpaceInvaders';
import NetworkSphere from './NetworkSphere';
import HeroBackground from './HeroBackground';
import InteractiveMonolith from './InteractiveMonolith';

/**
 * LazyVideo Component
 * Only loads and plays the video when scrolled into viewport via IntersectionObserver.
 */
const LazyVideo = ({ src, className, active = true }) => {
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
      { rootMargin: '0px' }  // Only load when actually in view
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pause/resume based on visibility AND active prop
  useEffect(() => {
    if (!shouldLoad) return;
    const vid = videoRef.current;
    if (!vid) return;
    if (!active) {
      vid.pause();
      return;
    }
    const el = containerRef.current;
    if (!el) return;
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
  }, [shouldLoad, active]);

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
          <source src={src.replace('.mp4', '.webm')} type="video/webm" />
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
    }, 500); // 500ms is enough — video end is detectable within half-second

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
        onCanPlay={handleCanPlay}
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
      className={`${className} group/reveal ${isVisible ? 'is-visible' : ''}`}
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

const TextAnimate = React.memo(({ text, italic, delay = 0 }) => {
  const characters = text.split('');
  return (
    <span className={`inline-block ${italic ? 'italic font-light' : 'font-normal'}`}>
      {characters.map((char, index) => {
        if (char === ' ') {
          return <span key={index}>&nbsp;</span>;
        }
        return (
          <span
            key={index}
            className="reveal-char"
            style={{
              transitionDelay: `${delay + index * 40}ms`,
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
});

const TypewriterText = React.memo(() => {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeSpeed, setTypeSpeed] = useState(150);

  const wordConfigs = React.useMemo(() => [
    {
      text: 'Sleek Code',
      segments: [
        { text: 'Sleek', italic: true },
        { text: ' Code', italic: false }
      ]
    },
    {
      text: 'Digital Art',
      segments: [
        { text: 'Digital', italic: true },
        { text: ' Art', italic: false }
      ]
    },
    {
      text: 'Architecture',
      segments: [
        { text: 'Architecture', italic: true }
      ]
    },
    {
      text: 'Simplicity',
      segments: [
        { text: 'Simplicity', italic: false }
      ]
    }
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
  let remainingChars = currentText.length;

  return (
    <span className="relative inline-block align-middle overflow-hidden pr-4 sm:pr-8" style={{ contain: 'layout paint' }}>
      {/* ── Ghost Loader (Pre-measures widest word to prevent CLS) ── */}
      <span className="invisible h-0 block overflow-hidden select-none pointer-events-none" aria-hidden="true" style={{ fontSize: 'inherit' }}>
        {wordConfigs.map((w, i) => (
          <span key={i} className="block" style={{ height: 0 }}>
            {w.segments.map((seg, sIdx) => (
              <span
                key={sIdx}
                className={seg.italic ? 'italic font-light' : 'font-normal'}
              >
                {seg.text}
              </span>
            ))}
          </span>
        ))}
      </span>

      {/* ── Actual Typewriter ── */}
      <span
        className="inline-block transition-all duration-500 ease-in-out text-[#00f0ff]"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          whiteSpace: 'nowrap',
          textShadow: '0 0 20px rgba(0, 240, 255, 0.6), 0 0 40px rgba(0, 240, 255, 0.3)'
        }}
      >
        {config.segments.map((seg, sIdx) => {
          if (remainingChars <= 0) return null;
          const segmentText = seg.text.substring(0, remainingChars);
          remainingChars -= seg.text.length;
          return (
            <span
              key={sIdx}
              className={seg.italic ? 'italic font-light' : 'font-normal'}
            >
              {segmentText}
            </span>
          );
        })}
        {/* Blinking Cursor */}
        <span className="animate-pulse border-r-[3px] border-[#00f0ff] ml-0.5 inline-block h-[0.85em] align-middle" />
      </span>
    </span>
  );
});

const Hero = React.memo(({ active, onReady, onNavigateNext }) => {
  const containerRef = useRef(null);
  const customCursorRef = useRef(null);
  const lastMousePos = useRef({ x: -100, y: -100 });
  const bannerRef = useRef(null);
  const portalWrapperRef = useRef(null);

  // ── Portal scroll state ──
  const [portalProgress, setPortalProgress] = useState(0);
  const portalCompleteRef = useRef(false);

  // Trigger onReady shortly after mount since there is no video to wait for anymore
  useEffect(() => {
    if (onReady) {
      const timer = setTimeout(() => onReady(), 500);
      return () => clearTimeout(timer);
    }
  }, [onReady]);

  useEffect(() => {
    const updateCursor = () => {
      if (customCursorRef.current && containerRef.current) {
        const x = lastMousePos.current.x;
        const y = lastMousePos.current.y + containerRef.current.scrollTop;
        customCursorRef.current.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
      }
    };

    const handleGlobalMouseMove = (e) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      updateCursor();
    };

    const scrollContainer = containerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateCursor, { passive: true });
    }
    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      if (scrollContainer) scrollContainer.removeEventListener('scroll', updateCursor);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  // ── Portal scroll logic (offset-based, no IntersectionObserver) ──
  useEffect(() => {
    const container = containerRef.current;
    const portalWrapper = portalWrapperRef.current;
    if (!container || !portalWrapper) return;

    const PORTAL_SCROLL_DISTANCE = 2500; // px of extra scroll to complete the portal

    const handleScroll = () => {
      if (portalCompleteRef.current) return;

      // How far the user has scrolled past the top of the portal wrapper
      const wrapperTop = portalWrapper.offsetTop;
      const scrolled = container.scrollTop - wrapperTop;

      if (scrolled < 0) {
        // Haven't reached the portal yet
        if (portalProgress !== 0) setPortalProgress(0);
        return;
      }

      // Progress: 0 at wrapperTop, 1 after PORTAL_SCROLL_DISTANCE more px
      const progress = Math.min(scrolled / PORTAL_SCROLL_DISTANCE, 1);
      setPortalProgress(progress);

      // When fully zoomed in, trigger navigation
      if (progress >= 1 && !portalCompleteRef.current) {
        portalCompleteRef.current = true;
        setTimeout(() => {
          if (onNavigateNext) onNavigateNext();
          // Reset after navigation
          setTimeout(() => {
            portalCompleteRef.current = false;
            setPortalProgress(0);
            // Scroll back to top for when user returns
            if (container) container.scrollTop = 0;
          }, 800);
        }, 600);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onNavigateNext, portalProgress]);

  const handleGlobalClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    // Don't jump-scroll if we're in the portal zone
    if (portalProgress > 0) return;
    if (containerRef.current) {
      containerRef.current.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleGlobalClick}
      className="w-screen h-screen relative overflow-y-auto overflow-x-hidden bg-[#060608] flex-shrink-0 no-scrollbar scroll-smooth cursor-none"
    >
      {/* Custom Scroll Cursor */}
      <div
        ref={customCursorRef}
        className="absolute top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center transition-transform duration-75 ease-out"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <div className="flex items-center justify-center text-white w-8 h-8 rounded-full border border-white/40 bg-white/30 shadow-[0_0_15px_rgba(255,255,255,0.4)]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* ── Hero First Fold (100vh) ── */}
      <div className="w-full h-screen flex items-center relative overflow-hidden bg-black flex-shrink-0">

        {/* ── Background ── */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Base dark gradient */}
          <div className="absolute inset-0 bg-[#060608]"
            style={{ backgroundImage: 'radial-gradient(ellipse at 75% 40%, rgba(99,102,241,0.12) 0%, transparent 65%)' }}
          />
          {/* WebGL Shader Background */}
          <HeroBackground />
          {/* Grain overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay grain-overlay" />
          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none opacity-10 scanlines" />
          {/* Left vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10" />
          {/* Bottom vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/40 to-transparent z-10" />
        </div>

        {/* ── 3D Network Sphere (right half) ── */}
        {/* pointer-events-auto here so drag/orbit works on the Canvas */}
        <div className="absolute top-0 right-0 w-full md:w-[55%] h-full z-10 pointer-events-none flex items-center justify-center overflow-hidden">
          <div
            style={{
              position: 'relative',
              width: 'min(80vw, 520px)',
              height: 'min(80vw, 520px)',
              flexShrink: 0,
              pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mask wrapper — Canvas fills this div absolutely */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                WebkitMaskImage: 'radial-gradient(circle at center, black 48%, transparent 76%)',
                maskImage: 'radial-gradient(circle at center, black 48%, transparent 76%)',
                overflow: 'hidden',
              }}
            >
              <Suspense fallback={null}>
                <NetworkSphere />
              </Suspense>
            </div>
            {/* Very subtle glow ring behind sphere */}
            <div className="absolute inset-0 rounded-full bg-primary/8 blur-2xl -z-10 pointer-events-none" />
          </div>
        </div>

        {/* ── Hero Text ── */}
        <div className="container mx-auto px-6 relative z-20 pointer-events-none">
          <div className="max-w-2xl text-left pointer-events-auto">

            <p className="text-primary font-semibold mb-4 tracking-[0.25em] uppercase text-[10px] animate-glitch-heavy inline-block">
              Creative Technical Craft
            </p>

            <h1
              className="text-3xl sm:text-4xl md:text-[4.5rem] leading-[1.15] mb-5 text-white tracking-tight font-normal"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Engineering
              <br />
              <span className="italic font-light">Sleek</span> Digital
              <br />
              <TypewriterText />
            </h1>

            <p className="text-[13px] md:text-[14px] text-slate-400 max-w-xl mb-8 leading-relaxed font-light font-body">
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
            <p className="text-[#00f0ff] tracking-[0.3em] text-[10px] md:text-[11px] uppercase font-medium font-mono mb-4">
              Exhibition
            </p>
            <h2
              className="text-4xl md:text-6xl text-white mb-6 font-normal tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              <TextAnimate text="Visual" delay={100} />{' '}
              <TextAnimate text="Symphony" italic delay={350} />
            </h2>
            <p className="text-slate-400 max-w-xl font-light leading-relaxed text-[13px] md:text-[14px] font-body">
              A curated expression of digital esthetics. Where rigid logic gracefully transitions into
              <br className="hidden sm:inline" /> boundless visual form.
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
                  <SpaceInvaders active={active} />
                </div>
                <div className="absolute -inset-4 border border-primary/20 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-1000 pointer-events-none rounded-sm"></div>
              </RevealOnScroll>
            </div>

            {/* Gallery Item 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-center">
              <RevealOnScroll delay={100} className="md:col-span-7 relative group">
                <div className="aspect-square md:aspect-[4/5] w-full overflow-hidden bg-white/5 ring-1 ring-white/10 rounded-sm">
                  <LazyVideo
                    src="https://a7i5ct7oqefyp3zm.public.blob.vercel-storage.com/lukisan.mp4"
                    active={active}
                    className="w-full h-full object-cover opacity-60 grayscale-[50%] group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-[1.03] transition-[opacity,filter,transform] duration-[1.5s] ease-[cubic-bezier(0.19,1,0.22,1)]"
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

          </div>

        </div> {/* Close max-w-6xl early */}

        {/* ── Portal Wrapper (provides scroll room for the sticky banner) ── */}
        <div ref={portalWrapperRef} className="relative mt-80 md:mt-[24rem]" style={{ height: 'calc(100vh + 2500px)' }}>
          {/* The banner is sticky: it fills the screen and stays pinned while user scrolls through the spacer */}
          <div
            ref={bannerRef}
            className="sticky top-0 w-full bg-[#0c0c0e] border-t border-b border-white/[0.05] h-screen relative overflow-hidden flex items-center justify-center pointer-events-auto"
          >
            {/* Faded Watermark Text */}
            <span
              className="text-[#4c4c54] text-6xl sm:text-8xl md:text-[9.5rem] font-bold tracking-[0.25em] uppercase font-display select-none pointer-events-none z-0"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                opacity: Math.max(1 - portalProgress * 0.7, 0),
              }}
            >
              MANTAP
            </span>
            {/* Interactive 3D Monolith Object */}
            <Suspense fallback={null}>
              <InteractiveMonolith scrollProgress={portalProgress} />
            </Suspense>

            {/* Vignette overlay — darkens edges as portal progresses */}
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, transparent ${60 - portalProgress * 55}%, black ${100 - portalProgress * 30}%)`,
                opacity: portalProgress,
                transition: 'opacity 0.15s ease-out',
              }}
            />

            {/* Full blackout overlay — appears at end of portal */}
            <div
              className="absolute inset-0 z-30 pointer-events-none bg-black"
              style={{
                opacity: portalProgress > 0.8 ? (portalProgress - 0.8) * 5 : 0,
                transition: 'opacity 0.3s ease-out',
              }}
            />

            {/* Scroll hint at bottom of banner */}
            {portalProgress < 0.1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-pulse">
                <span className="text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase">Scroll to enter</span>
                <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer Section (Full Width Background, Centered Content) ── */}
        <div className="w-full bg-black py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <footer className="w-full space-y-12">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                {/* Left Side Logo */}
                <div className="text-left">
                  <h3
                    className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white uppercase"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    MONOLITH
                  </h3>
                  <p className="text-[9px] tracking-[0.2em] font-mono text-slate-500 mt-2 text-left">
                    ARCHITECTURAL SOLUTIONS FOR THE DIGITAL FRONTIER.
                  </p>
                </div>

                {/* Right Side Links */}
                <div className="flex flex-wrap gap-x-8 gap-y-2 md:pt-2">
                  {['Legal', 'Privacy', 'Press', 'Intelligence'].map((link) => (
                    <a
                      key={link}
                      href={`#${link.toLowerCase()}`}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>

              {/* Bottom Copyright and Icons */}
              <div className="border-t border-white/[0.03] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[9px] font-mono tracking-wider text-slate-600">
                  © 2026 MONOLITH ARCHITECTURAL SOLUTIONS. ALL RIGHTS RESERVED.
                </span>

                {/* Footer Icons */}
                <div className="flex items-center gap-5 text-slate-500">
                  {/* Share Icon */}
                  <button className="hover:text-white transition-colors cursor-pointer" aria-label="Share">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
                    </svg>
                  </button>

                  {/* Terminal / Code Icon */}
                  <button className="hover:text-white transition-colors cursor-pointer" aria-label="Console">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <polyline points="9 17 14 12 9 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

    </div>
  );
});

export default Hero;
