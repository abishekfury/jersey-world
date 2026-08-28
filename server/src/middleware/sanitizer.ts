import { Request, Response, NextFunction } from 'express';

// Recursively sanitize objects against NoSQL injection ($ and .)
const sanitizeValue = (value: any): any => {
  if (typeof value === 'string') {
    return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        // Strip out $ or . keys for MongoDB query injection prevention
        const cleanKey = key.replace(/^\$|\./g, '');
        cleanObj[cleanKey] = sanitizeValue(value[key]);
      }
    }
    return cleanObj;
  }
  return value;
};

export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  next();
};
