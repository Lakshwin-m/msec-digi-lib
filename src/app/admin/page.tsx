'use client';

import AdminGateway from '@/components/auth/AdminGateway';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-indigo-500/5 overflow-hidden flex flex-col md:flex-row">
        {/* Information Side */}
        <div className="md:w-1/3 bg-indigo-900 p-12 text-white flex flex-col justify-between">
          <div>
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
            <div className="text-2xl font-black mb-12">MSEC Digital Library</div>
          
            
          </div>
          
         
        </div>

        {/* Content Side */}
        <div className="md:w-2/3 p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <AdminGateway />
          </div>
        </div>
      </div>
      
      <Link 
        href="/" 
        className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
      >
        ← Return to Public Archive
      </Link>
    </div>
  );
}
