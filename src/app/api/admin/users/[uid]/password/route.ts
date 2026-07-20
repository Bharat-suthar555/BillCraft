import { ADMIN_EMAIL, adminAuth, verifyAdminToken } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

// Admin-only password reset. Uses the Admin SDK to set a new password
// directly on the target user's account — no email link, no re-auth from
// the user. Gated entirely by verifyAdminToken().
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uid } = await params;
  const { password } = (await request.json()) as { password?: string };

  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters' },
      { status: 400 },
    );
  }

  const user = await adminAuth.getUser(uid);
  if (user.email === ADMIN_EMAIL) {
    return NextResponse.json(
      { error: 'Cannot reset the admin account’s password here' },
      { status: 403 },
    );
  }

  await adminAuth.updateUser(uid, { password });
  return NextResponse.json({ success: true });
}
