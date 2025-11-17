import GameSession, { IQuestionAnswer } from '@/models/GameSession';
import User from '@/models/User';
import LevelProgress from '@/models/LevelProgress';
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

// === SPEED BADGES ===

export async function checkSimsekRefleks(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.questionAnswers || currentSession.questionAnswers.length < 3) {
    return false;
  }
  const correctAnswers = currentSession.questionAnswers
    .filter((qa: IQuestionAnswer) => qa.isCorrect)
    .slice(-3);
  if (correctAnswers.length < 3) {
    return false;
  }
  const totalTime = correctAnswers.reduce((sum: number, qa: IQuestionAnswer) => sum + qa.timeSpent, 0);
  return totalTime <= 5;
}

export async function checkHizCanavari(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.questionAnswers || currentSession.questionAnswers.length < 5) {
    return false;
  }
  const correctAnswers = currentSession.questionAnswers
    .filter((qa: IQuestionAnswer) => qa.isCorrect)
    .slice(-5);
  if (correctAnswers.length < 5) {
    return false;
  }
  const totalTime = correctAnswers.reduce((sum: number, qa: IQuestionAnswer) => sum + qa.timeSpent, 0);
  return totalTime <= 15;
}

export async function checkZamanUstasi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.questionAnswers || currentSession.questionAnswers.length < 10) {
    return false;
  }
  const correctAnswers = currentSession.questionAnswers
    .filter((qa: IQuestionAnswer) => qa.isCorrect)
    .slice(-10);
  if (correctAnswers.length < 10) {
    return false;
  }
  const totalTime = correctAnswers.reduce((sum: number, qa: IQuestionAnswer) => sum + qa.timeSpent, 0);
  return totalTime <= 30;
}

export async function checkUltraHizli(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.questionAnswers || currentSession.questionAnswers.length < 20) {
    return false;
  }
  const correctAnswers = currentSession.questionAnswers
    .filter((qa: IQuestionAnswer) => qa.isCorrect)
    .slice(-20);
  if (correctAnswers.length < 20) {
    return false;
  }
  const totalTime = correctAnswers.reduce((sum: number, qa: IQuestionAnswer) => sum + qa.timeSpent, 0);
  return totalTime <= 60;
}

export async function checkFlasSampiyonu(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.questionAnswers || currentSession.questionAnswers.length < 50) {
    return false;
  }
  const correctAnswers = currentSession.questionAnswers
    .filter((qa: IQuestionAnswer) => qa.isCorrect)
    .slice(-50);
  if (correctAnswers.length < 50) {
    return false;
  }
  const totalTime = correctAnswers.reduce((sum: number, qa: IQuestionAnswer) => sum + qa.timeSpent, 0);
  return totalTime <= 120;
}

// === ACCURACY BADGES ===

export async function checkMukemmelBaslangic(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.questionAnswers || currentSession.questionAnswers.length < 5) {
    return false;
  }
  const lastAnswers = currentSession.questionAnswers.slice(-5);
  return lastAnswers.every((qa: IQuestionAnswer) => qa.isCorrect);
}

export async function checkDogrulukKahramani(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.questionAnswers || currentSession.questionAnswers.length < 20) {
    return false;
  }
  const lastAnswers = currentSession.questionAnswers.slice(-20);
  return lastAnswers.every((qa: IQuestionAnswer) => qa.isCorrect);
}

export async function checkMukemmelUsta(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.questionAnswers || currentSession.questionAnswers.length < 50) {
    return false;
  }
  const lastAnswers = currentSession.questionAnswers.slice(-50);
  return lastAnswers.every((qa: IQuestionAnswer) => qa.isCorrect);
}

export async function checkSifirHata(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.questionAnswers || currentSession.questionAnswers.length < 20) {
    return false;
  }
  const lastAnswers = currentSession.questionAnswers.slice(-20);
  const correctCount = lastAnswers.filter((qa: IQuestionAnswer) => qa.isCorrect).length;
  return correctCount === 20;
}

export async function checkKusursuz(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.questionAnswers || currentSession.questionAnswers.length < 50) {
    return false;
  }
  const lastAnswers = currentSession.questionAnswers.slice(-50);
  const correctCount = lastAnswers.filter((qa: IQuestionAnswer) => qa.isCorrect).length;
  return correctCount === 50;
}

// === OPERATION-SPECIFIC BADGES (TOPLAMA) ===

