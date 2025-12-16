import { useEffect } from 'react';
import { PanelContainer } from '@/components/panels/PanelContainer';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  if (isMobile) {
    return isOpen ? (
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-hidden="true"
        />

        {/* Sliding sidebar */}
        <aside
          id="sidebar"
          className="fixed top-14 right-0 bottom-0 w-full max-w-sm bg-zinc-950 border-l border-zinc-800 z-50 overflow-y-auto animate-in slide-in-from-right"
          role="complementary"
          aria-label="Side panel"
        >
          <div className="p-4 sm:p-6">
            <PanelContainer isMobile={isMobile} />
          </div>
        </aside>
      </>
    ) : null;
  }

  // Desktop sidebar (always visible)
  return (
    <aside
      id="sidebar"
      className="overflow-y-auto bg-zinc-950 border-l border-zinc-800 lg:row-span-2"
      role="complementary"
      aria-label="Side panel"
    >
      <div className="p-6">
        <PanelContainer isMobile={false} />
      </div>
    </aside>
  );
}
