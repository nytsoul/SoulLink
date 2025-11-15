import mongoose, { Schema, Document } from 'mongoose';

export interface IMemoryItem extends Document {
  userId: mongoose.Types.ObjectId;
  cidOrUrl: string; // IPFS CID or S3 URL
  mediaType: 'photo' | 'video';
  title: string;
  tags: string[];
  visibility: 'private' | 'shared' | 'public';
  encrypted: boolean;
  encryptedData?: string; // Client-side encrypted blob
  sharedWith: mongoose.Types.ObjectId[]; // User IDs who can view
  createdAt: Date;
  updatedAt: Date;
}

const MemoryItemSchema = new Schema<IMemoryItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cidOrUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['photo', 'video'], required: true },
    title: { type: String, required: true, maxlength: 200 },
    tags: [{ type: String }],
    visibility: { type: String, enum: ['private', 'shared', 'public'], default: 'private' },
    encrypted: { type: Boolean, default: false },
    encryptedData: { type: String },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

MemoryItemSchema.index({ userId: 1, createdAt: -1 });
MemoryItemSchema.index({ userId: 1, tags: 1 });

// Ensure max 500 items per user
MemoryItemSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('MemoryItem').countDocuments({ userId: this.userId });
    if (count >= 500) {
      return next(new Error('Maximum 500 memory items allowed per user'));
    }
  }
  next();
});

export default mongoose.model<IMemoryItem>('MemoryItem', MemoryItemSchema);

