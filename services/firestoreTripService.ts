// services/firestoreTripService.ts
import { db } from './firebaseService';
import { collection, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import type { Trip } from '../types';

// 旅程を保存（新規 or 上書き）
export const saveTripToFirestore = async (trip: Trip) => {
  await setDoc(doc(collection(db, 'trips'), trip.id), trip);
};

// 旅程を1件取得
export const getTripFromFirestore = async (tripId: string): Promise<Trip | null> => {
  const docSnap = await getDoc(doc(collection(db, 'trips'), tripId));
  return docSnap.exists() ? (docSnap.data() as Trip) : null;
};

// 旅程をリアルタイム監視
export const subscribeTrip = (
  tripId: string,
  onUpdate: (trip: Trip | null) => void
) => {
  return onSnapshot(doc(collection(db, 'trips'), tripId), (docSnap) => {
    onUpdate(docSnap.exists() ? (docSnap.data() as Trip) : null);
  });
};