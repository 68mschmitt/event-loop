import { Toolbar } from './Toolbar';
import { Canvas } from './Canvas';
import { Sidebar } from './Sidebar';
import { Timeline } from './Timeline';

export function AppLayout() {
  return (
    <div className="h-screen w-screen grid grid-rows-[auto_1fr_auto] grid-cols-1 lg:grid-cols-[1fr_400px]">
      {/* Toolbar spans full width */}
      <header className="col-span-full">
        <Toolbar />
      </header>
      
      {/* Canvas - main visualization area */}
      <main className="overflow-auto bg-zinc-900">
        <Canvas />
      </main>
      
      {/* Sidebar - panels on the right (or bottom on mobile) */}
      <aside className="overflow-auto bg-zinc-950 border-l border-zinc-800 lg:row-span-2">
        <Sidebar />
      </aside>
      
      {/* Timeline at bottom */}
      <footer className="col-span-full border-t border-zinc-800">
        <Timeline />
      </footer>
    </div>
  );
}
