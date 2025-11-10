'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ScanLine, Compass, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/scan', icon: ScanLine, label: 'Scan' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/rewards', icon: Wallet, label: 'Rewards' },
  { href: '/profile', icon: User, label: 'Profile' }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-emerald-500' : 'text-gray-500'
              )}
              aria-label={label}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
