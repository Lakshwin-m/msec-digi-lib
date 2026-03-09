'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSubjectById, updateSubject } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { hasRole } from '@/lib/utils/roleCheck';
import { Subject, DEPARTMENTS } from '@/lib/types';

export default function EditSubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [subjectData, setSubjectData] = useState<Partial<Subject>>({
    name: '',
    code: '',
    semester: 1,
    description: '',
    department: '',
    isActive: true
  });

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const data = await getSubjectById(subjectId);
        if (data) {
          setSubjectData({
            name: data.name,
            code: data.code,
            semester: data.semester,
            description: data.description,
            department: data.department,
            isActive: data.isActive
          });
        } else {
          setError('Subject not found');
        }
      } catch (err) {
        console.error('Error fetching subject:', err);
        setError('Failed to load subject data');
      } finally {
        setInitialLoading(false);
      }
    };

    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);

  if (authLoading || initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing subject protocols...</p>
      </div>
    );
  }

  const canAccess = hasRole(user?.role, ['hod', 'admin']);

  if (!canAccess) {
    return (
      <div className="py-24 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-300 text-xl font-bold">!</div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] leading-loose max-w-sm mx-auto">
          Administrative access node not recognized. <br/>
          Contact system architect for higher-level privileges.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user) {
      setError('Session expired. Please re-authenticate.');
      setLoading(false);
      return;
    }

    try {
      await updateSubject(subjectId, subjectData);
      router.push(`/semesters/${subjectData.semester}/${subjectId}`);
    } catch (err: any) {
      console.error('Error updating subject:', err);
      setError(err.message || 'Failed to update subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="relative">
          <div className="absolute -left-12 -top-12 text-[160px] font-black text-slate-50 pointer-events-none uppercase italic">
            EDIT
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-amber-100">
              <span>Admin Terminal</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              Modify <br/><span className="text-amber-500">Subject Data</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed mt-6 max-w-2xl">
              Update core subject parameters and classification.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Subject Information */}
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs italic">01</div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Subject Core Data</h2>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-indigo-100/50 p-8">
              <div className="space-y-6">
                <Input
                  label="Subject Name"
                  placeholder="e.g. Advanced Data Structures"
                  value={subjectData.name}
                  onChange={(e) => setSubjectData({ ...subjectData, name: e.target.value })}
                  required
                />
                <Input
                  label="Subject Code"
                  placeholder="e.g. CS3401"
                  value={subjectData.code}
                  onChange={(e) => setSubjectData({ ...subjectData, code: e.target.value })}
                  required
                />
              </div>
            </Card>

            <Card className="border-none shadow-indigo-100/50 p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Semester</label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                    value={subjectData.semester}
                    onChange={(e) => setSubjectData({ ...subjectData, semester: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester 0{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Department</label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                    value={subjectData.department}
                    onChange={(e) => setSubjectData({ ...subjectData, department: e.target.value })}
                    required
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            <Card className="md:col-span-2 border-none shadow-indigo-100/50 p-8">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Description</label>
                <textarea
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-900 min-h-[120px]"
                  placeholder="Brief overview of the course content and objectives..."
                  value={subjectData.description}
                  onChange={(e) => setSubjectData({ ...subjectData, description: e.target.value })}
                />
              </div>
            </Card>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl text-rose-600 font-bold text-sm">
            ERROR: {error}
          </div>
        )}

        <div className="flex justify-end pt-8 gap-4">
          <Button
            type="button"
            variant="outline"
            className="px-12 py-8 rounded-2xl font-black uppercase text-sm tracking-widest border-slate-200"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            className="px-12 py-8 rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-amber-500/20 bg-amber-500 text-white hover:bg-amber-600"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
