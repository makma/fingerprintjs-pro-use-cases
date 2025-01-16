import Crypto from 'crypto';
import { HASH_SALT } from '../envShared';

export function hashString(phoneNumber: string) {
  const hash = Crypto.createHash('sha256');
  hash.update(phoneNumber + HASH_SALT);
  return hash.digest('hex');
}
