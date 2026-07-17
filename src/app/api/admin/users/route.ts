import { adminAuth, verifyAdminToken } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await adminAuth.listUsers(1000);
  const users = result.users.map((u) => ({
    uid:           u.uid,
    email:         u.email ?? '',
    displayName:   u.displayName ?? '',
    photoURL:      u.photoURL ?? null,
    disabled:      u.disabled,
    emailVerified: u.emailVerified,
    createdAt:     u.metadata.creationTime,
    lastSignIn:    u.metadata.lastSignInTime,
    providers:     u.providerData.map((p) => p.providerId),
  }));

  return NextResponse.json({ users });
}
