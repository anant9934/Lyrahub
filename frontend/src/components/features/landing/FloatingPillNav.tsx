import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function FloatingPillNav() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <nav className="flex items-center justify-between bg-surface border border-border rounded-full px-6 py-3 shadow-dropdown">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🎓</span>
          <span className="text-ink font-medium">Lyrahub</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/leadership" className="text-ink-500 hover:text-ink transition-colors text-sm font-medium">
            Leadership
          </Link>
          <Link href="/#platform" className="text-ink-500 hover:text-ink transition-colors text-sm font-medium">
            Platform
          </Link>
          <Link href="/#governance" className="text-ink-500 hover:text-ink transition-colors text-sm font-medium">
            Governance
          </Link>
          <Link href="/#security" className="text-ink-500 hover:text-ink transition-colors text-sm font-medium">
            Security
          </Link>
        </div>

        <div className="hidden md:block">
          <Link href="/login" className="bg-ink text-surface px-5 py-2.5 rounded-full text-sm font-medium hover:bg-ink-700 transition-colors">
            Request Demo
          </Link>
        </div>

        <div className="md:hidden flex items-center">
          <button className="text-ink p-1">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  );
}
