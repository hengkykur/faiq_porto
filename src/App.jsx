import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

// Dynamic imports for code-splitting (chunking) for non-immediate sections
const Projects = lazy(() => import('./components/Projects'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));

function App() {
  const [ready, setReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [aboutScrollProgress, setAboutScrollProgress] = useState(0);
  useEffect(() => {
    // Safety fallback: Reveal site after 3s as a last resort
    const fallbackTimer = setTimeout(() => {
      if (!ready) {
        setReady(true);
        document.body.classList.add('loaded');
      }
    }, 3000);

    // Lift preloader as soon as Hero video has first frames
    if (isHeroReady) {
      const timer = setTimeout(() => {
        setReady(true);
        document.body.classList.add('loaded');
      }, 200); // Minimal crossfade delay
      return () => {
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
      };
    }

    return () => clearTimeout(fallbackTimer);
  }, [isHeroReady, ready]);

  return (
    <div className={`h-screen w-screen bg-black overflow-hidden relative ${ready ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
      {/* Fixed UI Elements */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* About Scroll Progress Bar — rendered at viewport level to escape translate3d */}
      <div
        className="fixed top-0 left-0 w-full z-[300] pointer-events-none"
        style={{ opacity: currentPage === 2 ? 1 : 0, transition: 'opacity 500ms', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        <div
          style={{
            height: '100%',
            width: '100%',
            transformOrigin: 'left',
            transform: `scaleX(${aboutScrollProgress})`,
            transition: 'transform 200ms linear',
            backgroundColor: 'oklch(65% 0.25 260)',
            boxShadow: '0 0 15px oklch(65% 0.25 260 / 0.8)',
            willChange: 'transform',
          }}
        />
      </div>

      <div
        className="flex h-full w-full"
        style={{
          transform: `translate3d(-${currentPage * 100}%, 0, 0)`,
          transition: 'transform 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
          willChange: 'transform',
        }}
      >
        <Hero active={currentPage === 0} onReady={() => setIsHeroReady(true)} />
        <Suspense fallback={null}>
          <Projects active={currentPage === 1} />
        </Suspense>
        <Suspense fallback={null}>
          <About active={currentPage === 2} prewarm={currentPage === 1} onScrollProgress={setAboutScrollProgress} />
        </Suspense>
        <Suspense fallback={null}>
          <Contact active={currentPage === 3} />
        </Suspense>
      </div>

      <Analytics />
      <SpeedInsights />

      {/* Decorative Background Glow */}
      <div className="fixed -bottom-32 -left-32 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-1 pointer-events-none"></div>
    </div>
  );
}

export default App;
