'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface HeaderProps {
  user: {
    name?: string | null;
    role: string;
  };
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const normalizedRole = user.role?.toUpperCase() || '';
  const isAdmin = normalizedRole === 'ADMIN';

  const navItems = [
    { label: 'Visão Geral', href: '/dashboard', show: true },
    { label: 'Financeiro', href: '/dashboard/financial', show: isAdmin || normalizedRole === 'FINANCIAL' },
    { label: 'Comercial', href: '/dashboard/commercial', show: isAdmin || normalizedRole === 'COMMERCIAL' },
    { label: 'Jurídico', href: '/dashboard/legal', show: isAdmin || normalizedRole === 'LEGAL' },
    { label: 'Usuários', href: '/dashboard/users', show: isAdmin },
  ];

  const visibleNavItems = navItems.filter((item) => item.show);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            E
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">EBRAMEV</span>
        </div>

        {/* Navegação Central - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Perfil e Sair - Desktop */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.name || 'Usuário'}</p>
            <p className="text-xs text-gray-500 capitalize">{normalizedRole.toLowerCase()}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 font-medium"
          >
            Sair
          </button>
        </div>

        {/* Menu Mobile Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <nav className="px-4 py-2 space-y-1">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 mt-2 border-t border-gray-200">
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-gray-900">{user.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500 capitalize">{normalizedRole.toLowerCase()}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 font-medium"
              >
                Sair
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
