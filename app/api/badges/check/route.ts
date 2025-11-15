import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import GameSession from '@/models/GameSession';
import { checkAllBadges } from '@/lib/badgeSystem';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId((session.user as any).id);

    // Get the most recent game session for badge checking
    const latestSession = await GameSession.findOne({ userId })
      .sort({ date: -1 })
      .lean();

    // If no session exists, return empty array
    if (!latestSession) {
      return NextResponse.json(
        {
          newlyEarnedBadges: [],
          message: 'No game sessions found',
        },
        { status: 200 }
      );
    }

    // Check for new badges
    const newlyEarnedBadges = await checkAllBadges(userId, latestSession);

    return NextResponse.json(
      {
        newlyEarnedBadges,
        message: newlyEarnedBadges.length > 0 
          ? `Earned ${newlyEarnedBadges.length} new badge(s)!` 
          : 'No new badges earned',
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

