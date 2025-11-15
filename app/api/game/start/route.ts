import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import GameSession from '@/models/GameSession';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameType, difficulty = 1 } = await request.json();

    if (!gameType) {
      return NextResponse.json({ error: 'Game type is required' }, { status: 400 });
    }

    await connectDB();

    const gameSession = await GameSession.create({
      userId: (session.user as any).id,
      gameType,
      difficulty,
      correct: 0,
      wrong: 0,
      timeSpent: 0,
      xpEarned: 0,
      date: new Date(),
    });

    return NextResponse.json(
      { sessionId: gameSession._id.toString() },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

