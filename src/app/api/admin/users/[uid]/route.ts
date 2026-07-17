import { ADMIN_EMAIL, adminAuth, verifyAdminToken } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

async function guard(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const err = await guard(request);
  if (err) return err;

  const { uid } = await params;

  // Prevent deleting the admin account itself
  const user = await adminAuth.getUser(uid);
  if (user.email === ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Cannot delete the admin account' }, { status: 403 });
  }

  await adminAuth.deleteUser(uid);
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const err = await guard(request);
  if (err) return err;

  const { uid } = await params;
  const { disabled } = (await request.json()) as { disabled: boolean };

  // Prevent disabling the admin account itself
  const user = await adminAuth.getUser(uid);
  if (user.email === ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Cannot disable the admin account' }, { status: 403 });
  }

  await adminAuth.updateUser(uid, { disabled });
  return NextResponse.json({ success: true });
}
