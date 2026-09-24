'use client';

import React, { useEffect, useRef, useState } from 'react';

// Lyrahub Tokens
const SAGE_COLOR = '#94BD88';
const DARK_GREEN = '#1E3A2F';
const MID_GREEN = '#7AA36E';
const AMBER = '#EE8E1E';

const SPRING = 0.02;
const FRICTION = 0.88;
const INTERACTION_RADIUS = 90;
const STRENGTH = 3.5;

interface Particle {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  depth: number;
  color: string;
  wanderPhase: number;
  isWanderer: boolean;
}

export default function ParticleHuman() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackImage, setFallbackImage] = useState(false);

  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  
  // Interaction state
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const targetMouseRef = useRef({ x: -9999, y: -9999 });
  const isInteractingRef = useRef(false);

  // Performance guards
  const isVisibleRef = useRef(true);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    // Check reduced motion
    prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // false for performance if we fill background, but we need transparent background. Wait, hero is sage. 
    // Actually, hero is sage, so we can use alpha: true to just blend, or alpha: false and fill with SAGE_COLOR. Let's use alpha: true.
    if (!ctx) {
      setFallbackImage(true);
      return;
    }

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = container.clientWidth;
    let height = container.clientHeight;
    let isMobile = width < 640;

    // Set up Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // Document hidden check
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const resizeCanvas = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      isMobile = width < 640;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(dpr, dpr);
      initParticles();
    };

    const getParticleCount = () => {
      if (width > 1024) return 4500;
      if (width >= 640) return 2500;
      return 1200;
    };

    const generateProceduralSilhouette = (count: number, w: number, h: number) => {
      const particles: Particle[] = [];
      const centerX = w / 2;
      const centerY = h / 2 + 50;

      for (let i = 0; i < count; i++) {
        // Procedural distribution: Head (ellipse) and Torso (trapezoid)
        let x, y;
        if (Math.random() < 0.25) {
          // Head
          const angle = Math.random() * Math.PI * 2;
          const r = Math.sqrt(Math.random()) * 60;
          x = centerX + Math.cos(angle) * r;
          y = centerY - 140 + Math.sin(angle) * r * 1.2;
        } else {
          // Torso
          const t = Math.random();
          const u = Math.random();
          const wOff = 120 + t * 60; 
          x = centerX + (u * 2 - 1) * wOff;
          y = centerY - 40 + t * 250;
        }

        particles.push(createParticle(x, y));
      }
      return particles;
    };

    const createParticle = (x: number, y: number): Particle => {
      const depth = 0.5 + Math.random(); // 0.5 to 1.5
      const randColor = Math.random();
      let color = DARK_GREEN;
      if (randColor > 0.98) color = AMBER;
      else if (randColor > 0.9) color = MID_GREEN;

      return {
        x, y,
        originalX: x,
        originalY: y,
        vx: 0, vy: 0,
        size: (0.8 + Math.random() * 1.2) * depth,
        opacity: Math.min(0.9, (0.35 + Math.random() * 0.55) * depth),
        depth,
        color,
        wanderPhase: Math.random() * Math.PI * 2,
        isWanderer: Math.random() < 0.05
      };
    };

    const initParticles = () => {
      const count = getParticleCount();
      
      const img = new Image();
      img.src = '/particle-human.png';
      
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        if (!offCtx) {
          particlesRef.current = generateProceduralSilhouette(count, width, height);
          return;
        }
        
        // We want to fit the image in the center, covering a good portion
        const scale = Math.min(width / img.width, height / img.height) * 0.8;
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (width - dw) / 2;
        const dy = (height - dh) / 2 + 30; // offset down a bit
        
        offCanvas.width = width;
        offCanvas.height = height;
        offCtx.drawImage(img, dx, dy, dw, dh);
        
        const imgData = offCtx.getImageData(0, 0, width, height).data;
        const particles: Particle[] = [];
        
        let attempts = 0;
        const maxAttempts = count * 50;
        
        while (particles.length < count && attempts < maxAttempts) {
          const px = Math.floor(Math.random() * width);
          const py = Math.floor(Math.random() * height);
          const i = (py * width + px) * 4;
          
          // Check alpha channel
          if (imgData[i + 3] > 50) {
            particles.push(createParticle(px, py));
          }
          attempts++;
        }
        
        if (particles.length === 0) {
          particlesRef.current = generateProceduralSilhouette(count, width, height);
        } else {
          particlesRef.current = particles;
        }
      };
      
      img.onerror = () => {
        particlesRef.current = generateProceduralSilhouette(count, width, height);
        if (prefersReducedMotionRef.current) drawStatic();
      };
    };

    let resizeTimer: any;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
      }, 200);
    };

    window.addEventListener('resize', onResize);

    // Interaction handling
    const updateMouse = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      
      if (window.TouchEvent && e instanceof TouchEvent) {
        if (e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          isInteractingRef.current = false;
          return;
        }
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      
      targetMouseRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
      isInteractingRef.current = true;
    };

    const handleMouseLeave = () => {
      isInteractingRef.current = false;
    };

    canvas.addEventListener('mousemove', updateMouse);
    canvas.addEventListener('touchmove', updateMouse, { passive: true });
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchend', handleMouseLeave);

    const drawStatic = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
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

      // Lerp mouse
      if (isInteractingRef.current) {
        // ~80ms smoothing. At 60fps, lerp factor ~0.2
        mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.2;
        mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.2;
      } else {
        // move mouse far away
        mouseRef.current.x = -9999;
        mouseRef.current.y = -9999;
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Trail effect
      if (isMobile) {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = `rgba(148, 189, 136, 0.15)`; // SAGE_COLOR with alpha
        ctx.fillRect(0, 0, width, height);
      }

      const particles = particlesRef.current;
      const breathingScale = 1 + 0.015 * Math.sin(time * 0.0004);
      const cx = width / 2;
      const cy = height / 2;

      // Precalculate a few things
      ctx.lineCap = 'round';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Breathing & Wander target
        let targetX = cx + (p.originalX - cx) * breathingScale;
        let targetY = cy + (p.originalY - cy) * breathingScale;

        if (p.isWanderer) {
          p.wanderPhase += 0.0003 * 16; // approx time delta
          targetX += Math.cos(p.wanderPhase) * 4;
          targetY += Math.sin(p.wanderPhase) * 4;
        }

        // Mouse interaction
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = INTERACTION_RADIUS * p.depth;

        if (isInteractingRef.current && dist < radius) {
          const force = (1 - dist / radius) * STRENGTH;
          p.vx += (dx / dist) * force * p.depth;
          p.vy += (dy / dist) * force * p.depth;
        }

        // Spring back
        p.vx += (targetX - p.x) * SPRING;
        p.vy += (targetY - p.y) * SPRING;
        
        // Friction
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        
        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Network lines
      if (!isMobile) {
        ctx.strokeStyle = DARK_GREEN;
        ctx.globalAlpha = 0.06;
        ctx.lineWidth = 1;
        
        const limit = Math.min(300, particles.length);
        for (let i = 0; i < limit; i++) {
          const p1 = particles[i];
          for (let j = i + 1; j < limit; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < 324) { // 18 * 18
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

    resizeCanvas();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      canvas.removeEventListener('mousemove', updateMouse);
      canvas.removeEventListener('touchmove', updateMouse);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchend', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full relative mt-16 md:mt-20 max-w-6xl mx-auto flex items-center justify-center">
      {/* Screen reader only description */}
      <p className="sr-only">Interactive particle visualization of a human silhouette representing students in the hub.</p>
      
      {fallbackImage ? (
        <img src="/particle-human.png" alt="Student Silhouette" className="opacity-80 w-full max-w-md mx-auto" />
      ) : (
        <canvas 
          ref={canvasRef} 
          className="w-full h-[520px] md:h-[640px] touch-none outline-none" 
          aria-hidden="true" 
        />
      )}
    </div>
  );
}
