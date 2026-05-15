'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Toggle } from '@/components/ui/toggle';
import { HugeiconsIcon } from '@hugeicons/react';
import { Sun01Icon, Moon01Icon } from '@hugeicons/core-free-icons';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === 'dark' : false;

  return (
    <Toggle
      variant="outline"
      size="lg"
      className="group relative aspect-square"
      // These attributes will now match the server exactly until mounting completes
      pressed={isDark}
      onPressedChange={(pressed) => setTheme(pressed ? 'dark' : 'light')}
      disabled={!mounted}
    >
      <HugeiconsIcon
        icon={Sun01Icon}
        className="h-8 w-8 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <HugeiconsIcon
        icon={Moon01Icon}
        className="absolute h-8 w-8 rotate-100 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
      <span className="sr-only">Toggle theme</span>
    </Toggle>
  );
}
