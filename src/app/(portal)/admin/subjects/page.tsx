'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { getAllSubjects, deleteSubject } from '@/lib/firebase/firestore';
import { Subject } from '@/lib/types';
import { Button } from '@/components/ui/Button';

export default function ManageSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    try {
      const data = await getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you absolutely sure? This action cannot be reversed and all associated resources may lose their target Subject entity.')) {
      try {
        await deleteSubject(id);
        setSubjects(subjects.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Deletion failure: Verify administrative permissions.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing subject archive...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="relative">
          <div className="absolute -left-12 -top-12 text-[160px] font-black text-slate-50 pointer-events-none uppercase italic">
            MGMT
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-indigo-100">
              <span>Admin Terminal</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              Subject <br/><span className="text-indigo-600">Inventory</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed mt-6 max-w-2xl">
              Centralized interface for auditing, modifying, or pruning the academic curriculum database.
            </p>
          </div>
        </div>
        <Link href="/admin/subjects/new">
          <Button variant="primary" className="rounded-2xl font-black uppercase text-xs tracking-widest px-10 py-8 shadow-2xl shadow-indigo-600/20">
            + New Subject
          </Button>
        </Link>
      </div>

      {/* Directory Table style list */}
      <div className="space-y-4">
        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <div className="col-span-1">Sem</div>
          <div className="col-span-2">Code</div>
          <div className="col-span-5">Subject Name</div>
          <div className="col-span-2">Department</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="space-y-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="border-none shadow-indigo-100/30 overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
              <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="col-span-1">
                  <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs italic">
                    {subject.semester}
                  </span>
                </div>
                <div className="col-span-2">
                  <div className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded border border-indigo-100">
                    {subject.code}
                  </div>
                </div>
                <div className="col-span-5">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                    {subject.name}
                  </h3>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {subject.department}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end items-center space-x-3">
                  <Link href={`/admin/subjects/edit/${subject.id}`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 uppercase text-[10px] font-black tracking-widest">
                      Audit
                    </Button>
                  </Link>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="p-3 text-slate-300 hover:text-rose-600 transition-colors"
                    title="Delete Subject"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
