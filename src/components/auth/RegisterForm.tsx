'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpWithDetails, signInWithGoogle } from '@/lib/firebase/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface RegisterFormProps {
  forceRole?: 'student' | 'admin';
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ forceRole }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: '',
    role: forceRole || 'student' as 'student' | 'admin',
    dob: '', // Password
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUpWithDetails(formData);
      router.push(formData.role === 'admin' ? '/admin-panel' : '/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 px-5 py-4 rounded-xl text-sm font-semibold flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@example.com"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Register Number"
          type="text"
          value={formData.registerNumber}
          onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
          placeholder="USN / Reg No"
          required
        />

        <Input
          label="Department"
          type="text"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          placeholder="CSE / IT / ECE"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!forceRole && (
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              Identity Role
            </label>
            <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  formData.role === 'student'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  formData.role === 'admin'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        )}

        <Input
          label="Password (DOB)"
          type="password"
          value={formData.dob}
          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          placeholder="DDMMYYYY"
          required
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs"
        disabled={loading}
      >
        {loading ? 'Processing Node...' : 'Initialize Profile'}
      </Button>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100"></div>
        </div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-center">
          <span className="bg-white px-4 text-slate-400 leading-relaxed max-w-[250px]">
            Institutional Domain Validation Required
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={async () => {
          setError('');
          try {
            await signInWithGoogle(forceRole);
            router.push(forceRole === 'admin' ? '/admin-panel' : '/dashboard');
          } catch (err: any) {
            setError(err.message);
          }
        }}
        className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-slate-50 py-5 rounded-2xl transition-all group"
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-indigo-600">Sync Institutional Google Identity</span>
      </button>
    </form>
  );
};
