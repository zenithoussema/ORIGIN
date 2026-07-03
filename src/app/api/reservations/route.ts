import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function sanitizeInput(input: string): string {
  return input.replace(/[<>"'&]/g, '').trim().slice(0, 500);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, date, time, guests } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Valid name is required (min 2 characters)' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    if (!time || typeof time !== 'string') {
      return NextResponse.json({ error: 'Time is required' }, { status: 400 });
    }

    const validTimes = ['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
    if (!validTimes.includes(time)) {
      return NextResponse.json({ error: 'Invalid time slot' }, { status: 400 });
    }

    const guestCount = parseInt(String(guests), 10);
    if (isNaN(guestCount) || guestCount < 1 || guestCount > 20) {
      return NextResponse.json({ error: 'Guests must be between 1 and 20' }, { status: 400 });
    }

    const reservationDate = new Date(date);
    if (isNaN(reservationDate.getTime()) || reservationDate < new Date()) {
      return NextResponse.json({ error: 'Date must be in the future' }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        name: sanitizeInput(name),
        date: reservationDate,
        time,
        guests: guestCount,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        date: reservation.date.toISOString(),
        time: reservation.time,
        guests: reservation.guests,
        status: reservation.status,
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
