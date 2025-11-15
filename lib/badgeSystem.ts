import GameSession, { IQuestionAnswer } from '@/models/GameSession';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * Check if user has earned the "Balon Ustası" badge
 * Condition: 10 balloons correctly popped in balloon-pop game
 */
export async function checkBallonUstasi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  // Check if this is a balloon-pop game with 10 correct answers
  if (currentSession.gameType === 'balloon-pop' && currentSession.correct >= 10) {
    return true;
  }
  return false;
}

/**
 * Check if user has earned the "Hızlı Refleks" badge
 * Condition: 3 questions answered correctly within 10 seconds total
 */
export async function checkHizliRefleks(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.questionAnswers || currentSession.questionAnswers.length < 3) {
    return false;
  }

  // Get last 3 correct answers
  const correctAnswers = currentSession.questionAnswers
    .filter((qa: IQuestionAnswer) => qa.isCorrect)
    .slice(-3);

  if (correctAnswers.length < 3) {
    return false;
  }

  // Check if last 3 correct answers were within 10 seconds total
  const totalTime = correctAnswers.reduce((sum: number, qa: IQuestionAnswer) => sum + qa.timeSpent, 0);
  return totalTime <= 10;
}

/**
 * Check if user has earned the "Mükemmel Seri" badge
 * Condition: 10 questions answered correctly in a row
 */
export async function checkMukemmelSeri(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.questionAnswers || currentSession.questionAnswers.length < 10) {
    return false;
  }

  // Get last 10 answers
  const lastAnswers = currentSession.questionAnswers.slice(-10);

  // Check if all are correct
  return lastAnswers.every((qa: IQuestionAnswer) => qa.isCorrect);
}

/**
 * Check if user has earned the "Toplama Kahramanı" badge
 * Condition: 50 addition questions answered correctly
 */
export async function checkToplamaKahramani(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({ userId }).lean();
  
  let additionCorrectCount = 0;
  
  for (const session of allSessions) {
    if (session.questionAnswers) {
      const additionAnswers = session.questionAnswers.filter(
        (qa: IQuestionAnswer) => qa.questionType === '+' && qa.isCorrect
      );
      additionCorrectCount += additionAnswers.length;
    }
  }

  return additionCorrectCount >= 50;
}

/**
 * Check if user has earned the "Çarpma Ustası" badge
 * Condition: 30 multiplication questions answered correctly
 */
export async function checkCarpmaUstasi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({ userId }).lean();
  
  let multiplicationCorrectCount = 0;
  
  for (const session of allSessions) {
    if (session.questionAnswers) {
      const multiplicationAnswers = session.questionAnswers.filter(
        (qa: IQuestionAnswer) => qa.questionType === '×' && qa.isCorrect
      );
      multiplicationCorrectCount += multiplicationAnswers.length;
    }
  }

  return multiplicationCorrectCount >= 30;
}

/**
 * Check if user has earned the "Günün Şampiyonu" badge
 * Condition: Earn 300 XP in a single day
 */
export async function checkGununSampiyonu(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySessions = await GameSession.find({
    userId,
    date: {
      $gte: today,
      $lt: tomorrow,
    },
  }).lean();

  const totalXP = todaySessions.reduce((sum, session) => sum + (session.xpEarned || 0), 0);

  return totalXP >= 300;
}

/**
 * Check if user has earned the "Balon Efsanesi" badge
 * Condition: 100 total correct answers across all games
 */
export async function checkBalonEfsanesi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({ userId }).lean();
  
  const totalCorrect = allSessions.reduce((sum, session) => sum + (session.correct || 0), 0);

  return totalCorrect >= 100;
}

/**
 * Check all badges for a user and return newly earned badges
 */
export async function checkAllBadges(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<string[]> {
  const user = await User.findById(userId);
  if (!user) {
    return [];
  }

  const existingBadges = new Set(user.badges || []);
  const newlyEarned: string[] = [];

  // Check each badge
  const badgeChecks = [
    { id: 'ballon_ustasi', check: checkBallonUstasi },
    { id: 'hizli_refleks', check: checkHizliRefleks },
    { id: 'mukemmel_seri', check: checkMukemmelSeri },
    { id: 'toplama_kahramani', check: checkToplamaKahramani },
    { id: 'carpma_ustasi', check: checkCarpmaUstasi },
    { id: 'gunun_sampiyonu', check: checkGununSampiyonu },
    { id: 'balon_efsanesi', check: checkBalonEfsanesi },
  ];

  for (const { id, check } of badgeChecks) {
    if (!existingBadges.has(id)) {
      const earned = await check(userId, currentSession);
      if (earned) {
        newlyEarned.push(id);
        existingBadges.add(id);
      }
    }
  }

  // Update user badges if new ones were earned
  if (newlyEarned.length > 0) {
    user.badges = Array.from(existingBadges);
    await user.save();
  }

  return newlyEarned;
}

