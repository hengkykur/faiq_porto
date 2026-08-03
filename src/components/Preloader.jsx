import React, { useState, useEffect } from 'react';

const GREETINGS = [
  "Halo",
  "Hello",
  "Bonjour",
  "Hola",
  "Ciao",
  "Hallo",
  "こんにちは",
  "안녕하세요",
  "你好",
  "مرحبا",
  "नमस्ते",
  "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ",
  "สวัสดี",
  "Olá"
];

const Preloader = ({ onComplete }) => {
  const [stage, setStage] = useState('loading'); // 'loading' | 'greetings' | 'exiting'
  const [progress, setProgress] = useState(0);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Lock body scroll while preloader is active
    document.body.style.overflow = 'hidden';

    // STAGE 1: Smooth Loading Bar (0% -> 100%)
    const startTime = Date.now();
    const loadingDuration = 1400; // 1.4s smooth loading progress

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / loadingDuration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(progressInterval);
        // Stage 1 Complete -> Transition to STAGE 2: Multilingual Greetings!
        setTimeout(() => {
          setStage('greetings');
        }, 180);
      }
    }, 20);

    return () => {
      clearInterval(progressInterval);
      document.body.style.overflow = '';
    };
  }, []);

  // STAGE 2: Cycle Multilingual Greetings AFTER Stage 1 finishes
  useEffect(() => {
    if (stage !== 'greetings') return;

    let timeoutId;
    let intervalId;

    // First greeting ("Halo") starts held a bit longer (450ms)
    timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setGreetingIndex((prev) => {
          if (prev < GREETINGS.length - 1) {
            return prev + 1;
          } else {
            clearInterval(intervalId);

            // All greetings finished -> STAGE 3: Curtain Slide-up Exit!
            setTimeout(() => {
              setStage('exiting');
              if (onComplete) onComplete();
            }, 200);

            // Remove from DOM after curtain reveal finishes
            setTimeout(() => {
              setIsHidden(true);
              document.body.style.overflow = '';
            }, 950);

            return prev;
          }
        });
      }, 120);
    }, 450); // Hold first greeting "Halo" for 450ms

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [stage, onComplete]);

  if (isHidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#050507] text-white flex flex-col items-center justify-center p-6 md:p-14 select-none pointer-events-auto transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        stage === 'exiting' ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* STAGE 1: LOADING BAR & PERCENTAGE (Played First) */}
      {stage === 'loading' && (
        <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="font-mono text-5xl sm:text-7xl font-bold tracking-tighter text-white">
            {progress}%
          </div>
          <div className="w-full h-[2px] bg-white/10 relative overflow-hidden rounded-full">
            <div
              className="h-full bg-white transition-all duration-75 ease-out rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
            LOADING PORTFOLIO
          </div>
        </div>
      )}

      {/* STAGE 2: MULTILINGUAL GREETINGS (Starts with "Halo" first, held longer) */}
      {stage === 'greetings' && (
        <div className="relative flex items-center justify-center min-h-[100px] animate-[fadeIn_0.2s_ease-out]">
          <h1
            key={greetingIndex}
            className="font-display font-light text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white italic text-center animate-[fadeInUp_0.12s_ease-out_forwards]"
            style={{ fontFamily: "'Cormorant Garamond', 'Outfit', sans-serif" }}
          >
            {GREETINGS[greetingIndex]}
          </h1>
        </div>
      )}
    </div>
  );
};

export default Preloader;
