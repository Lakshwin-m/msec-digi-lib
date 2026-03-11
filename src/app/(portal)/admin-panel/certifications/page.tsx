'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea, Select } from '@/components/ui/Input';
import { getCertificatesByStatus, approveCertificateAction, rejectCertificateAction } from '@/lib/firebase/firestore';
import { CertificateSubmission } from '@/lib/types';
import { formatDateShort } from '@/lib/utils/validators';
import { XP_CONFIG } from '@/lib/config/xp';

export default function AdminCertificationsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<CertificateSubmission[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});

  const fetchSubmissions = async (status: string) => {
    setLoading(true);
    try {
      const data = await getCertificatesByStatus(status);
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(filter);
  }, [filter]);

  const handleApprove = async (submission: CertificateSubmission) => {
    if (!user) return;
    
    setProcessingId(submission.id);
    try {
      const xpValue = XP_CONFIG[submission.platform] || 15;
      await approveCertificateAction(submission.id, user.uid, xpValue);
      setSubmissions(submissions.filter(s => s.id !== submission.id));
    } catch (error: any) {
      console.error('Error approving certificate:', error);
      alert(error.message || 'Failed to approve certificate.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!user) return;
    const reason = rejectReason[submissionId];
    if (!reason) {
      alert('Please provide a reason for rejection.');
      return;
    }

    setProcessingId(submissionId);
    try {
      await rejectCertificateAction(submissionId, user.uid, reason);
      setSubmissions(submissions.filter(s => s.id !== submissionId));
    } catch (error) {
      console.error('Error rejecting certificate:', error);
      alert('Failed to reject certificate.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReasonChange = (id: string, val: string) => {
    setRejectReason(prev => ({ ...prev, [id]: val }));
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Scanning Credential Queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-amber-100">
            <span>Admin Authority</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-none uppercase italic">
            Credential <span className="text-indigo-600">Verification</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Verify students' external certifications and award XP points according to the established framework.
          </p>
        </div>
        
        <div className="flex items-center space-x-4 bg-slate-900 p-2 rounded-2xl shadow-xl">
           <Button 
            variant={filter === 'pending' ? 'primary' : 'outline'} 
            onClick={() => setFilter('pending')}
            className={`rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest transition-all ${filter !== 'pending' ? 'text-slate-400 border-transparent hover:bg-white/5' : ''}`}
           >
             Pending
           </Button>
           <Button 
            variant={filter === 'approved' ? 'primary' : 'outline'} 
            onClick={() => setFilter('approved')}
            className={`rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest transition-all ${filter !== 'approved' ? 'text-slate-400 border-transparent hover:bg-white/5' : ''}`}
           >
             Verified
           </Button>
           <Button 
            variant={filter === 'rejected' ? 'primary' : 'outline'} 
            onClick={() => setFilter('rejected')}
            className={`rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest transition-all ${filter !== 'rejected' ? 'text-slate-400 border-transparent hover:bg-white/5' : ''}`}
           >
             Rejected
           </Button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card className="border-slate-100 bg-slate-50/50 rounded-[3rem]">
          <CardContent className="py-24 text-center">
            <div className="w-16 h-16 bg-white border border-slate-100 text-slate-300 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6">✓</div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No certifications found for this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {submissions.map((sub) => (
            <Card key={sub.id} className="border-none shadow-2xl shadow-slate-200/50 group overflow-hidden rounded-[3rem]">
              <div className="flex flex-col xl:flex-row h-full">
                {/* Data Side */}
                <div className="flex-1 p-10 space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                    <div className="flex items-center space-x-4">
                       <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xs font-black uppercase">
                         {sub.platform.substring(0, 2)}
                       </div>
                       <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Credentials</div>
                         <div className="text-sm font-black text-slate-900 uppercase">
                           {sub.studentName} <span className="text-indigo-600">[{sub.studentId}]</span>
                         </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform XP</div>
                       <div className="text-xl font-black text-indigo-600">+{XP_CONFIG[sub.platform] || 15} XP</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 leading-tight">
                        {sub.certificateTitle}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-4 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                                {sub.platform}
                            </span>
                            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200">
                                {sub.subject}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <a href={sub.driveLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="primary" className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 border-none py-6 rounded-2xl font-black uppercase tracking-widest text-[9px]">
                            Launch Certificate Node (Drive)
                          </Button>
                        </a>
                        {sub.verificationLink && (
                          <a href={sub.verificationLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="w-full border-slate-200 py-6 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-indigo-50">
                              External Verification Trace
                            </Button>
                          </a>
                        )}
                    </div>
                  </div>
                </div>

                {/* Control Side */}
                {filter === 'pending' && (
                <div className="w-full xl:w-[400px] bg-slate-50/50 border-t xl:border-t-0 xl:border-l border-slate-100 p-10 flex flex-col justify-between">
                   <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Evaluation Notes</label>
                     <Textarea 
                       placeholder="e.g., Certificate verified on NPTEL portal." 
                       className="bg-white text-sm rounded-2xl border-slate-100 p-6 min-h-[140px]"
                       value={rejectReason[sub.id] || ''}
                       onChange={(e) => handleReasonChange(sub.id, e.target.value)}
                     />
                   </div>

                   <div className="flex gap-4 pt-10">
                     <Button 
                       onClick={() => handleApprove(sub)}
                       disabled={processingId === sub.id}
                       className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-7 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-emerald-500/10"
                     >
                       {processingId === sub.id ? 'VERIFYING...' : 'AUTHORIZE XP'}
                     </Button>
                     <Button 
                       variant="outline"
                       onClick={() => handleReject(sub.id)}
                       disabled={processingId === sub.id}
                       className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 py-7 font-black uppercase tracking-widest text-[10px] rounded-2xl"
                     >
                       DENY
                     </Button>
                   </div>
                </div>
                )}
                
                {filter !== 'pending' && (
                    <div className="w-full xl:w-[400px] bg-slate-900 p-10 flex flex-col justify-center items-center text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-6 ${sub.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {sub.status === 'approved' ? '✓' : '×'}
                        </div>
                        <h4 className="text-white font-black uppercase tracking-widest text-lg mb-2">{sub.status}</h4>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Verified on {formatDateShort(sub.approvedAt!)}</p>
                        {sub.rejectionReason && (
                            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 w-full">
                                <p className="text-slate-300 text-xs italic">"{sub.rejectionReason}"</p>
                            </div>
                        )}
                    </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
