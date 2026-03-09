'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import {
  getSubjectById,
  getResourcesBySubject,
  getLearningLinksBySubject,
  getCertificationLinksBySubject,
  getQuizzesBySubject,
  completeQuizAction,
  completeTestAction,
  deleteSubject,
  deleteResource,
} from '@/lib/firebase/firestore';
import { Subject, Resource, LearningLink, CertificationLink, Quiz } from '@/lib/types';
import { getResourceTypeName } from '@/lib/utils/validators';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { canManageSubjects } from '@/lib/utils/roleCheck';

export default function SubjectDetailPage({
  params,
}: {
  params: Promise<{ semester: string; subjectId: string }>;
}) {
  const { semester, subjectId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState<string>('curriculum');
  const [resources, setResources] = useState<Record<string, Resource[]>>({});
  const [learningLinks, setLearningLinks] = useState<LearningLink[]>([]);
  const [certLinks, setCertLinks] = useState<CertificationLink[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'qb', label: 'Question Bank' },
    { id: 'qp', label: 'Past Papers' },
    { id: 'notes', label: 'Study Notes' },
    { id: 'textbook', label: 'Reference' },
    { id: 'links', label: 'External' },
    { id: 'certifications', label: 'Certs' },
    { id: 'quizzes', label: 'Quizzes' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectData, links, certs, quizData] = await Promise.all([
          getSubjectById(subjectId),
          getLearningLinksBySubject(subjectId),
          getCertificationLinksBySubject(subjectId),
          getQuizzesBySubject(subjectId),
        ]);

        setSubject(subjectData);
        setLearningLinks(links);
        setCertLinks(certs);
        setQuizzes(quizData);

        // Fetch resources for each type
        const resourceTypes = ['curriculum', 'qb', 'qp', 'notes', 'textbook', 'certificate'];
        const resourceData: Record<string, Resource[]> = {};

        await Promise.all(
          resourceTypes.map(async (type) => {
            const res = await getResourcesBySubject(subjectId, type);
            resourceData[type] = res;
          })
        );

        setResources(resourceData);
      } catch (error) {
        console.error('Error fetching subject data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      try {
        await deleteSubject(subjectId);
        router.push(`/semesters/${semester}`);
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Failed to delete subject');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Unlocking subject files...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-24 space-y-6">
        <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto text-slate-300">?</div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Subject entity not discovered.</p>
        <Link href={`/semesters/${semester}`}>
          <Button variant="primary" className="rounded-xl px-8">Return to Portal</Button>
        </Link>
      </div>
    );
  }

  const handleResourceDelete = async (id: string) => {
    if (confirm('Delete this resource permanently?')) {
      try {
        await deleteResource(id);
        // Optimistic update or refetch
        const resourceTypes = ['curriculum', 'qb', 'qp', 'notes', 'textbook', 'certificate'];
        const resourceData: Record<string, Resource[]> = {};
        await Promise.all(
          resourceTypes.map(async (type) => {
            const res = await getResourcesBySubject(subjectId, type);
            resourceData[type] = res;
          })
        );
        setResources(resourceData);
      } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Failed to delete resource');
      }
    }
  };

  const renderResourceList = (type: string) => {
    const typeResources = resources[type] || [];
    const isAdmin = user && canManageSubjects(user.role);

    return (
      <div className="space-y-6">
        {isAdmin && (
           <Link href={`/admin/resources?subjectId=${subjectId}`} className="block">
             <div className="w-full py-4 border-2 border-dashed border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-400 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
               + Inject New Resource Unit
             </div>
           </Link>
        )}

        {typeResources.length === 0 ? (
          <div className="py-24 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-300 text-xl font-bold">!</div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] leading-loose max-w-sm mx-auto">
              No {getResourceTypeName(type).toLowerCase()} identified. <br/>
              Contributing students are currently archiving materials for this segment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {typeResources.map((resource) => (
              <div
                key={resource.id}
                className="group bg-white border border-slate-100 p-8 rounded-3xl hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative"
              >
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/resources/${resource.id}/edit?subjectId=${subjectId}&semester=${semester}`}>
                      <button className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors" title="Edit Resource">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleResourceDelete(resource.id)}
                      className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors" 
                      title="Delete Resource"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                )}

                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded border border-slate-100">
                    {resource.resourceType}
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">
                    {resource.title}
                  </h4>
                  {resource.description && (
                    <p className="text-slate-500 font-medium leading-relaxed max-w-3xl line-clamp-1">
                      {resource.description}
                    </p>
                  )}
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto"
                  onClick={async (e) => {
                    if (user && (resource.type === 'qb' || resource.type === 'qp')) {
                      await completeTestAction(user.uid, resource.id);
                    }
                  }}
                >
                  <Button variant="primary" className="w-full md:w-auto rounded-xl font-black uppercase text-[10px] tracking-widest px-8">
                    View
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLearningLinks = () => {
    if (learningLinks.length === 0) {
      return (
        <div className="py-24 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">No external learning nodes discovered.</p>
        </div>
      );
    }

    const groupedLinks = learningLinks.reduce((acc, link) => {
      if (!acc[link.platform]) {
        acc[link.platform] = [];
      }
      acc[link.platform].push(link);
      return acc;
    }, {} as Record<string, LearningLink[]>);

    return (
      <div className="space-y-20">
        {Object.entries(groupedLinks).map(([platform, links]) => (
          <div key={platform} className="space-y-8">
            <div className="flex items-center space-x-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
                {platform} Ecosystem
              </h4>
              <div className="h-px w-full bg-slate-100"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="group bg-white border border-slate-100 p-8 rounded-3xl hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4 mb-8">
                    <h5 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                      {link.title}
                    </h5>
                    {link.description && (
                      <p className="text-slate-500 font-medium leading-relaxed line-clamp-2">
                        {link.description}
                      </p>
                    )}
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full rounded-xl font-black uppercase text-[10px] tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      Visit Platform
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCertifications = () => {
    const internalCerts = resources['certificate'] || [];
    const isAdmin = user && canManageSubjects(user.role);

    if (certLinks.length === 0 && internalCerts.length === 0) {
      return (
        <div className="space-y-6">
          {isAdmin && (
             <Link href={`/admin/resources?subjectId=${subjectId}`} className="block">
               <div className="w-full py-4 border-2 border-dashed border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-400 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
                 + Inject New Certification Unit
               </div>
             </Link>
          )}
          <div className="py-24 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">No professional certifications indexed.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        {isAdmin && (
           <Link href={`/admin/resources?subjectId=${subjectId}`} className="block">
             <div className="w-full py-4 border-2 border-dashed border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-400 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
               + Inject New Certification Unit
             </div>
           </Link>
        )}

        {/* Dynamic Certification Units (Archived) */}
        {internalCerts.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {internalCerts.map((cert) => (
              <div
                key={cert.id}
                className="group bg-white border border-slate-100 p-8 rounded-3xl hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative"
              >
                 {isAdmin && (
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/resources/${cert.id}/edit?subjectId=${subjectId}&semester=${semester}`}>
                      <button className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors" title="Edit Certificate">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleResourceDelete(cert.id)}
                      className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors" 
                      title="Delete Certificate"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center px-4 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                    Archived Certificate
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">
                    {cert.title}
                  </h4>
                  {cert.description && (
                    <p className="text-slate-500 font-medium leading-relaxed max-w-3xl">
                      {cert.description}
                    </p>
                  )}
                </div>
                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                  <Button variant="primary" className="w-full md:w-auto rounded-xl font-black uppercase text-[10px] tracking-widest px-8">
                    Access Credential
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Global Certification Ecosystem (External) */}
        {certLinks.length > 0 && (
          <div className="grid grid-cols-1 gap-6 pt-12">
            <div className="flex items-center space-x-6 mb-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
                Industry Ecosystem
              </h4>
              <div className="h-px w-full bg-slate-100"></div>
            </div>
            {certLinks.map((cert) => (
              <div
                key={cert.id}
                className="group bg-slate-900 text-white p-12 rounded-[40px] hover:shadow-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-12 border-b-8 border-indigo-600 relative overflow-hidden"
              >
                {/* Decorative background element */}
                <div className="absolute right-0 top-0 text-[200px] font-black italic opacity-[0.03] text-white leading-none pointer-events-none select-none">
                  CERT
                </div>
    
                <div className="flex-1 relative z-10">
                  <div className="inline-flex items-center px-4 py-1.5 bg-indigo-600/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-600/30 mb-8">
                    {cert.provider} Verified
                  </div>
                  <h4 className="text-4xl font-black mb-6 leading-none uppercase tracking-tighter">
                    {cert.title}
                  </h4>
                  {cert.description && (
                    <p className="text-slate-400 font-medium leading-relaxed max-w-2xl text-lg">
                      {cert.description}
                    </p>
                  )}
                </div>
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 w-full md:w-auto"
                >
                  <Button variant="accent" size="lg" className="w-full md:w-auto rounded-2xl font-black uppercase text-xs tracking-widest px-12 py-8">
                    Enroll Now
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderQuizzes = () => {
    if (quizzes.length === 0) {
      return (
        <div className="py-24 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">No interactive quizzes formulated for this subject.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="group bg-white border border-slate-100 p-8 rounded-[32px] hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                  {quiz.points} Points Available
                </div>
                {user?.completedQuizzes?.includes(quiz.id) && (
                  <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                    Completed
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight mb-3">
                  {quiz.title}
                </h4>
                {quiz.description && (
                  <p className="text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {quiz.description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {quiz.questions.length} Questions
                </div>
                {quiz.timeLimit && (
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {quiz.timeLimit} Min
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-10">
              <Button 
                variant={user?.completedQuizzes?.includes(quiz.id) ? "outline" : "primary"}
                className="w-full rounded-2xl font-black uppercase text-[10px] tracking-widest py-6"
                onClick={async () => {
                  if (user) {
                    if (!user.completedQuizzes?.includes(quiz.id)) {
                      if (confirm(`Begin ${quiz.title}? (Completing this quiz will award ${quiz.points} points and update your streak!)`)) {
                        await completeQuizAction(user.uid, quiz.id, quiz.points);
                        // Refresh quizzes
                        const updatedQuizzes = await getQuizzesBySubject(subjectId);
                        setQuizzes(updatedQuizzes);
                        alert('Quiz completed! Your streak has been updated.');
                      }
                    } else {
                      alert('You have already completed this quiz.');
                    }
                  }
                }}
              >
                {user?.completedQuizzes?.includes(quiz.id) ? "Review Results" : "Initiate Protocol"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-16 pb-32">
      {/* Premium Subject Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 border-b border-slate-100 pb-16 relative">
        <div className="flex-1 max-w-5xl">
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link href={`/semesters/${semester}`}>
              <Button variant="outline" className="rounded-xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px] px-8 py-5">
                ← Semester {semester}
              </Button>
            </Link>
            <div className="px-5 py-2 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-100">
              {subject.code}
            </div>
            
          </div>
          <h1 className="text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9] uppercase">
            {subject.name}
          </h1>
          {subject.description && (
            <p className="text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl">
              {subject.description}
            </p>
          )}

          {/* Admin Actions */}
          {user && canManageSubjects(user.role) && (
            <div className="flex gap-4 mt-8">
              <Link href={`/admin/subjects/${subject.id}/edit`}>
                <Button variant="outline" className="rounded-xl border-amber-200 text-amber-600 font-black uppercase tracking-widest text-[10px] px-8 py-5 hover:bg-amber-50">
                  Edit Subject
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="rounded-xl border-rose-200 text-rose-600 font-black uppercase tracking-widest text-[10px] px-8 py-5 hover:bg-rose-50"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* High-Impact Tab System */}
      <div className="sticky top-20 z-20 bg-slate-50/80 backdrop-blur-md py-4 -mx-4 px-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-10 py-5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20'
                  : 'bg-white text-slate-400 border border-slate-100 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Viewport */}
      <div className="pt-8">
        {activeTab === 'curriculum' && renderResourceList('curriculum')}
        {activeTab === 'qb' && renderResourceList('qb')}
        {activeTab === 'qp' && renderResourceList('qp')}
        {activeTab === 'notes' && renderResourceList('notes')}
        {activeTab === 'textbook' && renderResourceList('textbook')}
        {activeTab === 'links' && renderLearningLinks()}
        {activeTab === 'certifications' && renderCertifications()}
        {activeTab === 'quizzes' && renderQuizzes()}
      </div>
    </div>
  );
}
