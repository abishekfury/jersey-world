import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IUserAddress, UserRole } from '@shared/types';

export interface IUserDocument extends Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
  password?: string;
  authProvider?: string;
  googleId?: string;
  refreshTokenHash?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const AddressSchema = new Schema<IUserAddress>(
  {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    apartment: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ['customer', 'manager', 'admin'],
      default: 'customer',
      index: true,
    },
    authProvider: { type: String, enum: ['local', 'google', 'otp'], default: 'local' },
    googleId: { type: String },
    isActive: { type: Boolean, default: true },
    avatar: { type: String },
    phone: { type: String },
    addresses: [AddressSchema],
    isEmailVerified: { type: Boolean, default: false },
    dailyTryOnCount: { type: Number, default: 0 },
    lastTryOnDate: { type: String },
    refreshTokenHash: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (this: IUserDocument, next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password || '');
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
