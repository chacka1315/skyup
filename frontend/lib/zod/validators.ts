import z from 'zod';

export const User = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required.')
      .max(50, 'Name must has at most 50 characters.'),
    username: z
      .string()
      .regex(/^[a-z0-9]+$/i, 'Username can only contain letters and numbers.')
      .min(1, 'Username is required.')
      .max(50, 'Name must has at most 50 characters.'),
    email: z.email('This email is not valid.'),
    password: z
      .string()
      .trim()
      .min(
        8,
        'Password must have at least : 8 characters, one number, one capital letter, one lowercase letter and one special character like .@#$%&',
      ),
    password_repeat: z.string(),
  })
  .refine((data) => data.password === data.password_repeat, {
    error: 'Passwords do not matchs.',
    path: ['password_repeat'],
  });
