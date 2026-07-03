'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import { loginSchema } from '@/lib/validations';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const errorParam = searchParams.get('error');
  const { update } = useSession();

  const sessionRequired = errorParam === 'session_required';

  const validateForm = (): boolean => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: { email?: string; password?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as 'email' | 'password';
        errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRateLimited(false);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setRateLimited(true);
        setError(data.error || 'Too many attempts. Please wait before trying again.');
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.error || 'Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }

      await update();

      router.push(callbackUrl);
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-espresso flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-espresso via-espresso/95 to-espresso/90" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-caramel/30 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-caramel/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Link href="/" className="inline-block mb-8">
              <span className="font-heading text-5xl font-bold text-cream tracking-wider">
                ORIGIN
              </span>
            </Link>
            <h2 className="font-heading text-3xl font-bold text-cream mb-4">
              Welcome Back
            </h2>
            <p className="text-cream/60 text-lg max-w-md">
              Sign in to access your orders, favorites, and loyalty rewards.
            </p>
            <div className="mt-12 flex items-center gap-8 text-cream/40 text-sm">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-caramel">500+</span>
                <span>Happy Customers</span>
              </div>
              <div className="w-px h-12 bg-cream/20" />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-caramel">4.9</span>
                <span>Rating</span>
              </div>
              <div className="w-px h-12 bg-cream/20" />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-caramel">50+</span>
                <span>Premium Dishes</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="font-heading text-3xl font-bold text-espresso dark:text-cream">
                ORIGIN
              </span>
            </Link>
          </div>

          {sessionRequired && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-caramel/10 border border-caramel/20"
            >
              <p className="text-sm text-caramel">
                You need an account to continue. Please sign in below.
              </p>
            </motion.div>
          )}

          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-espresso dark:text-cream mb-2">
              Sign In
            </h1>
            <p className="text-smoke-300 dark:text-cream/50">
              Enter your credentials to access your account
            </p>
          </div>

          {error && (
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
                {error}
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    setError('');
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    fieldErrors.email
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-espresso/20 dark:border-cream/20 focus:ring-caramel/50'
                  } bg-white dark:bg-espresso-500 text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 transition-all text-sm`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-espresso dark:text-cream">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-caramel hover:text-caramel-400 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-300"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    setError('');
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                    fieldErrors.password
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
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              leftIcon={<LogIn size={18} />}
              disabled={rateLimited}
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-smoke-300 dark:text-cream/40 mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-caramel hover:text-caramel-400 transition-colors font-medium"
            >
              Create one now
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-espresso/10 dark:border-cream/10">
            <p className="text-center text-xs text-smoke-300/60 dark:text-cream/30">
              Protected by industry-standard encryption. Your credentials are never stored in plain text.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
