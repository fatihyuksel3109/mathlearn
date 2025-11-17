import mongoose, { Schema, Model } from 'mongoose';

export interface IChampion {
  _id: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  periodStart: Date;
  periodEnd: Date;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar: string;
  xpEarned: number;
  createdAt: Date;
}

const ChampionSchema = new Schema<IChampion>(
  {
    periodType: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly'],
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      required: true,
    },
    xpEarned: {
      type: Number,
      required: true,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Create unique index to prevent duplicate champions for the same period
ChampionSchema.index({ periodType: 1, periodStart: 1 }, { unique: true });

const Champion: Model<IChampion> =
  mongoose.models.Champion || mongoose.model<IChampion>('Champion', ChampionSchema);

export default Champion;

