import { LayoutDashboard, BookOpen, ShieldCheck } from 'lucide-react';

export default function OneSystemThreeDimensions() {
  const dimensions = [
    {
      title: "Student Dashboard",
      description: "A clear, personalized view of progress, upcoming deadlines, and course materials. No more hunting for resources.",
      icon: <LayoutDashboard className="w-6 h-6 text-amber-dark" />,
      bg: "bg-amber-bg",
      border: "border-amber/20"
    },
    {
      title: "Lecturer Workspace",
      description: "Streamlined tools for grading, curriculum management, and student communication. Built to reduce administrative overhead.",
      icon: <BookOpen className="w-6 h-6 text-sage-dark" />,
      bg: "bg-sage-bg",
      border: "border-sage/20"
    },
    {
      title: "Administrative Oversight",
      description: "Institution-wide analytics, strict role-based access control, and centralized platform governance.",
      icon: <ShieldCheck className="w-6 h-6 text-info" />,
      bg: "bg-info/10",
      border: "border-info/20"
    }
  ];

  return (
    <section className="w-full bg-canvas py-20 md:py-28" id="platform">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-ink max-w-lg">
            One System.<br />Three Dimensions.
          </h2>
          <p className="text-ink-500 mt-4 md:mt-0 max-w-sm text-base">
            Unidale is designed around how universities actually function. Each role gets exactly what they need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {dimensions.map((dim, idx) => (
            <div key={idx} className="bg-surface border border-border rounded-card p-6 md:p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${dim.bg} ${dim.border} border`}>
                {dim.icon}
              </div>
              <h3 className="text-lg font-semibold text-ink mb-3">{dim.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{dim.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
