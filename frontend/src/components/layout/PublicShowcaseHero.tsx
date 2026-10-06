import Image from "next/image"
import type { ReactNode } from "react"

type Tone = "sun" | "sky" | "night" | "lilac" | "cream"
type Visual = "campus" | "aida"

const tones: Record<Tone, { shell: string; eyebrow: string; body: string; star: string }> = {
  sun: { shell: "bg-[#fff8df] text-[#081a39]", eyebrow: "text-[#bd7400]", body: "text-[#526783]", star: "text-[#f6bd16]" },
  sky: { shell: "bg-[#e9f5ff] text-[#081a39]", eyebrow: "text-[#176bd1]", body: "text-[#526783]", star: "text-[#1781f2]" },
  night: { shell: "bg-[#071b3d] text-white", eyebrow: "text-[#83c1ff]", body: "text-[#c4d8f1]", star: "text-[#ffd542]" },
  lilac: { shell: "bg-[#f1ebff] text-[#081a39]", eyebrow: "text-[#7437db]", body: "text-[#526783]", star: "text-[#a26cff]" },
  cream: { shell: "bg-[#fff5e8] text-[#081a39]", eyebrow: "text-[#d26b15]", body: "text-[#526783]", star: "text-[#ffb420]" },
}

interface PublicShowcaseHeroProps {
  eyebrow: string
  title: ReactNode
  description: string
  tone: Tone
  visual: Visual
  visualLabel: string
  children?: ReactNode
}

export function PublicShowcaseHero({ eyebrow, title, description, tone, visual, visualLabel, children }: PublicShowcaseHeroProps) {
  const palette = tones[tone]

  return (
    <section className="px-4 pb-5 pt-5 sm:px-6 lg:px-8 lg:pb-9">
      <div className={`relative mx-auto grid max-w-[1440px] overflow-hidden rounded-[30px] border border-[#dce5f1] shadow-[0_18px_48px_rgba(8,26,57,0.09)] lg:min-h-[440px] lg:grid-cols-[1.05fr_0.95fr] ${palette.shell}`}>
        <div className="relative z-10 flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <p className={`mb-4 text-[11px] font-black uppercase tracking-[0.22em] ${palette.eyebrow}`}>✦ {eyebrow}</p>
          <h1 className="max-w-3xl text-[clamp(2.7rem,5vw,5.3rem)] font-black leading-[0.98] tracking-[-0.065em]">{title}</h1>
          <p className={`mt-6 max-w-xl text-sm leading-7 sm:text-base ${palette.body}`}>{description}</p>
          {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
        </div>

        <div className="relative min-h-[290px] overflow-hidden lg:min-h-full">
          {visual === "campus" ? (
            <>
              <Image src="/images/hero-campus.webp" alt="Students outside a modern university building" fill priority sizes="(max-width: 1024px) 100vw, 48vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071b3d]/45 via-transparent to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_36%,#b9e6ff_0%,#79b9ff_40%,#1c6dd1_100%)]" />
              <div className="absolute bottom-[-12%] left-[-10%] h-48 w-48 rounded-full bg-[#ffdf4d] blur-2xl" />
              <Image src="/images/aida-mascot.png" alt="AIDA, AIMETRA's 3D robot assistant" fill priority sizes="(max-width: 1024px) 90vw, 48vw" className="object-contain object-bottom drop-shadow-[0_25px_30px_rgba(7,27,61,0.35)]" />
            </>
          )}
          <span className={`absolute right-[9%] top-[8%] text-5xl drop-shadow-lg ${palette.star}`} aria-hidden="true">✦</span>
          <div className="absolute bottom-6 left-6 rounded-2xl border border-white/50 bg-white/90 px-4 py-3 text-xs font-extrabold tracking-[-0.02em] text-[#081a39] shadow-lg backdrop-blur-sm sm:left-8">
            {visualLabel}
          </div>
        </div>
      </div>
    </section>
  )
}
