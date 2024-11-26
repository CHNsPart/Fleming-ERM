'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/icons';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';

export default function Aside() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useKindeAuth()
  const isAdmin = user?.email === 'projectapplied02@gmail.com'

  const navItems = [
    ...(isAdmin ? [
      { href: '/dashboard', label: 'Dashboard', icon: Icons.dashboard },
      { href: '/dashboard/equipment-types', label: 'Manage Equipment', icon: Icons.settings },
      { href: '/analytics', label: 'Analytics', icon: Icons.barChart },
      { href: '/equipment-return', label: 'Equipment Return', icon: Icons.archive }
    ] : []),
    { href: '/all-equipments', label: 'All Equipments', icon: Icons.package },
    { href: '/request-form', label: 'Request Form', icon: Icons.fileBox },
  ];

  if (!isAuthenticated) {
    return (
      <aside className="w-64 bg-white">
        <nav className="mt-6">
          {navItems.filter(item => !item.href.includes('dashboard') && !item.href.includes('analytics')).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 mt-2 text-gray-700 ${
                pathname === item.href ? 'bg-gray-100' : 'hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5 mr-2" />
              {item.href === '/dashboard' ? (
                <span className='text-red-500 hover:translate-x-2 transition-all duration-300'>
                  Sign in to Access
                </span>
              ) : item.label}
            </Link>
          ))}
        </nav>
      </aside>
    )
  }

  return (
    <aside className="w-64 bg-white">
      <nav className="mt-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2 mt-2 text-gray-700 ${
              pathname === item.href ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-5 h-5 mr-2" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}