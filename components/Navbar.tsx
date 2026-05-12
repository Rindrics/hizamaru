'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { logout } from '@/app/actions/auth';

export default function Navbar({ user }: { user: User | null }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-black">
            hizamaru
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <Link
                  href="/life-plans"
                  className="text-sm text-gray-700 hover:text-primary"
                >
                  ライフプラン
                </Link>
                <Link
                  href="/family"
                  className="text-sm text-gray-700 hover:text-primary"
                >
                  家族
                </Link>
                <Link
                  href="/budget"
                  className="text-sm text-gray-700 hover:text-primary"
                >
                  家計簿
                </Link>
              </>
            )}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-sm text-gray-700 hover:text-primary"
                >
                  {user.email}
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-4">
                      <form action={logout} className="w-full">
                        <button
                          type="submit"
                          className="w-full px-4 py-2 text-sm font-medium text-primary-text bg-primary rounded-lg hover:bg-primary-hover"
                        >
                          ログアウト
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
