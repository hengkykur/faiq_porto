import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Contact from './components/Contact';
import DotPagination from './components/DotPagination';

function App() {
  const [ready, setReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    // Handling the preloader transition
    const timer = setTimeout(() => {
      setReady(true);
      document.body.classList.add('loaded');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`h-screen w-screen bg-black overflow-hidden relative ${ready ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
      {/* Fixed UI Elements */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <DotPagination currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Main Horizontal Slider Wrapper */}
      <div 
        className="flex transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] h-full w-full"
        style={{ transform: `translateX(-${currentPage * 100}%)` }}
      >
        <Hero active={currentPage === 0} />
        <Projects active={currentPage === 1} />
        <About active={currentPage === 2} />
        <Contact active={currentPage === 3} />
      </div>

      {/* Decorative Background Glow */}
      <div className="fixed -bottom-32 -left-32 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-1 pointer-events-none"></div>
    </div>
  );
}

export default App;
