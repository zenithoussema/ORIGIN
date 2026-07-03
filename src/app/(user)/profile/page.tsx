import type { Metadata } from 'next';
import ProfileDashboard from './ProfileDashboard';

export const metadata: Metadata = {
  title: 'My Profile | ORIGIN',
  description: 'Manage your account, orders, favorites, and loyalty rewards.',
};

export default function ProfilePage() {
  return <ProfileDashboard />;
}
