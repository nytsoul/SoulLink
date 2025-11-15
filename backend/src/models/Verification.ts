import mongoose, { Schema, Document } from 'mongoose';

export interface IVerification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'face' | 'identity' | 'phone' | 'email';
  result: 'PASS' | 'FAIL' | 'PENDING';
  verifierId?: string;
  proofHash: string;
  onChainTxHash?: string;
  metadata?: {
    confidence?: number;
    faceEmbedding?: string; // Encrypted
    imageUrl?: string; // Encrypted or IPFS CID
  };
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['face', 'identity', 'phone', 'email'], required: true },
    result: { type: String, enum: ['PASS', 'FAIL', 'PENDING'], default: 'PENDING' },
    verifierId: { type: String },
    proofHash: { type: String, required: true },
    onChainTxHash: { type: String },
    metadata: {
      confidence: { type: Number },
      faceEmbedding: { type: String },
      imageUrl: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

VerificationSchema.index({ userId: 1, type: 1 });
VerificationSchema.index({ proofHash: 1 }, { unique: true });

export default mongoose.model<IVerification>('Verification', VerificationSchema);

