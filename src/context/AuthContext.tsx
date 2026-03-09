'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange, getCurrentUser, signOut as firebaseSignOut } from '@/lib/firebase/auth';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Initial fetch
        const initialUser = await getCurrentUser();
        setUser(initialUser);
        
        if (initialUser) {
          // Setup real-time listener for user document (using our mapped Doc ID)
          const { onSnapshot, doc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase/config');
          
          if (unsubscribeFirestore) unsubscribeFirestore();
          
          unsubscribeFirestore = onSnapshot(doc(db, 'users', initialUser.uid), (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUser({
                uid: docSnap.id,
                registerNumber: data.registerNumber,
                email: firebaseUser.email || '',
                name: data.name,
                role: data.role,
                department: data.department,
                dob: data.dob,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                points: data.points || 0,
                streak: data.streak || 0,
                lastActiveDate: data.lastActiveDate?.toDate() || null,
                completedQuizzes: data.completedQuizzes || [],
                completedTests: data.completedTests || [],
                completedCertifications: data.completedCertifications || [],
                weeklyActivity: data.weeklyActivity || [],
              });
            }
          });
        }
      } else {
        if (unsubscribeFirestore) unsubscribeFirestore();
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const signOut = async () => {
    await firebaseSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
