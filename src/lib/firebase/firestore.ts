import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  runTransaction,
} from 'firebase/firestore';
import { db } from './config';
import {
  Subject,
  Resource,
  LearningLink,
  CertificationLink,
  Request,
  CertificateSubmission,
  PreparationResource,
  User,
  Quiz,
  Event,
} from '@/lib/types';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: unknown): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date();
};

// ==================== SUBJECTS ====================

export const getSubjectsBySemester = async (semester: number): Promise<Subject[]> => {
  const q = query(
    collection(db, 'subjects'),
    where('semester', '==', semester),
    where('isActive', '==', true)
  );

  const snapshot = await getDocs(q);
  const subjects = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as Subject;
  });

  return subjects.sort((a, b) => a.name.localeCompare(b.name));
};

export const getSubjectById = async (id: string): Promise<Subject | null> => {
  const docRef = doc(db, 'subjects', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as Subject;
};

export const getAllSubjects = async (department?: string): Promise<Subject[]> => {
  let q = query(collection(db, 'subjects'), orderBy('semester'), orderBy('name'));
  
  if (department && department !== 'General') {
    q = query(collection(db, 'subjects'), where('department', '==', department), orderBy('semester'), orderBy('name'));
  }
  
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as Subject;
  });
};

export const createSubject = async (
  subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'subjects'), {
    ...subjectData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateSubject = async (
  id: string,
  subjectData: Partial<Subject>
): Promise<void> => {
  const docRef = doc(db, 'subjects', id);
  await updateDoc(docRef, {
    ...subjectData,
    updatedAt: Timestamp.now(),
  });
};

export const deleteSubject = async (id: string): Promise<void> => {
  const docRef = doc(db, 'subjects', id);
  await deleteDoc(docRef);
};

export const migrateSubjectsDepartment = async (): Promise<number> => {
  const subjects = await getAllSubjects();
  let updatedCount = 0;

  for (const subject of subjects) {
    if (subject.semester === 6 && subject.department !== 'CSE') {
      await updateSubject(subject.id, { department: 'CSE' });
      updatedCount++;
    }
  }

  return updatedCount;
};

// ==================== RESOURCES ====================

export const getResourcesBySubject = async (
  subjectId: string,
  type?: string
): Promise<Resource[]> => {
  const constraints: QueryConstraint[] = [
    where('subjectId', '==', subjectId),
  ];

  if (type) {
    constraints.push(where('type', '==', type));
  }

  const q = query(collection(db, 'resources'), ...constraints);
  const snapshot = await getDocs(q);

  const resources = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as Resource;
  });

  return resources.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getResourceById = async (id: string): Promise<Resource | null> => {
  const docRef = doc(db, 'resources', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as Resource;
};

export const createResource = async (
  resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'resources'), {
    ...resourceData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateResource = async (
  id: string,
  resourceData: Partial<Resource>
): Promise<void> => {
  const docRef = doc(db, 'resources', id);
  await updateDoc(docRef, {
    ...resourceData,
    updatedAt: Timestamp.now(),
  });
};

export const deleteResource = async (id: string): Promise<void> => {
  const docRef = doc(db, 'resources', id);
  await deleteDoc(docRef);
};

// ==================== LEARNING LINKS ====================

export const getLearningLinksBySubject = async (
  subjectId: string
): Promise<LearningLink[]> => {
  const q = query(
    collection(db, 'learningLinks'),
    where('subjectId', '==', subjectId)
  );
  const snapshot = await getDocs(q);

  const links = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
    } as LearningLink;
  });

  return links.sort((a, b) => a.platform.localeCompare(b.platform));
};

