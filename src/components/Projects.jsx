import React, { useState, useEffect } from 'react';

const Projects = ({ active }) => {
  const [bgVideoLoaded, setBgVideoLoaded] = useState(false);

  const projects = [
    { title: 'Nexus UI Kit', desc: 'Modern design system for React app.', tags: ['React', 'CSS'] },
    { title: 'Cyber Analytics', desc: 'Real-time monitoring dashboard.', tags: ['Vite', 'Edge'] },
    { title: 'Vanguard Eco', desc: 'High-performance storefront.', tags: ['Next.js', 'Stripe'] },
  ];

  return (
    <div className="w-screen h-screen flex items-center relative overflow-hidden bg-black flex-shrink-0">
      {/* Cinematic Background Video Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Instant Visual Placeholder: Cinematic Skeleton Shimmer */}
        <div 
          className={`absolute inset-0 bg-[#0a0a0c] transition-opacity duration-1000 z-10 ${bgVideoLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(129, 140, 248, 0.08) 0%, transparent 60%)',
          }}
        >
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
          onLoadedData={() => setBgVideoLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-1000 scale-105 brightness-75 ${bgVideoLoaded ? 'opacity-50 blur-0' : 'opacity-0 blur-xl'}`}
        >
          <source src="/home1.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Aesthetic Layers */}
        <div className="absolute inset-0 pointer-events-none z-[5] opacity-20 mix-blend-overlay grain-overlay"></div>
        <div className="absolute inset-0 pointer-events-none z-[6] opacity-10 scanlines"></div>

        {/* High-Tech Vignette & Mesh Overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/20 to-transparent z-[7]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-[8]"></div>
        <div className="absolute inset-0 bg-radial-vignette opacity-50 z-[9]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="mb-12 text-left">
          <h2 className="text-4xl font-display font-bold mb-4 text-white uppercase italic tracking-tighter">Selected <span className="text-primary text-glow">Works</span></h2>
          <p className="text-slate-400 font-light tracking-widest uppercase text-xs">A refined collection of digital items.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((p, i) => (
            <div key={i} className="group glass rounded-3xl p-8 hover:bg-slate-900/40 transition-all duration-500 border-white/5 hover:border-primary/30 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <div className="text-[10px] font-mono text-primary">PROJECT_ID: 00{i+1}</div>
              </div>
              <div className="h-40 bg-slate-800/20 rounded-2xl mb-6 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-colors">
                <span className="text-slate-600 font-display font-medium text-sm tracking-[0.3em] uppercase group-hover:text-primary/60 transition-colors">Visual Preview</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors text-white italic">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">{p.desc}</p>
              <div className="mt-6 flex gap-2">
                {p.tags.map(tag => (
                  <span key={tag} className="text-[9px] px-2 py-1 rounded bg-white/5 text-slate-500 border border-white/5 uppercase tracking-tighter">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
