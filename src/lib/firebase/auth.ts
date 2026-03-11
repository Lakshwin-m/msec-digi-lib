import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { User } from '@/lib/types';

const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google - Restricted to @msec.edu.in domain
 */
export const signInWithGoogle = async (forcedRole?: 'student' | 'admin'): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // 1. Domain Validation
    if (!firebaseUser.email?.endsWith('@msec.edu.in')) {
      // Sign out immediately if domain check fails
      await firebaseSignOut(auth);
      throw new Error('Access restricted. Please use your official @msec.edu.in account.');
    }

    // 2. Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      return getCurrentUser();
    }

    // 3. Auto-provision for first-time Google sign-in (Sign Up)
    const newUser = {
      registerNumber: firebaseUser.email.split('@')[0].toUpperCase(),
      email: firebaseUser.email,
      name: firebaseUser.displayName || 'MSEC Member',
      role: forcedRole || 'student' as const, // Default role or forced role
      department: 'General',   // Default department
      dob: '00000000',          // Placeholder for Google-based users
      points: 0,
      streak: 0,
      completedQuizzes: [],
      completedTests: [],
      completedCertifications: [],
      weeklyActivity: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

    return {
      uid: firebaseUser.uid,
      ...newUser,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error: any) {
    console.error('[Google-IDP] Sign-In Error:', error);
    if (error.code === 'auth/popup-closed-by-user') return null;
    
    // Provide user friendly message for permission errors
    if (error.code === 'permission-denied' || (error.message && error.message.includes('permission'))) {
      throw new Error('Firestore Permissions Error: Did you apply the security rules? ' + error.message);
    }
    
    throw new Error(error.message || 'Google Sign-In failed');
  }
};

/**
 * Sign up a new user with academic details
 */
export const signUpWithDetails = async (
  details: {
    name: string;
    email: string;
    registerNumber: string;
    department: string;
    role: 'student' | 'admin';
    dob: string;
  }
): Promise<User> => {
  try {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, details.email, details.dob);
    const firebaseUser = userCredential.user;

    // 2. Create user document in Firestore
    const userData = {
      registerNumber: details.registerNumber,
      email: details.email,
      name: details.name,
      role: details.role,
      department: details.department,
      dob: details.dob,
      points: 0,
      streak: 0,
      completedQuizzes: [],
      completedTests: [],
      completedCertifications: [],
      weeklyActivity: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    return {
      uid: firebaseUser.uid,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered.');
    }
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Sign in with register number and password
 * Converts register number to email format before authentication.
 * Includes auto-provisioning: If user doesn't exist in Auth but exists in Firestore
 * with matching DOB, they are automatically created in Auth.
 */
export const signInWithRegisterNumber = async (
  registerNumber: string,
  password: string
): Promise<User> => {
  const emailDomain = process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'university.edu';
  const email = `${registerNumber}@${emailDomain}`;

  try {
    // 1. Attempt to sign in first
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found in database');
    }

    const userData = userDoc.data();

    return {
      uid: firebaseUser.uid,
      registerNumber: userData.registerNumber,
      email: firebaseUser.email || email,
      name: userData.name,
      role: userData.role,
      department: userData.department,
      dob: userData.dob,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date(),
    };
  } catch (signinError: any) {
    // 2. If user not found or invalid credentials, attempt auto-provisioning
    if (
      signinError.code === 'auth/user-not-found' || 
      signinError.code === 'auth/invalid-credential' ||
      signinError.code === 'auth/wrong-password'
    ) {
      try {
        // Search Firestore for a user with this register number
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('registerNumber', '==', registerNumber));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('Invalid register number or password');
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // 3. Verify DOB (password) matches Firestore record
        if (userData.dob !== password) {
          throw new Error('Invalid register number or password');
        }

        // 4. Create user in Firebase Auth since they exist in DB with correct DOB
        // Note: If this fails because user already exists, it means the password provided 
        // was actually wrong in the first attempt, or there's an email conflict.
        const newUserCred = await createUserWithEmailAndPassword(auth, email, password);
        const newFirebaseUser = newUserCred.user;

        // If the Firestore document ID is not the same as the new UID, 
        // in a real scenario we'd might want to migrate it, but for now we assume 
        // either they match or we create a new auth record.
        // Usually, for auto-provisioning, we'd want the Firestore document to exist already.
        
        return {
          uid: newFirebaseUser.uid,
          registerNumber: userData.registerNumber,
          email: newFirebaseUser.email || email,
          name: userData.name,
          role: userData.role,
          department: userData.department,
          dob: userData.dob,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        };
      } catch (provisionError: any) {
        if (provisionError.code === 'auth/email-already-in-use') {
          // This should have worked in first attempt if email domain is consistent
          throw new Error('Invalid register number or password');
        }
        throw new Error(provisionError.message || 'Authentication failed');
      }
    }
    
    // For other auth errors (e.g., config problems)
    const errorMsg = signinError.message || 'An unexpected error occurred during sign in';
    if (errorMsg.includes('configuration-not-found')) {
      throw new Error('Firebase Auth is not correctly configured. Please enable Email/Password provider.');
    }
    throw new Error(errorMsg);
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred during sign out');
  }
};

/**
 * Get the current authenticated user with role data
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    return null;
  }

  try {
    // 1. Try fetching by UID (preferred)
    let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    let userData = userDoc.exists() ? userDoc.data() : null;
    let finalDocId = userDoc.exists() ? userDoc.id : firebaseUser.uid;

    // 2. Fallback: If UID lookup fails, try querying by register number (extracted from email)
    if (!userData && firebaseUser.email) {
      const registerNumber = firebaseUser.email.split('@')[0];
      const q = query(collection(db, 'users'), where('registerNumber', '==', registerNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        userData = docSnap.data();
        finalDocId = docSnap.id;
        
        // OPTIONAL: Update the document to use the new UID for better performance in future
        // We'll just use the data for now to ensure functional login
      }
    }

    if (!userData) {
      return null;
    }

    return {
      uid: finalDocId,
      registerNumber: userData.registerNumber,
      email: firebaseUser.email || '',
      name: userData.name,
      role: userData.role,
      department: userData.department,
      dob: userData.dob,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date(),
      // Gamification
      points: userData.points || 0,
      streak: userData.streak || 0,
      lastActiveDate: userData.lastActiveDate?.toDate() || null,
      completedQuizzes: userData.completedQuizzes || [],
      completedTests: userData.completedTests || [],
      completedCertifications: userData.completedCertifications || [],
      weeklyActivity: userData.weeklyActivity || [],
    };
  } catch (error: any) {
    // If it's a permission error, it's very likely the security rules aren't applied or user document is missing
    if (error.code === 'permission-denied') {
      console.error('🔥 CRITICAL: Firestore Security Rules violation fetching user data.', error);
    } else {
      console.error('Error fetching user data:', error);
    }
    return null;
  }
};

/**
 * Subscribe to authentication state changes
 */
export const onAuthStateChange = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