export async function checkToplamaYeniBaslayan(
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

export async function checkToplamaUzmani(
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
  return additionCorrectCount >= 100;
}

export async function checkToplamaEfsanesi(
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
  return additionCorrectCount >= 500;
}

// === OPERATION-SPECIFIC BADGES (ÇIKARMA) ===

export async function checkCikarmaYeniBaslayan(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({ userId }).lean();
  let subtractionCorrectCount = 0;
  for (const session of allSessions) {
    if (session.questionAnswers) {
      const subtractionAnswers = session.questionAnswers.filter(
        (qa: IQuestionAnswer) => qa.questionType === '-' && qa.isCorrect
      );
      subtractionCorrectCount += subtractionAnswers.length;
    }
  }
  return subtractionCorrectCount >= 50;
}

export async function checkCikarmaUzmani(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({ userId }).lean();
  let subtractionCorrectCount = 0;
  for (const session of allSessions) {
    if (session.questionAnswers) {
      const subtractionAnswers = session.questionAnswers.filter(
        (qa: IQuestionAnswer) => qa.questionType === '-' && qa.isCorrect
      );
      subtractionCorrectCount += subtractionAnswers.length;
    }
  }
  return subtractionCorrectCount >= 100;
}

export async function checkCikarmaEfsanesi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({ userId }).lean();
  let subtractionCorrectCount = 0;
  for (const session of allSessions) {
    if (session.questionAnswers) {
      const subtractionAnswers = session.questionAnswers.filter(
        (qa: IQuestionAnswer) => qa.questionType === '-' && qa.isCorrect
      );
      subtractionCorrectCount += subtractionAnswers.length;
    }
  }
  return subtractionCorrectCount >= 500;
}

// === OPERATION-SPECIFIC BADGES (ÇARPMA) ===

export async function checkCarpmaYeniBaslayan(
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

export async function checkCarpmaUzmani(
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
  return multiplicationCorrectCount >= 100;
}

export async function checkCarpmaEfsanesi(
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
  return multiplicationCorrectCount >= 300;
}

// === OPERATION-SPECIFIC BADGES (BÖLME) ===

export async function checkBolmeYeniBaslayan(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({ userId }).lean();
  let divisionCorrectCount = 0;
  for (const session of allSessions) {
    if (session.questionAnswers) {
      const divisionAnswers = session.questionAnswers.filter(
        (qa: IQuestionAnswer) => (qa.questionType === '/' || qa.questionType === '÷') && qa.isCorrect
      );
      divisionCorrectCount += divisionAnswers.length;
    }
  }
  return divisionCorrectCount >= 25;
}

export async function checkBolmeUzmani(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({ userId }).lean();
  let divisionCorrectCount = 0;
  for (const session of allSessions) {
    if (session.questionAnswers) {
      const divisionAnswers = session.questionAnswers.filter(
        (qa: IQuestionAnswer) => (qa.questionType === '/' || qa.questionType === '÷') && qa.isCorrect
      );
      divisionCorrectCount += divisionAnswers.length;
    }
  }
  return divisionCorrectCount >= 75;
}

export async function checkBolmeEfsanesi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({ userId }).lean();
  let divisionCorrectCount = 0;
  for (const session of allSessions) {
    if (session.questionAnswers) {
      const divisionAnswers = session.questionAnswers.filter(
        (qa: IQuestionAnswer) => (qa.questionType === '/' || qa.questionType === '÷') && qa.isCorrect
      );
      divisionCorrectCount += divisionAnswers.length;
    }
  }
  return divisionCorrectCount >= 200;
}

// === LEVEL PROGRESSION BADGES ===

export async function checkMaceraBaslangic(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const completedLevels = await LevelProgress.find({ userId, completed: true }).lean();
  return completedLevels.length >= 1;
}

export async function checkMaceraKesifci(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const completedLevels = await LevelProgress.find({ userId, completed: true }).lean();
  return completedLevels.length >= 3;
}

export async function checkMaceraEfsanesi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const completedLevels = await LevelProgress.find({ userId, completed: true }).lean();
  return completedLevels.length >= 6;
}

export async function checkMaceraUstasi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allLevels = await LevelProgress.find({ userId }).lean();
  if (allLevels.length < 6) {
    return false;
  }
  return allLevels.every((level) => level.completed && level.stars === 3);
}

export async function checkSeviyeHizRekortmeni(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.levelId || !currentSession.questionAnswers) {
    return false;
  }
  const levelSessions = await GameSession.find({
    userId,
    gameType: 'adventure',
    levelId: currentSession.levelId,
  }).lean();
  
  if (levelSessions.length === 0) {
    return false;
  }
  
  // Check if current session completed level in less than 30 seconds
  const currentSessionTime = currentSession.questionAnswers.reduce(
    (sum: number, qa: IQuestionAnswer) => sum + qa.timeSpent,
    0
  );
  
  // Compare with previous sessions for this level
  const fastestPreviousTime = Math.min(
    ...levelSessions
      .filter((s) => s._id.toString() !== currentSession._id?.toString())
      .map((s) => s.timeSpent || Infinity)
  );
  
  return currentSessionTime < 30 && (fastestPreviousTime === Infinity || currentSessionTime < fastestPreviousTime);
}

