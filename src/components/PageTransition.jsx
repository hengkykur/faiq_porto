import React, { useEffect, useState, useRef } from 'react';

const PageTransition = ({ currentPage }) => {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const prevPageRef = useRef(currentPage);
  const timerRef = useRef(null);

  useEffect(() => {
    if (prevPageRef.current === currentPage) return;
    prevPageRef.current = currentPage;

    clearTimeout(timerRef.current);
    setFadeOut(false);
    setVisible(true);

    timerRef.current = setTimeout(() => {
      setFadeOut(true);
      timerRef.current = setTimeout(() => setVisible(false), 500);
    }, 700);

    return () => clearTimeout(timerRef.current);
  }, [currentPage]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
      style={{
        backgroundColor: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(12px)',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <h1
        className="font-display font-black text-5xl md:text-7xl text-white italic tracking-tighter select-none"
        style={{
          textShadow: '0 0 60px rgba(129,140,248,0.6), 0 0 120px rgba(129,140,248,0.3)',
          animation: 'logoPulse 0.7s ease-out',
        }}
      >
        Faiq_a.m
      </h1>

      <style>{`
        @keyframes logoPulse {
          0%   { opacity: 0; transform: scale(0.9); }
          60%  { opacity: 1; transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default PageTransition;
