"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bot, ArrowRight, Volume2, VolumeX } from "lucide-react"

interface InteractiveAidaMascotProps {
  className?: string
  priority?: boolean
  showBadge?: boolean
  badgeText?: string
}

const AIDA_QUOTES = [
  "⚡ Core energized! 1,240+ students connected across AI & ML.",
  "✦ Multimodal intelligence online and ready to assist you.",
  "💡 Over 35 high-impact research papers published this year!",
  "🚀 High placement readiness: 94.2% placement rate active.",
  "🤖 Ask me anything about our curriculum, hackathons & labs!",
  "✨ Supercharged! Explore our department's intelligent workspace below.",
]

export function InteractiveAidaMascot({
  className = "",
  priority = false,
  showBadge = true,
  badgeText = "★ Same Goals, Bigger Possibilities.",
}: InteractiveAidaMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [chargeLevel, setChargeLevel] = useState(100)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [showSpeech, setShowSpeech] = useState(false)
  const [ripples, setRipples] = useState<{ id: number }[]>([])
  const [floatingPoints, setFloatingPoints] = useState<{ id: number; text: string }[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 })

  // Play pleasant synthesised sci-fi chime when orb is clicked
  const playChime = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      if (ctx.state === "suspended") {
        ctx.resume()
      }

      const now = ctx.currentTime
      // Frequencies for a sparkling celestial major chord (E5, G#5, B5, E6)
      const freqs = [659.25, 830.61, 987.77, 1318.51]

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, now + i * 0.05)

        gain.gain.setValueAtTime(0.001, now + i * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.09, now + i * 0.05 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.5)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + i * 0.05)
        osc.stop(now + i * 0.05 + 0.55)
      })
    } catch {
      // Audio autoplay policy or unavailable
    }
  }, [soundEnabled])

  // Exact coordinates of energy ball center in mascot artwork:
  // Mascot image size: 1145 x 1374
  // Center of energy ball flare: x = 978.44 (85.45%), y = 690.65 (50.27%)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const orbCenterX = rect.left + rect.width * 0.8545
    const orbCenterY = rect.top + rect.height * 0.5027

    const dist = Math.hypot(e.clientX - orbCenterX, e.clientY - orbCenterY)
    const maxDist = rect.width * 0.28

    if (dist < maxDist) {
      const pull = (1 - dist / maxDist) * 8
      const angle = Math.atan2(e.clientY - orbCenterY, e.clientX - orbCenterX)
      setMagneticOffset({
        x: Math.cos(angle) * pull,
        y: Math.sin(angle) * pull,
      })
    } else {
      setMagneticOffset({ x: 0, y: 0 })
    }
  }, [])

  const triggerEnergize = useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent) => {
      if (e) e.stopPropagation()
      playChime()

      // Visual shockwave ripple
      const id = Date.now()
      setRipples((prev) => [...prev, { id }])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, 1000)

      // Floating points text
      const pointId = id + 1
      const pointsText = chargeLevel >= 300 ? "MAX OVERDRIVE! 🔥" : "+35% ⚡"
      setFloatingPoints((prev) => [...prev, { id: pointId, text: pointsText }])
      setTimeout(() => {
        setFloatingPoints((prev) => prev.filter((p) => p.id !== pointId))
      }, 1200)

      // Increase charge level and cycle speech quote
      setChargeLevel((prev) => (prev >= 300 ? 100 : prev + 35))
      setQuoteIndex((prev) => (prev + 1) % AIDA_QUOTES.length)
      setShowSpeech(true)
    },
    [chargeLevel, playChime]
  )

  // Auto-hide speech bubble after delay
  useEffect(() => {
    if (showSpeech) {
      const timer = setTimeout(() => setShowSpeech(false), 6000)
      return () => clearTimeout(timer)
    }
  }, [showSpeech, quoteIndex])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHovered(false)
        setMagneticOffset({ x: 0, y: 0 })
      }}
      className={`relative select-none ${className}`}
      style={{
        aspectRatio: "1145 / 1374",
      }}
    >
      {/* ── Soft Background Ambient Halo ───────────────────────────────── */}
      <div className="pointer-events-none absolute inset-x-[15%] top-[10%] bottom-[15%] rounded-full bg-gradient-to-tr from-[#1478ef]/15 via-white/40 to-[#ffcf36]/20 blur-3xl dark:bg-[#1B365D]/30" />

      {/* ── Base 3D Mascot Image ───────────────────────────────────────── */}
      <div className="relative h-full w-full">
        <Image
          src="/images/aida-mascot.png"
          alt="AIDA, AIMETRA 3D Robot Assistant"
          fill
          priority={priority}
          sizes="(max-width: 640px) 320px, (max-width: 1024px) 420px, 480px"
          className="object-contain drop-shadow-[0_24px_35px_rgba(7,27,61,0.22)] transition-transform duration-500 will-change-transform"
        />
      </div>

      {/* ── AIDA Interactive Speech Bubble (Floats cleanly to upper-left of head) ── */}
      <div
        className={`absolute -top-12 left-0 sm:-left-28 sm:-top-14 z-30 transition-all duration-300 ${
          showSpeech
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 pointer-events-none translate-y-2"
        }`}
      >
        <div className="relative max-w-[280px] rounded-2xl border border-[#DCE5F1] bg-white/95 p-3.5 shadow-[0_12px_32px_rgba(9,25,54,0.18)] backdrop-blur-md dark:border-[#2A4468] dark:bg-[#112239]/95 sm:max-w-[310px]">
          <div className="flex items-start gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#EDF5FF] text-[#1478ef] dark:bg-[#1E3456]">
              <Bot className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#1478ef]">
                <span>AIDA Intelligence</span>
                <span className="text-[#D97706] font-mono">⚡ {chargeLevel}%</span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-[#071b3d] dark:text-white">
                {AIDA_QUOTES[quoteIndex]}
              </p>
              <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#F0F4FA] dark:border-[#1E3456]">
                <Link
                  href="/aida"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1478ef] hover:underline"
                >
                  <span>Open Assistant</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowSpeech(false)}
                  className="text-[10px] font-bold text-[#9AB5D0] hover:text-[#071b3d]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
          {/* Arrow pointer pointing towards robot */}
          <div className="absolute -bottom-1.5 right-8 sm:right-6 h-3 w-3 rotate-45 border-b border-r border-[#DCE5F1] bg-white dark:border-[#2A4468] dark:bg-[#112239]" />
        </div>
      </div>

      {/* ── THE LIVE INTERACTIVE GLOWING ENERGY BALL ───────────────────── */}
      {/* Exactly centered on the painted energy ball in the hand: left: 85.45%, top: 50.27% */}
      <div
        style={{
          left: `calc(85.45% + ${magneticOffset.x}px)`,
          top: `calc(50.27% + ${magneticOffset.y}px)`,
          transform: "translate(-50%, -50%)",
        }}
        onClick={(e) => triggerEnergize(e)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            triggerEnergize(e)
          }
        }}
        onMouseEnter={() => {
          setIsHovered(true)
          setShowSpeech(true)
        }}
        onMouseLeave={() => setIsHovered(false)}
        className="group absolute z-20 flex h-24 w-24 cursor-pointer items-center justify-center touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCF36]"
        title="⚡ Click or tap to energize AIDA's Energy Ball!"
        role="button"
        tabIndex={0}
        aria-label="Interactive AIDA energy orb. Click to energize."
      >
        {/* FX Layer 1: Wide Luminous Amber & Gold Corona (Screen blend mode so it glows without covering) */}
        <div
          className={`pointer-events-none absolute h-36 w-36 rounded-full transition-all duration-500 ${
            isHovered ? "scale-125 opacity-90" : "scale-100 opacity-70"
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(255,235,130,0.6) 0%, rgba(255,185,40,0.35) 40%, rgba(255,130,0,0.15) 65%, transparent 80%)",
            mixBlendMode: "screen",
          }}
        />

        {/* FX Layer 2: Pulsing High-Energy Plasma Glow */}
        <div
          className="pointer-events-none absolute h-24 w-24 rounded-full transition-all duration-300"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,220,90,0.5) 35%, rgba(255,160,0,0.2) 60%, transparent 75%)",
            mixBlendMode: "screen",
            animation: `pulse ${isHovered ? "1.2s" : "2.4s"} cubic-bezier(0.4, 0, 0.6, 1) infinite`,
          }}
        />

        {/* FX Layer 3: Concentric Expanding Shockwaves on Click */}
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="pointer-events-none absolute rounded-full border border-[#FFF399] animate-ping"
            style={{
              width: "70px",
              height: "70px",
              boxShadow: "0 0 20px rgba(255, 207, 54, 0.9), inset 0 0 10px rgba(255, 255, 255, 0.8)",
              mixBlendMode: "screen",
            }}
          />
        ))}

        {/* FX Layer 4: 3D Rotating Atomic / Orbital Energy Bands (Aligned with artwork angles) */}
        <div
          className={`pointer-events-none absolute h-28 w-28 transition-transform duration-300 ${
            isHovered ? "scale-115" : "scale-100"
          }`}
        >
          {/* Orbital Loop 1 (25deg tilt, matches existing artwork loop) */}
          <div className="absolute inset-0 animate-[spin_5s_linear_infinite]">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <ellipse
                cx="50"
                cy="50"
                rx="42"
                ry="13"
                fill="none"
                stroke="#FFF275"
                strokeWidth="1.4"
                strokeDasharray="8 4"
                className="opacity-80"
                style={{ mixBlendMode: "screen" }}
                transform="rotate(25 50 50)"
              />
              {/* Traveling Photon on Loop 1 */}
              <circle
                cx="88"
                cy="50"
                r="2.2"
                fill="#FFFFFF"
                className="drop-shadow-[0_0_6px_#FFCF36]"
              />
            </svg>
          </div>

          {/* Orbital Loop 2 (-35deg reverse spin) */}
          <div className="absolute inset-0 animate-[spin_7s_linear_reverse_infinite]">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <ellipse
                cx="50"
                cy="50"
                rx="39"
                ry="14"
                fill="none"
                stroke="#FFD54F"
                strokeWidth="1.2"
                className="opacity-75"
                style={{ mixBlendMode: "screen" }}
                transform="rotate(-35 50 50)"
              />
              {/* Traveling Photon on Loop 2 */}
              <circle
                cx="13"
                cy="50"
                r="2"
                fill="#FFFFFF"
                className="drop-shadow-[0_0_5px_#FFB300]"
              />
            </svg>
          </div>

          {/* Orbital Loop 3 (Steep inclined high-speed orbit) */}
          <div className="absolute inset-0 animate-[spin_3.2s_linear_infinite]">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <ellipse
                cx="50"
                cy="50"
                rx="36"
                ry="18"
                fill="none"
                stroke="#FFFDE7"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="opacity-85"
                style={{ mixBlendMode: "screen" }}
                transform="rotate(68 50 50)"
              />
              <circle cx="50" cy="14" r="2" fill="#FFFFFF" />
            </svg>
          </div>
        </div>

        {/* FX Layer 5: Sparkling Star Flare at Core (Centered right at x=978, y=691) */}
        <div
          className="pointer-events-none relative flex h-12 w-12 items-center justify-center"
          style={{ mixBlendMode: "screen" }}
        >
          {/* Subtle translucent central brilliance */}
          <div
            className={`h-7 w-7 rounded-full transition-transform duration-300 ${
              isHovered ? "scale-125" : "scale-100"
            }`}
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,230,120,0.6) 40%, rgba(255,180,0,0.2) 70%, transparent 100%)",
            }}
          />

          {/* 4-point rotating stellar cross glint */}
          <div className="absolute inset-0 flex items-center justify-center animate-[spin_10s_linear_infinite]">
            <div className="h-10 w-0.5 bg-gradient-to-b from-transparent via-white to-transparent opacity-80" />
            <div className="absolute h-0.5 w-10 bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
          </div>

          {/* Diagonal secondary sparkle rays */}
          <div className="absolute inset-0 flex items-center justify-center rotate-45 animate-[spin_14s_linear_reverse_infinite]">
            <div className="h-6 w-0.5 bg-gradient-to-b from-transparent via-[#FFF399] to-transparent opacity-70" />
            <div className="absolute h-0.5 w-6 bg-gradient-to-r from-transparent via-[#FFF399] to-transparent opacity-70" />
          </div>
        </div>

        {/* FX Layer 6: Rising Energy Sparks */}
        <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2">
          {[
            { delay: "0s", left: "-6px" },
            { delay: "0.8s", left: "6px" },
            { delay: "1.4s", left: "-1px" },
          ].map((spark, idx) => (
            <div
              key={idx}
              className="absolute h-1.5 w-1.5 rounded-full bg-[#FFFDE7] animate-pulse drop-shadow-[0_0_5px_#FFCF36]"
              style={{
                left: spark.left,
                animationDelay: spark.delay,
                animationDuration: "1.8s",
                opacity: 0.75,
              }}
            />
          ))}
        </div>

        {/* FX Layer 7: Floating "+35% ⚡" / "OVERDRIVE" on Click */}
        {floatingPoints.map((p) => (
          <div
            key={p.id}
            className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-black text-[#FFCF36] drop-shadow-[0_0_8px_rgba(255,207,54,0.9)] animate-out fade-out slide-out-to-top duration-1000"
          >
            {p.text}
          </div>
        ))}

        {/* Interactive Helper Pill (Floats cleanly in open air above orb, fingers 100% visible) */}
        <div
          className={`pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#071b3d]/90 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#FFCF36] shadow-md backdrop-blur-sm transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          ⚡ Click to Energize
        </div>
      </div>

      {/* ── Optional Bottom Floating Badge ────────────────────────────── */}
      {showBadge && (
        <div className="absolute -bottom-2 right-4 z-20 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-2 text-xs font-black text-[#92400E] shadow-lg sm:right-8 dark:bg-[#1E293B] dark:border-[#334155] dark:text-[#FDE68A]">
          {badgeText}
        </div>
      )}

      {/* ── Top Status Pill Badge ───────────────────────────────────────── */}
      <div className="absolute top-2 right-2 sm:right-4 z-10 flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[11px] font-bold text-[#071b3d] shadow-sm backdrop-blur-sm dark:bg-[#162D4A] dark:border-[#2A4468] dark:text-white">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Department AI Online</span>
        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          className="ml-1 text-[#9AB5D0] hover:text-[#071b3d] transition-colors"
          title={soundEnabled ? "Mute interactive chimes" : "Enable chimes"}
        >
          {soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
        </button>
      </div>
    </div>
  )
}

