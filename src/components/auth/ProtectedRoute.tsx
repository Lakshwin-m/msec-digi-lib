'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { hasRole } from '@/lib/utils/roleCheck';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (requiredRoles && !hasRole(user.role, requiredRoles)) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, requiredRoles]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Verifying credentials...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRoles && !hasRole(user.role, requiredRoles)) {
    return null;
  }

  return <>{children}</>;
};
