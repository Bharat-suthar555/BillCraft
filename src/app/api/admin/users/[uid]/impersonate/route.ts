import { ADMIN_EMAIL, adminAuth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

// Mints a sign-in token for the target user AND a return token for the
// admin's own account, so the client can switch identity now and switch
// back later without re-authenticating. Gated on the caller's own ID
// token carrying the admin email — this is the only access check here.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (decoded.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uid } = await params;
  if (uid === decoded.uid) {
    return NextResponse.json(
      { error: 'Cannot impersonate yourself' },
      { status: 400 },
    );
  }

  const targetUser = await adminAuth.getUser(uid);
  if (targetUser.disabled) {
    return NextResponse.json(
      { error: 'Cannot impersonate a disabled user' },
      { status: 400 },
    );
  }

  const [targetToken, adminReturnToken] = await Promise.all([
    adminAuth.createCustomToken(uid),
    adminAuth.createCustomToken(decoded.uid),
  ]);

  return NextResponse.json({
    targetToken,
    adminReturnToken,
    targetEmail: targetUser.email ?? '',
  });
}
