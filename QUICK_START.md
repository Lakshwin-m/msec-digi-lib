# Quick Start Guide - Academic Library System

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] A Firebase account (free)
- [ ] A Google Drive account
- [ ] A code editor (VS Code recommended)

## Step-by-Step Setup (15 minutes)

### Step 1: Firebase Project Setup (5 minutes)

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name: `academic-library` (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Firebase Services (3 minutes)

**Enable Authentication:**
1. In Firebase Console, click "Authentication" in left sidebar
2. Click "Get started"
3. Click "Sign-in method" tab
4. Click "Email/Password"
5. Toggle "Enable"
6. Click "Save"

**Enable Firestore:**
1. Click "Firestore Database" in left sidebar
2. Click "Create database"
3. Select "Start in production mode"
4. Choose your region (closest to your users)
5. Click "Enable"

### Step 3: Get Firebase Configuration (2 minutes)

1. Click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll to "Your apps" section
4. Click the web icon `</>`
5. Register app name: `Academic Library Web`
6. **DON'T** check "Also set up Firebase Hosting"
7. Click "Register app"
8. **COPY** the firebaseConfig object - you'll need this!

It looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 4: Configure Your App (2 minutes)

1. Open `.env.local` in your code editor
2. Replace the placeholder values with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...  # Your apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Customize these:
NEXT_PUBLIC_APP_NAME=CS Department Library
NEXT_PUBLIC_DEPARTMENT_NAME=Computer Science & Engineering
NEXT_PUBLIC_EMAIL_DOMAIN=cse.university.edu
```

3. Save the file

### Step 5: Deploy Firestore Security Rules (2 minutes)

1. In Firebase Console, go to "Firestore Database"
2. Click "Rules" tab
3. Delete everything and paste the contents from `FIRESTORE_RULES.txt`
4. Click "Publish"

### Step 6: Create Your First Admin User (3 minutes)

**In Firebase Console:**

1. Go to "Authentication" → "Users" tab
2. Click "Add user"
3. Enter:
   - Email: `ADMIN001@cse.university.edu` (use your email domain from .env.local)
   - Password: Choose a strong password (save it!)
4. Click "Add user"
5. **COPY the UID** (long string like `xYz123...`)

**In Firestore:**

1. Go to "Firestore Database" → "Data" tab
2. Click "Start collection"
3. Collection ID: `users`
4. Click "Next"
5. Document ID: Paste the UID you copied
6. Add these fields (click "Add field" for each):

| Field | Type | Value |
|-------|------|-------|
| uid | string | (paste the UID again) |
| registerNumber | string | ADMIN001 |
| email | string | ADMIN001@cse.university.edu |
| name | string | Admin User |
| role | string | admin |
| department | string | Computer Science & Engineering |
| createdAt | timestamp | (click clock icon, select "now") |
| updatedAt | timestamp | (click clock icon, select "now") |

7. Click "Save"

### Step 7: Run the Application

```bash
cd academic-library
npm install  # If you haven't already
npm run dev
```

Visit: http://localhost:3000

**Login with:**
- Register Number: `ADMIN001`
- Password: (the password you set in Step 6)

## What to Do Next

### As Admin, You Can:

1. **Add Your First Subject**
   - Go to Admin → Manage Subjects
   - Click "Add Subject"
   - Fill in: Name, Code, Semester, Description

2. **Add Resources**
   - Upload a PDF to Google Drive
   - Right-click → Share → "Anyone with link can view"
   - Copy the link
   - Go to Admin → Manage Resources
   - Paste the Google Drive link

3. **Create More Users**
   - Repeat Step 6 for each user
   - Change the `role` field to: `student`, `faculty`, or `hod`
   - Use register numbers like: `CS001`, `CS002`, etc.

## Common Issues

### "Firebase: Error (auth/invalid-api-key)"
- Check that your API key in `.env.local` is correct
- Restart the dev server after changing `.env.local`

### "Missing or insufficient permissions"
- Make sure you deployed the Firestore security rules
- Check that the user document exists in Firestore

### "User not found"
- Verify the user exists in both Authentication AND Firestore
- Check that the email domain matches `NEXT_PUBLIC_EMAIL_DOMAIN`

### Build hangs on "Running TypeScript"
- This is normal if Firebase env vars are placeholders
- Once you add real Firebase credentials, build will complete

## Production Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/academic-library.git
   git push -u origin main
   ```

2. Go to https://vercel.com
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Add environment variables (copy from `.env.local`)
6. Click "Deploy"

Your app will be live at: `https://your-project.vercel.app`

## Next Steps

- [ ] Add more subjects for all 8 semesters
- [ ] Upload PDFs to Google Drive and add links
- [ ] Create student/faculty user accounts
- [ ] Add learning links (YouTube, GeeksForGeeks, etc.)
- [ ] Add certification links
- [ ] Populate preparation hub resources
- [ ] Test all features
- [ ] Deploy to production

## Need Help?

Check these files:
- `README.md` - Comprehensive documentation
- `walkthrough.md` - Feature walkthrough
- `FIRESTORE_RULES.txt` - Security rules

## Success Checklist

- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore enabled
- [ ] Security rules deployed
- [ ] `.env.local` configured
- [ ] Admin user created
- [ ] App runs locally
- [ ] Successfully logged in
- [ ] Can access admin dashboard

🎉 **Congratulations!** Your academic library system is ready to use.
