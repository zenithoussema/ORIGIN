import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const profileSettingsSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  language: z.enum(['en', 'ar', 'fr']),
  theme: z.enum(['light', 'dark']),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  customerEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  customerPhone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s\-()]{8,20}$/, 'Please enter a valid phone number'),
  deliveryType: z.enum(['DINE_IN', 'PICKUP', 'DELIVERY']),
  address: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'WALLET']),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, 'Cart must have at least one item'),
}).refine(
  (data) => {
    if (data.deliveryType === 'DELIVERY') {
      return !!data.address && data.address.length >= 5;
    }
    return true;
  },
  {
    message: 'Delivery address is required for delivery orders',
    path: ['address'],
  }
);

export type CheckoutInput = z.infer<typeof checkoutSchema>;
