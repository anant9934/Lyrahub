import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="w-full bg-sage relative overflow-hidden min-h-[90vh] flex flex-col">
      {/* Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Text content */}
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-8 md:pb-0 relative z-10 w-full">
          <div className="max-w-3xl mx-auto text-center">

            {/* Eyebrow */}
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/60 mb-5">
              AI &amp; ML Education, Talent, Research &amp; Analytics
            </p>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ink leading-[1.1]">
              The intelligence layer
              <br className="hidden md:block" />
              for the{' '}
              <span className="text-amber">AI &amp; ML department.</span>
            </h1>

            <p className="mt-6 text-base md:text-lg text-ink/70 mx-auto leading-relaxed max-w-2xl">
              AIMETRA connects students, faculty, projects, research,
              opportunities, alumni and institutional data into one
              intelligent academic environment.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="bg-ink text-surface px-7 py-3.5 rounded-btn font-medium hover:bg-ink/85 transition-colors w-full sm:w-auto shadow-lg shadow-ink/15"
              >
                Explore AIMETRA
              </Link>
              <Link
                href="#system"
                className="border border-border bg-surface text-ink px-7 py-3.5 rounded-btn font-medium hover:bg-canvas-alt transition-colors w-full sm:w-auto"
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Figure — full-bleed static image with seamless blend */}
        <div className="relative w-full mt-4 md:mt-8 flex-1 min-h-[320px] md:min-h-[500px]">
          {/* Top edge blend: sage gradient fading into the image */}
          <div
            className="absolute top-0 left-0 right-0 h-24 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, #94BD88 0%, transparent 100%)',
            }}
          />
          <Image
            src="/hero-figure.jpg"
            alt="Connected signals representing the people, knowledge and evidence within an AI & ML academic department"
            fill
            priority
            className="object-cover object-top"
            sizes="100vw"
          />
          {/* Subtle color overlay to unify any remaining color mismatch */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-color"
            style={{ backgroundColor: 'rgba(148, 189, 136, 0.08)' }}
          />
        </div>
      </div>

      {/* Soft gradient transition to the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-canvas to-transparent pointer-events-none z-10" />
    </section>
  );
}