export async function checkButunSeviyeleriAc(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allLevels = await LevelProgress.find({ userId }).lean();
  const uniqueLevelIds = new Set(allLevels.map((level) => level.levelId));
  return uniqueLevelIds.size >= 6;
}

// === STREAK BADGES ===

export async function checkUcGunlukSeri(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const user = await User.findById(userId).lean();
  return (user?.streak || 0) >= 3;
}

export async function checkHaftalikKahraman(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const user = await User.findById(userId).lean();
  return (user?.streak || 0) >= 7;
}

export async function checkIkiHaftaUstasi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const user = await User.findById(userId).lean();
  return (user?.streak || 0) >= 14;
}

export async function checkAyinSampiyonu(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const user = await User.findById(userId).lean();
  return (user?.streak || 0) >= 30;
}

export async function checkYuzGunEfsanesi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const user = await User.findById(userId).lean();
  return (user?.streak || 0) >= 100;
}

// === GAME-SPECIFIC BADGES (BALLOON POP) ===

export async function checkBalonYeniBaslayan(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({
    userId,
    gameType: 'balloon-pop',
  }).lean();
  const totalCorrect = allSessions.reduce((sum, session) => sum + (session.correct || 0), 0);
  return totalCorrect >= 5;
}

export async function checkBalonUzmani(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({
    userId,
    gameType: 'balloon-pop',
  }).lean();
  const totalCorrect = allSessions.reduce((sum, session) => sum + (session.correct || 0), 0);
  return totalCorrect >= 50;
}

export async function checkBalonEfsanesiOyun(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({
    userId,
    gameType: 'balloon-pop',
  }).lean();
  const totalCorrect = allSessions.reduce((sum, session) => sum + (session.correct || 0), 0);
  return totalCorrect >= 200;
}

// === GAME-SPECIFIC BADGES (QUICK RACE) ===

export async function checkHizliYarisYeniBaslayan(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({
    userId,
    gameType: 'quick-race',
  }).lean();
  const totalCorrect = allSessions.reduce((sum, session) => sum + (session.correct || 0), 0);
  return totalCorrect >= 10;
}

export async function checkHizliYarisUzmani(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({
    userId,
    gameType: 'quick-race',
  }).lean();
  const totalCorrect = allSessions.reduce((sum, session) => sum + (session.correct || 0), 0);
  return totalCorrect >= 100;
}

export async function checkHizliYarisSampiyonu(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({
    userId,
    gameType: 'quick-race',
  }).lean();
  const totalCorrect = allSessions.reduce((sum, session) => sum + (session.correct || 0), 0);
  return totalCorrect >= 500;
}

// === GAME-SPECIFIC BADGES (FRACTIONS) ===

export async function checkKesirUstasi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({
    userId,
    gameType: 'fractions',
  }).lean();
  const totalCorrect = allSessions.reduce((sum, session) => sum + (session.correct || 0), 0);
  return totalCorrect >= 20;
}

export async function checkKesirBuyucusu(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({
    userId,
    gameType: 'fractions',
  }).lean();
  const totalCorrect = allSessions.reduce((sum, session) => sum + (session.correct || 0), 0);
  return totalCorrect >= 100;
}

// === GAME-SPECIFIC BADGES (GEOMETRY) ===

export async function checkGeometriUzmani(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({
    userId,
    gameType: 'geometry',
  }).lean();
  const totalCorrect = allSessions.reduce((sum, session) => sum + (session.correct || 0), 0);
  return totalCorrect >= 20;
}

export async function checkGeometriDahisi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({
    userId,
    gameType: 'geometry',
  }).lean();
  const totalCorrect = allSessions.reduce((sum, session) => sum + (session.correct || 0), 0);
  return totalCorrect >= 100;
}

// === XP MILESTONE BADGES ===

export async function checkIlkAdimlar(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const user = await User.findById(userId).lean();
  return (user?.xp || 0) >= 100;
}

export async function checkOgrenciYildiz(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const user = await User.findById(userId).lean();
  return (user?.xp || 0) >= 500;
}

export async function checkOgrenciKahramani(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const user = await User.findById(userId).lean();
  return (user?.xp || 0) >= 1000;
}

