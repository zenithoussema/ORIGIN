import { NextResponse } from 'next/server';
import { assertApiAuth } from '@/lib/server-auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger.server';

export async function GET(request: Request) {
  const auth = await assertApiAuth(request);
  if (!auth.authorized) return auth.response;

  return NextResponse.json({
    user: {
      id: auth.session.user.id,
      name: auth.session.user.name,
      email: auth.session.user.email,
      image: auth.session.user.image,
      role: auth.session.user.role,
    },
  });
}

export async function PATCH(request: Request) {
  const auth = await assertApiAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { name, email } = body;

    if (name && (typeof name !== 'string' || name.length < 2 || name.length > 50)) {
      return NextResponse.json(
        { error: 'Invalid name' },
        { status: 400 }
      );
    }

    if (email && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      );
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const updates: Record<string, string> = {};
    if (name) updates.name = name;
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (existing && existing.id !== auth.session.user.id) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      updates.email = email;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true });
    }

    await prisma.user.update({
      where: { id: auth.session.user.id },
      data: updates,
    });

    logger.info('Profile updated', 'API', { userId: auth.session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Profile update error', 'API', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
