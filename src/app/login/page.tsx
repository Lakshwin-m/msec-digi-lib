'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
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
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* Visual Side (LHS) */}
      <div className="hidden lg:flex lg:w-1/2 bg-teal-800 p-16 flex-col justify-between text-white relative overflow-hidden">
        <div className="z-10">
          <Image src="/logo.png" alt="Logo" width={100} height={100} />
          <div className="text-3xl font-extrabold tracking-tighter flex pt-3 items-center space-x-3 mb-12">
          
              MSEC Digital Library
            

          </div>
          
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Everything you need for your Academic Excellence.
          </h2>
          <p className="text-xl text-indigo-100 max-w-md leading-relaxed">
            Access previous year question papers, study materials, and the latest global trends all in one place.
          </p>
        </div>

        {/* Decorative solid pattern instead of gradients */}
        
      </div>

      {/* Form Side (RHS) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center space-x-2 mb-12">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg font-black">
              M
            </div>
            <span className="text-xl font-bold text-slate-900">Academic Library</span>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight uppercase">MSEC Digital Library</h1>
         
          </div>

          <div className="bg-slate-50/50 p-1 rounded-2xl border border-slate-100">
            <div className="bg-white p-8 rounded-[calc(1rem-2px)] border border-slate-100 shadow-sm">
              <LoginForm />
            </div>
          </div>

        
        </div>
      </div>
    </div>
  );
}
