'use client'; // 👈 ✨ Next.js 16 validation layer unlock trigger!

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import dynamicImport from 'next/dynamic';

// Ab compiler ise perfectly client-side runtime dynamic shell banayega
const AdminDashboardClient = dynamicImport(
  () => import('./AdminDashboardClient'),
  { ssr: false } 
);

export default function AdminPage() {
  return <AdminDashboardClient />;
}