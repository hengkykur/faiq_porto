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
  const [loadStage, setLoadStage] = useState(0); // 0=Wait Hero, 1=Hero Ready/Projects, 2=About, 3=Contact
  const [aboutScrollProgress, setAboutScrollProgress] = useState(0);

  // Fallback timer: NEVER lock the screen forever
  useEffect(() => {
    if (loadStage === 0) {
      const fallbackTimer = setTimeout(() => {
        setLoadStage(prev => (prev === 0 ? 1 : prev));
      }, 7000); // Wait up to 7s max for Hero assets
      return () => clearTimeout(fallbackTimer);
    }
  }, [loadStage]);

  // Waterfall logic
  useEffect(() => {
    if (loadStage === 1) {
      // Hero is ready: Lift preloader
      setReady(true);
      document.body.classList.add('loaded');

      // Schedule the next assets sequentially to prevent network clogging
      const t1 = setTimeout(() => setLoadStage(2), 2000); // 2s after preloader lifts, download About assets
      const t2 = setTimeout(() => setLoadStage(3), 4000); // 4s after preloader lifts, download Contact assets

      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [loadStage]);

  return (
    <div className={`h-screen w-screen bg-black overflow-hidden relative ${ready ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
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
        <Hero active={currentPage === 0} onReady={() => setLoadStage(prev => prev === 0 ? 1 : prev)} />
        <Suspense fallback={null}>
          <Projects active={currentPage === 1} assetsAllowed={loadStage >= 1} />
        </Suspense>
        <Suspense fallback={null}>
          <About active={currentPage === 2} assetsAllowed={loadStage >= 2} onScrollProgress={setAboutScrollProgress} />
        </Suspense>
        <Suspense fallback={null}>
          <Contact active={currentPage === 3} assetsAllowed={loadStage >= 3} />
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
