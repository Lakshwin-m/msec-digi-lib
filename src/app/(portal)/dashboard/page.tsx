'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { isHODOrAdmin } from '@/lib/utils/roleCheck';
import { getLeaderboard, updateUserStreak } from '@/lib/firebase/firestore';
import { User } from '@/lib/types';
import { calculateLevel, calculateLevelProgress, getXPForNextLevel } from '@/lib/utils/gamification';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<User[]>([]);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin' || user.role === 'hod' || user.role === 'faculty') {
        router.push('/admin');
        return;
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    const initGamification = async () => {
      if (user?.uid) {
        // Update streak in background
        updateUserStreak(user.uid).catch(console.error);
        
        // Fetch leaderboard
        try {
          const topUsers = await getLeaderboard(5);
          setLeaderboard(topUsers);
        } catch (error) {
          console.error("Failed to fetch leaderboard", error);
        }
      }
    };

    if (!loading && user) {
      initGamification();
    }
  }, [user?.uid, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing your hub...</p>
      </div>
    );
  }

  const isAdminOrHOD = isHODOrAdmin(user?.role);

  const quickActions = [
    {
      title: 'Browse Semesters',
      description: 'Access subjects and resources from Semester 1 to 8',
      href: '/semesters',
      initial: 'S',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Preparation Hub',
      description: 'Resources for GATE, IELTS, GRE, and professional paths',
      href: '/preparation',
      initial: 'P',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Trends',
      description: 'Stay updated with the latest global trends',
      href: '/trends',
      initial: 'T',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Events',
      description: 'Discover hackathons, symposiums and conferences',
      href: '/events',
      initial: 'E',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Certifications',
      description: 'Sync industry credentials and earn XP points',
      href: '/certifications',
      initial: 'C',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Submit Request',
      description: 'Cannot find what you need? Request a resource here',
      href: '/requests/new',
      initial: 'R',
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'My Requests',
      description: 'Track the status and history of your resource requests',
      href: '/requests',
      initial: 'M',
      color: 'bg-slate-50 text-slate-600',
    },
    {
      title: 'Leaderboard',
      description: 'Check to see who is leading the charts',
      href: '/leaderboard',
      initial: 'L',
      color: 'bg-yellow-50 text-yellow-600',
    },
  ];

  return (
    <div className="space-y-16 pb-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] p-8 md:p-20 bg-slate-50 border border-slate-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 -mr-48 -mt-48 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-3xl">
          
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-none uppercase tracking-tighter">
            Hello, <span className="text-indigo-600">{user?.name?.split(' ')[0]}!</span>
          </h2>
          
          <div className="mb-10 max-w-md">
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest text-[10px]">Level</span>
                <span className="text-3xl font-black text-slate-900">{calculateLevel(user?.points)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">XP Progress</span>
                <span className="text-xs font-bold text-indigo-600">{user?.points || 0} / {(calculateLevel(user?.points)) * 500} XP</span>
              </div>
            </div>
            <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-200 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                style={{ width: `${calculateLevelProgress(user?.points)}%` }}
              ></div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">
              {getXPForNextLevel(user?.points)} XP remaining for level {calculateLevel(user?.points) + 1}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/semesters">
              <Button variant="primary" size="lg" className="rounded-2xl font-black uppercase text-xs tracking-widest px-10 py-7">
                Enter Subject Vault
              </Button>
            </Link>
            {isAdminOrHOD && (
              <Link href="/admin/subjects/new">
                <Button variant="outline" size="lg" className="rounded-2xl font-black uppercase text-xs tracking-widest px-10 py-7 border-slate-200">
                  + Add New Subject
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Admin Quick Control - Highly Visible for Admins */}
      {isAdminOrHOD && (
        <section className="space-y-8">
          <div className="flex items-center space-x-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
              Administrative Command Center
            </h2>
            <div className="h-px w-full bg-slate-100"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/admin/subjects/new">
              <Card hover className="bg-slate-900 border-none group overflow-hidden relative">
                <div className="absolute right-0 bottom-0 text-[120px] font-black italic opacity-5 text-white leading-none pointer-events-none translate-y-8 translate-x-8 uppercase">ADD</div>
                <CardContent className="p-10 relative z-10">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-2xl shadow-indigo-500/50">
                    +
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Add New Subject</h3>
                  <p className="text-slate-400 font-medium leading-relaxed max-w-xs">
                    Initialize a new curriculum subject and synchronize resource links.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/requests">
              <Card hover className="bg-white border-2 border-slate-100 group">
                <CardContent className="p-10">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 font-black text-xl mb-6 border border-amber-100">
                    !
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">Pending Approvals</h3>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-xs">
                    Review and adjudicate incoming student resource requests.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      )}

      {/* Main Grid */}
      <section>
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Quick Navigation</h2>
            <p className="text-slate-500 font-medium mt-1">Direct access nodes for all library services</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card hover className="h-full border-none shadow-indigo-100/30 group p-1">
                <div className="p-8 h-full flex flex-col justify-between">
                  <div>
                    
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-xl font-black uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                        {action.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-slate-500 font-medium leading-relaxed text-sm">
                        {action.description}
                      </p>
                    </CardContent>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
                    Access Resources →
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>


      {/* Gamification & Progress Section */}
      <section className="space-y-8">
        <div className="flex items-center space-x-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
            Your Learning Journey
          </h2>
          <div className="h-px w-full bg-slate-100"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Weekly Activity Graph */}
          {user?.weeklyActivity && user.weeklyActivity.length > 0 ? (
            <Card className="col-span-1 md:col-span-2 border-none shadow-xl shadow-indigo-100/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            
              </div>
              <CardHeader className="p-8 pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">Weekly Focus</CardTitle>
                    <p className="text-slate-500 font-medium mt-2">Activity across Quizzes & Certifications</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-10">
                <div className="h-64 flex items-end justify-between space-x-2 md:space-x-4">
                  {(() => {
                    // 1. Prepare 7 days of labels/dates
                    const days = [];
                    const today = new Date();
                    for (let i = 6; i >= 0; i--) {
                      const d = new Date(today);
                      d.setDate(today.getDate() - i);
                      days.push({
                        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
                        label: d.toLocaleDateString('en-US', { weekday: 'short' })
                      });
                    }

                    // 2. Map existing activity to our 7-day grid
                    const chartData = days.map(day => {
                      const activity = user.weeklyActivity?.find(a => a.date === day.date);
                      return {
                        ...day,
                        xp: (activity as any)?.xp || (activity as any)?.minutes || 0
                      };
                    });
                    
                    const maxXP = Math.max(...chartData.map(a => a.xp), 50);
                    
                    return chartData.map((item, i) => (
                      <div key={i} className="flex flex-col items-center flex-1 group relative">
                        <div 
                          className="w-full bg-slate-100/50 rounded-2xl relative overflow-hidden group-hover:bg-indigo-50 transition-colors duration-300"
                          style={{ height: '200px' }}
                        >
                          {item.xp > 0 && (
                            <div 
                              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-2xl transition-all duration-500 group-hover:to-indigo-500"
                              style={{ height: `${(item.xp / maxXP) * 100}%` }}
                            ></div>
                          )}
                        </div>
                        <span className="text-[10px] uppercase font-black text-slate-400 mt-4 tracking-widest">
                          {item.label}
                        </span>
                        
                        {/* Tooltip */}
                        <div className="absolute -top-12 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none transform translate-y-2 group-hover:translate-y-0 z-10 whitespace-nowrap">
                          {item.xp} XP
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="col-span-1 md:col-span-2 border-none shadow-xl shadow-indigo-100/50 overflow-hidden relative flex flex-col justify-center items-center p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-slate-900">No Activity Yet</h3>
              <p className="text-slate-500 mt-2">Complete quizzes to see your stats here!</p>
            </Card>
          )}

          {/* Gamification Stats */}
          <div className="space-y-8">
            {/* Streak Card */}
            <Card className="bg-gradient-to-br from-orange-400 to-rose-500 border-none text-white overflow-hidden relative shadow-lg shadow-orange-200">
               <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
               <CardContent className="p-8 relative z-10">
                 <div className="flex items-center space-x-4 mb-4">
                   <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl shadow-inner">
                     🔥
                   </div>
                   <div>
                     <div className="text-white/80 text-xs font-bold uppercase tracking-widest">Current Streak</div>
                     <div className="text-3xl font-black text-white">{user?.streak || 0} Days</div>
                   </div>
                 </div>
                 <p className="text-white/90 text-sm font-medium leading-relaxed">
                   {(user?.streak || 0) > 0 ? "Keep it up! Consistency is key." : "Start your streak today by completing a quiz!"}
                 </p>
               </CardContent>
            </Card>

            {/* Leaderboard Mini */}
            <Card className="border-none shadow-xl shadow-slate-100">
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-black uppercase text-slate-800 tracking-tight">Top Learners</CardTitle>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">Top 5</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                  {leaderboard.length > 0 ? leaderboard.map((lbUser, i) => (
                    <div key={lbUser.uid} className="flex items-center p-4 hover:bg-slate-50 transition-colors">
                      <div className={`w-8 h-8 rounded-full ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'} flex items-center justify-center text-xs font-black mr-4`}>
                        {lbUser.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{lbUser.name}</div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">LVL {calculateLevel(lbUser.points)}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{lbUser.points || 0} XP</span>
                        </div>
                      </div>
                      <div className={`text-sm font-black ${i === 0 ? 'text-amber-500' : 'text-slate-300'}`}>
                        #{i + 1}
                      </div>
                    </div>
                  )) : (
                     <div className="p-8 text-center text-slate-500">
                       No leaderboard data yet.
                     </div>
                  )}
                </div>
                <div className="p-4 border-t border-slate-50 text-center">
                  <Link href="/leaderboard" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors">
                    View Full Leaderboard →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        

      </section>

    </div>
  );
}
