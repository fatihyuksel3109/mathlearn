import mongoose, { Schema, Model } from 'mongoose';

export interface ILevelProgress {
  _id: string;
  userId: mongoose.Types.ObjectId;
  levelId: string;
  completed: boolean;
  stars: number;
}

const LevelProgressSchema = new Schema<ILevelProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    levelId: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    stars: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
  },
  {
    timestamps: false,
  }
);

LevelProgressSchema.index({ userId: 1, levelId: 1 }, { unique: true });

const LevelProgress: Model<ILevelProgress> =
  mongoose.models.LevelProgress || mongoose.model<ILevelProgress>('LevelProgress', LevelProgressSchema);

export default LevelProgress;

