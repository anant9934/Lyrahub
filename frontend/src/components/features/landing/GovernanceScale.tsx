import { CheckCircle2 } from 'lucide-react';

export default function GovernanceScale() {
  const points = [
    "Role-based access controls for faculty, admins, and students",
    "Configurable workflows to match institutional policies",
    "Real-time analytics for academic performance and engagement",
    "Institution-wide architecture ensuring data consistency"
  ];

  return (
    <section className="w-full bg-canvas py-20 md:py-28" id="governance">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left: Image/Illustration */}
          <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-sage-bg border-4 border-surface shadow-md">
            {/* Using a placeholder gradient/pattern instead of external image to comply with rules */}
            <div className="absolute inset-0 bg-gradient-to-br from-sage/40 to-sage-dark/20"></div>
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1E1E1E_1px,transparent_1px)] [background-size:20px_20px]"></div>
            
            {/* Decorative elements to simulate a dashboard UI in the environment */}
            <div className="absolute bottom-8 right-8 bg-surface p-4 rounded-xl shadow-lg border border-border/50 max-w-xs">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-success"></span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">System Status</div>
                  <div className="text-xs text-ink-500">All services operational</div>
                </div>
              </div>
              <div className="h-1.5 w-full bg-canvas-alt rounded-full overflow-hidden">
                <div className="h-full bg-success w-full"></div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-ink mb-6">
              Built for Institutional<br />Governance and Scale
            </h2>
            <p className="text-lg text-ink-500 mb-8 leading-relaxed">
              Unidale provides the structural integrity large learning institutions require, without sacrificing the intuitive experience users expect.
            </p>

            <ul className="space-y-4">
              {points.map((point, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-sage shrink-0 mt-0.5" />
                  <span className="text-ink-700 text-base">{point}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
