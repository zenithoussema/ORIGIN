'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import { registerSchema, type RegisterInput } from '@/lib/validations';

export default function RegisterClient() {
  const [formData, setFormData] = useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'One number', met: /[0-9]/.test(formData.password) },
  ];

  const handleChange = (field: keyof RegisterInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setApiError('');
    setRateLimited(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError('');
    setRateLimited(false);

    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof RegisterInput;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setRateLimited(true);
        setApiError(data.error || 'Too many attempts. Please wait before trying again.');
        setIsLoading(false);
        return;
      }

      if (response.status === 400 && data.fieldErrors) {
        setErrors(data.fieldErrors);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setApiError(data.error || 'Something went wrong. Please try again.');
        setIsLoading(false);
        return;
      }

      await update();

      router.push('/');
    } catch {
      setApiError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="font-heading text-3xl font-bold text-espresso dark:text-cream">
              ORIGIN
            </span>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-espresso dark:text-cream mb-2">
            Create Account
          </h1>
          <p className="text-smoke-300 dark:text-cream/50">
            Join ORIGIN to earn rewards and track your orders
          </p>
        </div>

        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              rateLimited
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            <p className={`text-sm ${rateLimited ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
              {apiError}
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              Full Name
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-300"
              />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ahmed Mohammed"
                autoComplete="name"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-espresso/20 dark:border-cream/20 focus:ring-caramel/50'
                } bg-white dark:bg-espresso-500 text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 transition-all text-sm`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-300"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-espresso/20 dark:border-cream/20 focus:ring-caramel/50'
                } bg-white dark:bg-espresso-500 text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 transition-all text-sm`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-300"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-espresso/20 dark:border-cream/20 focus:ring-caramel/50'
                } bg-white dark:bg-espresso-500 text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 transition-all text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke-300 hover:text-espresso dark:hover:text-cream transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}

            {formData.password.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {passwordRequirements.map((req) => (
                  <div key={req.label} className="flex items-center gap-2 text-xs">
                    <Check
                      size={14}
                      className={req.met ? 'text-sage' : 'text-smoke-300 dark:text-cream/30'}
                    />
                    <span
                      className={
                        req.met
                          ? 'text-sage'
                          : 'text-smoke-300 dark:text-cream/30'
                      }
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-300"
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-espresso/20 dark:border-cream/20 focus:ring-caramel/50'
                } bg-white dark:bg-espresso-500 text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 transition-all text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke-300 hover:text-espresso dark:hover:text-cream transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            leftIcon={<UserPlus size={18} />}
            disabled={rateLimited}
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-smoke-300 dark:text-cream/40 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-caramel hover:text-caramel-400 transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-espresso/10 dark:border-cream/10">
          <p className="text-center text-xs text-smoke-300/60 dark:text-cream/30">
            Protected by industry-standard encryption. Your credentials are never stored in plain text.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
