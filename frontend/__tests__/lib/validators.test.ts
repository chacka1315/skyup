import { User } from '@/lib/zod/validators';

const validData = {
  name: 'Alice Smith',
  username: 'alice123',
  email: 'alice@example.com',
  password: 'Secret1!',
  password_repeat: 'Secret1!',
};

describe('User validator', () => {
  it('accepts valid data', () => {
    expect(User.safeParse(validData).success).toBe(true);
  });

  // --- name ---
  it('rejects empty name', () => {
    const result = User.safeParse({ ...validData, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 50 characters', () => {
    const result = User.safeParse({ ...validData, name: 'a'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('accepts name with exactly 50 characters', () => {
    const result = User.safeParse({ ...validData, name: 'a'.repeat(50) });
    expect(result.success).toBe(true);
  });

  // --- username ---
  it('rejects username with special characters', () => {
    const result = User.safeParse({ ...validData, username: 'alice_!' });
    expect(result.success).toBe(false);
  });

  it('accepts alphanumeric username', () => {
    const result = User.safeParse({ ...validData, username: 'Alice123' });
    expect(result.success).toBe(true);
  });

  it('rejects empty username', () => {
    const result = User.safeParse({ ...validData, username: '' });
    expect(result.success).toBe(false);
  });

  // --- email ---
  it('rejects invalid email', () => {
    const result = User.safeParse({ ...validData, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects email without domain', () => {
    const result = User.safeParse({ ...validData, email: 'alice@' });
    expect(result.success).toBe(false);
  });

  // --- password ---
  it('rejects password shorter than 8 characters', () => {
    const result = User.safeParse({
      ...validData,
      password: 'Abc1!',
      password_repeat: 'Abc1!',
    });
    expect(result.success).toBe(false);
  });

  // --- password_repeat ---
  it('rejects mismatched passwords', () => {
    const result = User.safeParse({
      ...validData,
      password: 'Secret1!',
      password_repeat: 'Different1!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain('password_repeat');
    }
  });

  it('accepts matching passwords', () => {
    const result = User.safeParse({
      ...validData,
      password: 'MyPassword1!',
      password_repeat: 'MyPassword1!',
    });
    expect(result.success).toBe(true);
  });
});
