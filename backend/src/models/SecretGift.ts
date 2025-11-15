import mongoose, { Schema, Document } from 'mongoose';

export interface ISecretGift extends Document {
  userId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  title: string;
  type: 'message' | 'video' | 'image' | 'game';
  content?: string;
  mediaUrl?: string;
  clues: string[];
  triviaQuestions?: Array<{
    question: string;
    answer: string;
  }>;
  isUnlocked: boolean;
  unlockedAt?: Date;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const SecretGiftSchema = new Schema<ISecretGift>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['message', 'video', 'image', 'game'],
      required: true,
    },
    content: { type: String },
    mediaUrl: { type: String },
    clues: [{ type: String }],
    triviaQuestions: [{
      question: { type: String },
      answer: { type: String },
    }],
    isUnlocked: { type: Boolean, default: false },
    unlockedAt: { type: Date },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
  },
  {
    timestamps: true,
  }
);

SecretGiftSchema.index({ recipientId: 1, isUnlocked: -1 });

export default mongoose.model<ISecretGift>('SecretGift', SecretGiftSchema);


