'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getRequestsByUser } from '@/lib/firebase/firestore';
import { Request } from '@/lib/types';
import { formatDateShort } from '@/lib/utils/validators';

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;

      try {
        const data = await getRequestsByUser(user.uid);
        setRequests(data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching your requests...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'rejected':
        return 'text-rose-700 bg-rose-50 border-rose-100';
      default:
        return 'text-amber-700 bg-amber-50 border-amber-100';
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-100">
            <span>Feedback Loop</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-none">
            My Requests
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Track the status of your submitted resource and subject requests. We process most requests within 48-72 hours.
          </p>
        </div>
        <Link href="/requests/new">
          <Button variant="accent" className="rounded-xl px-8 shadow-lg shadow-emerald-700/10">
            Submit New Request
          </Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <Card className="border-slate-100 bg-slate-50/50">
          <CardContent className="py-24 text-center">
            <div className="w-16 h-16 bg-white border-2 border-slate-100 text-slate-300 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6">0</div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-8">You haven't submitted any requests yet.</p>
            <Link href="/requests/new">
              <Button variant="primary" className="rounded-xl px-10">Start Your First Request</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="border-none shadow-indigo-100 group">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-md border border-indigo-100">
                        {request.requestType === 'subject' ? 'Subject' : 'Resource'}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Submitted {formatDateShort(request.createdAt)}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                      {request.subjectName || request.resourceTitle}
                    </h3>
                    
                    <p className="text-slate-500 font-medium leading-relaxed max-w-3xl line-clamp-2">
                      {request.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 pt-2">
                      {request.semester && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          Semester {request.semester}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 min-w-[140px]">
                    <span
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border-2 text-center w-full ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>

                {request.status !== 'pending' && request.reviewNotes && (
                  <div className="mt-8 pt-8 border-t border-slate-50 bg-slate-50/30 -mx-8 px-8 pb-8 rounded-b-2xl">
                    <div className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5"></div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Review Notes</div>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                          "{request.reviewNotes}"
                        </p>
                      </div>
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
