'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { submitCertificate } from '@/lib/firebase/firestore';
import { CERTIFICATION_PLATFORMS } from '@/lib/config/xp';
import { isGoogleDriveUrl } from '@/lib/utils/validators';

export default function NewCertificationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [platform, setPlatform] = useState(CERTIFICATION_PLATFORMS[0]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [verificationLink, setVerificationLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to submit a certification');
      return;
    }

    if (!isGoogleDriveUrl(driveLink)) {
      setError('Please provide a valid Google Drive link for your certificate.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await submitCertificate({
        studentUid: user.uid,
        studentId: user.registerNumber,
        studentName: user.name,
        subject,
        certificateTitle: title,
        platform,
        driveLink,
        verificationLink: verificationLink || "",
      });

      router.push('/certifications');
    } catch (err: any) {
      setError(err.message || 'Failed to submit certification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-100">
          <span>Earn XP Points</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight uppercase leading-none italic">
          Certification <span className="text-indigo-600">Sync</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
          Submit your completed industry certifications to earn XP points and boost your rank in the department vault.
        </p>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-slate-900 border-b border-white/5 p-10">
          <CardTitle className="text-xl text-white uppercase tracking-widest font-black">Submission Protocol</CardTitle>
          <p className="text-slate-400 text-sm font-medium mt-2 uppercase tracking-tight">Enter your credential details below</p>
        </CardHeader>
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 px-6 py-4 rounded-2xl text-sm font-bold flex items-center space-x-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Input
                label="Certification Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., SQL (Advanced)"
                required
                className="bg-slate-50"
              />
              <Input
                label="Subject/Area"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Database Management"
                required
                className="bg-slate-50"
              />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Select
                label="Learning Platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                options={CERTIFICATION_PLATFORMS.map(p => ({ value: p, label: p }))}
                required
              />
              <Input
                label="Verification Link (Optional)"
                type="url"
                value={verificationLink}
                onChange={(e) => setVerificationLink(e.target.value)}
                placeholder="https://hackerrank.com/certificates/..."
                className="bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <Input
                label="Google Drive Link (Required)"
                type="url"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                required
                className="bg-slate-50"
              />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 italic">
                 Note: Ensure the link sharing is set to "Anyone with the link"
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button type="submit" disabled={loading} className="flex-1 py-4 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700">
                {loading ? 'Initializing Sync...' : 'Publish Certification'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="py-4 px-12 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl border-slate-200"
                onClick={() => router.back()}
                disabled={loading}
              >
                Return
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
