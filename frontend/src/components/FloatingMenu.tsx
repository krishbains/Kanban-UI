import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconHome,
  IconNewSection,
  IconHandStop,
  IconBrush,
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
      title: "Components",
      icon: (
        <IconNewSection className={`h-full w-full ${activeTitle === 'Components' ? 'text-neutral-700 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-300'}`} />
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
  return (
    <div className="flex items-center justify-center pointer-events-auto">
      <FloatingDock
        mobileClassName="translate-y-20" // only for demo, remove for production
        items={links}
      />
    </div>
  );
}
