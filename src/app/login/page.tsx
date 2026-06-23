'use client';
// ⚡ Strict Next.js Deployment Override Node
export const dynamic = 'force-dynamic';

// ... (Aapka baqi login page ka jitna bhi code hai, use bilkul mat chhero, baqi sab same rahega)
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else if (data?.user) {
      router.push('/admin');
    }
  };

  return (
    // Fixed: justify00ontent is now perfectly corrected to justifyContent
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', backgroundColor: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', zIndex: 9999 }}>
      
      {/* Dynamic Centered Card */}
      <div style={{ maxWidth: '440px', width: '100%', backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', padding: '40px', borderRadius: '24px', boxSizing: 'border-box', boxShadow: '0 40px 100px rgba(0,0,0,0.9)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ margin: 0, color: '#d4af37', letterSpacing: '4px', fontSize: '24px', fontWeight: 'bold' }}>LUXE PORTAL</h2>
          <p style={{ margin: '8px 0 0 0', color: '#555', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>Secure Core Node</p>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '12px', marginBottom: '20px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Corporate Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@luxe.com" style={{ width: '100%', padding: '14px', backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Security Cipher</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" style={{ width: '100%', padding: '14px', backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#d4af37', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 'bold', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? 'VERIFYING...' : 'ACCESS MATRIX'}
          </button>
        </form>
      </div>

    </div>
  );
}