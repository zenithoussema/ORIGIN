import type { Metadata } from 'next';
import RegisterClient from './RegisterClient';

export const metadata: Metadata = {
  title: 'Create Account | ORIGIN',
  description: 'Create an ORIGIN account to earn rewards and track your orders.',
};

export default function RegisterPage() {
  return <RegisterClient />;
}
