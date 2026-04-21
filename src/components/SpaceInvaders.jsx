import React, { useRef, useEffect, useState } from 'react';

const PLAYER_SPRITE = [
  "     #     ",
  "    ###    ",
  "    ###    ",
  "   #####   ",
  "  #######  ",
  " ######### ",
  "## ##### ##",
  "##  ###  ##"
];

const ALIEN_SPRITE_A1 = [
  "  #     #  ",
  "   #   #   ",
  "  #######  ",
  " ## ### ## ",
  "###########",
  "# ####### #",
  "# #     # #",
  "   ## ##   "
];

const ALIEN_SPRITE_A2 = [
  "  #     #  ",
  "#  #   #  #",
  "# ####### #",
  "### ### ###",
  "###########",
  "  #######  ",
  "   #   #   ",
  "  #     #  "
];

const ALIEN_SPRITE_B1 = [
  "   ####   ",
  " ######## ",
  "### ## ###",
  "##########",
  "  # ## #  ",
  " #      # ",
  "##      ##"
];

const ALIEN_SPRITE_B2 = [
  "   ####   ",
  " ######## ",
  "### ## ###",
  "##########",
  "    ##    ",
  "  ##  ##  ",
  "   #  #   "
];

const SpaceInvaders = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isHoveredRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  const reqRef = useRef();
  const mouseX = useRef(null);
  const isVisibleRef = useRef(false);
  const lastFrameTimeRef = useRef(0);
  // Use a separate state ONLY for UI visibility (does not affect game loop)
  const [isHoveredUI, setIsHoveredUI] = useState(false);
  const FPS_CAP = 60;
  const FRAME_INTERVAL = 1000 / FPS_CAP;

  // Trigger loading when component becomes visible on screen + track visibility
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting && !hasStartedLoading) {
         setHasStartedLoading(true);
      }
    }, { threshold: 0.1 });
    
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [hasStartedLoading]);

  // Handle the loading percentage increment
  useEffect(() => {
    if (!hasStartedLoading) return;
    
    let interval = setInterval(() => {
      setLoadingProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 800); // Hold at 100% for drama
          return 100;
        }
        return p + Math.floor(Math.random() * 30 + 5); // Faster random jump
      });
    }, 80); // Faster interval (was 120)
    
    return () => clearInterval(interval);
  }, [hasStartedLoading]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isLoading) return; // Only run engine if not loading
    const ctx = canvas.getContext('2d');
    
    let w = canvas.width;
    let h = canvas.height;
    let frame = 0;
    
    const scale = 2; // Pixel art multiplier
    let player = { x: w/2 - 11, y: h - 45, speed: 6, deadTime: 0, showGameOver: false, aiDir: 0, aiCooldown: 0 }; 
    let bullets = [];
    let enemyBullets = [];
    let enemies = [];
    let particles = [];
    let stars = [];

    // Init pixel stars
    for(let i=0; i<40; i++) {
        stars.push({
            x: Math.floor(Math.random() * w),
            y: Math.floor(Math.random() * h),
            speed: 0.3 + Math.random() * 1.5
        });
    }

    const drawSprite = (ctx, map, x, y, size, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      for(let r=0; r<map.length; r++) {
        for(let c=0; c<map[r].length; c++) {
          if (map[r][c] !== ' ') {
            ctx.rect(Math.floor(x + c * size), Math.floor(y + r * size), size, size);
          }
        }
      }
      ctx.fill();
    };

    const createExplosion = (x, y, color) => {
      for(let i=0; i<15; i++) {
        particles.push({
          x: x + 10, y: y + 10,
          vx: Math.floor((Math.random() - 0.5) * 8),
          vy: Math.floor((Math.random() - 0.5) * 8),
          life: 15 + Math.random() * 5,
          color: color
        });
      }
    };

    const update = (timestamp) => {
      // FPS cap: skip frame if not enough time has elapsed
      if (timestamp - lastFrameTimeRef.current < FRAME_INTERVAL) {
        reqRef.current = requestAnimationFrame(update);
        return;
      }
      lastFrameTimeRef.current = timestamp;

      // Pause game loop when not visible to save CPU
      if (!isVisibleRef.current) {
        reqRef.current = requestAnimationFrame(update);
        return;
      }

      frame++;
      
      if (player.deadTime > 0) {
        player.deadTime--;
        // Lock player in center while dead for respawn
        if (player.deadTime === 179) player.x = -100; // Hide completely
        if (player.deadTime === 60) {
           player.x = w/2 - 11; // Move to center for respawn
           player.showGameOver = false;
        }
      } else {
        // Auto Fire (Faster)
        if (frame % 30 === 0) {
          bullets.push({ x: player.x + 10, y: player.y - 8, w: 2, h: 8, speed: -7 });
        }
        
        // Infinite Retro Spawner (Faster)
        if (frame % 60 === 0) {
          let isTypeA = Math.random() > 0.5;
          enemies.push({
            x: Math.random() * (w - 30) + 10,
            y: -20, 
            w: isTypeA ? 22 : 20,
            h: 16,
            type: isTypeA ? 'A' : 'B',
            vx: Math.floor((Math.random() - 0.5) * 4), 
            vy: 0.8 + Math.random() * 1.2,
            offsetFrame: Math.floor(Math.random() * 10)
          });
        }
        
        if (isHoveredRef.current && mouseX.current !== null) {
          // Manual Control: Snap to integer coordinates to avoid sub-pixel jitter
          let targetX = mouseX.current - 11;
          let dist = targetX - player.x;
          if (Math.abs(dist) <= 2) {
            player.x = Math.round(targetX);
          } else {
            let moveAmount = dist * 0.4;
            if (Math.abs(moveAmount) > player.speed) moveAmount = Math.sign(dist) * player.speed;
            player.x += Math.round(moveAmount);
          }
        } else {
          // AI Auto-pilot with direction commitment to prevent jitter
          player.aiCooldown = Math.max(0, player.aiCooldown - 1);

          let dangers = [...enemyBullets, ...enemies].filter(obj => {
             let ow = obj.w || scale;
             return obj.y < player.y + 16 && obj.y > player.y - 150 && 
                    obj.x + ow > player.x - 20 && obj.x < player.x + 42;
          });
          
          if (dangers.length > 0) {
             // DODGE: recalculate direction immediately if in danger
             let danger = dangers.reduce((closest, curr) => (curr.y > closest.y ? curr : closest), dangers[0]);
             let dCenter = danger.x + (danger.w || scale)/2;
             let pCenter = player.x + 11;
             
             // Only change direction if cooldown allows
             if (player.aiCooldown === 0) {
               player.aiDir = dCenter < pCenter ? 1 : -1; // move AWAY from danger
               player.aiCooldown = 8; // commit for 8 frames
             }
             
             let dodgeSpeed = Math.round(player.speed * 0.7);
             player.x += player.aiDir * dodgeSpeed;
             
          } else if (enemies.length > 0) {
             // ATTACK: track the lowest enemy, only change direction if not committed
             let target = enemies.reduce((lowest, curr) => (curr.y > lowest.y ? curr : lowest), enemies[0]);
             let tCenter = target.x + target.w/2;
             let pCenter = player.x + 11;
             let dist = tCenter - pCenter;
             
             // Only update direction if cooldown expired and enemy is far enough
             if (player.aiCooldown === 0 && Math.abs(dist) > 12) {
               player.aiDir = Math.sign(dist);
               player.aiCooldown = 12; // commit for 12 frames
             } else if (Math.abs(dist) <= 8) {
               player.aiDir = 0; // stop if close enough
               player.aiCooldown = 0;
             }
             
             if (player.aiDir !== 0) {
               let attackSpeed = Math.max(1, Math.round(player.speed * 0.4));
               player.x += player.aiDir * attackSpeed;
             }
          } else {
             // No enemies: idle, reset
             player.aiDir = 0;
             player.aiCooldown = 0;
          }
        }
        
        // Ensure player.x is always an integer to prevent rendering artifacts
        player.x = Math.round(player.x);

        // Restrict player 
        if (player.x < 0) player.x = 0;
        if (player.x > w - 22) player.x = w - 22;
      }

      // Update bullets
      bullets.forEach(b => b.y += b.speed);
      bullets = bullets.filter(b => b.y > -20);
      
      enemyBullets.forEach(b => b.y += b.speed);
      enemyBullets = enemyBullets.filter(b => b.y < h + 20);

      // Enemy logic
      enemies.forEach(e => {
        // Jerky retro vertical falling and sliding
        e.y += e.vy;
        e.x += e.vx;
        
        // Bounce off walls
        if (e.x < 5 || e.x > w - e.w - 5) e.vx *= -1;
        
        // Shoot
        if (Math.random() < 0.005) {
            enemyBullets.push({ x: e.x + e.w/2, y: e.y + e.h, w: 2, h: 8, speed: 4 });
        }
      });
      
      enemies = enemies.filter(e => e.y < h + 30);

      // Collisions: Player Bullets against Enemies
      bullets.forEach(b => {
        enemies.forEach((e, i) => {
          if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
            createExplosion(e.x, e.y, e.type === 'A' ? '#10b981' : '#f59e0b');
            enemies.splice(i, 1);
            b.y = -100; 
          }
        });
      });
      
      // Collisions: Enemy Bullets against Player
      enemyBullets.forEach((b) => {
         if (player.deadTime === 0 && b.x < player.x + 22 && b.x + b.w > player.x && b.y < player.y + 16 && b.y + b.h > player.y) {
            b.y = h + 100;
            if (isHoveredRef.current) {
               createExplosion(player.x, player.y, '#ef4444');
               player.deadTime = 180; // Die for 3 seconds
               player.showGameOver = true;
            } else {
               // AI safety net so it "never loses" if RNG physics trap it
               createExplosion(b.x, b.y, '#3b82f6'); 
            }
         }
      });
      
      // Collisions: Enemies crashing into Player
      enemies.forEach((e, i) => {
         if (player.deadTime === 0 && e.x < player.x + 22 && e.x + e.w > player.x && e.y < player.y + 16 && e.y + e.h > player.y) {
            createExplosion(e.x, e.y, e.type === 'A' ? '#10b981' : '#f59e0b');
            enemies.splice(i, 1);
            if (isHoveredRef.current) {
               createExplosion(player.x, player.y, '#ef4444');
               player.deadTime = 180; // Die for 3 seconds
               player.showGameOver = true;
            }
         }
      });

      // Update Particles (blocky movement)
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
      });
      particles = particles.filter(p => p.life > 0);

      // Stars
      stars.forEach(s => {
          s.y += s.speed;
          if (s.y > h) { s.y = 0; s.x = Math.floor(Math.random() * w); }
      });

      draw();
      reqRef.current = requestAnimationFrame(update);
    };

    const draw = () => {
      // Classic pure black void
      ctx.fillStyle = '#010101';
      ctx.fillRect(0, 0, w, h);

      // Retro chunky stars
      ctx.fillStyle = '#a1a1aa';
      stars.forEach(s => {
          ctx.fillRect(Math.floor(s.x/scale)*scale, Math.floor(s.y/scale)*scale, scale, scale);
      });

      // Draw Enemies
      enemies.forEach((e) => {
        // Animation toggle based on frame rate
        let isAnimState2 = (frame + e.offsetFrame) % 30 < 15;
        let map;
        let color;
        if (e.type === 'A') {
            map = isAnimState2 ? ALIEN_SPRITE_A2 : ALIEN_SPRITE_A1;
            color = '#10b981'; // Cyber green
        } else {
            map = isAnimState2 ? ALIEN_SPRITE_B2 : ALIEN_SPRITE_B1;
            color = '#f59e0b'; // Amber yellow
        }
        drawSprite(ctx, map, e.x, Math.floor(e.y), scale, color);
      });

      // Draw Player Ship 
      if (player.deadTime === 0) {
         drawSprite(ctx, PLAYER_SPRITE, player.x, player.y, scale, '#3b82f6');
      } else if (player.deadTime < 60) {
         // Respawn blinking effect
         if (Math.floor(frame / 6) % 2 === 0) {
            drawSprite(ctx, PLAYER_SPRITE, player.x, player.y, scale, 'rgba(59, 130, 246, 0.5)');
         }
      }
      
      // Draw Game Over Text
      if (player.showGameOver) {
         ctx.fillStyle = '#ef4444';
         ctx.font = '20px "Press Start 2P", monospace';
         ctx.textAlign = 'center';
         ctx.fillText("GAME OVER", w/2, h/2 - 10);
         ctx.font = '10px "Press Start 2P", monospace';
         ctx.fillStyle = '#10b981';
         if (Math.floor(frame / 20) % 2 === 0) ctx.fillText("INSERT COIN", w/2, h/2 + 20);
      }

      // Draw Bullets as chunky rectangles
      ctx.fillStyle = '#fff';
      bullets.forEach(b => {
         // Snapped to scale grid
         ctx.fillRect(Math.floor(b.x/scale)*scale, Math.floor(b.y/scale)*scale, scale, b.h);
      });
      
      // Enemy Bullets
      ctx.fillStyle = '#ef4444';
      enemyBullets.forEach(b => {
         ctx.fillRect(Math.floor(b.x/scale)*scale, Math.floor(b.y/scale)*scale, scale, b.h);
      });

      // Particles (chunky pixels)
      particles.forEach(p => {
        ctx.fillStyle = p.color;
        let a = (p.life / 20).toFixed(1);
        ctx.globalAlpha = a;
        ctx.fillRect(Math.floor(p.x/scale)*scale, Math.floor(p.y/scale)*scale, scale, scale);
      });
      ctx.globalAlpha = 1.0;
    };

    // Start animation loop
    reqRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(reqRef.current);
  }, [isLoading]); // Only re-run when loading finishes, NOT on hover

  const updateMouseX = (clientX) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    mouseX.current = (clientX - rect.left) * scaleX;
  };

  const handleMouseMove = (e) => updateMouseX(e.clientX);
  const handleTouchMove = (e) => {
    if (e.touches.length > 0) updateMouseX(e.touches[0].clientX);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden group cursor-crosshair touch-none border-[8px] border-double border-white/20 p-1"
      onMouseEnter={() => { isHoveredRef.current = true; setIsHoveredUI(true); }}
      onMouseLeave={() => { isHoveredRef.current = false; setIsHoveredUI(false); mouseX.current = null; }}
      onMouseMove={handleMouseMove}
      onTouchStart={() => { isHoveredRef.current = true; setIsHoveredUI(true); }}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => { isHoveredRef.current = false; setIsHoveredUI(false); mouseX.current = null; }}
    >
      {/* ── Retro Loading Screen Overlay ── */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-[#010101] flex flex-col items-center justify-center p-6">
           <div className="text-[#10b981] font-arcade text-[10px] md:text-[12px] animate-pulse">
             {hasStartedLoading ? 'INSERT COIN / SYS BOOT' : 'STANDBY'}
           </div>
           
           <div className="text-[#10b981] font-arcade text-xl md:text-2xl mt-6">
             {Math.min(loadingProgress, 100)}%
           </div>
           
           {/* Pixelated Progress Bar */}
           <div className="w-48 h-3 border-2 border-[#10b981] mt-6 p-[2px]">
              <div 
                className="h-full bg-[#10b981] transition-all duration-100 ease-linear" 
                style={{ width: `${Math.min(loadingProgress, 100)}%` }} 
              />
           </div>
        </div>
      )}

      {/* Explicitly enforce pixelated CSS */}
      <canvas 
        ref={canvasRef} 
        width="400" 
        height="300" 
        className={`w-full h-full object-cover transition-opacity duration-700 rendering-pixelated ${isLoading ? 'opacity-0' : 'opacity-80 group-hover:opacity-100'}`}
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Overlay UI (Hidden while loading) */}
      {!isLoading && (
        <div className={`absolute inset-x-0 bottom-4 flex justify-center pointer-events-none transition-opacity duration-500 ${isHoveredUI ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-white/50 text-[8px] sm:text-[10px] font-mono uppercase tracking-[0.4em] font-bold bg-black/60 px-3 py-1 rounded-sm border border-white/10 shadow-lg">
            Hover to Control
          </p>
        </div>
      )}
      
      {/* Heavy CRT Scanline and Bezel overlay for arcade feel */}
      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay z-20" 
           style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.8))', backgroundSize: '100% 4px' }}>
      </div>
      
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.95)] z-30"></div>
    </div>
  );
};

export default SpaceInvaders;
