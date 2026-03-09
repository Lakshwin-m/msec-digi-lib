# Department Academic Library System

A production-ready, department-level digital academic library web application built with Next.js, Firebase, and Tailwind CSS. Designed for long-term institutional use with zero recurring costs using Firebase's free tier.

## Features

### Core Functionality
- **Role-Based Access Control**: Student, Faculty, HOD, and Admin roles
- **Semester-Based Organization**: Browse resources from Semester 1-8
- **Comprehensive Subject Structure**: Each subject includes:
  - Curriculum
  - Question Bank (QB)
  - Question Papers (QP)
  - Notes
  - Textbooks
  - Learning Links (YouTube, GeeksForGeeks, HackerRank, etc.)
  - Certification/Test Links
- **Preparation Hub**: Resources for GATE, Government Exams, IELTS, TOEFL, GRE, GMAT, and Higher Studies
- **Tech Trends**: Real-time technology trends from Dev.to API
- **Request System**: Students can request new subjects or resources

### Technical Highlights
- **No File Storage Costs**: All PDFs stored in Google Drive with links in Firestore
- **Firebase Free Tier**: Uses only Authentication and Firestore (no Cloud Functions or Storage)
- **Clean, Professional UI**: Neutral color palette, minimal design suitable for institutional deployment
- **Fully Responsive**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication (Email/Password)
- **Database**: Firestore
- **File Storage**: Google Drive (external)
- **Language**: TypeScript

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Firebase project (free tier)
- A Google Drive account for storing PDFs

## Setup Instructions

### 1. Clone and Install

```bash
cd academic-library
npm install
```

### 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider
4. Enable **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in **production mode**
   - Choose your region

### 3. Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Register your app and copy the configuration

### 4. Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   NEXT_PUBLIC_APP_NAME=Department Academic Library
   NEXT_PUBLIC_DEPARTMENT_NAME=Computer Science & Engineering
   NEXT_PUBLIC_EMAIL_DOMAIN=cse.university.edu
   ```

### 5. Firestore Security Rules

In Firebase Console, go to Firestore Database → Rules and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAdmin() {
      return getUserRole() in ['admin'];
    }
    
    function isHODOrAdmin() {
      return getUserRole() in ['hod', 'admin'];
    }
    
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /subjects/{subjectId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isHODOrAdmin();
    }
    
    match /resources/{resourceId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isHODOrAdmin();
    }
    
    match /learningLinks/{linkId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isHODOrAdmin();
    }
    
    match /certificationLinks/{linkId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isHODOrAdmin();
    }
    
    match /requests/{requestId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isHODOrAdmin();
    }
    
    match /preparationHub/{docId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isHODOrAdmin();
    }
  }
}
```

### 6. Create Initial Admin User

Since the first user needs to be an admin, you'll need to create them manually:

1. Run the development server:
   ```bash
   npm run dev
   ```

2. In Firebase Console, go to Authentication → Users
3. Click "Add user"
4. Enter:
   - Email: `ADMIN001@cse.university.edu` (use your email domain)
   - Password: (choose a secure password)

5. Copy the UID of the created user

6. In Firestore Database, create a new document:
   - Collection: `users`
   - Document ID: (paste the UID)
   - Fields:
     ```
     uid: (the UID)
     registerNumber: "ADMIN001"
     email: "ADMIN001@cse.university.edu"
     name: "Admin User"
     role: "admin"
     department: "Computer Science & Engineering"
     createdAt: (current timestamp)
     updatedAt: (current timestamp)
     ```

7. Now you can login with:
   - Register Number: `ADMIN001`
   - Password: (the password you set)

### 7. Google Drive Setup

For storing PDFs:

1. Create a Google Drive folder structure:
   ```
   Academic Library/
   ├── Semester 1/
   ├── Semester 2/
   ├── ...
   ├── Semester 8/
   └── Preparation Hub/
       ├── GATE/
       ├── IELTS/
       └── ...
   ```

2. When uploading PDFs:
   - Upload to appropriate folder
   - Right-click → Share → Get link
   - Set to "Anyone with the link can view"
   - Copy the link

3. In the admin panel, paste the Google Drive link when adding resources

## Running the Application

### Development
```bash
npm run dev
```
Visit `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables from `.env.local`
5. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Self-hosted with Node.js

## Usage Guide

### For Students/Faculty

1. **Login**: Use your register number and password
2. **Browse Semesters**: Click on any semester to view subjects
3. **View Resources**: Click on a subject to see all resources organized in tabs
4. **Submit Requests**: Request new subjects or resources via the request form
5. **Preparation Hub**: Access competitive exam resources
6. **Tech Trends**: Stay updated with latest technology articles

### For HOD/Admin

1. **Manage Subjects**:
   - Go to Admin → Manage Subjects
   - Add new subjects with code, name, semester, description
   
2. **Manage Resources**:
   - Go to Admin → Manage Resources
   - Add Google Drive links for PDFs
   - Categorize by type (curriculum, QB, QP, notes, textbooks)
   - Add learning links (YouTube, GeeksForGeeks, etc.)
   - Add certification links

3. **Review Requests**:
   - Go to Admin → Review Requests
   - Approve or reject student requests
   - Add notes for feedback

## Firestore Collections Structure

### users
```typescript
{
  uid: string
  registerNumber: string
  email: string
  name: string
  role: "student" | "faculty" | "hod" | "admin"
  department: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### subjects
```typescript
{
  id: string
  name: string
  code: string
  semester: number (1-8)
  department: string
  description: string
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
  isActive: boolean
}
```

### resources
```typescript
{
  id: string
  subjectId: string
  semester: number
  title: string
  type: "curriculum" | "qb" | "qp" | "notes" | "textbook" | "link"
  resourceType: "pdf" | "url"
  url: string (Google Drive link)
  description?: string
  visibility: "public" | "restricted"
  uploadedBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### requests
```typescript
{
  id: string
  requestType: "subject" | "resource"
  requestedBy: string
  requestedByName: string
  requestedByRegNo: string
  subjectName?: string
  resourceTitle?: string
  description: string
  semester?: number
  status: "pending" | "approved" | "rejected"
  reviewedBy?: string
  reviewedAt?: Timestamp
  reviewNotes?: string
  createdAt: Timestamp
}
```

## Troubleshooting

### Firebase Connection Issues
- Verify all environment variables are correct
- Check Firebase project settings
- Ensure Firestore and Authentication are enabled

### Login Issues
- Verify user exists in both Authentication and Firestore
- Check that email domain matches `NEXT_PUBLIC_EMAIL_DOMAIN`
- Ensure Firestore security rules are deployed

### Google Drive Links Not Working
- Ensure links are set to "Anyone with the link can view"
- Use direct file links, not folder links
- Test links in incognito mode

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase Console for errors
3. Check browser console for client-side errors
4. Review Firestore security rules

## License

This project is built for educational/institutional use.

---

Built with ❤️ for academic excellence
