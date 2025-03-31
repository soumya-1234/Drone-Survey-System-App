"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:bg-gray-100';
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-600">
                Drone Survey System
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {/* Mission Management */}
              <Link
                href="/missions"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/missions')}`}
              >
                Missions
              </Link>

              {/* Fleet Management */}
              <Link
                href="/fleet"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/fleet')}`}
              >
                Fleet
              </Link>

              {/* Mission Monitoring */}
              <Link
                href="/monitoring"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/monitoring')}`}
              >
                Monitoring
              </Link>

              {/* Survey Reports */}
              <Link
                href="/reports"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/reports')}`}
              >
                Reports
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/missions"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/missions')}`}
          >
            Missions
          </Link>

          <Link
            href="/fleet"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/fleet')}`}
          >
            Fleet
          </Link>

          <Link
            href="/monitoring"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/monitoring')}`}
          >
            Monitoring
          </Link>

          <Link
            href="/reports"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/reports')}`}
          >
            Reports
          </Link>
        </div>
      </div>
    </nav>
  );
}
