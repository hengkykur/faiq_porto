import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import DotPagination from './components/DotPagination';

import Hero from './components/Hero';

// Dynamic imports for code-splitting (chunking) for non-immediate sections
const Projects = lazy(() => import('./components/Projects'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));

function App() {
  const [ready, setReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isHeroReady, setIsHeroReady] = useState(false);
  useEffect(() => {
    // Safety fallback: Reveal site after 6s as a last resort
    const fallbackTimer = setTimeout(() => {
      if (!ready) {
        setReady(true);
        document.body.classList.add('loaded');
      }
    }, 6000);

    // Only lift the preloader when Hero video confirms it can play through
    if (isHeroReady) {
      const timer = setTimeout(() => {
        setReady(true);
        document.body.classList.add('loaded');
      }, 800); // 800ms offset for ultra-smooth crossfade
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
      <DotPagination currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div 
        className="flex transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] h-full w-full"
        style={{ transform: `translateX(-${currentPage * 100}%)` }}
      >
        <Suspense fallback={null}>
          <Hero active={currentPage === 0} onReady={() => setIsHeroReady(true)} />
        </Suspense>
        <Suspense fallback={null}>
          <Projects active={currentPage === 1} />
        </Suspense>
        <Suspense fallback={null}>
          <About active={currentPage === 2} prewarm={currentPage === 1 || ready} />
        </Suspense>
        <Suspense fallback={null}>
          <Contact active={currentPage === 3} />
        </Suspense>
      </div>

      {/* Decorative Background Glow */}
      <div className="fixed -bottom-32 -left-32 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-1 pointer-events-none"></div>
    </div>
  );
}

export default App;
