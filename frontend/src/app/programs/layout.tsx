import Navbar from '@/components/layout/Navbar';

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
