// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  Home, 
  Users, 
  DollarSign, 
  LogOut
} from 'lucide-react';
import { NavigationItem } from '@/types/navigation';
import MobileMenu from './MobileMenu';

export default function Navbar() {
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/team', label: 'Create Team', icon: Users },
    { href: '/transfers', label: 'Transfer Market', icon: DollarSign },
  ];

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto">
        <div className="flex justify-between items-center h-16 px-4">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Football Manager
            </Link>
          </div>

          <nav className="hidden md:flex space-x-4">
            {navigationItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${pathname === href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => signOut({ callbackUrl: '/auth' })}
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
      <div className="md:hidden">
        <MobileMenu navigationItems={navigationItems} />
      </div>
    </div>
  );
}