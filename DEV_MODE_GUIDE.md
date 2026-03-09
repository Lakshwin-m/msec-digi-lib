# Development Mode Guide

## Quick Start

Your Academic Library app is now configured to run in **Development Mode** without Firebase!

### How to Use

1. **Development Mode is ENABLED** by default in `.env.local`:
   ```env
   NEXT_PUBLIC_DEV_MODE=true
   ```

2. **Login Credentials** (any password works):
   - **Admin**: `ADMIN001` (or any register number with "admin")
   - **HOD**: `HOD001` (or any register number with "hod")
   - **Faculty**: `FAC001` (or any register number with "fac")
   - **Student**: `CS001` (or any other register number)

3. **What You Get**:
   - ✅ Full UI access without Firebase setup
   - ✅ Mock data for subjects, resources, links, and requests
   - ✅ All pages and features work
   - ✅ Role-based views (admin, student, faculty, HOD)

### Sample Data Included

- **5 Subjects** across semesters 3, 4, and 5
- **3 Resources** (lecture notes, question papers)
- **3 Learning Links** (MIT OCW, GeeksforGeeks, W3Schools)
- **2 Certification Links** (Coursera courses)
- **2 Sample Requests** (pending and approved)
- **3 Preparation Resources** (GATE, govt exams, higher studies)

### Testing Different Roles

To test different user roles, just login with:

| Role | Register Number | What You'll See |
|------|----------------|-----------------|
| **Admin** | `ADMIN001` | Full admin dashboard, manage subjects, resources, review requests |
| **HOD** | `HOD001` | HOD dashboard, view all data, approve requests |
| **Faculty** | `FAC001` | Faculty view, upload resources, manage subjects |
| **Student** | `CS001` | Student view, browse subjects, request resources |

### Switching to Production (Firebase)

When you're ready to connect Firebase:

1. Set up Firebase (follow `QUICK_START.md`)
2. Update `.env.local`:
   ```env
   NEXT_PUBLIC_DEV_MODE=false
   ```
3. Add your Firebase credentials to `.env.local`
4. Restart the dev server

### Current Status

✅ Development mode is **ACTIVE**
✅ Mock authentication enabled
✅ Mock data loaded
✅ All UI features available for testing

### Next Steps

1. **Check the UI**: Navigate to http://localhost:3000
2. **Login**: Use `ADMIN001` (or any register number) with any password
3. **Explore**: Browse subjects, resources, and all features
4. **Test Roles**: Try different register numbers to see different views

---

**Note**: In development mode, all create/update/delete operations will appear to work but won't persist data. This is perfect for UI testing!
