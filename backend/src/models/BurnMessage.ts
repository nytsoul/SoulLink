import mongoose, { Schema, Document } from 'mongoose';

export interface IBurnMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'video';
  mediaUrl?: string;
  viewedAt?: Date;
  isViewed: boolean;
  expiresAt: Date;
  autoDeleteAfter: number; // seconds
  createdAt: Date;
}

const BurnMessageSchema = new Schema<IBurnMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
    mediaUrl: { type: String },
    viewedAt: { type: Date },
    isViewed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    autoDeleteAfter: { type: Number, default: 60 }, // 60 seconds default
  },
  {
    timestamps: true,
  }
);

BurnMessageSchema.index({ recipientId: 1, isViewed: -1, expiresAt: 1 });

export default mongoose.model<IBurnMessage>('BurnMessage', BurnMessageSchema);


