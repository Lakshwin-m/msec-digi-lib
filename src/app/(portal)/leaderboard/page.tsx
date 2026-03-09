'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getLeaderboard } from '@/lib/firebase/firestore';
import { User } from '@/lib/types';
import { calculateLevel, XP_PER_LEVEL } from '@/lib/utils/gamification';
import Link from 'next/link';

export default function LeaderboardPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullLeaderboard = async () => {
      try {
        const topUsers = await getLeaderboard(50); // Fetch top 50
        setLeaderboard(topUsers);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFullLeaderboard();
  }, []);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Computing rankings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-12">
        <div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8] mb-4">
            Leaderboard
          </h1>
          <p className="text-xl text-slate-500 font-medium">The elite learners of the Academic Library</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px] px-8 py-5">
            ← Back to Hub
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span className="w-12">Rank</span>
            <span className="flex-1">Student Node</span>
            <span className="w-24 text-center">Level</span>
            <span className="w-32 text-right">XP Points</span>
          </div>

          <div className="space-y-3">
            {leaderboard.map((user, index) => {
              const isCurrentUser = user.uid === currentUser?.uid;
              const rank = index + 1;
              const level = calculateLevel(user.points);

              return (
                <div 
                  key={user.uid}
                  className={`group flex items-center p-6 rounded-3xl transition-all border ${
                    isCurrentUser 
                      ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-200' 
                      : 'bg-white border-slate-100 hover:border-indigo-100'
                  }`}
                >
                  <div className={`w-12 text-2xl font-black ${isCurrentUser ? 'text-white/50' : 'text-slate-200'}`}>
                    {rank < 10 ? `0${rank}` : rank}
                  </div>
                  
                  <div className="flex-1 flex items-center space-x-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${
                      isCurrentUser ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`text-lg font-black uppercase tracking-tight ${isCurrentUser ? 'text-white' : 'text-slate-900'}`}>
                        {user.name}
                        {isCurrentUser && <span className="ml-3 text-[8px] bg-white/20 px-2 py-0.5 rounded text-white tracking-widest uppercase">You</span>}
                      </h3>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isCurrentUser ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {user.department}
                      </p>
                    </div>
                  </div>

                  <div className="w-24 text-center">
                    <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      isCurrentUser ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      LVL {level}
                    </div>
                  </div>

                  <div className="w-32 text-right">
                    <div className={`text-xl font-black ${isCurrentUser ? 'text-white' : 'text-slate-900'}`}>
                      {user.points || 0}
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${isCurrentUser ? 'text-white/50' : 'text-slate-400'}`}>
                      XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        
      </div>
    </div>
  );
}
