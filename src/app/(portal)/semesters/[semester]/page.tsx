'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { getSubjectsBySemester } from '@/lib/firebase/firestore';
import { Subject } from '@/lib/types';
import { getSemesterName } from '@/lib/utils/validators';
import { Button } from '@/components/ui/Button';

import { useAuth } from '@/context/AuthContext';
import { canManageSubjects } from '@/lib/utils/roleCheck';
import { deleteSubject } from '@/lib/firebase/firestore';
import { DEPARTMENTS } from '@/lib/types';

export default function SemesterDetailPage({
  params,
}: {
  params: Promise<{ semester: string }>;
}) {
  const { semester } = use(params);
  const semesterNum = parseInt(semester);
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const fetchSubjects = async () => {
    try {
      const data = await getSubjectsBySemester(semesterNum);
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [semesterNum]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigation
    if (confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      try {
        await deleteSubject(id);
        fetchSubjects(); // Refresh list
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Failed to delete subject');
      }
    }
  };

  const filteredSubjects = selectedDept === 'ALL' 
    ? subjects 
    : subjects.filter(s => s.department === selectedDept);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing semester vault...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-24">
      {/* Header with Semester Number Indicator */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="relative">
          <div className="absolute -left-12 -top-12 text-[160px] font-black text-slate-50 pointer-events-none uppercase italic">
            {semesterNum}
          </div>
          <div className="relative z-10">
           
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              {getSemesterName(semesterNum)}
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed mt-6 max-w-2xl">
              Precision-curated repository for all subjects within this academic term. Access validated materials per segment.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <Link href="/semesters">
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] px-8 py-6">
              ← Semester Hub
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm">
            <span className="pl-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter:</span>
            <select 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border-none text-xs font-black uppercase tracking-widest text-slate-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
            >
              <option value="ALL">Show All Depts</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredSubjects.length === 0 ? (
        <Card className="border-slate-100 bg-slate-50/50">
          <CardContent className="py-24 text-center">
            <div className="w-16 h-16 bg-white border-2 border-slate-100 text-slate-300 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6">?</div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              {selectedDept === 'ALL' 
                ? 'No subjects archived for this segment.' 
                : `No subjects archived for ${selectedDept} in this semester.`}
            </p>
            <Link href="/requests/new">
              <Button variant="primary" className="mt-8 px-8 rounded-xl">Request Subjects</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
            <Link key={subject.id} href={`/semesters/${semester}/${subject.id}`} className="group relative">
              <Card className="h-full border-none shadow-indigo-100/30 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500 bg-white flex flex-col pt-12">
                
                {/* Admin Actions Overlay */}
                {user && canManageSubjects(user.role) && (
                  <div className="absolute top-4 right-4 z-20 flex space-x-2">
                    <Link href={`/admin/subjects/${subject.id}/edit`}>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                        title="Edit Subject"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </Link>
                    <button 
                      onClick={(e) => handleDelete(e, subject.id)}
                      className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                      title="Delete Subject"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                )}

                <div className="p-8 flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-md border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {subject.code}
                    </div>
                    {subject.department && (
                      <div className="inline-flex items-center px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-md border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        {subject.department}
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight mb-4">
                    {subject.name}
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {subject.description || 'Verified academic resources, question modules, and reference textbooks.'}
                  </p>
                </div>
                <div className="px-8 py-6 border-t border-slate-50 mt-auto flex items-center justify-between group-hover:bg-slate-50/50 transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600">View</span>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-400">
                    <span className="text-sm font-bold">→</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
