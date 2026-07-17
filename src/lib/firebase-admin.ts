import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const ADMIN_APP = 'billcraft-admin';

const adminApp =
  getApps().find((a) => a.name === ADMIN_APP) ??
  initializeApp(
    {
      credential: cert({
        projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
    },
    ADMIN_APP,
  );

export const adminAuth = getAuth(adminApp);

export const ADMIN_EMAIL = 'admin@billcraft.com';

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}
