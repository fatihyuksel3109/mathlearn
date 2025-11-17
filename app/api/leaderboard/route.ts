import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import GameSession from '@/models/GameSession';
import {
  getPeriodBounds,
  getCurrentPeriodLeader,
  getCurrentChampion,
  checkAndSaveExpiredChampions,
  PeriodType,
} from '@/lib/championUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    await connectDB();

    // Check for expired champions
    await checkAndSaveExpiredChampions();

    // Get period from query parameter (default to 'all-time')
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'all-time') as PeriodType | 'all-time';

    let users: Array<{
      _id: string;
      name: string;
      email: string;
      avatar: string;
      xp: number;
      badges: string[];
    }> = [];

    let currentChampion: any = null;

    if (period === 'all-time') {
      // Get all users sorted by total XP
      const allUsers = await User.find({})
        .sort({ xp: -1 })
        .limit(20)
        .lean();

      users = allUsers.map(user => ({
        _id: user._id.toString(),
        name: user.name || 'Unknown',
        email: user.email || '',
        avatar: user.avatar || 'fox',
        xp: user.xp ?? 0,
        badges: user.badges ?? [],
      }));
    } else {
      // For time-based periods, aggregate XP from GameSession
      const bounds = getPeriodBounds(period);

      // Aggregate XP per user from GameSession records
      const sessions = await GameSession.aggregate([
        {
          $match: {
            date: {
              $gte: bounds.start,
              $lte: bounds.end,
            },
            xpEarned: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: '$userId',
            totalXP: { $sum: '$xpEarned' },
          },
        },
        {
          $sort: { totalXP: -1 },
        },
        {
          $limit: 20,
        },
      ]);

      // Get user details for top users
      const userIds = sessions.map(s => s._id);
      const userMap = new Map();
      
      if (userIds.length > 0) {
        const usersData = await User.find({
          _id: { $in: userIds },
        }).lean();

        usersData.forEach(user => {
          userMap.set(user._id.toString(), user);
        });
      }

      // Combine session data with user data
      users = sessions.map(session => {
        const user = userMap.get(session._id.toString());
        return {
          _id: session._id.toString(),
          name: user?.name || 'Unknown',
          email: user?.email || '',
          avatar: user?.avatar || 'fox',
          xp: session.totalXP,
          badges: user?.badges || [],
        };
      });

      // Get current period's leader (may not be saved as champion yet)
      const currentLeader = await getCurrentPeriodLeader(period);
      if (currentLeader) {
        currentChampion = {
          userId: currentLeader.userId.toString(),
          userName: currentLeader.userName,
          userAvatar: currentLeader.userAvatar,
          xp: currentLeader.xpEarned,
          period: period,
        };
      }

      // Also try to get saved champion (for display purposes)
      const savedChampion = await getCurrentChampion(period);
      if (savedChampion) {
        currentChampion = {
          userId: savedChampion.userId.toString(),
          userName: savedChampion.userName,
          userAvatar: savedChampion.userAvatar,
          xp: savedChampion.xpEarned,
          period: period,
        };
      }
    }

    const totalUsers = await User.countDocuments({});

    return NextResponse.json(
      {
        users,
        total: totalUsers,
        period,
        currentChampion,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

