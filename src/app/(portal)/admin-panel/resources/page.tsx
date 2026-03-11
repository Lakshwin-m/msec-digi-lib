'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { getAllSubjects, createResource, getResourcesBySubject, deleteResource } from '@/lib/firebase/firestore';
import { Subject, Resource } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ManageResourcesPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newResource, setNewResource] = useState({
    title: '',
    resourceType: 'curriculum',
    url: '',
    description: ''
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getAllSubjects();
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubjectId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      const fetchResources = async () => {
        try {
          const data = await getResourcesBySubject(selectedSubjectId);
          setResources(data);
        } catch (error) {
          console.error('Error fetching resources:', error);
        }
      };
      fetchResources();
    }
  }, [selectedSubjectId]);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !user) return;

    setSubmitting(true);
    try {
      const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
      
      await createResource({
        subjectId: selectedSubjectId,
        title: newResource.title,
        description: newResource.description,
        url: newResource.url,
        type: newResource.resourceType as any,
        resourceType: 'url',
        semester: selectedSubject?.semester || 1,
        visibility: 'public',
        uploadedBy: user.uid
      });
      // Refresh resources
      const data = await getResourcesBySubject(selectedSubjectId);
      setResources(data);
      setNewResource({ title: '', resourceType: 'curriculum', url: '', description: '' });
    } catch (error) {
      console.error('Error creating resource:', error);
      alert('Failed to add resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (confirm('Delete this resource permanently?')) {
      try {
        await deleteResource(id);
        setResources(resources.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing resource index...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="relative">
          <div className="absolute -left-12 -top-12 text-[160px] font-black text-slate-50 pointer-events-none uppercase italic">
            RES
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-indigo-100">
              <span>Admin Terminal</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              Resource <br/><span className="text-indigo-600">Curation</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed mt-6 max-w-2xl">
              Precision mapping of digital documentation to established subject entities in the archive.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Form */}
        <div className="lg:col-span-1 space-y-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Injection Point</h2>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <Card className="border-none shadow-indigo-100/50 p-8">
            <form onSubmit={handleCreateResource} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Target Subject</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  required
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.department ? `[${s.department}] ` : ''}{s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Resource Title"
                placeholder="e.g. Unit 2 Question Bank"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                required
              />

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Classification</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                  value={newResource.resourceType}
                  onChange={(e) => setNewResource({ ...newResource, resourceType: e.target.value as any })}
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
                placeholder="https://drive.google.com/..."
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full rounded-2xl py-6 font-black uppercase text-xs tracking-widest"
                disabled={submitting}
              >
                {submitting ? 'Injecting...' : 'Deploy Resource'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Active mappings</h2>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <div className="space-y-4">
            {resources.length === 0 ? (
              <div className="py-24 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No resources mapped to selected subject.</p>
              </div>
            ) : (
              resources.map((resource) => (
                <Card key={resource.id} className="border-none shadow-indigo-100/30 overflow-hidden group">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded border border-slate-100">
                          {resource.type || resource.resourceType}
                        </div>
                        {subjects.find(s => s.id === resource.subjectId)?.department && (
                          <div className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded border border-indigo-100">
                            {subjects.find(s => s.id === resource.subjectId)?.department}
                          </div>
                        )}
                      </div>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                        {resource.title}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-4">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                        Verify Link
                      </a>
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
