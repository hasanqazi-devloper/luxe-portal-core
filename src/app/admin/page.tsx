// ⚡ Strict Static Compilation Bypass Nodes
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import dynamicImport from 'next/dynamic';

// Next.js ko bolo is dashboard layout ko build server par chhere hi na, sirf direct browser par load kare!
const AdminDashboardClient = dynamicImport(
  () => import('./AdminDashboardClient'),
  { ssr: false } // 🛡️ Completely bypasses build engine prerender check!
);

export default function AdminPage() {
  return <AdminDashboardClient />;
}