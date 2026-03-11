'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getPendingRequests, getAllSubjects, getLeaderboard, updateUserStreak, getCertificatesByStatus, migrateSubjectsDepartment } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/lib/types';
import { calculateLevel, calculateLevelProgress, getXPForNextLevel } from '@/lib/utils/gamification';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [systemStats, setSystemStats] = useState({ totalPoints: 0, avgStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [pendingCerts, setPendingCerts] = useState(0);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const dept = user?.department;
        const [pending, subjects, topUsers, topCerts] = await Promise.all([
          getPendingRequests(dept),
          getAllSubjects(dept),
          getLeaderboard(50), 
          getCertificatesByStatus('pending', dept)
        ]);
        setPendingCount(pending.length);
        setSubjectCount(subjects.length);
        setLeaderboard(topUsers.slice(0, 5));
        setPendingCerts(topCerts.length);
        
        const totalPoints = topUsers.reduce((acc: number, curr: User) => acc + (curr.points || 0), 0);
        const avgStreak = topUsers.length > 0 ? topUsers.reduce((acc: number, curr: User) => acc + (curr.streak || 0), 0) / topUsers.length : 0;
        setSystemStats({ totalPoints, avgStreak: Math.round(avgStreak) });
        
        if (user?.uid) {
          updateUserStreak(user.uid).catch(console.error);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchAdminData();
    }
  }, [user?.uid, authLoading]);

  const handleMigration = async () => {
    if (!confirm('This will update all Semester 6 subjects with empty departments to "CSE". Proceed?')) return;
    
    setMigrating(true);
    setMigrationResult(null);
    try {
      const updatedCount = await migrateSubjectsDepartment();
      setMigrationResult(`Success: Updated ${updatedCount} subjects.`);
      // Refresh subject count
      const subjects = await getAllSubjects();
      setSubjectCount(subjects.length);
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationResult('Error: Migration failed.');
    } finally {
      setMigrating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Command Center...</p>
      </div>
    );
  }

  const quickActions = [
    { title: 'Subjects', desc: 'Curate the curriculum', href: '/admin-panel/subjects', initial: 'S', color: 'indigo' },
    { title: 'Resources', desc: 'Manage Drive links', href: '/admin-panel/resources', initial: 'R', color: 'emerald' },
    { title: 'Approvals', desc: 'Process student needs', href: '/admin-panel/requests', initial: 'A', color: 'amber' },
    { title: 'Certifications', desc: 'Verify industry credentials', href: '/admin-panel/certifications', initial: 'C', color: 'emerald' },
    { title: 'Preparation', desc: 'Gate & Study Hub', href: '/admin-panel/preparation', initial: 'P', color: 'rose' },
    { title: 'Trends', desc: 'Latest Tech Shifts', href: '/trends', initial: 'T', color: 'slate' },
    { title: 'Semesters', href: '/semesters', initial: 'M', color: 'indigo' }
  ];

  return (
    <div className="space-y-16 pb-32">
      {/* Premium Admin Header */}
      <section className="relative overflow-hidden rounded-[4rem] p-12 md:p-20 bg-slate-900 text-white shadow-3xl shadow-slate-900/40">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 -mr-72 -mt-72 rounded-full blur-[120px]"></div>
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-5 py-2 rounded-2xl border border-indigo-500/30">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Department: {user?.department || 'Global'}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 uppercase italic">
            Admin Panel
          </h1>
          <p className="text-3xl text-slate-400 font-medium leading-relaxed max-w-xl">
            Hello, Administrator <span className="text-white font-black">{user?.name}</span>. 
          </p>
        </div>
      </section>

      {/* Departmental Stats Grid */}
      <section className="space-y-8">
        <div className="flex items-center space-x-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">
            {user?.department || 'Global'} Command Metrics
          </h2>
          <div className="h-px w-full bg-slate-100"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 flex flex-col justify-between group hover:border-indigo-100 transition-all shadow-xl shadow-slate-100/50">
          <div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black mb-10 group-hover:scale-110 transition-transform">#</div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Academic Subjects</h3>
            <div className="text-5xl font-black text-slate-900 tracking-tighter italic">{subjectCount}</div>
          </div>
          <Link href="/admin-panel/subjects" className="mt-10 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Open Archive →</Link>
        </div>

        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 flex flex-col justify-between group hover:border-amber-100 transition-all shadow-xl shadow-slate-100/50">
          <div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-black mb-10 group-hover:scale-110 transition-transform">!</div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Pending Review</h3>
            <div className="text-5xl font-black text-slate-900 tracking-tighter italic">{pendingCount}</div>
          </div>
          <Link href="/admin-panel/requests" className="mt-10 text-[10px] font-black text-amber-600 uppercase tracking-widest">Adjudicate Now →</Link>
        </div>

        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 flex flex-col justify-between group hover:border-emerald-100 transition-all shadow-xl shadow-slate-100/50">
          <div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-black mb-10 group-hover:scale-110 transition-transform">🎓</div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Pending Certs</h3>
            <div className="text-5xl font-black text-slate-900 tracking-tighter italic">{pendingCerts}</div>
          </div>
          <Link href="/admin-panel/certifications" className="mt-10 text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verify Nodes →</Link>
        </div>

        <Card className="border-none shadow-xl shadow-slate-100/50 bg-white rounded-[3rem] overflow-hidden">
           <CardHeader className="p-10 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-black uppercase text-slate-800 tracking-widest">Student Ranks</CardTitle>
                <Link href="/leaderboard" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</Link>
              </div>
           </CardHeader>
           <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                 {leaderboard.map((student, i) => (
                    <div key={student.uid} className="px-10 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                       <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                            i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{student.name}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Level {calculateLevel(student.points)}</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-sm font-black text-indigo-600">{student.points}</div>
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">XP POINTS</div>
                       </div>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>
        </div>
      </section>

      {/* Control Nodes */}
      <section className="space-y-10">
        <div className="flex items-center space-x-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">
            System Control Nodes
          </h2>
          <div className="h-px w-full bg-slate-100"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {quickActions.map((action) => (
             <Link key={action.href} href={action.href}>
               <Card hover className="h-full border-none shadow-xl shadow-slate-200/40 group p-2 rounded-[2.5rem]">
                 <div className="p-8 h-full flex flex-col justify-between">
                    <div>
                     
                      <h3 className="text-xl font-black uppercase tracking-tight mb-3 group-hover:text-indigo-600 transition-colors">{action.title}</h3>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">{action.desc || 'System interface node'}</p>
                    </div>
                    <div className="mt-10 pt-6 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors flex justify-between items-center">
                      View
                      <span className="text-lg">→</span>
                    </div>
                 </div>
               </Card>
             </Link>
           ))}
        </div>
      </section>

     
    </div>
  );
}
