'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createSubject, createResource } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { hasRole } from '@/lib/utils/roleCheck';
import { DEPARTMENTS } from '@/lib/types';

interface ResourceForm {
  title: string;
  type: string;
  url: string;
  description: string;
}

export default function AddSubjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Opening creation terminal...</p>
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
  
  const [subjectData, setSubjectData] = useState({
    name: '',
    code: '',
    semester: 1,
    description: '',
    department: user?.department || 'Computer Science',
    isActive: true
  });

  const [resources, setResources] = useState<ResourceForm[]>([
    { title: '', type: 'curriculum', url: '', description: '' }
  ]);

  const handleAddResource = () => {
    setResources([...resources, { title: '', type: 'curriculum', url: '', description: '' }]);
  };

  const handleRemoveResource = (index: number) => {
    const newResources = [...resources];
    newResources.splice(index, 1);
    setResources(newResources);
  };

  const handleResourceChange = (index: number, field: keyof ResourceForm, value: string) => {
    const newResources = [...resources];
    newResources[index][field] = value;
    setResources(newResources);
  };

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
      // 1. Create the subject
      const subjectId = await createSubject({
        ...subjectData,
        createdBy: user.uid
      });

      // 2. Create the resources
      const resourcePromises = resources
        .filter(r => r.title && r.url)
        .map(r => createResource({
          subjectId,
          title: r.title,
          url: r.url,
          description: r.description,
          type: r.type as any, // ResourceType (e.g. curriculum, notes)
          resourceType: 'url', // ResourceFormat enum
          semester: subjectData.semester,
          visibility: 'public',
          uploadedBy: user.uid
        }));

      await Promise.all(resourcePromises);

      router.push(`/semesters/${subjectData.semester}/${subjectId}`);
    } catch (err: any) {
      console.error('Error adding subject:', err);
      setError(err.message || 'Failed to add subject. Please check your permissions.');
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
            ADD
          </div>
          <div className="relative z-10">
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              Expand <br/><span className="text-indigo-600">Curriculum</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed mt-6 max-w-2xl">
              Initialize a new subject entity and synchronize associated digital resources into the core repository.
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

        {/* Resources Section */}
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs italic">02</div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Initial resource payload</h2>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <div className="space-y-6">
            {resources.map((resource, index) => (
              <Card key={index} className="border-none shadow-indigo-100/30 overflow-hidden group">
                <div className="bg-slate-50 px-8 py-3 border-b border-slate-100 flex justify-between items-center group-hover:bg-indigo-50 transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600">Resource Unit {index + 1}</span>
                  {resources.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveResource(index)}
                      className="text-[10px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest"
                    >
                      Delete Unit
                    </button>
                  )}
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Resource Title"
                    placeholder="e.g. Unit 1 Notes"
                    value={resource.title}
                    onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                  />
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Type</label>
                    <select
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                      value={resource.type}
                      onChange={(e) => handleResourceChange(index, 'type', e.target.value)}
                    >
                      <option value="curriculum">Curriculum</option>
                      <option value="qb">Question Bank</option>
                      <option value="qp">Past Papers</option>
                      <option value="notes">Study Notes</option>
                      <option value="textbook">Reference Book</option>
                    </select>
                  </div>
                  <Input
                    label="Drive URL"
                    placeholder="https://drive.google.com/..."
                    value={resource.url}
                    onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                  />
                </div>
              </Card>
            ))}

            <button
              type="button"
              onClick={handleAddResource}
              className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black uppercase text-xs tracking-[0.2em] hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              + Attach additional resource unit
            </button>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl text-rose-600 font-bold text-sm">
            ERROR: {error}
          </div>
        )}

        <div className="flex justify-end pt-8">
          <Button
            type="submit"
            variant="primary"
            className="px-12 py-8 rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-indigo-600/20"
            disabled={loading}
          >
            {loading ? 'Executing Protocol...' : 'Finalize and Deploy Subject'}
          </Button>
        </div>
      </form>
    </div>
  );
}
