'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/dashboard"
            className="text-gray-500 hover:text-gray-700"
          >
            Home
          </Link>
        </li>
        {paths.map((path, index) => (
          <li key={path} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            <Link
              href={`/${paths.slice(0, index + 1).join('/')}`}
              className={`${
                index === paths.length - 1
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {path.charAt(0).toUpperCase() + path.slice(1)}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}