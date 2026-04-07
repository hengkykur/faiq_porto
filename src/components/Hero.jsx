import React, { useState, useRef, useEffect } from 'react';
// import homeVideo from '../assets/home.mp4';
// import homeVideoCircle from '../assets/vidiohomebulet.mp4'; 

const ThreeDElement = ({ src, isVideo = false, className, floatDelay = "0s", size = "w-64 h-64", playbackRate = 1.0 }) => {
  const [duration, setDuration] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [blur, setBlur] = useState(30);
  const [scale, setScale] = useState(0.8);
  const videoRef = useRef(null);
  const requestRef = useRef(null);

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
            <div className="w-full h-full rounded-full overflow-hidden">
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
                }}
                preload="auto"
                className="w-full h-full object-cover mix-blend-screen"
                style={{
                  WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 70%)',
                  maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 70%)'
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

  // De-prioritize secondary tech video (reduced delay for faster feel)
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => setShouldLoadSecondary(true), 300);
      return () => clearTimeout(timer);
    }
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
      {/* Cinematic Background Video Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Instant Visual Placeholder: Cinematic Skeleton Shimmer */}
        <div 
          className={`absolute inset-0 bg-[#0a0a0c] transition-opacity duration-1000 z-10 ${bgVideoLoaded ? 'opacity-0' : 'opacity-100'}`}
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

        <video
          autoPlay
          muted={true}
          defaultMuted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => {
            setBgVideoLoaded(true);
            if (onReady) onReady();
          }}
          className={`w-full h-full object-cover transition-all duration-1000 scale-105 brightness-90 ${bgVideoLoaded ? 'opacity-65 blur-0' : 'opacity-0 blur-xl'}`}
        >
          <source src="/home1.mp4" type="video/mp4" />
        </video>
        {/* High-Tech Vignette & Mesh Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15 mix-blend-overlay"></div>
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
            />
          )}
        </div>
      </div>


      <div className="container mx-auto px-6 relative z-20 pointer-events-none pt-12">
        <div className="max-w-4xl text-left pointer-events-auto">
          <h2 className="text-primary font-semibold mb-4 tracking-widest uppercase text-sm animate-glitch-heavy inline-block">Welcome to my space</h2>
          <h1 className="text-6xl md:text-8xl font-display font-bold leading-tight mb-6 text-white text-left italic">
            Building <span className="text-gradient hover:animate-glitch-heavy cursor-default inline-block pr-4">Digital</span> Experiences <br />
            with <span className="italic font-light text-glow min-w-[200px] inline-block">
              {currentText}<span className="animate-pulse border-r-4 border-primary ml-1">&nbsp;</span>
            </span>.
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed text-left font-light">
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
