import React, { useState, useRef, useEffect } from 'react';
// import homeVideo from '../assets/home.mp4';
// import homeVideoCircle from '../assets/vidiohomebulet.mp4'; 

const ThreeDElement = ({ src, isVideo = false, className, floatDelay = "0s", size = "w-64 h-64", playbackRate = 1.0, ...props }) => {
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

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
        {/* Layer 0: Very Subtle Glow - Pure CSS */}
        <div className="absolute -inset-20 bg-primary/5 blur-[120px] opacity-20"
          style={{ transform: 'translate3d(0, 0, -40px)', opacity: videoLoaded ? 0.2 : 0 }}></div>

        {/* Layer 2: Main Content - Hardware Accelerated + Loop Masking */}
        <div className="absolute inset-0 transition-opacity duration-1000 ease-out"
          style={{
            transform: `translate3d(0, 0, 50px) scale(${videoLoaded ? 1 : 0.9})`,
            opacity: videoLoaded ? 0.6 : 0,
            animation: videoLoaded && duration > 0 ? `loop-mask ${duration}s linear infinite` : 'none',
            willChange: 'transform, opacity, filter'
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
                onCanPlayThrough={(e) => {
                   if (e.target.duration) setDuration(e.target.duration);
                   setVideoLoaded(true);
                   // Ensure video starts playing immediately
                   e.target.play().catch(err => console.log("Autoplay blocked:", err));
                   if (src === "/vidiohomebulet.mp4" && props.onReady) props.onReady();
                }}
                preload="auto"
                className={`w-full h-full object-cover mix-blend-screen relative z-10 transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 75%)',
                  maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 75%)',
                  willChange: 'opacity'
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
                setVideoLoaded(true); // Reuse state for image
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

  const wordConfigs = [
    { text: 'Digital Art', font: "'Cormorant Garamond', serif", italic: true },
    { text: 'Sleek Code', font: "'Space Grotesk', sans-serif", italic: false },
    { text: 'Architecture', font: "'Outfit', sans-serif", italic: true },
    { text: 'Simplicity', font: "'Plus Jakarta Sans', sans-serif", italic: false }
  ];

  useEffect(() => {
    const handleTyping = () => {
      const currentConfig = wordConfigs[wordIndex];
      const fullWord = currentConfig.text;

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
          setWordIndex((prev) => (prev + 1) % wordConfigs.length);
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
          <h2 className="text-primary font-semibold mb-3 tracking-[0.2em] uppercase text-[10px] animate-glitch-heavy inline-block">Creative Technical Craft</h2>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-4 text-white text-left italic tracking-tight">
            Engineering <span className="text-gradient hover:animate-glitch-heavy cursor-default inline-block pr-4">Sleek</span> Digital <br />
            <span 
              className="text-glow min-w-[150px] inline-block transition-all duration-300"
              style={{ 
                fontFamily: wordConfigs[wordIndex].font,
                fontStyle: wordConfigs[wordIndex].italic ? 'italic' : 'normal',
                fontWeight: wordConfigs[wordIndex].font.includes('Cormorant') ? 300 : 400
              }}
            >
              {currentText}<span className="animate-pulse border-r-4 border-primary ml-1">&nbsp;</span>
            </span>.
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-lg mb-8 leading-relaxed text-left font-light font-body">
            I craft high-performance code and intelligent digital architecture.
            Connecting <span className="text-white font-medium border-b border-primary/30">Web, Mobile, and Intelligence</span> through creative technical craft.
          </p>
        </div>
      </div>

      {/* Background Decorative Gradient Overlay */}
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none z-10"></div>
    </div>
  );
};

export default Hero;
