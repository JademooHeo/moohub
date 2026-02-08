'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import useThemeStore from '@/stores/useThemeStore';

const navItems = [
  { label: '홈', href: '/', icon: '🏠' },
  { label: '캘린더', href: '/calendar', icon: '📅' },
  { label: '메모', href: '/memo', icon: '📝' },
  { label: '블로그', href: '/blog', icon: '✍️' },
  { label: '즐겨찾기', href: '/bookmarks', icon: '⭐' },
];

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const { data: session } = useSession();

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            MooHub
          </span>
        </Link>
        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                    : 'text-gray-500 hover:bg-white/40 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                <span className="hidden sm:inline mr-1">{item.icon}</span>
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-indigo-500" />
                )}
              </Link>
            );
          })}
          <div className="mx-2 h-5 w-px bg-gray-200 dark:bg-gray-700/50" />
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2 text-gray-500 transition-all duration-200 hover:bg-white/40 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="테마 전환"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 006.002-2.082A9.718 9.718 0 0021.752 15.002z" />
              </svg>
            )}
          </button>
          {/* Google 로그인/로그아웃 */}
          {session ? (
            <button
              onClick={() => signOut()}
              className="ml-1 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-all duration-200 hover:bg-white/40 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              {session.user?.image && (
                <img
                  src={session.user.image}
                  className="h-5 w-5 rounded-full"
                  alt=""
                />
              )}
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="glass-btn ml-1 rounded-xl px-3 py-1.5 text-xs font-medium text-white"
            >
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
