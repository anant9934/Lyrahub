'use client';

import React, { useEffect, useRef } from 'react';

// Color Distribution Constants
const COLOR_DARK = '#1E3A2F'; // 88%
const COLOR_MID = '#7AA36E';  // 9%
const COLOR_ACCENT = '#EE8E1E'; // 3%

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
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  // Interaction State
  const mouseRef = useRef({ x: -9999, y: -9999, targetX: -9999, targetY: -9999, active: false });
  const isVisibleRef = useRef(true);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => { isVisibleRef.current = entries[0].isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    const handleVisibilityChange = () => { isVisibleRef.current = !document.hidden; };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isMobile = false;

    const getParticleCount = (w: number) => {
      if (w > 1280) return 8000;
      if (w >= 1024) return 6000;
      if (w >= 640) return 3500;
      return 1500;
    };

    const generateParticles = () => {
      // Offscreen canvas for sampling
      const offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;

      offCtx.fillStyle = '#000000';

      const cx = width * 0.58;
      const cy = height * 0.32;
      const headRh = height * 0.08;
      const headRw = height * 0.06;

      // 1. HEAD
      offCtx.save();
      offCtx.translate(cx, cy);
      offCtx.rotate(-8 * Math.PI / 180);
      offCtx.beginPath();
      offCtx.ellipse(0, 0, headRw, headRh, 0, 0, Math.PI * 2);
      offCtx.fill();
      offCtx.restore();

      // 2. NECK
      const neckW = height * 0.03;
      offCtx.beginPath();
      offCtx.rect(cx - neckW / 2, cy + headRh * 0.8, neckW, height * 0.1);
      offCtx.fill();

      // 3. SHOULDERS + TORSO
      const torsoTopY = cy + headRh * 0.8 + height * 0.05;
      const topW = height * 0.22;
      const bottomW = height * 0.34;
      offCtx.save();
      offCtx.translate(cx, torsoTopY);
      offCtx.rotate(-8 * Math.PI / 180); // lean matching head
      offCtx.beginPath();
      offCtx.moveTo(-topW / 2, 0);
      offCtx.lineTo(topW / 2, 0);
      offCtx.lineTo(bottomW / 2, height - torsoTopY);
      offCtx.lineTo(-bottomW / 2, height - torsoTopY);
      offCtx.fill();
      offCtx.restore();

      // 4. ARM OUTLINE (subtle left shoulder)
      offCtx.save();
      offCtx.translate(cx, torsoTopY);
      offCtx.rotate(-8 * Math.PI / 180);
      offCtx.beginPath();
      offCtx.ellipse(-topW / 2 - headRw * 0.5, height * 0.08, headRw * 1.5, height * 0.15, 0, 0, Math.PI * 2);
      offCtx.fill();
      offCtx.restore();

      // 5. DISSOLUTION ZONE
      const gradStartX = width * 0.65;
      const gradEndX = width * 0.85;
      
      const imgData = offCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (x > gradStartX) {
            const alphaFactor = 1 - Math.min(1, (x - gradStartX) / (gradEndX - gradStartX));
            const i = (y * width + x) * 4 + 3;
            if (data[i] > 0) {
              data[i] = Math.floor(data[i] * alphaFactor);
            }
          }
        }
      }
      offCtx.putImageData(imgData, 0, 0);

      // Sampling
      const candidates: { x: number; y: number }[] = [];
      const finalData = offCtx.getImageData(0, 0, width, height).data;

      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const alpha = finalData[(y * width + x) * 4 + 3];
          if (alpha > 128) {
            candidates.push({ x, y });
          }
        }
      }

      // Fisher-Yates Shuffle
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }

      const targetCount = getParticleCount(width);
      const count = Math.min(targetCount, candidates.length);
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const p = candidates[i];
        
        const colorRand = Math.random();
        let color = COLOR_DARK;
        if (colorRand > 0.97) color = COLOR_ACCENT;
        else if (colorRand > 0.88) color = COLOR_MID;

        const depthRand = Math.random();
        let depth = 0.7;
        if (depthRand > 0.9) depth = 1.3;
        else if (depthRand > 0.6) depth = 1.0;

        let baseOpacity = (0.5 + Math.random() * 0.45) * depth;
        if (baseOpacity < 0.35) baseOpacity = 0.35;
        if (baseOpacity > 1) baseOpacity = 1;

        const size = (0.6 + Math.random() * 1.6) * depth;
        
        let wanderAmp = 0;
        if (Math.random() < 0.06) {
          wanderAmp = Math.random() * 3.5;
        }

        newParticles.push({
          x: p.x, y: p.y,
          ox: p.x, oy: p.y,
          vx: 0, vy: 0,
          size,
          baseOpacity,
          depth,
          color,
          wanderPhase: Math.random() * Math.PI * 2,
          wanderAmp
        });
      }

      particlesRef.current = newParticles;
    };

    const resizeCanvas = () => {
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
    };

    let resizeTimer: any;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
      }, 200);
    };
    window.addEventListener('resize', onResize);

    // Mouse Interaction
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      
      if (window.TouchEvent && e instanceof TouchEvent) {
        if (e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          return;
        }
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      
      mouseRef.current.targetX = clientX - rect.left;
      mouseRef.current.targetY = clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseEnter = () => { mouseRef.current.active = true; };
    const handleMouseLeave = () => { mouseRef.current.active = false; };
    const handleTouchStart = () => { mouseRef.current.active = true; };
    let touchEndTimer: any;
    const handleTouchEnd = () => { 
      clearTimeout(touchEndTimer);
      touchEndTimer = setTimeout(() => { mouseRef.current.active = false; }, 400);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleMouseMove, { passive: true });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    resizeCanvas();

    let frameCount = 0;
    
    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particlesRef.current) {
        ctx.globalAlpha = p.baseOpacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const animate = (time: number) => {
      if (prefersReducedMotionRef.current) {
        drawStatic();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);

      if (!isVisibleRef.current) return;

      if (isMobile) {
        frameCount++;
        if (frameCount % 2 !== 0) return; // ~45fps limit on mobile
      }

      // Cursor smoothing
      if (mouseRef.current.active) {
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.15;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.15;
      } else {
        mouseRef.current.x = -9999;
        mouseRef.current.y = -9999;
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      
      // Calculate centroid (approximate based on head and body offset)
      const centerX = width * 0.58;
      const centerY = height * 0.5;

      const breath = 1 + 0.008 * Math.sin(time * 0.0006);

      ctx.clearRect(0, 0, width, height);
      
      const particles = particlesRef.current;
      const nearParticles: Particle[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Breathing & Wander target
        let targetX = centerX + (p.ox - centerX) * breath;
        let targetY = centerY + (p.oy - centerY) * breath;

        if (p.wanderAmp > 0) {
          p.wanderPhase += 0.0004;
          targetX += Math.cos(p.wanderPhase) * p.wanderAmp;
          targetY += Math.sin(p.wanderPhase * 1.3) * p.wanderAmp;
        }

        // Interaction
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

        // Return physics
        p.vx += (targetX - p.x) * 0.022;
        p.vy += (targetY - p.y) * 0.022;
        p.vx *= 0.90;
        p.vy *= 0.90;
        
        // Velocity cap
        const speedSq = p.vx * p.vx + p.vy * p.vy;
        if (speedSq > 144) { // 12 * 12
          const speed = Math.sqrt(speedSq);
          p.vx = (p.vx / speed) * 12;
          p.vy = (p.vy / speed) * 12;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.depth > 1.0 && !isMobile) {
          nearParticles.push(p);
        }

        ctx.globalAlpha = p.baseOpacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Network lines
      if (!isMobile) {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < nearParticles.length; i++) {
          const pi = nearParticles[i];
          for (let j = i + 1; j < nearParticles.length; j++) {
            const pj = nearParticles[j];
            const dx = pi.x - pj.x;
            const dy = pi.y - pj.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < 900) {
              const alpha = (1 - distSq / 900) * 0.15;
              ctx.strokeStyle = `rgba(30, 58, 47, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(pi.x, pi.y);
              ctx.lineTo(pj.x, pj.y);
              ctx.stroke();
            }
          }
        }
      }

      ctx.globalAlpha = 1;
    };

    if (prefersReducedMotionRef.current) {
      drawStatic();
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-auto">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full touch-none outline-none" 
        aria-hidden="true" 
      />
    </div>
  );
}
