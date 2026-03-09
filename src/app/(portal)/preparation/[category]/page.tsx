'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { getPreparationResourcesByCategory } from '@/lib/firebase/firestore';
import { PreparationResource } from '@/lib/types';
import { getPreparationCategoryName, getResourceTypeName } from '@/lib/utils/validators';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { completeTestAction } from '@/lib/firebase/firestore';

export default function PreparationCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const { user } = useAuth();
  const [resources, setResources] = useState<PreparationResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getPreparationResourcesByCategory(category);
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [category]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Curating exam materials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-100">
            <span>Specialized Archive</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-none uppercase">
            {getPreparationCategoryName(category)}
          </h1>
          
        </div>
        <Link href="/preparation">
          <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] px-6">
            ← Back to Hub
          </Button>
        </Link>
      </div>

      {resources.length === 0 ? (
        <Card className="border-slate-100 bg-slate-50/50">
          <CardContent className="py-24 text-center">
            <div className="w-16 h-16 bg-white border-2 border-slate-100 text-slate-300 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6">?</div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No resources archived for this track yet.</p>
            <Link href="/requests/new">
              <Button variant="primary" className="mt-8 px-8 rounded-xl">Request Materials</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="border-none shadow-indigo-100/30 group">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-md border border-indigo-100">
                      {getResourceTypeName(resource.type)}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">
                      {resource.title}
                    </h3>
                    {resource.description && (
                      <p className="text-slate-500 font-medium leading-relaxed max-w-4xl line-clamp-2">
                        {resource.description}
                      </p>
                    )}
                  </div>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto"
                    onClick={async () => {
                      if (user && (resource.type === 'qb' || resource.type === 'qp')) {
                        await completeTestAction(user.uid, resource.id);
                      }
                    }}
                  >
                    <Button variant="accent" className="w-full md:w-auto rounded-xl font-black uppercase text-[10px] tracking-widest px-8">
                      View
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
