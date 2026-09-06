import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Schedule,
  Subject,
  Lecturer,
  Room,
  ClassGroup,
  TimeSlot,
  AcademicYear,
  ReportSettings,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// -------------------------------------------------------------
// Jadwal (Schedules) Operations
// -------------------------------------------------------------

export async function fetchSchedulesFromFirestore(): Promise<Schedule[]> {
  const path = 'schedules';
  try {
    const snap = await getDocs(collection(db, path));
    const list: Schedule[] = [];
    snap.forEach((docItem) => {
      list.push(docItem.data() as Schedule);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveScheduleToFirestore(schedule: Schedule): Promise<void> {
  const path = `schedules/${schedule.id}`;
  try {
    await setDoc(doc(db, 'schedules', schedule.id), schedule);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteScheduleFromFirestore(scheduleId: string): Promise<void> {
  const path = `schedules/${scheduleId}`;
  try {
    await deleteDoc(doc(db, 'schedules', scheduleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function batchSaveSchedulesToFirestore(schedules: Schedule[]): Promise<void> {
  const CHUNK_SIZE = 450;
  for (let i = 0; i < schedules.length; i += CHUNK_SIZE) {
    const chunk = schedules.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const item of chunk) {
      const ref = doc(db, 'schedules', item.id);
      batch.set(ref, item);
    }
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'schedules (batch)');
    }
  }
}

export async function clearAllSchedulesFromFirestore(): Promise<void> {
  const path = 'schedules';
  try {
    const snap = await getDocs(collection(db, path));
    const CHUNK_SIZE = 450;
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
      const chunk = docs.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const d of chunk) {
        batch.delete(d.ref);
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToSchedules(
  onUpdate: (schedules: Schedule[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'schedules';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: Schedule[] = [];
      snap.forEach((d) => {
        list.push(d.data() as Schedule);
      });
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// -------------------------------------------------------------
// Master Data Operations (Simpan sebagai koleksi atau dokumen)
// -------------------------------------------------------------

export async function saveMasterCollection<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  const CHUNK_SIZE = 450;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const item of chunk) {
      const ref = doc(db, collectionName, item.id);
      batch.set(ref, item);
    }
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, collectionName);
    }
  }
}

export async function fetchMasterCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const snap = await getDocs(collection(db, collectionName));
    const list: T[] = [];
    snap.forEach((d) => {
      list.push(d.data() as T);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
    return [];
  }
}

// -------------------------------------------------------------
// Settings Operations
// -------------------------------------------------------------

export async function saveSettingsToFirestore(settings: ReportSettings): Promise<void> {
  const path = 'settings/report';
  try {
    await setDoc(doc(db, 'settings', 'report'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchSettingsFromFirestore(): Promise<ReportSettings | null> {
  const path = 'settings/report';
  try {
    const snap = await getDoc(doc(db, 'settings', 'report'));
    if (snap.exists()) {
      return snap.data() as ReportSettings;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}
