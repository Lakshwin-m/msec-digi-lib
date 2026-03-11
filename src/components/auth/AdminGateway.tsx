'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function AdminGateway() {
  const [passcode, setPasscode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const correctPasscode = process.env.NEXT_PUBLIC_ADMIN_PASSPHRASE || 'msec-admin-2024';

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === correctPasscode) {
      setIsVerified(true);
      setError('');
    } else {
      setError('Incorrect Administrator Passcode.');
    }
  };

  if (!isVerified) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto shadow-xl shadow-indigo-200">
            🔐
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Admin Gateway</h2>
          <p className="text-slate-500 text-sm font-medium mt-2">Enter the institutional secret to proceed.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            label="Base Password"
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="••••••••"
            required
          />
          {error && <p className="text-rose-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
          <Button type="submit" variant="primary" className="w-full">
            Verify Identity
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Admin Access</h2>
          <p className="text-slate-500 text-sm font-medium">Authentication authorized via base password.</p>
        </div>
        <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
          <button
            onClick={() => setMode('login')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              mode === 'login' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              mode === 'register' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400'
            }`}
          >
            Create Admin
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl">
        {mode === 'login' ? (
          <LoginForm forceAdmin={true} />
        ) : (
          <RegisterForm forceRole="admin" />
        )}
      </div>
      
      <button 
        onClick={() => setIsVerified(false)}
        className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-500 transition-colors mx-auto block"
      >
        ← Reset Session
      </button>
    </div>
  );
}
