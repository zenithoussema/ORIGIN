import type { Metadata } from 'next';
import AdminClient from './AdminClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard | ORIGIN',
  description: 'ORIGIN restaurant admin control center',
};

export default function AdminPage() {
  return <AdminClient />;
}
