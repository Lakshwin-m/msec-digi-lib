import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from './config';
import { Event } from '@/lib/types';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: unknown): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date();
};

export const createEvent = async (
  eventData: Omit<Event, 'id' | 'createdAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'events'), {
    ...eventData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getEvents = async (): Promise<Event[]> => {
  const q = query(
    collection(db, 'events'),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
    } as Event;
  });
};

export const deleteEvent = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'events', id));
};
