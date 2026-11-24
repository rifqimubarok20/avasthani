import { collection, deleteDoc, deleteField, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from '@react-native-firebase/firestore';
import { getFirebaseFirestore } from '@/services/firebase/firestore';

export interface Farm {
  id: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  boundary?: [number, number][];
  areaHectares: number;
  crops: string[];
  ownerUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FarmDraft {
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  boundary?: [number, number][];
  areaHectares: number;
  crops: string[];
}

export async function listFarms(uid: string): Promise<Farm[]> {
  const db = await getFirebaseFirestore();
  const snapshot = await getDocs(query(collection(db, 'users', uid, 'farms'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((item) => {
    const data = item.data() as Omit<Farm, 'boundary'> & { boundary?: unknown };
    const boundary = decodeBoundary(data.boundary);
    return {
      ...data,
      ...(boundary ? { boundary } : {}),
    } as Farm;
  });
}

export async function createFarm(uid: string, input: FarmDraft): Promise<void> {
  const db = await getFirebaseFirestore();
  const farmRef = doc(collection(db, 'users', uid, 'farms'));
  const farm = {
    id: farmRef.id,
    name: input.name.trim(),
    location: input.location.trim(),
    ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
    ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
    ...(input.boundary?.length ? { boundary: encodeBoundary(input.boundary) } : {}),
    areaHectares: input.areaHectares,
    crops: input.crops,
    ownerUid: uid,
  };
  await setDoc(farmRef, { ...farm, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateFarm(uid: string, farmId: string, input: FarmDraft): Promise<void> {
  const db = await getFirebaseFirestore();
  const update: Record<string, unknown> = {
    name: input.name.trim(),
    location: input.location.trim(),
    latitude: input.latitude ?? deleteField(),
    longitude: input.longitude ?? deleteField(),
    areaHectares: input.areaHectares,
    crops: input.crops,
    updatedAt: serverTimestamp(),
  };
  if (input.boundary !== undefined) {
    update.boundary = input.boundary.length ? encodeBoundary(input.boundary) : deleteField();
  }
  await updateDoc(doc(db, 'users', uid, 'farms', farmId), {
    ...update,
  });
}

function encodeBoundary(boundary: [number, number][]) {
  return boundary.map(([latitude, longitude]) => ({ latitude, longitude }));
}

function decodeBoundary(value: unknown): [number, number][] | undefined {
  if (!Array.isArray(value)) return undefined;
  const points = value.flatMap((point): [number, number][] => {
    if (typeof point !== 'object' || point === null || !('latitude' in point) || !('longitude' in point)) return [];
    const { latitude, longitude } = point as { latitude: unknown; longitude: unknown };
    return typeof latitude === 'number' && typeof longitude === 'number' ? [[latitude, longitude]] : [];
  });
  return points.length >= 3 ? points : undefined;
}

export async function removeFarm(uid: string, farmId: string): Promise<void> {
  const db = await getFirebaseFirestore();
  await deleteDoc(doc(db, 'users', uid, 'farms', farmId));
}
