'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getSemesterName } from '@/lib/utils/validators';
import { useAuth } from '@/context/AuthContext';
import { canManageSubjects } from '@/lib/utils/roleCheck';
import { Button } from '@/components/ui/Button';

export default function SemestersPage() {
  const { user } = useAuth();
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-16 pb-24">
      {/* Premium Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="max-w-2xl">
          
          <h1 className="text-5xl font-black text-slate-900 mb-6  leading-none uppercase">
            Semesters
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">
            A structured repository of knowledge, organized by academic progression. Navigate through your curriculum with precision.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-6">
          {user && canManageSubjects(user.role) && (
            <Link href="/admin/subjects/new">
              <Button variant="primary" className="rounded-2xl font-black uppercase text-xs tracking-widest px-10 py-7 shadow-2xl shadow-indigo-600/20">
                + Subject
              </Button>
            </Link>
          )}
          
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {semesters.map((semester) => (
          <Link key={semester} href={`/semesters/${semester}`} className="group">
            <Card className="h-full border-none shadow-indigo-100/50 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col p-8 bg-white relative overflow-hidden">
              {/* Background Accent Number */}
              <h1 className="text-2xl font-black text-slate-900 mb-6  leading-none ">Semester {semester}</h1>
              

             

             

              <div className="mt-auto pt-6 border-t border-slate-50 group-hover:border-indigo-50 transition-colors flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">View Resources</span>
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-400">
                  <span className="text-xs font-bold">→</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