export const createLearningLink = async (
  linkData: Omit<LearningLink, 'id' | 'createdAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'learningLinks'), {
    ...linkData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const deleteLearningLink = async (id: string): Promise<void> => {
  const docRef = doc(db, 'learningLinks', id);
  await deleteDoc(docRef);
};

// ==================== CERTIFICATION LINKS ====================

export const getCertificationLinksBySubject = async (
  subjectId: string
): Promise<CertificationLink[]> => {
  const q = query(
    collection(db, 'certificationLinks'),
    where('subjectId', '==', subjectId)
  );
  const snapshot = await getDocs(q);

  const links = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
    } as CertificationLink;
  });

  return links.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const createCertificationLink = async (
  linkData: Omit<CertificationLink, 'id' | 'createdAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'certificationLinks'), {
    ...linkData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const deleteCertificationLink = async (id: string): Promise<void> => {
  const docRef = doc(db, 'certificationLinks', id);
  await deleteDoc(docRef);
};

// ==================== REQUESTS ====================

export const getRequestsByUser = async (userId: string): Promise<Request[]> => {
  const q = query(
    collection(db, 'requests'),
    where('requestedBy', '==', userId)
  );
  const snapshot = await getDocs(q);

  const requests = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      reviewedAt: data.reviewedAt ? convertTimestamp(data.reviewedAt) : undefined,
    } as Request;
  });

  return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getAllRequests = async (): Promise<Request[]> => {
  const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      reviewedAt: data.reviewedAt ? convertTimestamp(data.reviewedAt) : undefined,
    } as Request;
  });
};

export const getPendingRequests = async (department?: string): Promise<Request[]> => {
  let q = query(
    collection(db, 'requests'),
    where('status', '==', 'pending')
  );

  if (department && department !== 'General') {
    q = query(
      collection(db, 'requests'),
      where('status', '==', 'pending'),
      where('department', '==', department)
    );
  }
  const snapshot = await getDocs(q);

  const requests = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      reviewedAt: data.reviewedAt ? convertTimestamp(data.reviewedAt) : undefined,
    } as Request;
  });

  return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const createRequest = async (
  requestData: Omit<Request, 'id' | 'createdAt' | 'status'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'requests'), {
    ...requestData,
    status: 'pending',
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const reviewRequest = async (
  id: string,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  reviewNotes?: string
): Promise<void> => {
  const docRef = doc(db, 'requests', id);
  await updateDoc(docRef, {
    status,
    reviewedBy,
    reviewedAt: Timestamp.now(),
    reviewNotes: reviewNotes || '',
  });
};

// ==================== PREPARATION HUB ====================

export const getPreparationResourcesByCategory = async (
  category: string
): Promise<PreparationResource[]> => {
  const q = query(
    collection(db, 'preparationHub'),
    where('category', '==', category)
  );
  const snapshot = await getDocs(q);

  const resources = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
    } as PreparationResource;
  });

  return resources.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const createPreparationResource = async (
  resourceData: Omit<PreparationResource, 'id' | 'createdAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'preparationHub'), {
    ...resourceData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const deletePreparationResource = async (id: string): Promise<void> => {
  const docRef = doc(db, 'preparationHub', id);
  await deleteDoc(docRef);
};

// ==================== QUIZZES ====================

export const getQuizzesBySubject = async (
  subjectId: string
): Promise<Quiz[]> => {
  const q = query(
    collection(db, 'quizzes'),
    where('subjectId', '==', subjectId)
  );
  const snapshot = await getDocs(q);

  const quizzes = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
    } as Quiz;
  });

  return quizzes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getQuizById = async (id: string): Promise<Quiz | null> => {
  const docRef = doc(db, 'quizzes', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: convertTimestamp(data.createdAt),
  } as Quiz;
};

export const createQuiz = async (
  quizData: Omit<Quiz, 'id' | 'createdAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'quizzes'), {
    ...quizData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const completeQuizAction = async (
  userId: string,
  quizId: string,
  quizPoints: number
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  
  const userData = userSnap.data();
  const completedQuizzes = userData.completedQuizzes || [];
  
  if (!completedQuizzes.includes(quizId)) {
    await updateDoc(userRef, {
      completedQuizzes: [...completedQuizzes, quizId],
    });
    // Update streak and add quiz points
    await updateUserStreak(userId, quizPoints);
  } else {
    // If already completed, just update streak (no extra quiz points, or maybe less?)
    await updateUserStreak(userId, 0);
  }
};

export const completeTestAction = async (
  userId: string,
  testId: string,
  testPoints: number = 20
): Promise<void> => {
  try {
    console.log(`[Gamification] Triggering action for test: ${testId} (Points: ${testPoints}) for User: ${userId}`);
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error(`[Gamification] CRITICAL: User Document ${userId} not found in Firestore. Check Auth UID vs Doc ID.`);
      return;
    }
    
    const userData = userSnap.data();
    const completedTests = userData.completedTests || [];
    
    if (!completedTests.includes(testId)) {
      console.log(`[Gamification] New test completion detected. Awarding ${testPoints} XP.`);
      await updateDoc(userRef, {
        completedTests: [...completedTests, testId],
      });
      await updateUserStreak(userId, testPoints);
    } else {
      console.log(`[Gamification] Test already completed. Refreshing streak only.`);
      await updateUserStreak(userId, 0);
    }
  } catch (error) {
    console.error(`[Gamification] completeTestAction Error:`, error);
  }
};

