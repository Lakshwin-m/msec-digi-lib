'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createRequest } from '@/lib/firebase/firestore';
import { RequestType, DEPARTMENTS } from '@/lib/types';

export default function NewRequestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [requestType, setRequestType] = useState<RequestType>('subject');
  const [subjectName, setSubjectName] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [description, setDescription] = useState('');
  const [semester, setSemester] = useState<number>(1);
  const [department, setDepartment] = useState<string>(user?.department || 'CSE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to submit a request');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (!user.name || !user.registerNumber) {
        throw new Error('User profile is incomplete. Please update your profile.');
      }

      // Construct request object carefully - Firestore rejects 'undefined' values
      const requestData: any = {
        requestType,
        requestedBy: user.uid,
        requestedByName: user.name,
        requestedByRegNo: user.registerNumber,
        description,
        semester: semester, // Apply semester to both types
        department: department,
        createdAt: new Date(), // Local fallback though firestore function adds it
      };

      if (requestType === 'subject') {
        requestData.subjectName = subjectName;
      } else {
        requestData.resourceTitle = resourceTitle;
      }

      await createRequest(requestData);

      router.push('/requests');
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please ensure all fields are valid.');
      console.error('Error submitting request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-100">
          <span>Resource Request</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Contributor Portal
        </h1>
        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
          Help us expand our academic ecosystem by requesting missing subjects or high-quality study materials.
        </p>
      </div>

      <Card className="border-none shadow-indigo-100/50">
        <CardHeader className="border-b border-slate-50 pb-8">
          <CardTitle className="text-xl">Request Particulars</CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 px-5 py-4 rounded-xl text-sm font-semibold flex items-center space-x-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Select
                label="Request Category"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as RequestType)}
                options={[
                  { value: 'subject', label: 'Missing Subject' },
                  { value: 'resource', label: 'Resource (Notes/Papers)' },
                ]}
                required
              />

              <Select
                label="Academic Semester"
                value={semester}
                onChange={(e) => setSemester(parseInt(e.target.value))}
                options={[
                  { value: 1, label: 'Semester 1' },
                  { value: 2, label: 'Semester 2' },
                  { value: 3, label: 'Semester 3' },
                  { value: 4, label: 'Semester 4' },
                  { value: 5, label: 'Semester 5' },
                  { value: 6, label: 'Semester 6' },
                  { value: 7, label: 'Semester 7' },
                  { value: 8, label: 'Semester 8' },
                ]}
                required
              />

              <Select
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                options={DEPARTMENTS.map(dept => ({ value: dept, label: dept }))}
                required
              />
            </div>

            <Input
              label={requestType === 'subject' ? "Full Subject Name" : "Resource/Subject Identification"}
              type="text"
              value={requestType === 'subject' ? subjectName : resourceTitle}
              onChange={(e) => requestType === 'subject' ? setSubjectName(e.target.value) : setResourceTitle(e.target.value)}
              placeholder={requestType === 'subject' ? "e.g., Quantum Computing Fundamentals" : "e.g., OOSE Certificate links"}
              required
            />

            <Textarea
              label="Contribution Details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a clear description of why this is needed or what content it covers..."
              rows={5}
              required
            />

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1 py-4 font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-indigo-600/10">
                {loading ? 'Processing Submission...' : 'Transmit Request'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="py-4 px-10 font-bold uppercase tracking-widest text-xs rounded-xl border-slate-200"
                onClick={() => router.back()}
                disabled={loading}
              >
                Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
