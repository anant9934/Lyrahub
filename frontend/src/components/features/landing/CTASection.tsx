import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="w-full bg-canvas py-20 md:py-32 px-6">
      <div className="max-w-4xl mx-auto text-center bg-sage-bg border border-sage/20 rounded-3xl p-12 md:p-20 shadow-sm relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-sage/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-amber/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-ink mb-8">
            Replace scattered tools with<br />one structure
          </h2>
          <Link href="/login" className="inline-block bg-ink text-surface px-8 py-4 rounded-full font-medium hover:bg-ink-700 transition-colors shadow-lg shadow-ink/10">
            Request Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
