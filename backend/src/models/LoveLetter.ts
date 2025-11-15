import mongoose, { Schema, Document } from 'mongoose';

export interface ILoveLetter extends Document {
  userId: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId;
  title: string;
  content: string;
  keywords: string[];
  mode: 'love' | 'friends';
  isPrinted: boolean;
  isSent: boolean;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LoveLetterSchema = new Schema<ILoveLetter>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    keywords: [{ type: String }],
    mode: { type: String, enum: ['love', 'friends'], required: true },
    isPrinted: { type: Boolean, default: false },
    isSent: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

LoveLetterSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ILoveLetter>('LoveLetter', LoveLetterSchema);