// ==================== GAMIFICATION ====================

export const getLeaderboard = async (limitCount = 5): Promise<User[]> => {
  const q = query(
    collection(db, 'users'), 
    where('role', '==', 'student'), // Only show students
    orderBy('points', 'desc'), 
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      registerNumber: data.registerNumber || '',
      email: data.email || '',
      name: data.name || '',
      role: data.role || '',
      department: data.department || '',
      dob: data.dob || '',
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      // Gamification
      points: data.points || 0,
      streak: data.streak || 0,
      lastActiveDate: data.lastActiveDate?.toDate() || null,
      completedQuizzes: data.completedQuizzes || [],
      completedTests: data.completedTests || [],
      completedCertifications: data.completedCertifications || [],
      weeklyActivity: data.weeklyActivity || [],
    };
  });
};

export const updateUserStreak = async (userId: string, additionalPoints: number = 0): Promise<void> => {
  const userRef = doc(db, 'users', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const lastActive = userData.lastActiveDate instanceof Timestamp ? userData.lastActiveDate.toDate() : null;
      const now = new Date();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      let needsUpdate = false;
      let newStreak = userData.streak || 0;
      let points = (userData.points || 0) + additionalPoints;
      
      if (additionalPoints > 0) needsUpdate = true;
      
      if (lastActive) {
        const lastActiveDate = new Date(lastActive);
        lastActiveDate.setHours(0, 0, 0, 0);
        
        const diffTime = today.getTime() - lastActiveDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) {
          newStreak += 1;
          points += 10; // Consecutive day bonus
          needsUpdate = true;
        } else if (diffDays > 1) {
          // Streak broken: Reset to 0 unless they are performing an action now
          newStreak = additionalPoints > 0 ? 1 : 0;
          needsUpdate = true;
        } else if (diffDays === 0 && additionalPoints > 0 && newStreak === 0) {
          // If they were at 0 (from a previous visit today or a brand new reset), and now doing an action
          newStreak = 1;
          needsUpdate = true;
        }
        // Same day (0) keeps existing streak
      } else if (additionalPoints > 0 || (userData.points === undefined)) {
        // First time ever performing an action or missing points field
        newStreak = 1;
        needsUpdate = true;
      }

      if (!needsUpdate && additionalPoints === 0) {
        // If it's the same day and no points added, we can probably skip
        // but let's check if the weekly activity needs syncing
        const weeklyActivity = userData.weeklyActivity || [];
        const todayActivityIndexInCheck = weeklyActivity.findIndex((a: any) => a.date === todayStr);
        
        if (todayActivityIndexInCheck !== -1) {
          // Already has activity for today, and no points added
          console.log(`[Gamification] No update needed for ${userId} (Already active today)`);
          return;
        }
      }

      // Track Daily XP in Weekly Activity (Using Local Date for consistency)
      let weeklyActivity = userData.weeklyActivity || [];
      const totalWeeklyXP = weeklyActivity.reduce((acc: number, curr: any) => acc + (curr.xp || curr.minutes || 0), 0);
      const todayActivityIndex = weeklyActivity.findIndex((a: any) => a.date === todayStr);
      
      // Calculate what was earned in THIS transaction
      let pointsAwardedNow = additionalPoints;
      if (lastActive && (newStreak > userData.streak)) pointsAwardedNow += 10;

      if (todayActivityIndex !== -1) {
        // Update existing entry
        let currentXP = weeklyActivity[todayActivityIndex].xp || weeklyActivity[todayActivityIndex].minutes || 0;
        
        // SYNC: If user has global points but the graph is empty/0, 
        // sync the global points into today's activity so it doesn't show 0.
        if (totalWeeklyXP === 0 && (userData.points || 0) > 0) {
          currentXP = (userData.points || 0);
        }

        weeklyActivity[todayActivityIndex].xp = currentXP + pointsAwardedNow;
        if (weeklyActivity[todayActivityIndex].minutes) delete weeklyActivity[todayActivityIndex].minutes;
      } else if (pointsAwardedNow > 0 || (totalWeeklyXP === 0 && (userData.points || 0) > 0)) {
        // Create new daily entry only if something was earned or we are syncing existing points
        const baseXP = totalWeeklyXP === 0 ? (userData.points || 0) : 0;
        weeklyActivity.push({
          date: todayStr,
          xp: baseXP + pointsAwardedNow
        });
      }

      // Keep only last 7 active days
      if (weeklyActivity.length > 7) {
        weeklyActivity = weeklyActivity.slice(-7);
      }

      transaction.update(userRef, {
        lastActiveDate: Timestamp.now(),
        streak: newStreak,
        points: points,
        weeklyActivity: weeklyActivity,
        updatedAt: Timestamp.now()
      });
      
      console.log(`[Gamification] Update successful. Total XP: ${points}, Today XP: ${pointsAwardedNow}`);
    });
  } catch (error) {
    console.error('[Gamification] Transaction failed:', error);
  }
};
// ==================== CERTIFICATION SUBMISSIONS ====================

