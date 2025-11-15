import mongoose, { Schema, Document } from 'mongoose';

export interface IMoodEntry extends Document {
  userId: mongoose.Types.ObjectId;
  partnerId?: mongoose.Types.ObjectId;
  mood: 'happy' | 'sad' | 'excited' | 'tired' | 'anxious' | 'calm' | 'romantic' | 'playful';
  notes?: string;
  date: Date;
  createdAt: Date;
}

export interface IMoodTracker extends Document {
  userId: mongoose.Types.ObjectId;
  partnerId?: mongoose.Types.ObjectId;
  entries: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MoodEntrySchema = new Schema<IMoodEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    partnerId: { type: Schema.Types.ObjectId, ref: 'User' },
    mood: {
      type: String,
      enum: ['happy', 'sad', 'excited', 'tired', 'anxious', 'calm', 'romantic', 'playful'],
      required: true,
    },
    notes: { type: String },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

MoodEntrySchema.index({ userId: 1, date: -1 });
MoodEntrySchema.index({ partnerId: 1, date: -1 });

export const MoodEntry = mongoose.model<IMoodEntry>('MoodEntry', MoodEntrySchema);
export default MoodEntry;


