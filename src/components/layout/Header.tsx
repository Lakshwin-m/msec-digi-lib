'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { canManageSubjects } from '@/lib/utils/roleCheck';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const isAdmin = user && (user.role === 'admin' || user.role === 'hod' || user.role === 'faculty');

  const studentLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Semesters', href: '/semesters' },
    { name: 'Preparation Hub', href: '/preparation' },
    { name: 'Trends', href: '/trends' },
    { name: 'Events', href: '/events' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  const adminLinks = [
    { name: 'Command Center', href: '/admin' },
    { name: 'Subjects', href: '/admin/subjects' },
    { name: 'Resources', href: '/admin/resources' },
    { name: 'Preparation', href: '/admin/preparation' },
    { name: 'Events', href: '/events' },
    { name: 'Requests', href: '/admin/requests' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  const currentLinks = isAdmin ? adminLinks : studentLinks;

  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-500 ${
      isAdmin ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/80 border-slate-100 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-10">
            <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-3 group">
              <Image src="/logo.png" alt="Logo" width={100} height={100} />
              <div className="hidden lg:block">
                <div className={`text-lg font-bold leading-none ${isAdmin ? 'text-white' : 'text-slate-900'}`}>MSEC DIGITAL LIBRARY</div>
                <div className={`text-xs font-semibold uppercase tracking-widest mt-1 ${isAdmin ? 'text-indigo-400' : 'text-indigo-500'}`}>Portal</div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {currentLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    pathname === link.href
                      ? (isAdmin ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-600')
                      : (isAdmin ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50')
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin/subjects/new">
                  <Button variant="primary" size="sm" className="ml-4 rounded-xl font-black uppercase text-[10px] tracking-widest px-5 shadow-lg shadow-indigo-600/30">
                    + Create
                  </Button>
                </Link>
              )}
            </nav>
          </div>

          {/* User Info and Sign Out */}
          <div className="flex items-center space-x-6">
            {user && (
              <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                <span className={`text-sm font-bold ${isAdmin ? 'text-white' : 'text-slate-900'}`}>{user.name}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isAdmin ? 'text-indigo-400' : 'text-indigo-500'}`}>{user.role}</span>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut} 
              className={`rounded-xl ${isAdmin ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-600'}`}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
