import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/db';
import LevelProgress from '@/models/LevelProgress';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { levelId, stars } = await request.json();

    if (!levelId) {
      return NextResponse.json({ error: 'Level ID is required' }, { status: 400 });
    }

    await connectDB();

    const levelProgress = await LevelProgress.findOneAndUpdate(
      {
        userId: (session.user as any).id,
        levelId,
      },
      {
        userId: (session.user as any).id,
        levelId,
        completed: true,
        stars: stars || 0,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        message: 'Level completed successfully',
        levelProgress,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

