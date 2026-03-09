'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCertificatesByUser } from '@/lib/firebase/firestore';
import { CertificateSubmission } from '@/lib/types';
import { formatDateShort } from '@/lib/utils/validators';

export default function CertificationsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<CertificateSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      try {
        const data = await getCertificatesByUser(user.uid);
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching certifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing your vault...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'rejected': return 'text-rose-700 bg-rose-50 border-rose-100';
      default: return 'text-amber-700 bg-amber-50 border-amber-100';
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-100">
            <span>Certification Hub</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-none uppercase italic">
            Credential <span className="text-indigo-600">History</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Monitor the verification status of your industry credentials and track your accumulated XP from external platforms.
          </p>
        </div>
        <Link href="/certifications/new">
          <Button variant="accent" className="rounded-2xl px-10 py-7 font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/10">
            Sync New Credential
          </Button>
        </Link>
      </div>

      {submissions.length === 0 ? (
        <Card className="border-slate-100 bg-slate-50/50 rounded-[3rem]">
          <CardContent className="py-24 text-center">
             <div className="w-20 h-20 bg-white border border-slate-100 text-slate-300 rounded-[2rem] flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-sm">0</div>
             <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">Empty Vault</h3>
             <p className="text-slate-500 font-medium mb-10 max-w-xs mx-auto text-sm">You haven't synced any certifications yet. Start by adding your first industry credential.</p>
             <Link href="/certifications/new">
               <Button variant="primary" className="rounded-xl px-12 py-4 uppercase font-black tracking-widest text-[10px]">New Credential</Button>
             </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {submissions.map((sub) => (
            <Card key={sub.id} className="border-none shadow-xl shadow-slate-200/40 group overflow-hidden rounded-[2.5rem]">
              <CardContent className="p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="px-4 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                        {sub.platform}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <span className="w-1 h-1 bg-slate-200 rounded-full mr-2"></span>
                        {formatDateShort(sub.submittedAt)}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight uppercase tracking-tight mb-2">
                        {sub.certificateTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          #{sub.subject}
                        </span>
                        {sub.status === 'approved' && (
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                            +{sub.xpValue} XP AWARDED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch lg:items-end gap-5">
                    <div
                      className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 text-center ${getStatusColor(
                        sub.status
                      )}`}
                    >
                      {sub.status}
                    </div>
                    
                    <div className="flex gap-4">
                      <a href={sub.driveLink} target="_blank" rel="noopener noreferrer" className="flex-1 lg:flex-none">
                        <Button variant="outline" className="w-full text-[9px] font-black uppercase tracking-widest rounded-xl border-slate-100 hover:bg-slate-50">
                          Drive
                        </Button>
                      </a>
                      {sub.verificationLink && (
                        <a href={sub.verificationLink} target="_blank" rel="noopener noreferrer" className="flex-1 lg:flex-none">
                          <Button variant="outline" className="w-full text-[9px] font-black uppercase tracking-widest rounded-xl border-slate-100 hover:bg-slate-50">
                            Verify
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {sub.status === 'rejected' && sub.rejectionReason && (
                   <div className="mt-8 pt-8 border-t border-slate-50 bg-rose-50/30 -mx-10 px-10 pb-8 rounded-b-[2.5rem]">
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-rose-500 rounded-full mt-2"></div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Rejection Protocol Note</div>
                        <p className="text-sm font-semibold text-rose-800 leading-relaxed italic">
                          "{sub.rejectionReason}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {sub.status === 'approved' && sub.approvedAt && (
                   <div className="mt-8 pt-8 border-t border-slate-50 bg-emerald-50/20 -mx-10 px-10 pb-8 rounded-b-[2.5rem]">
                    <div className="flex items-center justify-between text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">
                       <span>Validated on {formatDateShort(sub.approvedAt)}</span>
                       <span className="flex items-center">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                         System Verified
                       </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
