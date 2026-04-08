import React, { useState, useRef, useEffect } from 'react';
// import homeVideo from '../assets/home.mp4';
// import homeVideoCircle from '../assets/vidiohomebulet.mp4'; 

const ThreeDElement = ({ src, isVideo = false, className, floatDelay = "0s", size = "w-64 h-64", playbackRate = 1.0, ...props }) => {
  const [duration, setDuration] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [blur, setBlur] = useState(30);
  const [scale, setScale] = useState(0.8);
  const videoRef = useRef(null);
  const requestRef = useRef(null);

  const [videoLoaded, setVideoLoaded] = useState(false);

  const animate = () => {
    if (videoRef.current) {
      const vid = videoRef.current;
      const current = vid.currentTime;
      const dur = vid.duration;

      if (dur > 0) {
        const fadeTime = 1.5; // Seconds for fade-in/out
        let alpha = 1;
        let vBlur = 0;
        let vScale = 1;

        if (current < fadeTime) {
          // Fade In Phase
          const p = current / fadeTime;
          alpha = p * 0.4;
          vBlur = 30 * (1 - p);
          vScale = 0.8 + (0.2 * p);
        } else if (current > dur - fadeTime) {
          // Fade Out Phase
          const p = (dur - current) / fadeTime;
          alpha = p * 0.4;
          vBlur = 35 * (1 - p);
          vScale = 1 + (0.15 * (1 - p));
        } else {
          alpha = 0.6;
        }

        setOpacity(alpha);
        setBlur(vBlur);
        setScale(vScale);
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isVideo) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isVideo]);

  useEffect(() => {
    if (videoRef.current && isVideo) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, isVideo]);

  const handleLoadedMetadata = (e) => {
    if (isVideo && e.target.duration) {
      setDuration(e.target.duration);
    }
  };

  return (
    <div
      className={`relative ${size} transition-all duration-500 ease-out animate-float pointer-events-auto ${className}`}
      style={{
        perspective: '1500px',
        animationDelay: floatDelay,
      }}
    >
      <div className="relative w-full h-full transition-transform duration-300 ease-out pointer-events-none">
        {/* Layer 0: Very Subtle Glow */}
        <div className="absolute -inset-20 bg-primary/5 blur-[120px] opacity-20"
          style={{ transform: 'translateZ(-40px)', opacity: opacity * 0.2 }}></div>

        {/* Layer 2: Main Content */}
        <div className="absolute inset-0"
          style={{
            transform: `translateZ(50px) scale(${scale})`,
            opacity: opacity,
            filter: `blur(${blur}px)`
          }}>
          {isVideo ? (
            <div className="w-full h-full relative">
              {/* Cinematic Fallback Gradient - ONLY visible until data is buffered */}
              {!videoLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-indigo-500/10 to-transparent animate-pulse z-0 rounded-full"></div>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                muted={true}
                defaultMuted
                loop
                playsInline
                onLoadedMetadata={handleLoadedMetadata}
                onLoadedData={(e) => {
                   if (e.target.duration) setDuration(e.target.duration);
                   setVideoLoaded(true);
                   // Instant reveal once data is ready
                   setOpacity(0.6);
                   setBlur(0);
                   setScale(1);
                   if (src === "/vidiohomebulet.mp4" && props.onReady) props.onReady();
                }}
                preload="auto"
                className={`w-full h-full object-cover mix-blend-screen relative z-10 transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 75%)',
                  maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 75%)'
                }}
              >
                <source src={src} type="video/mp4" />
              </video>
            </div>
          ) : (
            <img
              src={src}
              alt="3D Tech Model"
              className="w-full h-full object-contain mix-blend-screen opacity-80 filter contrast-[1.5] brightness-[1.1]"
              style={{
                WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 95%)',
                maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 95%)'
              }}
              onLoad={() => {
                if (props.onReady) props.onReady();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Hero = ({ active, onReady }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeSpeed, setTypeSpeed] = useState(150);
  const [shouldLoadSecondary, setShouldLoadSecondary] = useState(false);
  const [bgVideoLoaded, setBgVideoLoaded] = useState(false);

  // Instant mount for secondary tech video to maximize speed
  useEffect(() => {
    if (active) {
      setShouldLoadSecondary(true);
    }
    
    // Fallback for preloader if no 3D video exists, 
    // though here we trigger it via 3D video load
  }, [active]);

  const words = ['Elegance', 'Precision', 'Innovation', 'Simplicity'];

  useEffect(() => {
    const handleTyping = () => {
      const fullWord = words[wordIndex];

      if (!isDeleting) {
        // Typing
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        setTypeSpeed(150);

        if (currentText === fullWord) {
          // Pause at end
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        setTypeSpeed(75);

        if (currentText === '') {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typeSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIndex, typeSpeed]);

  return (
    <div className="w-screen h-screen flex items-center relative overflow-hidden bg-black flex-shrink-0">
      {/* Cinematic Background Layer - Simplified after video removal */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-[#0a0a0c] z-10"
          style={{ 
            backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(129, 140, 248, 0.08) 0%, transparent 60%)',
          }}
        >
          {/* Shimmer Effect */}
          {!bgVideoLoaded && (
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute inset-0 bg-transparent animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]"></div>
            </div>
          )}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        </div>

        {/* Cinematic Aesthetic Layers: Noise & Scanlines */}
        <div className="absolute inset-0 pointer-events-none z-[5] opacity-30 mix-blend-overlay grain-overlay"></div>
        <div className="absolute inset-0 pointer-events-none z-[6] opacity-20 scanlines"></div>

        {/* High-Tech Vignette & Mesh Overlay - Strengthened */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent z-[7]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-[8]"></div>
        <div className="absolute inset-0 bg-radial-vignette opacity-40 z-[9]"></div>
      </div>

      {/* Background 3D Elements Container - Forced to Right Half */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full z-10 pointer-events-none overflow-visible flex items-center justify-center">
        {/* Replaced 3 images with 1 Circular Tech Video */}
        <div className="pointer-events-auto scale-125 md:scale-[1.8] translate-y-10 transition-opacity duration-1000" style={{ opacity: shouldLoadSecondary ? 1 : 0 }}>
          {shouldLoadSecondary && (
            <ThreeDElement
              src="/vidiohomebulet.mp4"
              isVideo={true}
              size="w-64 h-64 md:w-[350px] md:h-[350px]"
              tiltFactor={40}
              floatDelay="0s"
              playbackRate={1.0}
              onReady={() => {
                 setBgVideoLoaded(true);
                 if (onReady) onReady();
              }}
            />
          )}
        </div>
      </div>


      <div className="container mx-auto px-6 relative z-20 pointer-events-none pt-12">
        <div className="max-w-4xl text-left pointer-events-auto">
          <h2 className="text-primary font-semibold mb-4 tracking-widest uppercase text-sm animate-glitch-heavy inline-block">Welcome to my space</h2>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 text-white text-left italic">
            Building <span className="text-gradient hover:animate-glitch-heavy cursor-default inline-block pr-4">Digital</span> Experiences <br />
            with <span className="italic font-light text-glow min-w-[200px] inline-block">
              {currentText}<span className="animate-pulse border-r-4 border-primary ml-1">&nbsp;</span>
            </span>.
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed text-left font-light">
            I’m a Software Developer building seamless digital ecosystems.
            Bridging the gap between <span className="text-white font-medium">Web, Android, and AI</span> through high-performance, intelligent solutions.
          </p>
        </div>
      </div>

      {/* Background Decorative Gradient Overlay */}
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none z-10"></div>
    </div>
  );
};

export default Hero;
