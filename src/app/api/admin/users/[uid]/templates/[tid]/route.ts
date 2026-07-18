import { adminDb, verifyAdminToken } from '@/lib/firebase-admin';
import { TemplateSettings } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

// Admin-only edit of a specific user's template. Bypasses Realtime Database
// rules via the Admin SDK — access is gated entirely by verifyAdminToken().
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string; tid: string }> },
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uid, tid } = await params;
  const { _id, createdAt, updatedAt, ...data } =
    (await request.json()) as Partial<TemplateSettings>;
  void _id;
  void createdAt;
  void updatedAt;

  await adminDb
    .ref(`users/${uid}/templates/${tid}`)
    .update({ ...data, updatedAt: Date.now() });

  return NextResponse.json({ success: true });
}
