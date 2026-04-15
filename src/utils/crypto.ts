import { pbkdf2Sync, randomBytes } from 'node:crypto';

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
  const [salt, key] = storedHash.split(':');
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === key;
};
