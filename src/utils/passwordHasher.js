import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Supported password hashing algorithms
 */
export const HashAlgorithms = {
  BCRYPT: 'bcrypt',
  SCRYPT: 'scrypt',
  PBKDF2: 'pbkdf2',
  ARGON2: 'argon2', // Note: requires argon2 package to be installed
};

/**
 * Password Hasher Service
 * Supports multiple hashing algorithms configurable via environment
 */
class PasswordHasher {
  constructor() {
    this.algorithm = env.HASH_ALGORITHM || HashAlgorithms.BCRYPT;
    this.rounds = env.BCRYPT_ROUNDS || 12;
    this.keyLength = env.HASH_KEY_LENGTH || 64;
    this.saltLength = env.HASH_SALT_LENGTH || 16;
  }

  /**
   * Hash a password using the configured algorithm
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hash(password) {
    switch (this.algorithm.toLowerCase()) {
      case HashAlgorithms.BCRYPT:
        return this.hashWithBcrypt(password);

      case HashAlgorithms.SCRYPT:
        return this.hashWithScrypt(password);

      case HashAlgorithms.PBKDF2:
        return this.hashWithPbkdf2(password);

      case HashAlgorithms.ARGON2:
        return this.hashWithArgon2(password);

      default:
        throw new Error(`Unsupported hash algorithm: ${this.algorithm}`);
    }
  }

  /**
   * Verify a password against a hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  async verify(password, hash) {
    // Detect algorithm from hash format
    const algorithm = this.detectAlgorithm(hash);

    switch (algorithm) {
      case HashAlgorithms.BCRYPT:
        return this.verifyBcrypt(password, hash);

      case HashAlgorithms.SCRYPT:
        return this.verifyScrypt(password, hash);

      case HashAlgorithms.PBKDF2:
        return this.verifyPbkdf2(password, hash);

      case HashAlgorithms.ARGON2:
        return this.verifyArgon2(password, hash);

      default:
        throw new Error(`Unable to detect hash algorithm from hash: ${hash}`);
    }
  }

  /**
   * Detect hashing algorithm from hash format
   * @param {string} hash - Hashed password
   * @returns {string} Algorithm name
   */
  detectAlgorithm(hash) {
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return HashAlgorithms.BCRYPT;
    }
    if (hash.startsWith('$scrypt$')) {
      return HashAlgorithms.SCRYPT;
    }
    if (hash.startsWith('$pbkdf2$')) {
      return HashAlgorithms.PBKDF2;
    }
    if (hash.startsWith('$argon2')) {
      return HashAlgorithms.ARGON2;
    }

    // Default fallback
    return this.algorithm;
  }

  // ==================== BCRYPT ====================

  /**
   * Hash password with bcrypt
   */
  async hashWithBcrypt(password) {
    return bcrypt.hash(password, this.rounds);
  }

  /**
   * Verify password with bcrypt
   */
  async verifyBcrypt(password, hash) {
    return bcrypt.compare(password, hash);
  }

  // ==================== SCRYPT ====================

  /**
   * Hash password with scrypt
   */
  async hashWithScrypt(password) {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(this.saltLength).toString('hex');

      crypto.scrypt(password, salt, this.keyLength, (err, derivedKey) => {
        if (err) reject(err);
        // Format: $scrypt$salt$hash
        resolve(`$scrypt$${salt}$${derivedKey.toString('hex')}`);
      });
    });
  }

  /**
   * Verify password with scrypt
   */
  async verifyScrypt(password, hash) {
    return new Promise((resolve, reject) => {
      try {
        const parts = hash.split('$');
        if (parts.length !== 4 || parts[0] !== '' || parts[1] !== 'scrypt') {
          return resolve(false);
        }

        const salt = parts[2];
        const originalHash = parts[3];

        crypto.scrypt(password, salt, this.keyLength, (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey.toString('hex') === originalHash);
        });
      } catch (error) {
        resolve(false);
      }
    });
  }

  // ==================== PBKDF2 ====================

  /**
   * Hash password with PBKDF2
   */
  async hashWithPbkdf2(password) {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(this.saltLength).toString('hex');
      const iterations = this.rounds * 1000; // Convert rounds to iterations

      crypto.pbkdf2(password, salt, iterations, this.keyLength, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        // Format: $pbkdf2$iterations$salt$hash
        resolve(`$pbkdf2$${iterations}$${salt}$${derivedKey.toString('hex')}`);
      });
    });
  }

  /**
   * Verify password with PBKDF2
   */
  async verifyPbkdf2(password, hash) {
    return new Promise((resolve, reject) => {
      try {
        const parts = hash.split('$');
        if (parts.length !== 5 || parts[0] !== '' || parts[1] !== 'pbkdf2') {
          return resolve(false);
        }

        const iterations = parseInt(parts[2]);
        const salt = parts[3];
        const originalHash = parts[4];

        crypto.pbkdf2(password, salt, iterations, this.keyLength, 'sha512', (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey.toString('hex') === originalHash);
        });
      } catch (error) {
        resolve(false);
      }
    });
  }

  // ==================== ARGON2 ====================

  /**
   * Hash password with Argon2
   * Note: Requires 'argon2' package to be installed
   */
  async hashWithArgon2(password) {
    try {
      const argon2 = await import('argon2');
      return argon2.hash(password);
    } catch (error) {
      throw new Error('Argon2 package not installed. Run: npm install argon2');
    }
  }

  /**
   * Verify password with Argon2
   * Note: Requires 'argon2' package to be installed
   */
  async verifyArgon2(password, hash) {
    try {
      const argon2 = await import('argon2');
      return argon2.verify(hash, password);
    } catch (error) {
      throw new Error('Argon2 package not installed. Run: npm install argon2');
    }
  }
}

// Export singleton instance
export const passwordHasher = new PasswordHasher();
export default passwordHasher;
