import './globals.css';
import type { Metadata } from 'next';
import { BottomNav } from '@/components/bottom-nav';
import { Toaster } from '@/components/ui/sonner';
import { PWARegister } from '@/components/pwa-register';

export const metadata: Metadata = {
  title: 'Conbini Rater - Rate Your Favorite Convenience Store Foods',
  description: 'Discover, rate, and review convenience store foods from Japan. Track your favorites from 7-Eleven, FamilyMart, Lawson, and more.',
  manifest: '/manifest.json',
  themeColor: '#10b981',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Conbini Rater',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-sans antialiased bg-gray-50">
        <PWARegister />
        <div className="pb-16 min-h-screen">
          {children}
        </div>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
