import { LayoutGrid, Lock, Key, Search } from 'lucide-react';

export default function SecurityTrust() {
  const cards = [
    {
      title: "Controlled Academic Data",
      icon: <LayoutGrid className="w-6 h-6 text-ink" />
    },
    {
      title: "Secure Data Permissions",
      icon: <Lock className="w-6 h-6 text-ink" />
    },
    {
      title: "Institution-Controlled Access",
      icon: <Key className="w-6 h-6 text-ink" />
    },
    {
      title: "Administrative Oversight",
      icon: <Search className="w-6 h-6 text-ink" />
    }
  ];

  return (
    <section className="w-full bg-canvas py-20 md:py-28" id="security">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-ink">
            Security and Trust
          </h2>
          <p className="text-ink-500 max-w-2xl mx-auto mt-4">
            Enterprise-grade security designed specifically for academic environments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-surface border border-border rounded-card p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-canvas flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <h3 className="text-base font-semibold text-ink">{card.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
