import mongoose, { Schema, Document } from 'mongoose';

export interface ISurpriseDrop extends Document {
  userId: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId;
  type: 'message' | 'image' | 'video' | 'game' | 'gift';
  title: string;
  content?: string;
  mediaUrl?: string;
  scheduledFor: Date;
  unlockedAt?: Date;
  isUnlocked: boolean;
  countdownMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SurpriseDropSchema = new Schema<ISurpriseDrop>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['message', 'image', 'video', 'game', 'gift'],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String },
    mediaUrl: { type: String },
    scheduledFor: { type: Date, required: true },
    unlockedAt: { type: Date },
    isUnlocked: { type: Boolean, default: false },
    countdownMessage: { type: String },
  },
  {
    timestamps: true,
  }
);

SurpriseDropSchema.index({ userId: 1, scheduledFor: 1 });
SurpriseDropSchema.index({ recipientId: 1, isUnlocked: -1 });

export default mongoose.model<ISurpriseDrop>('SurpriseDrop', SurpriseDropSchema);