export async function checkMatematikUstasi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const user = await User.findById(userId).lean();
  return (user?.xp || 0) >= 2500;
}

export async function checkMatematikEfsanesi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const user = await User.findById(userId).lean();
  return (user?.xp || 0) >= 5000;
}

export async function checkUstunOgrenci(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const user = await User.findById(userId).lean();
  return (user?.xp || 0) >= 10000;
}

export async function checkMatematikDehasi(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const user = await User.findById(userId).lean();
  return (user?.xp || 0) >= 25000;
}

// === WEEKLY/DAILY CHALLENGE BADGES ===

export async function checkHaftaSavasci(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const weekSessions = await GameSession.find({
    userId,
    date: { $gte: startOfWeek },
  }).lean();
  
  const uniqueDays = new Set<string>();
  weekSessions.forEach((session) => {
    const date = new Date(session.date);
    date.setHours(0, 0, 0, 0);
    uniqueDays.add(date.toISOString().split('T')[0]);
  });
  
  return uniqueDays.size >= 5;
}

export async function checkGunlukSampiyon(
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
  return totalXP >= 500;
}

export async function checkHaftalikUsta(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const weekSessions = await GameSession.find({
    userId,
    date: { $gte: startOfWeek },
  }).lean();
  
  const totalXP = weekSessions.reduce((sum, session) => sum + (session.xpEarned || 0), 0);
  return totalXP >= 2000;
}

export async function checkHaftaSonuSavasci(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const allSessions = await GameSession.find({ userId }).lean();
  
  let hasSaturday = false;
  let hasSunday = false;
  
  for (const session of allSessions) {
    const date = new Date(session.date);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 6) {
      hasSaturday = true;
    } else if (dayOfWeek === 0) {
      hasSunday = true;
    }
    if (hasSaturday && hasSunday) {
      return true;
    }
  }
  
  return false;
}

// === RARE/SECRET BADGES ===

export async function checkGeceYarisiOyuncu(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.date) {
    return false;
  }
  const sessionDate = new Date(currentSession.date);
  const hour = sessionDate.getHours();
  return hour >= 0 && hour < 6;
}

export async function checkErkenKusu(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  if (!currentSession.date) {
    return false;
  }
  const sessionDate = new Date(currentSession.date);
  const hour = sessionDate.getHours();
  // Early bird: plays between 5 AM and 6 AM
  return hour >= 5 && hour < 6;
}

export async function checkMukemmelHafta(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  
  const recentSessions = await GameSession.find({
    userId,
    date: { $gte: sevenDaysAgo },
  })
    .sort({ date: -1 })
    .lean();
  
  if (recentSessions.length < 7) {
    return false;
  }
  
  // Group sessions by day and check if each day has at least one perfect game
  const dailyPerfectGames = new Map<string, boolean>();
  
  for (const session of recentSessions) {
    const date = new Date(session.date);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!dailyPerfectGames.has(dateKey)) {
      dailyPerfectGames.set(dateKey, false);
    }
    
    if (session.wrong === 0 && session.correct > 0) {
      dailyPerfectGames.set(dateKey, true);
    }
  }
  
  // Check if we have 7 consecutive days with perfect games
  const sortedDates = Array.from(dailyPerfectGames.keys())
    .map((d) => new Date(d + 'T00:00:00.000Z'))
    .sort((a, b) => b.getTime() - a.getTime());
  
  if (sortedDates.length < 7) {
    return false;
  }
  
  // Check last 7 days for perfect games
  let consecutivePerfectDays = 0;
  for (let i = 0; i < Math.min(7, sortedDates.length); i++) {
    const dateKey = sortedDates[i].toISOString().split('T')[0];
    if (dailyPerfectGames.get(dateKey)) {
      consecutivePerfectDays++;
    } else {
      break;
    }
  }
  
  return consecutivePerfectDays >= 7;
}

