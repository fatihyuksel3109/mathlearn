import GameSession from '@/models/GameSession';
import Champion, { IChampion } from '@/models/Champion';
import User from '@/models/User';
import mongoose from 'mongoose';

export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface PeriodBounds {
  start: Date;
  end: Date;
}

export interface ChampionData {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar: string;
  xpEarned: number;
}

/**
 * Calculate the start and end dates for a given period type
 */
export function getPeriodBounds(periodType: PeriodType, date: Date = new Date()): PeriodBounds {
  const start = new Date(date);
  const end = new Date(date);

  switch (periodType) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'weekly':
      // Start of week (Sunday = 0)
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      // End of week (Saturday)
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;

    case 'monthly':
      // Start of month
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      // End of month
      end.setMonth(end.getMonth() + 1);
      end.setDate(0); // Last day of current month
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

/**
 * Calculate the previous period bounds for a given period type
 */
export function getPreviousPeriodBounds(periodType: PeriodType, date: Date = new Date()): PeriodBounds {
  const prevDate = new Date(date);

  switch (periodType) {
    case 'daily':
      prevDate.setDate(prevDate.getDate() - 1);
      break;

    case 'weekly':
      prevDate.setDate(prevDate.getDate() - 7);
      break;

    case 'monthly':
      prevDate.setMonth(prevDate.getMonth() - 1);
      break;
  }

  return getPeriodBounds(periodType, prevDate);
}

/**
 * Calculate the champion (top user by XP) for a given period
 */
export async function calculateChampion(
  periodType: PeriodType,
  startDate: Date,
  endDate: Date
): Promise<ChampionData | null> {
  // Aggregate XP earned from GameSession records within the period
  const sessions = await GameSession.aggregate([
    {
      $match: {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
        xpEarned: { $gt: 0 }, // Only count sessions with XP earned
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
      $limit: 1,
    },
  ]);

  if (sessions.length === 0 || sessions[0].totalXP === 0) {
    return null;
  }

  const topUser = sessions[0];
  const user = await User.findById(topUser._id).lean();

  if (!user) {
    return null;
  }

  return {
    userId: topUser._id,
    userName: user.name || 'Unknown',
    userAvatar: user.avatar || 'fox',
    xpEarned: topUser.totalXP,
  };
}

/**
 * Save a champion to the database
 */
export async function saveChampion(
  periodType: PeriodType,
  periodStart: Date,
  periodEnd: Date,
  championData: ChampionData
): Promise<void> {
  try {
    await Champion.findOneAndUpdate(
      {
        periodType,
        periodStart,
      },
      {
        periodType,
        periodStart,
        periodEnd,
        userId: championData.userId,
        userName: championData.userName,
        userAvatar: championData.userAvatar,
        xpEarned: championData.xpEarned,
      },
      {
        upsert: true,
        new: true,
      }
    );
  } catch (error: any) {
    // Ignore duplicate key errors (champion already saved)
    if (error.code !== 11000) {
      console.error('Error saving champion:', error);
      throw error;
    }
  }
}

/**
 * Get the current period's champion (if it exists)
 */
export async function getCurrentChampion(periodType: PeriodType): Promise<IChampion | null> {
  const bounds = getPeriodBounds(periodType);
  const champion = await Champion.findOne({
    periodType,
    periodStart: bounds.start,
  }).lean();

  return champion as IChampion | null;
}

/**
 * Get historical champions for a period type
 */
export async function getHistoricalChampions(
  periodType: PeriodType,
  limit: number = 5
): Promise<IChampion[]> {
  const champions = await Champion.find({
    periodType,
  })
    .sort({ periodStart: -1 })
    .limit(limit)
    .lean();

  return champions as IChampion[];
}

/**
 * Check for expired periods and save their champions
 * This should be called periodically (e.g., when a game is submitted or leaderboard is accessed)
 */
export async function checkAndSaveExpiredChampions(): Promise<void> {
  const now = new Date();
  const periodTypes: PeriodType[] = ['daily', 'weekly', 'monthly'];

  for (const periodType of periodTypes) {
    // Check previous period (which may have just ended)
    const previousBounds = getPreviousPeriodBounds(periodType, now);
    
    // Check if champion already exists for this period
    const existingChampion = await Champion.findOne({
      periodType,
      periodStart: previousBounds.start,
    });

    if (!existingChampion) {
      // Calculate and save champion for the previous period
      const championData = await calculateChampion(
        periodType,
        previousBounds.start,
        previousBounds.end
      );

      if (championData) {
        await saveChampion(
          periodType,
          previousBounds.start,
          previousBounds.end,
          championData
        );
      }
    }
  }
}

/**
 * Get current period's top user (may not be saved as champion yet)
 */
export async function getCurrentPeriodLeader(periodType: PeriodType): Promise<ChampionData | null> {
  const bounds = getPeriodBounds(periodType);
  return await calculateChampion(periodType, bounds.start, bounds.end);
}

