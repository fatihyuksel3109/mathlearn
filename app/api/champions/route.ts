import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import {
  getCurrentChampion,
  getCurrentPeriodLeader,
  getHistoricalChampions,
  getPreviousPeriodBounds,
  PeriodType,
} from '@/lib/championUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();

    const periodTypes: PeriodType[] = ['daily', 'weekly', 'monthly'];
    const current: any = {};
    const historical: any = {
      daily: [],
      weekly: [],
      monthly: [],
    };

    // Get current champions for each period type
    for (const periodType of periodTypes) {
      // Try to get saved champion first
      let champion = await getCurrentChampion(periodType);

      // If no saved champion, get current period leader
      if (!champion) {
        const leader = await getCurrentPeriodLeader(periodType);
        if (leader) {
          champion = {
            userId: leader.userId,
            userName: leader.userName,
            userAvatar: leader.userAvatar,
            xpEarned: leader.xpEarned,
            periodType,
            periodStart: null,
            periodEnd: null,
          };
        }
      }

      if (champion) {
        current[periodType] = {
          userId: champion.userId.toString(),
          userName: champion.userName,
          userAvatar: champion.userAvatar,
          xp: champion.xpEarned,
          period: periodType,
        };
      } else {
        current[periodType] = null;
      }

      // Get historical champions (excluding current period)
      const historicalChampions = await getHistoricalChampions(periodType, 5);
      historical[periodType] = historicalChampions.map(champ => ({
        userId: champ.userId.toString(),
        userName: champ.userName,
        userAvatar: champ.userAvatar,
        xp: champ.xpEarned,
        period: periodType,
        periodStart: champ.periodStart,
        periodEnd: champ.periodEnd,
      }));
    }

    return NextResponse.json(
      {
        current,
        historical,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Champions API error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

