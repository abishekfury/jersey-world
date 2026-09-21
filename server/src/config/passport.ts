import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './env';
import { User } from '../models/User';
import { logger } from './logger';

export const configurePassport = (): void => {
  if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.GOOGLE_CLIENT_ID,
          clientSecret: config.GOOGLE_CLIENT_SECRET,
          callbackURL: config.GOOGLE_CALLBACK_URL,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value?.toLowerCase();
            if (!email) {
              return done(new Error('No email found in Google profile'), undefined);
            }

            const name =
              profile.displayName ||
              `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() ||
              email.split('@')[0];
            const avatar = profile.photos?.[0]?.value;

            let user = await User.findOne({
              $or: [{ googleId: profile.id }, { email }],
            });

            if (!user) {
              user = await User.create({
                name,
                email,
                avatar,
                googleId: profile.id,
                role: 'customer',
                authProvider: 'google',
                isEmailVerified: true,
                dailyTryOnCount: 0,
              });
            } else {
              let modified = false;
              if (!user.googleId) {
                user.googleId = profile.id;
                modified = true;
              }
              if (avatar && !user.avatar) {
                user.avatar = avatar;
                modified = true;
              }
              if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                modified = true;
              }
              if (modified) {
                await user.save();
              }
            }

            return done(null, user);
          } catch (error) {
            logger.error('Google OAuth Passport Strategy error:', error);
            return done(error as Error, undefined);
          }
        }
      )
    );
    logger.info('🔐 Passport Google OAuth Strategy initialized successfully.');
  } else {
    logger.warn('Google OAuth credentials missing; Passport Google strategy skipped.');
  }
};

