'use client';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import dynamicImport from 'next/dynamic';

// Next.js compiler ko strictly block karo taake build server par evaluate na ho
const HomeClientComponent = dynamicImport(
  () => import('./HomeClientComponent'),
  { ssr: false } // 🛡️ Completely bypasses build engine prerender check!
);

export default function HomePage() {
  return <HomeClientComponent />;
}