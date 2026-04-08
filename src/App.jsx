import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import DotPagination from './components/DotPagination';

// Dynamic imports for code-splitting (chunking)
const Hero = lazy(() => import('./components/Hero'));
const Projects = lazy(() => import('./components/Projects'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));

function App() {
  const [ready, setReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isHeroReady, setIsHeroReady] = useState(false);
  useEffect(() => {
    // Add a safety fallback: Reveal site after 3.5s regardless of video state
    const fallbackTimer = setTimeout(() => {
      if (!ready) {
        setReady(true);
        document.body.classList.add('loaded');
      }
    }, 3500);

    // Only lift the preloader when Hero video is buffered
    if (isHeroReady) {
      const timer = setTimeout(() => {
        setReady(true);
        document.body.classList.add('loaded');
      }, 500);
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