export async function checkKoleksiyoncu(
  userId: mongoose.Types.ObjectId,
  currentSession: any
): Promise<boolean> {
  const user = await User.findById(userId).lean();
  return (user?.badges?.length || 0) >= 25;
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
    // Speed badges
    { id: 'simsek_refleks', check: checkSimsekRefleks },
    { id: 'hiz_canavari', check: checkHizCanavari },
    { id: 'zaman_ustasi', check: checkZamanUstasi },
    { id: 'ultra_hizli', check: checkUltraHizli },
    { id: 'flas_sampiyonu', check: checkFlasSampiyonu },
    // Accuracy badges
    { id: 'mukemmel_baslangic', check: checkMukemmelBaslangic },
    { id: 'dogruluk_kahramani', check: checkDogrulukKahramani },
    { id: 'mukemmel_usta', check: checkMukemmelUsta },
    { id: 'sifir_hata', check: checkSifirHata },
    { id: 'kusursuz', check: checkKusursuz },
    // Operation badges - Toplama
    { id: 'toplama_yeni_baslayan', check: checkToplamaYeniBaslayan },
    { id: 'toplama_uzmani', check: checkToplamaUzmani },
    { id: 'toplama_efsanesi', check: checkToplamaEfsanesi },
    // Operation badges - Çıkarma
    { id: 'cikarma_yeni_baslayan', check: checkCikarmaYeniBaslayan },
    { id: 'cikarma_uzmani', check: checkCikarmaUzmani },
    { id: 'cikarma_efsanesi', check: checkCikarmaEfsanesi },
    // Operation badges - Çarpma
    { id: 'carpma_yeni_baslayan', check: checkCarpmaYeniBaslayan },
    { id: 'carpma_uzmani', check: checkCarpmaUzmani },
    { id: 'carpma_efsanesi', check: checkCarpmaEfsanesi },
    // Operation badges - Bölme
    { id: 'bolme_yeni_baslayan', check: checkBolmeYeniBaslayan },
    { id: 'bolme_uzmani', check: checkBolmeUzmani },
    { id: 'bolme_efsanesi', check: checkBolmeEfsanesi },
    // Level progression badges
    { id: 'macera_baslangic', check: checkMaceraBaslangic },
    { id: 'macera_kesifci', check: checkMaceraKesifci },
    { id: 'macera_efsanesi', check: checkMaceraEfsanesi },
    { id: 'macera_ustasi', check: checkMaceraUstasi },
    { id: 'seviye_hiz_rekortmeni', check: checkSeviyeHizRekortmeni },
    { id: 'butun_seviyeleri_ac', check: checkButunSeviyeleriAc },
    // Streak badges
    { id: 'uc_gunluk_seri', check: checkUcGunlukSeri },
    { id: 'haftalik_kahraman', check: checkHaftalikKahraman },
    { id: 'iki_hafta_ustasi', check: checkIkiHaftaUstasi },
    { id: 'ayin_sampiyonu', check: checkAyinSampiyonu },
    { id: 'yuz_gun_efsanesi', check: checkYuzGunEfsanesi },
    // Game-specific badges - Balloon Pop
    { id: 'balon_yeni_baslayan', check: checkBalonYeniBaslayan },
    { id: 'balon_uzmani', check: checkBalonUzmani },
    { id: 'balon_efsanesi_oyun', check: checkBalonEfsanesiOyun },
    // Game-specific badges - Quick Race
    { id: 'hizli_yaris_yeni_baslayan', check: checkHizliYarisYeniBaslayan },
    { id: 'hizli_yaris_uzmani', check: checkHizliYarisUzmani },
    { id: 'hizli_yaris_sampiyonu', check: checkHizliYarisSampiyonu },
    // Game-specific badges - Fractions
    { id: 'kesir_ustasi', check: checkKesirUstasi },
    { id: 'kesir_buyucusu', check: checkKesirBuyucusu },
    // Game-specific badges - Geometry
    { id: 'geometri_uzmani', check: checkGeometriUzmani },
    { id: 'geometri_dahisi', check: checkGeometriDahisi },
    // XP milestone badges
    { id: 'ilk_adimlar', check: checkIlkAdimlar },
    { id: 'ogrenci_yildiz', check: checkOgrenciYildiz },
    { id: 'ogrenci_kahramani', check: checkOgrenciKahramani },
    { id: 'matematik_ustasi', check: checkMatematikUstasi },
    { id: 'matematik_efsanesi', check: checkMatematikEfsanesi },
    { id: 'ustun_ogrenci', check: checkUstunOgrenci },
    { id: 'matematik_dehasi', check: checkMatematikDehasi },
    // Weekly/Daily challenge badges
    { id: 'hafta_savasci', check: checkHaftaSavasci },
    { id: 'gunluk_sampiyon', check: checkGunlukSampiyon },
    { id: 'haftalik_usta', check: checkHaftalikUsta },
    { id: 'hafta_sonu_savasci', check: checkHaftaSonuSavasci },
    // Rare/Secret badges
    { id: 'gece_yarisi_oyuncu', check: checkGeceYarisiOyuncu },
    { id: 'erken_kusu', check: checkErkenKusu },
    { id: 'mukemmel_hafta', check: checkMukemmelHafta },
    { id: 'koleksiyoncu', check: checkKoleksiyoncu },
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

