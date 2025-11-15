import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  dob: Date;
  email: string;
  phone: string;
  password: string;
  gender?: string;
  pronouns?: string;
  location?: string;
  bio?: string;
  interests: string[];
  profilePhotos: string[];
  modeDefault: 'love' | 'friends';
  modeLocked: boolean; // Lock mode after registration
  walletAddress?: string;
  securityPassphraseHash?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  privateMode: boolean; // Private mode toggle
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    gender: { type: String },
    pronouns: { type: String },
    location: { type: String },
    bio: { type: String, maxlength: 500 },
    interests: [{ type: String }],
    profilePhotos: [{ type: String }],
    modeDefault: { type: String, enum: ['love', 'friends'], default: 'love' },
    modeLocked: { type: Boolean, default: false },
    walletAddress: { type: String, lowercase: true },
    privateMode: { type: Boolean, default: false },
    securityPassphraseHash: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Hash security passphrase before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('securityPassphraseHash') || !this.securityPassphraseHash) return next();
  this.securityPassphraseHash = await bcrypt.hash(this.securityPassphraseHash, 12);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);