export const submitCertificate = async (
  submissionData: Omit<CertificateSubmission, 'id' | 'status' | 'xpValue' | 'submittedAt' | 'approvedBy' | 'approvedAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'certificate_submissions'), {
    ...submissionData,
    status: 'pending',
    xpValue: 0,
    submittedAt: Timestamp.now(),
    approvedBy: null,
    approvedAt: null
  });
  return docRef.id;
};

export const getCertificatesByUser = async (userId: string): Promise<CertificateSubmission[]> => {
  const q = query(
    collection(db, 'certificate_submissions'),
    where('studentUid', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  const certs = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      submittedAt: data.submittedAt?.toDate() || new Date(),
      approvedAt: data.approvedAt?.toDate() || undefined,
    } as CertificateSubmission;
  });

  return certs.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
};

export const getCertificatesByStatus = async (status: string, department?: string): Promise<CertificateSubmission[]> => {
  let q = query(
    collection(db, 'certificate_submissions'),
    where('status', '==', status)
  );

  if (department && department !== 'General') {
    q = query(
      collection(db, 'certificate_submissions'),
      where('status', '==', status),
      where('department', '==', department)
    );
  }
  
  const snapshot = await getDocs(q);
  const certs = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      submittedAt: data.submittedAt?.toDate() || new Date(),
      approvedAt: data.approvedAt?.toDate() || undefined,
    } as CertificateSubmission;
  });

  return certs.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
};

export const approveCertificateAction = async (
  submissionId: string,
  adminUid: string,
  xpValue: number
): Promise<void> => {
  const { runTransaction } = await import('firebase/firestore');
  const submissionRef = doc(db, 'certificate_submissions', submissionId);

  await runTransaction(db, async (transaction) => {
    const submissionDoc = await transaction.get(submissionRef);
    if (!submissionDoc.exists()) throw new Error("Submission not found");
    
    const submissionData = submissionDoc.data();
    if (submissionData.status !== 'pending') throw new Error("Submission already processed");

    const studentUid = submissionData.studentUid;
    const userRef = doc(db, 'users', studentUid);
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists()) throw new Error("User document not found");
    const userData = userDoc.data();

    // 1. Update Submission
    transaction.update(submissionRef, {
      status: 'approved',
      xpValue: xpValue,
      approvedBy: adminUid,
      approvedAt: Timestamp.now()
    });

    // 2. Update User (Atomic)
    // Points is current field for totalXP
    const currentPoints = userData.points || 0;
    const currentCertCount = userData.certificationsApproved || 0;
    const currentCerts = userData.completedCertifications || [];

    transaction.update(userRef, {
      points: currentPoints + xpValue,
      certificationsApproved: currentCertCount + 1,
      completedCertifications: [...currentCerts, submissionId],
      updatedAt: Timestamp.now()
    });
  });
};

export const rejectCertificateAction = async (
  submissionId: string,
  adminUid: string,
  reason: string
): Promise<void> => {
  const submissionRef = doc(db, 'certificate_submissions', submissionId);
  await updateDoc(submissionRef, {
    status: 'rejected',
    rejectionReason: reason,
    approvedBy: adminUid,
    approvedAt: Timestamp.now()
  });
};
