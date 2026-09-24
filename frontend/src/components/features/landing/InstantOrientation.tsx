import { TrendingUp, Library, Building2, Bot } from 'lucide-react';

export default function InstantOrientation() {
  const features = [
    {
      title: "Track Academic Progress in Real Time",
      description: "Students and advisors can instantly view performance metrics, completed credits, and upcoming milestones without deciphering complex reports.",
      icon: <TrendingUp className="w-5 h-5 text-ink-700" />
    },
    {
      title: "Centralized Curriculum Management",
      description: "Faculty can update syllabi, manage assignments, and distribute resources from a single, organized interface that updates globally.",
      icon: <Library className="w-5 h-5 text-ink-700" />
    },
    {
      title: "Consistent Course Architecture",
      description: "Every course follows a predictable, intuitive structure. Students spend time learning the material, not learning how to navigate the course.",
      icon: <Building2 className="w-5 h-5 text-ink-700" />
    },
    {
      title: "Integrated AI Academic Support",
      description: "Built-in AI tutoring provides immediate assistance with coursework, explains complex concepts, and guides research directly within the platform.",
      icon: <Bot className="w-5 h-5 text-ink-700" />
    }
  ];

  return (
    <section className="w-full bg-canvas py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-ink mb-4">
            Designed For Instant Orientation
          </h2>
          <p className="text-ink-500 max-w-2xl mx-auto">
            Complex academic structures simplified into a clear, intuitive interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-surface border border-border rounded-card p-6 md:p-8 flex items-start space-x-4 shadow-sm hover:border-border-soft transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-canvas-alt flex items-center justify-center shrink-0 group-hover:bg-amber-bg group-hover:text-amber-dark transition-colors">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink mb-2">{feature.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
