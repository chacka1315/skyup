import type { Metadata } from 'next';
import { inter } from '../lib/font';
import './globals.css';
import QueryProvider from './query-provider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'SkyUp',
  description: 'Skyup social media',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased overflow-hidden`}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster id="global" />
        <Toaster id="post-stuff" position="top-center" />
      </body>
    </html>
  );
}
