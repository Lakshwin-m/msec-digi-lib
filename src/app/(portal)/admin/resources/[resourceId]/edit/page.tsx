'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getResourceById, updateResource } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { hasRole } from '@/lib/utils/roleCheck';
import { Resource } from '@/lib/types';

export default function EditResourcePage({
  params,
}: {
  params: Promise<{ resourceId: string }>;
}) {
  const { resourceId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  const semester = searchParams.get('semester');
  
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [resourceData, setResourceData] = useState<Partial<Resource>>({
    title: '',
    type: 'curriculum',
    url: '',
    description: ''
  });

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const data = await getResourceById(resourceId);
        if (data) {
          setResourceData({
            title: data.title,
            type: data.type,
            url: data.url,
            description: data.description || ''
          });
        } else {
          setError('Resource not found');
        }
      } catch (err) {
        console.error('Error fetching resource:', err);
        setError('Failed to load resource data');
      } finally {
        setInitialLoading(false);
      }
    };

    if (resourceId) {
      fetchResource();
    }
  }, [resourceId]);

  if (authLoading || initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing resource index...</p>
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

    try {
      await updateResource(resourceId, resourceData);
      
      // Redirect back to subject page if we have context, otherwise back one level
      if (subjectId && semester) {
        router.push(`/semesters/${semester}/${subjectId}`);
      } else {
        router.back();
      }
    } catch (err: any) {
      console.error('Error updating resource:', err);
      setError(err.message || 'Failed to update resource.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-24">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="relative">
          <div className="absolute -left-12 -top-12 text-[160px] font-black text-slate-50 pointer-events-none uppercase italic">
            EDIT
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-indigo-100">
              <span>Admin Terminal</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              Modify <br/><span className="text-indigo-600">Resource Unit</span>
            </h1>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-indigo-100/50 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Resource Title"
            placeholder="e.g. Unit 2 Notes"
            value={resourceData.title}
            onChange={(e) => setResourceData({ ...resourceData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Classification</label>
            <select
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
              value={resourceData.type}
              onChange={(e) => setResourceData({ ...resourceData, type: e.target.value as any })}
              required
            >
              <option value="curriculum">Curriculum</option>
              <option value="qb">Question Bank</option>
              <option value="qp">Past Papers</option>
              <option value="notes">Study Notes</option>
              <option value="textbook">Reference Book</option>
              <option value="certificate">Certificate</option>
            </select>
          </div>

          <Input
            label="Drive Access Link"
            value={resourceData.url}
            onChange={(e) => setResourceData({ ...resourceData, url: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Description (Optional)</label>
            <textarea
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-900 min-h-[100px]"
              placeholder="Brief description..."
              value={resourceData.description}
              onChange={(e) => setResourceData({ ...resourceData, description: e.target.value })}
            />
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-bold text-sm">
              ERROR: {error}
            </div>
          )}

          <div className="flex justify-end pt-4 gap-4">
            <Button
              type="button"
              variant="outline"
              className="px-8 py-6 rounded-xl font-black uppercase text-xs tracking-widest"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-8 py-6 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/20"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Update Resource'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
