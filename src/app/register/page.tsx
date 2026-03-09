'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RegisterForm } from '@/components/auth/RegisterForm';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Servers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* Visual Side (LHS) */}
      <div className="hidden lg:flex lg:w-1/3 bg-indigo-900 p-16 flex-col justify-between text-white relative overflow-hidden">
        <div className="z-10">
          <div className="text-3xl font-extrabold tracking-tighter flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-white text-indigo-900 rounded-xl flex items-center justify-center font-black">M</div>
            <span>MSEC Archive</span>
          </div>
          
          <h2 className="text-5xl font-black leading-tight mb-8 uppercase tracking-tighter">
            Join the <span className="text-indigo-400 underline decoration-indigo-500 underline-offset-8">Academic</span> Vanguard.
          </h2>
          <p className="text-xl text-indigo-200/80 max-w-sm font-medium leading-relaxed">
            Register your institutional identity to unlock the full potential of our digital library and gamified learning engine.
          </p>
        </div>

        <div className="z-10 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center font-bold text-xl">🚀</div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-indigo-300">Live Status</div>
              <div className="text-lg font-bold">Registration Active</div>
            </div>
          </div>
        </div>

        {/* Decorative solid pattern */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-800 opacity-20 -mr-20 -mb-20 rounded-full"></div>
      </div>

      {/* Form Side (RHS) */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-slate-50/30">
        <div className="w-full max-w-2xl">
          <div className="mb-12">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-indigo-100">
              <span>Node Initialization</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Create Account</h1>
            <p className="text-slate-500 font-medium">Map your academic details to our decentralized resource archive.</p>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-500/5">
            <RegisterForm />
          </div>

          <p className="mt-8 text-center text-slate-500 font-medium italic">
            Already registered in the archive? <Link href="/login" className="text-indigo-600 font-black uppercase tracking-widest text-xs ml-2 hover:underline">Return to Access Point →</Link>
          </p>

          <footer className="mt-16 text-center text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-50">
            &copy; {new Date().getFullYear()} MSEC DIGITAL ARCHIVE SYSTEM v2.0
          </footer>
        </div>
      </div>
    </div>
  );
}
