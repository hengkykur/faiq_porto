import React from 'react';

const Contact = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-screen h-screen flex items-center justify-center flex-shrink-0 relative overflow-hidden bg-black select-none">

      {/* Minimalist Background Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-block mb-6 px-4 py-1 border border-primary/30 rounded-full">
          <span className="text-primary font-mono text-[10px] tracking-[0.4em] uppercase">Ready for Deployment</span>
        </div>

        <h2 className="text-6xl md:text-9xl font-display font-bold text-white mb-12 italic tracking-tighter shadow-glow uppercase">
          Let's <span className="text-glow">Connect</span>
        </h2>

        <div className="flex flex-col items-center gap-12 mt-12">
          <a
            href="mailto:adimulyo2005@gmail.com"
            className="text-2xl md:text-5xl font-display font-bold text-slate-300 hover:text-white transition-all hover:scale-105 border-b-2 border-white/10 hover:border-primary pb-2"
          >
            ADIMULYO2005@GMAIL.COM
          </a>

          <div className="flex gap-12">
            {[
              { name: 'GitHub', url: 'https://github.com/hengkykur' },
              { name: 'LinkedIn', url: '#' },
              { name: 'Instagram', url: 'https://instagram.com/faiqadimulyo_04' },
              { name: 'Twitter', url: '#' }
            ].map(social => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs md:text-sm font-mono text-slate-500 hover:text-primary tracking-widest uppercase transition-colors"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-32 opacity-20 hover:opacity-50 transition-opacity cursor-default">
          <div className="font-display font-black text-2xl text-white italic tracking-tighter">Faiq_a.m — {currentYear}</div>
        </div>
      </div>

    </div>
  );
};

export default Contact;
