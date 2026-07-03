import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Sign In | ORIGIN',
  description: 'Sign in to your ORIGIN account to access your orders and rewards.',
};

export default function LoginPage() {
  return <LoginClient />;
}
