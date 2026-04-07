import React from 'react';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const menuItems = ['Home', 'Projects', 'About', 'Contact'];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 py-6">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="text-2xl font-bold font-display tracking-tighter text-white uppercase">
          Faiq<span className="text-primary italic">_a.m</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium">
          {menuItems.map((item, index) => (
            <button
              key={item}
              onClick={() => setCurrentPage(index)}
              className={`transition-all duration-300 ${currentPage === index ? 'text-primary scale-110' : 'text-slate-400 hover:text-white'}`}
            >
              {item}
            </button>
          ))}
        </div>
        <button className="px-5 py-2 glass rounded-full text-sm font-semibold hover:bg-white/10 transition-all border-white/20 text-white">

        </button>
      </div>
    </nav>
  );
};

export default Navbar;
