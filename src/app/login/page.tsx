'use client';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import dynamicImport from 'next/dynamic';

// Next.js ko bolo is login screen ko build server par touch na kare, sirf client browser par load kare
const LoginClientComponent = dynamicImport(
  () => import('./LoginClientComponent'),
  { ssr: false } // 🛡️ Completely bypasses build engine prerender check!
);

export default function LoginPage() {
  return <LoginClientComponent />;
}