import React from 'react';

const Projects = ({ active }) => {
  const projects = [
    { title: 'Nexus UI Kit', desc: 'Modern design system for React app.', tags: ['React', 'CSS'] },
    { title: 'Cyber Analytics', desc: 'Real-time monitoring dashboard.', tags: ['Vite', 'Edge'] },
    { title: 'Vanguard Eco', desc: 'High-performance storefront.', tags: ['Next.js', 'Stripe'] },
  ];

  return (
    <div className="w-screen h-screen flex items-center bg-black/50 flex-shrink-0">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-left">
          <h2 className="text-4xl font-display font-bold mb-4 text-white">Selected <span className="text-primary italic">Works</span></h2>
          <p className="text-slate-400">A refined collection of digital items.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((p, i) => (
            <div key={i} className="group glass rounded-3xl p-8 hover:bg-slate-900/40 transition-all border-white/5 hover:border-primary/30 text-left">
              <div className="h-40 bg-slate-800/50 rounded-2xl mb-6 flex items-center justify-center">
                <span className="text-slate-600 font-display font-medium text-sm tracking-widest uppercase">Visual</span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors text-white">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
