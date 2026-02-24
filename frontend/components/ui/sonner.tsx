'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  CircleXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5 text-primary" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-400" />,
        error: <CircleXIcon className="size-5 text-red-700" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover-notif)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--primary)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
