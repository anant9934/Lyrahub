'use client';

import React, { useEffect, useRef } from 'react';

// Strict color distribution
const COLOR_1 = '#1E3A2F'; // 88%
const COLOR_2 = '#7AA36E'; // 9%
const COLOR_3 = '#EE8E1E'; // 3%

interface Particle {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  size: number;
  baseOpacity: number;
  depth: number;
  color: string;
  wanderPhase: number;
  wanderAmp: number;
}

export default function ParticleHuman() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  
  // Physics and interaction state
  const mouseRef = useRef({ x: -999, y: -999 });
  const targetMouseRef = useRef({ x: -999, y: -999 });
  const mouseActiveRef = useRef(false);
  const isVisibleRef = useRef(true);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Intersection Observer to pause when out of view
    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isMobile = false;
    let centroidX = 0;
    let centroidY = 0;

    const generateParticles = () => {
      // 1. Offscreen canvas
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const oCtx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!oCtx) return;

      // 2. Draw procedural silhouette
      const hX = width * 0.58;
      const hY = height * 0.32;
      const hRX = height * 0.06;
      const hRY = height * 0.08;
      
      oCtx.fillStyle = 'black';
      
      // Head
      oCtx.save();
      oCtx.translate(hX, hY);
      oCtx.rotate(-8 * Math.PI / 180);
      oCtx.beginPath();
      oCtx.ellipse(0, 0, hRX, hRY, 0, 0, Math.PI * 2);
      oCtx.fill();
      oCtx.restore();

      // Neck
      const neckW = height * 0.03;
      oCtx.fillRect(hX - neckW / 2 - 2, hY + hRY * 0.8, neckW + 4, height * 0.06);

      // Shoulders + Torso
      const topW = height * 0.22;
      const botW = height * 0.34;
      const torsoY = hY + hRY + height * 0.02;
      const botY = height;
      
      oCtx.save();
      // Slight leftward lean by skewing or just adjusting coordinates
      oCtx.beginPath();
      // top left
      oCtx.moveTo(hX - topW / 2 - width * 0.02, torsoY);
      // top right
      oCtx.lineTo(hX + topW / 2 - width * 0.02, torsoY);
      // bot right
      oCtx.lineTo(hX + botW / 2, botY);
      // bot left
      oCtx.lineTo(hX - botW / 2 - width * 0.04, botY);
      oCtx.fill();
      oCtx.restore();

      // Arm curve (subtle on left)
      oCtx.beginPath();
      oCtx.moveTo(hX - topW / 2 - width * 0.02, torsoY);
      oCtx.quadraticCurveTo(hX - botW * 0.8, torsoY + height * 0.2, hX - botW / 2 - width * 0.04, botY);
      oCtx.fill();

      // 3. Dissolution Mask (Right edge)
      const gradStartX = width * 0.65;
      const gradEndX = width * 0.85;
      
      const grad = oCtx.createLinearGradient(gradStartX, 0, gradEndX, 0);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      
      oCtx.globalCompositeOperation = 'destination-in';
      oCtx.fillStyle = grad;
      oCtx.fillRect(gradStartX, 0, width - gradStartX, height);
      
      // 4. Sample Pixels
      const imgData = oCtx.getImageData(0, 0, width, height).data;
      const candidates: {x: number, y: number}[] = [];
      
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const alpha = imgData[(y * width + x) * 4 + 3];
          if (alpha > 128) {
            candidates.push({ x, y });
          }
        }
      }

      // Fisher-Yates shuffle
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = candidates[i];
        candidates[i] = candidates[j];
        candidates[j] = temp;
      }

      // Target count
      let targetCount = 1500;
      if (width > 1280) targetCount = 8000;
      else if (width >= 1024) targetCount = 6000;
      else if (width >= 640) targetCount = 3500;

      const count = Math.min(targetCount, candidates.length);
      const newParticles: Particle[] = [];
      
      let sumX = 0;
      let sumY = 0;

      for (let i = 0; i < count; i++) {
        const c = candidates[i];
        
        // Depth distribution
        const rDepth = Math.random();
        const depth = rDepth < 0.6 ? 0.7 : (rDepth < 0.9 ? 1.0 : 1.3);
        
        // Color distribution
        const rColor = Math.random();
        const color = rColor < 0.88 ? COLOR_1 : (rColor < 0.97 ? COLOR_2 : COLOR_3);
        
        // Size & Opacity
        const size = (0.6 + Math.random() * 1.6) * depth;
        const baseOpacity = Math.min(1, Math.max(0.35, (0.5 + Math.random() * 0.45) * depth));
        
        // Wander
        const isWander = Math.random() < 0.06;
        const wanderAmp = isWander ? Math.random() * 3.5 : 0;
        const wanderPhase = Math.random() * Math.PI * 2;

        newParticles.push({
          x: c.x,
          y: c.y,
          ox: c.x,
          oy: c.y,
          vx: 0,
          vy: 0,
          size,
          baseOpacity,
          depth,
          color,
          wanderPhase,
          wanderAmp
        });
        
        sumX += c.x;
        sumY += c.y;
      }

      centroidX = count > 0 ? sumX / count : width / 2;
      centroidY = count > 0 ? sumY / count : height / 2;

      particlesRef.current = newParticles;
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      isMobile = width < 640;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(dpr, dpr);
      
      generateParticles();
      
      if (prefersReducedMotionRef.current) {
        drawStatic();
      }
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.globalAlpha = p.baseOpacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.ox, p.oy, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let resizeTimer: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    };
    window.addEventListener('resize', onResize);

    // Interaction handling
    const updateMouse = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseRef.current.x = clientX - rect.left;
      targetMouseRef.current.y = clientY - rect.top;
    };

    const onMouseMove = (e: MouseEvent) => {
      updateMouse(e.clientX, e.clientY);
    };
    
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateMouse(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onMouseEnter = () => { mouseActiveRef.current = true; };
    const onMouseLeave = () => { mouseActiveRef.current = false; };
    const onTouchStart = () => { mouseActiveRef.current = true; };
    
    let touchEndTimer: NodeJS.Timeout;
    const onTouchEnd = () => {
      clearTimeout(touchEndTimer);
      touchEndTimer = setTimeout(() => {
        mouseActiveRef.current = false;
      }, 400);
    };

    if (!prefersReducedMotionRef.current) {
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseleave', onMouseLeave);
      canvas.addEventListener('mouseenter', onMouseEnter);
      canvas.addEventListener('touchmove', onTouchMove, { passive: true });
      canvas.addEventListener('touchstart', onTouchStart, { passive: true });
      canvas.addEventListener('touchend', onTouchEnd);
    }

    let frameCount = 0;
    
    const animate = (timestamp: number) => {
      if (prefersReducedMotionRef.current) return;
      animationRef.current = requestAnimationFrame(animate);
      
      if (!isVisibleRef.current) return;
      
      frameCount++;
      // Mobile target FPS 45 skip logic - roughly skip 1 out of 4 frames at 60fps
      if (isMobile && frameCount % 4 === 0) return;

      // Mouse smoothing
      if (mouseActiveRef.current) {
        mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.15;
        mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.15;
      } else {
        mouseRef.current.x = -999;
        mouseRef.current.y = -999;
      }
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Breathing
      const breath = 1 + 0.008 * Math.sin(timestamp * 0.0006);

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Target computation
        let tx = centroidX + (p.ox - centroidX) * breath;
        let ty = centroidY + (p.oy - centroidY) * breath;
        
        if (p.wanderAmp > 0) {
          p.wanderPhase += 0.0004;
          tx += Math.cos(p.wanderPhase) * p.wanderAmp;
          ty += Math.sin(p.wanderPhase * 1.3) * p.wanderAmp;
        }

        // Interaction
        if (mouseActiveRef.current) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const distSq = dx * dx + dy * dy;
          const radius = 90 * p.depth;
          const radiusSq = radius * radius;
          
          if (distSq < radiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const falloff = 1 - dist / radius;
            const force = falloff * falloff * 6 * p.depth;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Spring
        p.vx += (tx - p.x) * 0.022;
        p.vy += (ty - p.y) * 0.022;
        p.vx *= 0.90;
        p.vy *= 0.90;
        
        // Velocity cap
        const velMagSq = p.vx * p.vx + p.vy * p.vy;
        if (velMagSq > 144) { // 12 * 12
          const velMag = Math.sqrt(velMagSq);
          p.vx = (p.vx / velMag) * 12;
          p.vy = (p.vy / velMag) * 12;
        }

        p.x += p.vx;
        p.y += p.vy;

        ctx.globalAlpha = p.baseOpacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Network lines
      if (!isMobile) {
        ctx.lineWidth = 0.5;
        
        // Optimize: just iterate depth > 1.0
        const nearParticles = particles.filter(p => p.depth > 1.0);
        const nearCount = nearParticles.length;
        
        for (let i = 0; i < nearCount; i++) {
          const p1 = nearParticles[i];
          for (let j = i + 1; j < nearCount; j++) {
            const p2 = nearParticles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < 900) {
              const alpha = (1 - distSq / 900) * 0.15;
              ctx.strokeStyle = `rgba(30, 58, 47, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }
      
      ctx.globalAlpha = 1.0;
    };

    resize();
    if (!prefersReducedMotionRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('mouseenter', onMouseEnter);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animationRef.current);
      clearTimeout(resizeTimer);
      clearTimeout(touchEndTimer);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block pointer-events-auto" 
        aria-hidden="true" 
      />
    </div>
  );
}
