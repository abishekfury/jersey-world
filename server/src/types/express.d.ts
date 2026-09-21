import { IUserDocument } from '../models/User';

declare global {
  namespace Express {
    // Extend Express.User to match our custom User document type
    interface User extends IUserDocument {}
  }
}

