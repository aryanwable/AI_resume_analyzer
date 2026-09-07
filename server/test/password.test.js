import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';

describe('Password Security & Hashing Tests (bcryptjs)', () => {
  const plainPassword = 'MySuperSecretPassword2026!';

  test('bcrypt generates a valid 60-character salted hash with $2a$ / $2b$ prefix', async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainPassword, salt);

    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 60);
    assert.ok(hash.startsWith('$2a$') || hash.startsWith('$2b$'));
  });

  test('identical passwords hashed with different salts produce different hash strings', async () => {
    const salt1 = await bcrypt.genSalt(10);
    const salt2 = await bcrypt.genSalt(10);

    const hash1 = await bcrypt.hash(plainPassword, salt1);
    const hash2 = await bcrypt.hash(plainPassword, salt2);

    assert.notEqual(hash1, hash2);
    // Both must still verify successfully against the same plaintext
    assert.equal(await bcrypt.compare(plainPassword, hash1), true);
    assert.equal(await bcrypt.compare(plainPassword, hash2), true);
  });

  test('User instance comparePassword method accurately validates correct password', async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const userInstance = new User({
      name: 'Security Test User',
      email: 'security@example.com',
      password: hashedPassword,
    });

    const isMatch = await userInstance.comparePassword(plainPassword);
    assert.equal(isMatch, true);
  });

  test('User instance comparePassword method rejects incorrect password', async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const userInstance = new User({
      name: 'Security Test User',
      email: 'security@example.com',
      password: hashedPassword,
    });

    const isMatch = await userInstance.comparePassword('WrongPassword123!');
    assert.equal(isMatch, false);
  });

  test('User instance comparePassword gracefully handles empty or null input', async () => {
    const userInstance = new User({
      name: 'Security Test User',
      email: 'security@example.com',
      password: 'some_hashed_string',
    });

    assert.equal(await userInstance.comparePassword(''), false);
    assert.equal(await userInstance.comparePassword(null), false);
    assert.equal(await userInstance.comparePassword(undefined), false);
  });
});
