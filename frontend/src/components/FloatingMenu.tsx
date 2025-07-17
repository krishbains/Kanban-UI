import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { useEffect, useState } from "react";
import {
  IconHome,
  IconHandStop,
  IconBrush,
  IconZoomIn,
} from "@tabler/icons-react";

export function FloatingMenu({ moveMode, setMoveMode, colorMode, setColorMode }: { moveMode: boolean; setMoveMode: (v: boolean) => void; colorMode: boolean; setColorMode: (v: boolean) => void }) {
  const [activeTitle, setActiveTitle] = React.useState<string | null>(null);
  const handleToggle = (title: string) => {
    if (moveMode && title !== 'Move') return; // block toggling others in move mode
    if (title === 'Move') {
      setMoveMode(!moveMode);
      if (moveMode) setActiveTitle(null);
      else setActiveTitle('Move');
    } else if (title === 'Brush') {
      setColorMode(!colorMode);
      setActiveTitle(!colorMode ? 'Brush' : null);
    } else {
      setActiveTitle(activeTitle === title ? null : title);
    }
  };
  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className={`h-full w-full ${activeTitle === 'Home' ? 'text-neutral-700 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-300'}`} />
      ),
      href: "#",
      selected: activeTitle === 'Home',
      onClick: () => handleToggle('Home'),
      disabled: moveMode,
    },
    {
      title: "Move",
      icon: (
        <IconHandStop className={`h-full w-full ${moveMode ? 'text-neutral-700 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-300'}`} />
      ),
      href: "#",
      selected: moveMode,
      onClick: () => handleToggle('Move'),
    },
    {
      title: "Brush",
      icon: (
        <IconBrush className={`h-full w-full ${colorMode ? 'text-neutral-700 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-300'}`} />
      ),
      href: "#",
      selected: colorMode,
      onClick: () => handleToggle('Brush'),
      disabled: moveMode,
    },
    {
      title: "Zoom",
      icon: (
        <IconZoomIn className={`h-full w-full ${activeTitle === 'Components' ? 'text-neutral-700 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-300'}`} />
      ),
      href: "#",
      selected: activeTitle === 'Components',
      onClick: () => handleToggle('Components'),
      disabled: moveMode,
    },
    {
      title: "Aceternity UI",
      icon: (
        <img
          src="https://assets.aceternity.com/logo-dark.png"
          width={20}
          height={20}
          alt="Aceternity Logo"
          style={{ filter: activeTitle === 'Aceternity UI' ? 'brightness(0.7)' : 'none' }}
        />
      ),
      href: "#",
      selected: activeTitle === 'Aceternity UI',
      onClick: () => handleToggle('Aceternity UI'),
      disabled: moveMode,
    }
  ];
  // Always use desktop dock, but smaller on mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 430);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return (
    <div className="flex items-center justify-center pointer-events-auto">
      <FloatingDock
        desktopClassName={isMobile ? "h-12 gap-2 px-2 pb-1" : "h-16 gap-4 px-4 pb-3"}
        items={links.map(link => ({
          ...link,
          icon: (
            <span className={isMobile ? "w-4 h-4" : "w-6 h-6"}>{link.icon}</span>
          )
        }))}
      />
    </div>
  );
}
