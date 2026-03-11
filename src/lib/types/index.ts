// Type definitions for the academic library system

export type UserRole = 'student' | 'faculty' | 'hod' | 'admin';

export type Department = 'CSE' | 'CIVIL' | 'IT' | 'MECH' | 'AIDS' | 'ECE' | 'EEE';

export const DEPARTMENTS: Department[] = ['CSE', 'CIVIL', 'IT', 'MECH', 'AIDS', 'ECE', 'EEE'];

export type ResourceType = 'curriculum' | 'qb' | 'qp' | 'notes' | 'textbook' | 'link' | 'certificate';

export type ResourceFormat = 'pdf' | 'url';

export type Visibility = 'public' | 'restricted';

export type RequestType = 'subject' | 'resource';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export type LearningPlatform = 'youtube' | 'geeksforgeeks' | 'hackerrank' | 'other';

export type PreparationCategory = 'gate' | 'govt_exams' | 'ielts' | 'toefl' | 'gre' | 'gmat' | 'higher_studies';

export interface User {
  uid: string;
  registerNumber: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  dob: string; // Date of Birth used as password (e.g., DDMMYYYY)
  createdAt: Date;
  updatedAt: Date;
  // Gamification & Progress
  points?: number;
  streak?: number;
  lastActiveDate?: Date;
  completedQuizzes?: string[];
  completedTests?: string[];
  completedCertifications?: string[];
  certificationsApproved?: number;
  weeklyActivity?: {
    date: string; // YYYY-MM-DD
    xp: number;
  }[];
}

export interface Quiz {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  questions: Question[];
  points: number;
  timeLimit?: number; // in minutes
  createdBy: string;
  createdAt: Date;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  department: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Resource {
  id: string;
  subjectId: string;
  semester: number;
  title: string;
  type: ResourceType;
  resourceType: ResourceFormat;
  url: string;
  description?: string;
  visibility: Visibility;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningLink {
  id: string;
  subjectId: string;
  platform: LearningPlatform;
  title: string;
  url: string;
  description?: string;
  addedBy: string;
  createdAt: Date;
}

export interface CertificationLink {
  id: string;
  subjectId: string;
  title: string;
  url: string;
  provider: string;
  description?: string;
  addedBy: string;
  createdAt: Date;
}

export interface Request {
  id: string;
  requestType: RequestType;
  requestedBy: string;
  requestedByName: string;
  requestedByRegNo: string;
  subjectName?: string;
  resourceTitle?: string;
  description: string;
  semester?: number;
  department?: string;
  status: RequestStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
}

export interface PreparationResource {
  id: string;
  category: PreparationCategory;
  title: string;
  type: ResourceType;
  resourceType: ResourceFormat;
  url: string;
  description?: string;
  visibility: Visibility;
  uploadedBy: string;
  createdAt: Date;
}

export interface CertificateSubmission {
  id: string;
  studentId: string; // regNo
  studentUid: string;
  studentName: string;
  department: string;
  subject: string;
  certificateTitle: string;
  platform: string;
  driveLink: string;
  verificationLink?: string;
  status: RequestStatus;
  xpValue: number;
  submittedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export interface GlobalTrend {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  user: {
    name: string;
    username: string;
  };
  tag_list: string[];
  reading_time_minutes: number;
}

export type EventType = 'hackathon' | 'symposium' | 'conference' | 'tech_event' | 'cultural' | 'sports' | 'other';

export interface Event {
  id: string;
  collegeName: string;
  type: EventType;
  eventName: string;
  address: string;
  eventSite: string; // URL
  description?: string;
  date?: string;
  postedBy: {
    uid: string;
    name: string;
    role: string;
  };
  createdAt: Date;
}
