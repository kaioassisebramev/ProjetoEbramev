'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  role: string;
  userName: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [];

  // Menu baseado na role
  const normalizedRole = role?.toUpperCase() || '';
  
  if (normalizedRole === 'ADMIN') {
    menuItems.push(
      { href: '/dashboard', label: 'Visão Geral', icon: '📊' },
      { href: '/dashboard/financial', label: 'Financeiro', icon: '💰' },
      { href: '/dashboard/commercial', label: 'Comercial', icon: '📈' },
      { href: '/dashboard/legal', label: 'Jurídico', icon: '⚖️' },
      { href: '/dashboard/users', label: 'Usuários', icon: '👥' }
    );
  } else if (normalizedRole === 'COMMERCIAL') {
    menuItems.push(
      { href: '/dashboard', label: 'Visão Geral', icon: '📊' },
      { href: '/dashboard/commercial', label: 'Comercial', icon: '📈' }
    );
  } else if (normalizedRole === 'FINANCIAL') {
    menuItems.push(
      { href: '/dashboard', label: 'Visão Geral', icon: '📊' },
      { href: '/dashboard/financial', label: 'Financeiro', icon: '💰' }
    );
  } else if (normalizedRole === 'LEGAL') {
    menuItems.push(
      { href: '/dashboard', label: 'Visão Geral', icon: '📊' },
      { href: '/dashboard/legal', label: 'Jurídico', icon: '⚖️' }
    );
  } else {
    // ADMINISTRATIVE ou outros
    menuItems.push(
      { href: '/dashboard', label: 'Visão Geral', icon: '📊' }
    );
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-white">Projeto4</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`${
                          isActive
                            ? 'bg-indigo-700 text-white'
                            : 'text-indigo-200 hover:text-white hover:bg-indigo-700'
                        } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <div className="text-xs font-semibold leading-6 text-indigo-200">
                {userName}
              </div>
              <button
                onClick={handleLogout}
                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white w-full"
              >
                <span className="text-lg">🚪</span>
                Sair
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
