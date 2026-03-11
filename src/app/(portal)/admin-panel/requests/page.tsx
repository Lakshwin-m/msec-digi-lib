'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { getPendingRequests, reviewRequest } from '@/lib/firebase/firestore';
import { Request } from '@/lib/types';
import { formatDateShort } from '@/lib/utils/validators';

export default function AdminRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getPendingRequests();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    
    setProcessingId(id);
    try {
      await reviewRequest(id, status, user.uid, notes[id] || '');
      // Remove from list after review
      setRequests(requests.filter(req => req.id !== id));
    } catch (error) {
      console.error('Error reviewing request:', error);
      alert('Failed to process request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleNoteChange = (id: string, val: string) => {
    setNotes(prev => ({ ...prev, [id]: val }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading pending requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-amber-100">
            <span>Admin Control</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-none uppercase italic">
            Request Approval <span className="text-indigo-600">Queue</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Review and adjudicate incoming student resource requests. Every approval helps expand the vault.
          </p>
        </div>
        <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center space-x-4 shadow-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">{requests.length} Pending Actions</span>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card className="border-slate-100 bg-slate-50/50">
          <CardContent className="py-24 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6">✓</div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">The queue is empty. You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {requests.map((request) => (
            <Card key={request.id} className="border-none shadow-xl shadow-slate-200/50 group overflow-hidden">
              <div className="flex flex-col lg:flex-row h-full">
                {/* Information Side */}
                <div className="flex-1 p-8 lg:p-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-md border border-indigo-100">
                        {request.requestType}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {formatDateShort(request.createdAt)}
                      </span>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested By</div>
                       <div className="text-sm font-bold text-slate-900">{request.requestedByName} <span className="text-indigo-600">({request.requestedByRegNo})</span></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">
                      {request.subjectName || request.resourceTitle}
                    </h3>
                    {request.semester && (
                      <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg mb-4">
                        Semester {request.semester}
                      </div>
                    )}
                    <p className="text-slate-500 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                      "{request.description}"
                    </p>
                  </div>
                </div>

                {/* Actions Side */}
                <div className="w-full lg:w-96 bg-slate-50 lg:border-l border-slate-100 p-8 lg:p-10 flex flex-col justify-between">
                   <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Review Notes (Optional)</label>
                     <Textarea 
                       placeholder="e.g., Added to Semester 4 database." 
                       className="bg-white text-sm"
                       rows={3}
                       value={notes[request.id] || ''}
                       onChange={(e) => handleNoteChange(request.id, e.target.value)}
                     />
                   </div>

                   <div className="flex gap-4 pt-8">
                     <Button 
                       onClick={() => handleReview(request.id, 'approved')}
                       disabled={processingId === request.id}
                       className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-6 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-emerald-500/10"
                     >
                       {processingId === request.id ? '...' : 'PUBLISH'}
                     </Button>
                     <Button 
                       variant="outline"
                       onClick={() => handleReview(request.id, 'rejected')}
                       disabled={processingId === request.id}
                       className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 py-6 font-black uppercase tracking-widest text-[10px] rounded-xl"
                     >
                       REJECT
                     </Button>
                   </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
