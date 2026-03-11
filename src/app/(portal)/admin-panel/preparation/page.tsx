'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { createPreparationResource, getPreparationResourcesByCategory, deletePreparationResource } from '@/lib/firebase/firestore';
import { PreparationResource, PreparationCategory } from '@/lib/types';
import { getPreparationCategoryName, getResourceTypeName } from '@/lib/utils/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import { Select } from '@/components/ui/Input';

export default function AdminPreparationPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<PreparationCategory>('gate');
  const [resources, setResources] = useState<PreparationResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const categories: PreparationCategory[] = [
    'gate',
    'govt_exams',
    'ielts',
    'toefl',
    'gre',
    'gmat',
    
  ];

  const [newResource, setNewResource] = useState({
    title: '',
    type: 'notes' as any,
    url: '',
    description: ''
  });

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const data = await getPreparationResourcesByCategory(selectedCategory);
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [selectedCategory]);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await createPreparationResource({
        category: selectedCategory,
        title: newResource.title,
        description: newResource.description,
        url: newResource.url,
        type: newResource.type,
        resourceType: 'url',
        visibility: 'public',
        uploadedBy: user.uid
      });
      
      // Refresh resources
      const data = await getPreparationResourcesByCategory(selectedCategory);
      setResources(data);
      setNewResource({ title: '', type: 'notes', url: '', description: '' });
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
        await deletePreparationResource(id);
        setResources(resources.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="relative">
          <div className="absolute -left-12 -top-12 text-[160px] font-black text-slate-50 pointer-events-none uppercase italic">
            HUB
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-rose-50 text-rose-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-rose-100">
              <span>Admin Terminal</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              Preparation <br/><span className="text-rose-600">Curator</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed mt-6 max-w-2xl">
              Manage specialized exam resources for GATE, IELTS, TOEFL and more for the global excellence hub.
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

          <Card className="border-none shadow-rose-100/50 p-8">
            <form onSubmit={handleCreateResource} className="space-y-6">
              <Select
                label="Target Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as PreparationCategory)}
                options={categories.map(cat => ({
                  value: cat,
                  label: getPreparationCategoryName(cat)
                }))}
                required
              />

              <Input
                label="Resource Title"
                placeholder="e.g. GATE 2024 Syllabus & PYQs"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                required
              />

              <Select
                label="Resource Type"
                value={newResource.type}
                onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                options={[
                  { value: 'notes', label: 'Study Material' },
                  { value: 'qp', label: 'Past Papers' },
                  { value: 'qb', label: 'Question Bank' },
                  { value: 'textbook', label: 'E-Book' },
                  {value:'test', label:'Test'},
                  { value: 'link', label: 'External Link' },
                ]}
                required
              />

              <Input
                label="Resource URL"
                placeholder="Google Drive or External Link"
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full rounded-2xl py-6 font-black uppercase text-xs tracking-widest bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 border-none"
                disabled={submitting}
              >
                {submitting ? 'Injecting...' : 'Deploy Study Resource'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Active mappings - {getPreparationCategoryName(selectedCategory)}</h2>
            <div className="h-px w-32 bg-slate-100"></div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
              </div>
            ) : resources.length === 0 ? (
              <div className="py-24 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No resources archived for this track yet.</p>
              </div>
            ) : (
              resources.map((resource) => (
                <Card key={resource.id} className="border-none shadow-rose-100/30 overflow-hidden group">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex-1 space-y-1">
                      <div className="inline-flex px-2 py-0.5 bg-rose-50 text-rose-400 text-[8px] font-black uppercase tracking-widest rounded border border-rose-100">
                        {getResourceTypeName(resource.type)}
                      </div>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-rose-600 transition-colors">
                        {resource.title}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-4">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline">
                        Access Link
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
