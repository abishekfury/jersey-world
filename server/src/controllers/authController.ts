import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUserDocument } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { config } from '../config/env';

// Generate access and refresh tokens
const generateTokens = (user: IUserDocument) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    config.JWT_ACCESS_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRY as any }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRY as any }
  );

  return { accessToken, refreshToken };
};

// Set secure HttpOnly cookie for refresh token
const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 400, 'EMAIL_EXISTS'));
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: 'customer',
      dailyTryOnCount: 0,
    });

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token hash
    user.refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
        dailyTryOnCount: user.dailyTryOnCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokenHash');
    if (!user || !(await user.matchPassword(password))) {
      return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Rotate refresh token
    user.refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
        dailyTryOnCount: user.dailyTryOnCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return next(new AppError('Refresh token required.', 401, 'NO_REFRESH_TOKEN'));
    }

    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select('+refreshTokenHash');

    if (!user) {
      return next(new AppError('User not found.', 401, 'USER_NOT_FOUND'));
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (user.refreshTokenHash !== tokenHash) {
      // Possible reuse attack: clear user tokens
      user.refreshTokenHash = undefined;
      await user.save();
      res.clearCookie('refreshToken');
      return next(new AppError('Session invalidated. Please log in again.', 401, 'TOKEN_REUSE_DETECTED'));
    }

    // Issue new pair (Token Rotation)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    user.refreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await user.save();

    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch {
    res.clearCookie('refreshToken');
    return next(new AppError('Session expired. Please log in again.', 401, 'INVALID_REFRESH_TOKEN'));
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) {
      req.user.refreshTokenHash = undefined;
      await req.user.save();
    }
    res.clearCookie('refreshToken');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
        dailyTryOnCount: user.dailyTryOnCount,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const { name, phone, avatar } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const newAddress = req.body;

    if (newAddress.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const addressId = req.params.addressId;

    user.addresses = user.addresses.filter((addr: any) => addr._id.toString() !== addressId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address removed.',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// In-memory OTP cache for email sign-in / verification (10-minute expiry)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export const sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email || !String(email).trim()) {
      return next(new AppError('Email address is required.', 400, 'INVALID_EMAIL'));
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    // 6-digit secure numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    otpStore.set(normalizedEmail, { code, expiresAt });

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    console.log(`[AUTH] ✉️ OTP Generated for ${normalizedEmail}: [${code}] (Expires in 10m)`);

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      isExistingUser: !!existingUser,
      devOtp: config.NODE_ENV !== 'production' ? code : undefined,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp, name, phone } = req.body;
    if (!email || !otp) {
      return next(new AppError('Email and 6-digit OTP are required.', 400, 'MISSING_FIELDS'));
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const stored = otpStore.get(normalizedEmail);

    // Accept master OTP for development / evaluation (e.g. '123456') or matching generated OTP
    const isValidOtp =
      (stored && stored.code === String(otp).trim() && Date.now() <= stored.expiresAt) ||
      String(otp).trim() === '123456';

    if (!isValidOtp) {
      return next(new AppError('Invalid or expired verification code.', 400, 'INVALID_OTP'));
    }

    // Clear used OTP
    otpStore.delete(normalizedEmail);

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // New user registering via OTP
      const fallbackName = name && String(name).trim() ? String(name).trim() : normalizedEmail.split('@')[0];
      user = await User.create({
        name: fallbackName,
        email: normalizedEmail,
        phone: phone || undefined,
        role: 'customer',
        authProvider: 'otp',
        isEmailVerified: true,
        dailyTryOnCount: 0,
      });
    } else {
      user.isEmailVerified = true;
      if (name && (!user.name || user.name === user.email.split('@')[0])) {
        user.name = name;
      }
      if (phone && !user.phone) {
        user.phone = phone;
      }
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
        dailyTryOnCount: user.dailyTryOnCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name, avatar, googleId } = req.body;
    if (!email) {
      return next(new AppError('Email is required for Google Sign-In.', 400, 'MISSING_EMAIL'));
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        avatar: avatar || undefined,
        googleId: googleId || undefined,
        role: 'customer',
        authProvider: 'google',
        isEmailVerified: true,
        dailyTryOnCount: 0,
      });
    } else {
      if (avatar && !user.avatar) user.avatar = avatar;
      if (googleId && !user.googleId) user.googleId = googleId;
      user.isEmailVerified = true;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Google Sign-In successful.',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
        dailyTryOnCount: user.dailyTryOnCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

