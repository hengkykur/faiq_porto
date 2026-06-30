import React, { useState } from 'react';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const [open, setOpen] = useState(false);
  const menuItems = ['Archive', 'Exhibitions', 'Studio', 'Contact'];

  const navigate = (index) => {
    setCurrentPage(index);
    setOpen(false);
  };

  return (
    <>
      {/* Persistent Header Bar */}
      <header className="fixed top-0 left-0 w-full z-[100] bg-black/60 backdrop-blur-md border-t-[3px] border-[#818cf8] border-b border-white/[0.05] px-6 md:px-12 h-20 flex items-center justify-between pointer-events-auto">
        {/* Left Logo */}
        <div 
          className="text-white text-base md:text-lg font-bold tracking-[0.25em] uppercase cursor-pointer transition-opacity hover:opacity-85"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          onClick={() => navigate(0)}
        >
          MONOLITH
        </div>

        {/* Middle Links (Visible on desktop/tablet) */}
        <nav className="hidden md:flex items-center gap-10 pr-12">
          {menuItems.map((item, index) => {
            const isActive = currentPage === index;
            return (
              <button
                key={item}
                onClick={() => navigate(index)}
                className={`text-[10px] font-mono uppercase tracking-[0.2em] transition-all duration-300 pb-1 cursor-pointer border-b-2 ${
                  isActive 
                    ? 'text-[#00f0ff] border-[#00f0ff] font-semibold' 
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                {item}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Hamburger button — positioned inside the header visually, persistent z-index */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed top-5 right-6 md:right-12 z-[200] w-10 h-10 flex flex-col items-center justify-center gap-[6px] group cursor-pointer"
        aria-label="Toggle menu"
      >
        <span
          className={`block h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${
            open ? 'w-6 rotate-45 translate-y-[8px]' : 'w-6'
          }`}
        />
        <span
          className={`block h-[2px] bg-white rounded-full transition-all duration-300 ${
            open ? 'w-0 opacity-0' : 'w-4 group-hover:w-6'
          }`}
        />
        <span
          className={`block h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${
            open ? 'w-6 -rotate-45 -translate-y-[8px]' : 'w-5 group-hover:w-6'
          }`}
        />
      </button>

      {/* Fullscreen overlay */}
      <div
        className={`fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-500 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Decorative noise */}
        <div className="absolute inset-0 opacity-[0.03] grain-overlay pointer-events-none" />

        <nav className="flex flex-col items-center gap-2 w-full max-w-sm px-8">
          {menuItems.map((item, index) => (
            <button
              key={item}
              onClick={() => navigate(index)}
              className="w-full group relative py-5 flex items-center gap-6 border-b border-white/[0.06] last:border-b-0 cursor-pointer"
            >
              <span className="text-[11px] font-mono text-white/20 group-hover:text-primary transition-colors duration-300 w-5">
                0{index + 1}
              </span>
              <span
                className={`text-3xl font-display font-bold uppercase tracking-tight transition-all duration-300 group-hover:translate-x-2 group-hover:text-primary ${
                  currentPage === index ? 'text-primary' : 'text-white/80'
                }`}
              >
                {item}
              </span>
              {currentPage === index && (
                <span className="ml-auto text-[9px] font-mono text-primary/60 uppercase tracking-widest">active</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer info inside menu */}
        <div className="absolute bottom-10 text-center">
          <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">Faiq_a.m © 2026</p>
        </div>
      </div>
    </>
  );
};

export default React.memo(Navbar);
