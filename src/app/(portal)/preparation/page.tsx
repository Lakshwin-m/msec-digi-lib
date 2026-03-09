'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getPreparationCategoryName } from '@/lib/utils/validators';
import { PreparationCategory } from '@/lib/types';

export default function PreparationPage() {
  const categories: PreparationCategory[] = [
    'gate',
    'govt_exams',
    'ielts',
    'toefl',
    'gre',
    'gmat',
    
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-3xl">
       
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Preparation Hub
        </h1>
        <p className="text-lg text-slate-500 font-medium leading-relaxed">
          Unlock premium study materials, practice papers, and strategic guides for the world's most competitive academic and professional examinations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <Link key={category} href={`/preparation/${category}`}>
            <Card hover className="group border-none shadow-indigo-100/50 flex flex-col p-8">
              
              <CardHeader className="mb-2 !p-0">
                <CardTitle className="group-hover:text-indigo-600 transition-colors text-2xl tracking-tight leading-tight">
                  {getPreparationCategoryName(category)}
                </CardTitle>
              </CardHeader>
              <CardContent className="!p-0 mt-4">
                
                <div className="pt-4 border-t border-slate-50 flex items-center text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                  Explore Hub →
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
