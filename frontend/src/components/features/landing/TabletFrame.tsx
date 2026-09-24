export default function TabletFrame() {
  return (
    <div className="max-w-5xl mx-auto mt-16 relative z-10 px-4 md:px-0">
      <div className="bg-surface rounded-3xl border-4 border-ink/10 shadow-hero overflow-hidden aspect-[16/10] flex flex-col relative">
        {/* Top bar */}
        <div className="h-12 border-b border-border flex items-center px-4 bg-canvas/50">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-danger"></div>
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <div className="w-3 h-3 rounded-full bg-success"></div>
          </div>
          <div className="ml-8 flex space-x-6 text-sm font-medium text-ink-500">
            <span className="text-ink">Dashboard</span>
            <span>My Subjects</span>
            <span>AI Tutor</span>
            <span>Grades</span>
          </div>
        </div>

        {/* Dashboard inner */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-border p-4 space-y-4 bg-canvas/30 hidden md:block">
            <div className="h-8 bg-border-soft rounded-md w-full"></div>
            <div className="h-8 bg-border-soft rounded-md w-3/4"></div>
            <div className="h-8 bg-border-soft rounded-md w-5/6"></div>
            <div className="h-8 bg-border-soft rounded-md w-full"></div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-6 md:p-8 bg-canvas/20">
            <div className="h-8 w-64 bg-ink/10 rounded-md mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-surface border border-border rounded-xl shadow-sm p-4">
                <div className="h-4 w-24 bg-border rounded mb-4"></div>
                <div className="h-12 w-12 bg-amber-bg rounded-full"></div>
              </div>
              <div className="h-32 bg-surface border border-border rounded-xl shadow-sm p-4">
                <div className="h-4 w-24 bg-border rounded mb-4"></div>
                <div className="h-12 w-12 bg-sage-bg rounded-full"></div>
              </div>
              <div className="h-32 bg-surface border border-border rounded-xl shadow-sm p-4 hidden md:block">
                <div className="h-4 w-24 bg-border rounded mb-4"></div>
                <div className="h-12 w-12 bg-info/20 rounded-full"></div>
              </div>
            </div>
            
            <div className="mt-6 h-48 bg-surface border border-border rounded-xl shadow-sm"></div>
          </div>
        </div>

        {/* CSS Hands Illusion (Gradient overlay at the edges) */}
        <div className="absolute top-1/2 -left-4 w-12 h-32 bg-gradient-to-r from-black/5 to-transparent -translate-y-1/2 rounded-r-full blur-xl hidden md:block pointer-events-none"></div>
        <div className="absolute top-1/2 -right-4 w-12 h-32 bg-gradient-to-l from-black/5 to-transparent -translate-y-1/2 rounded-l-full blur-xl hidden md:block pointer-events-none"></div>
      </div>
    </div>
  );
}
