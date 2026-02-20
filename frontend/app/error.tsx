'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <h2 className="text-center mb-2">Something went wrong!</h2>
      <Button onClick={() => reset()}> Try again</Button>
    </main>
  );
}
