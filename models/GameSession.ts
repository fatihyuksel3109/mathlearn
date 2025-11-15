import mongoose, { Schema, Model } from 'mongoose';

export interface IQuestionAnswer {
  questionType: string; // '+', '-', '×', '/' or gameType
  isCorrect: boolean;
  timeSpent: number; // seconds
  timestamp: Date;
}

export interface IGameSession {
  _id: string;
  userId: mongoose.Types.ObjectId;
  gameType: string;
  difficulty: number;
  levelId?: string; // For adventure game levels
  correct: number;
  wrong: number;
  timeSpent: number;
  xpEarned: number;
  date: Date;
  questionAnswers?: IQuestionAnswer[];
}

const GameSessionSchema = new Schema<IGameSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gameType: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Number,
      default: 1,
    },
    levelId: {
      type: String,
      required: false,
    },
    correct: {
      type: Number,
      default: 0,
    },
    wrong: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    questionAnswers: {
      type: [
        {
          questionType: { type: String, required: true },
          isCorrect: { type: Boolean, required: true },
          timeSpent: { type: Number, required: true },
          timestamp: { type: Date, required: true },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: false,
  }
);

const GameSession: Model<IGameSession> =
  mongoose.models.GameSession || mongoose.model<IGameSession>('GameSession', GameSessionSchema);

export default GameSession;

