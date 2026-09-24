import ParticleHuman from './ParticleHuman';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="w-full bg-sage pt-32 pb-20 relative overflow-hidden">
      {/* Decorative background elements can go here if needed */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          


          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-ink leading-tight">
            Mapping the brightest minds in <br className="hidden md:block" />
            <span className="text-amber">Machine Learning.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-ink-700 mx-auto leading-relaxed">
            <strong className="text-ink font-semibold">Centralize. Evaluate. Elevate.</strong><br/>
            Replace scattered spreadsheets and endless emails with one intelligent workspace. From midnight hackathon deployments to final placements, Lyrahub is the single source of truth for every skill, project, and achievement.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/login" className="bg-ink text-surface px-6 py-3 rounded-btn font-medium hover:bg-ink-700 transition w-full sm:w-auto shadow-lg shadow-ink/20">
              Enter the Hub
            </Link>
            <Link href="#documentation" className="border border-border bg-surface text-ink px-6 py-3 rounded-btn font-medium hover:bg-canvas-alt transition w-full sm:w-auto">
              View Documentation
            </Link>
          </div>
          
        </div>
      </div>
      
      <ParticleHuman />
      
      {/* Soft gradient transition to the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-canvas to-transparent pointer-events-none"></div>
    </section>
  );
}
