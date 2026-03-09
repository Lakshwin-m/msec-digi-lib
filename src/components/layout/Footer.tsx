import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="col-span-1 md:col-span-2 space-y-6">
            
             <Image src="/logo.png" alt="Academic Library" width={104} height={104} />
          
              <span className="text-xl font-bold text-white tracking-tight pt-10">MSEC Digital Library</span>
            
            <p className="max-w-md text-sm leading-relaxed">
              A comprehensive digital ecosystem providing high-quality academic resources, previous year question papers, and technology tracking tools for students and faculty.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Portal</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/semesters" className="hover:text-white transition-colors">Semester Hub</Link></li>
              <li><Link href="/preparation" className="hover:text-white transition-colors">Preparation</Link></li>
              <li><Link href="/trends" className="hover:text-white transition-colors">Trends</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">Events</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/requests/new" className="hover:text-white transition-colors">Request Resource</Link></li>
              <li><Link href="/requests" className="hover:text-white transition-colors">My Requests</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-[10px] font-bold uppercase tracking-[0.2em]">
          <p>© {currentYear} {process.env.NEXT_PUBLIC_APP_NAME || 'Academic Library'}. All rights reserved.</p>
          <div className="flex space-x-8">
            <span className="text-slate-600">Built for Excellence</span>
            <span className="text-slate-600">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
