'use client'; 

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import dynamicImport from 'next/dynamic';

// Dynamic import with SSR disabled prevents server side hydration mismatches
const AdminDashboardClient = dynamicImport(
  () => import('./AdminDashboardClient'),
  { ssr: false } 
);

export default function AdminPage() {
  return <AdminDashboardClient />;
}