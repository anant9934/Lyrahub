import Image from "next/image"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

type Tone = "blue" | "navy" | "yellow" | "lilac" | "mint" | "orange" | "teal" | "rose"

const styles: Record<Tone, {
  shell: string
  eyebrow: string
  body: string
  icon: string
  glowLeft: string
  glowRight: string
  star: string
}> = {
  blue: {
    shell: "bg-gradient-to-br from-[#e6f1ff] via-[#ecf5ff] to-[#f0f8ff] text-[#071b3d]",
    eyebrow: "text-[#1478ef]",
    body: "text-[#3D5A80]",
    icon: "bg-[#1478ef]/10 text-[#1478ef]",
    glowLeft: "bg-[#1478ef]/20",
    glowRight: "bg-[#FFCF36]/20",
    star: "text-[#1478ef]/40",
  },
  navy: {
    shell: "bg-gradient-to-br from-[#071b3d] via-[#0d2850] to-[#071b3d] text-white",
    eyebrow: "text-[#79bbff]",
    body: "text-[#b8ceea]",
    icon: "bg-white/15 text-[#FFCF36]",
    glowLeft: "bg-[#1478ef]/30",
    glowRight: "bg-[#FFCF36]/20",
    star: "text-[#5ac9ff]/50",
  },
  yellow: {
    shell: "bg-gradient-to-br from-[#fff8e6] via-[#fffcf0] to-[#fff8e6] text-[#071b3d]",
    eyebrow: "text-[#c28a00]",
    body: "text-[#3D5A80]",
    icon: "bg-[#FFCF36]/20 text-[#a66c00]",
    glowLeft: "bg-[#FFCF36]/30",
    glowRight: "bg-[#1478ef]/15",
    star: "text-[#FFCF36]/50",
  },
  lilac: {
    shell: "bg-gradient-to-br from-[#f0eaff] via-[#f5f0ff] to-[#f0eaff] text-[#071b3d]",
    eyebrow: "text-[#7c3aed]",
    body: "text-[#3D5A80]",
    icon: "bg-[#7c3aed]/10 text-[#7c3aed]",
    glowLeft: "bg-[#7c3aed]/20",
    glowRight: "bg-[#FFCF36]/15",
    star: "text-[#7c3aed]/40",
  },
  mint: {
    shell: "bg-gradient-to-br from-[#e2f8f5] via-[#ecfdf5] to-[#e2f8f5] text-[#071b3d]",
    eyebrow: "text-[#0f8f85]",
    body: "text-[#3D5A80]",
    icon: "bg-[#0f8f85]/10 text-[#0f8f85]",
    glowLeft: "bg-[#0f8f85]/20",
    glowRight: "bg-[#FFCF36]/15",
    star: "text-[#0f8f85]/40",
  },
  orange: {
    shell: "bg-gradient-to-br from-[#fff4e8] via-[#fff8f0] to-[#fff4e8] text-[#071b3d]",
    eyebrow: "text-[#ea6e22]",
    body: "text-[#3D5A80]",
    icon: "bg-[#ea6e22]/10 text-[#ea6e22]",
    glowLeft: "bg-[#ea6e22]/20",
    glowRight: "bg-[#FFCF36]/15",
    star: "text-[#ea6e22]/40",
  },
  teal: {
    shell: "bg-gradient-to-br from-[#e0f5f5] via-[#ebfafa] to-[#e0f5f5] text-[#071b3d]",
    eyebrow: "text-[#0d9488]",
    body: "text-[#3D5A80]",
    icon: "bg-[#0d9488]/10 text-[#0d9488]",
    glowLeft: "bg-[#0d9488]/20",
    glowRight: "bg-[#FFCF36]/15",
    star: "text-[#0d9488]/40",
  },
  rose: {
    shell: "bg-gradient-to-br from-[#fff0f2] via-[#fff5f7] to-[#fff0f2] text-[#071b3d]",
    eyebrow: "text-[#e11d48]",
    body: "text-[#3D5A80]",
    icon: "bg-[#e11d48]/10 text-[#e11d48]",
    glowLeft: "bg-[#e11d48]/20",
    glowRight: "bg-[#FFCF36]/15",
    star: "text-[#e11d48]/40",
  },
}

interface WorkspaceHeroProps {
  eyebrow: string
  title: ReactNode
  description: string
  tone?: Tone
  icon?: LucideIcon
  visual?: "aida" | "campus"
  actions?: ReactNode
  /** Show stat pills inline with the eyebrow row */
  stats?: Array<{ label: string; value: string | number }>
}

export function WorkspaceHero({
  eyebrow,
  title,
  description,
  tone = "blue",
  icon: Icon,
  visual,
  actions,
  stats,
}: WorkspaceHeroProps) {
  const palette = styles[tone]

  return (
    <div
      className={`relative isolate flex min-h-[200px] flex-col justify-center overflow-hidden rounded-[28px] border border-white/60 p-6 shadow-[0_6px_32px_rgba(9,25,54,0.10)] sm:p-8 ${visual ? "lg:pr-[33%]" : ""} ${palette.shell}`}
    >
      {/* Ambient background glows */}
      <div className={`absolute -left-16 -top-16 h-56 w-56 rounded-full blur-[70px] opacity-60 ${palette.glowLeft}`} />
      <div className={`absolute -bottom-20 -right-10 h-52 w-52 rounded-full blur-[60px] opacity-50 ${palette.glowRight}`} />

      {/* Decorative star accents */}
      <span aria-hidden="true" className={`absolute right-[8%] top-[14%] text-4xl ${palette.star} select-none`}>✦</span>
      <span aria-hidden="true" className={`absolute left-[4%] bottom-[20%] text-2xl ${palette.star} opacity-60 select-none`}>✦</span>

      {/* Campus image visual */}
      {visual === "campus" && (
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[33%] [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)] lg:block">
          <Image src="/images/hero-campus.webp" alt="" fill sizes="33vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-current/30 to-transparent" style={{ color: "transparent", background: "linear-gradient(to right, rgba(230,241,255,0.6), transparent)" }} />
        </div>
      )}

      {/* AIDA mascot visual */}
      {visual === "aida" && (
        <div className="pointer-events-none absolute -bottom-20 right-4 -z-10 hidden h-[290px] w-[290px] lg:block">
          <Image
            src="/images/aida-mascot.png"
            alt=""
            fill
            sizes="290px"
            className="object-contain object-bottom drop-shadow-[0_12px_24px_rgba(9,25,54,0.18)]"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative max-w-3xl">
        {/* Eyebrow row */}
        <div className={`mb-3 flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] ${palette.eyebrow}`}>
          {Icon && (
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${palette.icon}`}>
              <Icon className="h-4 w-4" />
            </span>
          )}
          <span>{eyebrow}</span>

          {/* Inline stat pills */}
          {stats && stats.map((s) => (
            <span
              key={s.label}
              className="ml-1 rounded-full border border-current/20 bg-white/50 px-3 py-1 text-[10px] font-semibold normal-case tracking-normal text-current/80 backdrop-blur-sm"
            >
              <strong className="font-black">{s.value}</strong> {s.label}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black leading-[1.05] tracking-[-0.055em] sm:text-4xl xl:text-5xl">
          {title}
        </h1>

        {/* Description */}
        <p className={`mt-3 max-w-2xl text-sm leading-6 ${palette.body}`}>
          {description}
        </p>

        {/* Actions */}
        {actions && (
          <div className="mt-5 flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
