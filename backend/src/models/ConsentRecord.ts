import mongoose, { Schema, Document } from 'mongoose';

export interface IConsentRecord extends Document {
  userId: mongoose.Types.ObjectId;
  consentType: 'face-verification' | 'data-processing' | 'marketing' | 'blockchain';
  consentHash: string;
  onChainTxHash?: string;
  granted: boolean;
  revokedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentRecordSchema = new Schema<IConsentRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    consentType: {
      type: String,
      enum: ['face-verification', 'data-processing', 'marketing', 'blockchain'],
      required: true,
    },
    consentHash: { type: String, required: true },
    onChainTxHash: { type: String },
    granted: { type: Boolean, default: true },
    revokedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

ConsentRecordSchema.index({ userId: 1, consentType: 1 });
ConsentRecordSchema.index({ consentHash: 1 });

export default mongoose.model<IConsentRecord>('ConsentRecord', ConsentRecordSchema);

