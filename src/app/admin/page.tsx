'use client';

// ⚡ Next.js Dynamic Run Engine Configuration Locks
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // 👈 Relative path mapping taake URL undefined na ho
import { 
  LogOut, Loader2, Shield, Users, Building2, 
  DollarSign, LayoutDashboard, Key, Menu, X 
} from 'lucide-react';

import LeadsPipeline from './components/LeadsPipeline';
import InventoryManager from './components/InventoryManager';
import FinancialMatrix from './components/FinancialMatrix';

interface Lead { id: string; name: string; email: string; phone: string; property_interest: string; status: string; }
interface Property { id: string; title: string; price: number; location: string; beds_baths: string; commission_fee: number; purpose?: string; rent_status?: string; }

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  // WP Style Tab Controller
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'inventory' | 'rentals' | 'finance'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(1200);

  // Synchronize Central Database Nodes
  const fetchSystemData = async () => {
    // 🛡️ Build Server Pipeline Guard Check (Netlify optimization)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      console.log("Build environment dynamic lock active: Skipping database hit.");
      return;
    }

    try {
      const [leadsRes, propsRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('properties').select('*').order('created_at', { ascending: false })
      ]);
      if (leadsRes.data) setLeads(leadsRes.data);
      if (propsRes.data) setProperties(propsRes.data);
    } catch (err) {
      console.error("System Matrix Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 992) setSidebarOpen(false);
      
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
        if (window.innerWidth < 992) setSidebarOpen(false);
        else setSidebarOpen(true);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        fetchSystemData();
      }
    };
    checkSession();
  }, [router]);

  const handleUpdateLeadStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
    if (!error) fetchSystemData();
  };

  const handleAddPropertyBridge = async (propertyData: any) => {
    const { error } = await supabase.from('properties').insert([propertyData]);
    if (!error) { 
      fetchSystemData(); 
      return true; 
    }
    return false;
  };

  const handleDeleteLeadNode = async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) fetchSystemData();
  };

  const handleDeletePropertyNode = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (!error) fetchSystemData();
  };

  const handleToggleRentStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    const { error } = await supabase.from('properties').update({ rent_status: nextStatus }).eq('id', id);
    if (!error) fetchSystemData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Loader2 className="animate-spin text-[#d4af37]" size={40} />
        <p style={{ color: '#666', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>Synchronizing Luxe Core Matrices...</p>
      </div>
    );
  }

  const isMobile = windowWidth < 992;
  const rentalProperties = properties.filter(p => p.purpose === 'Rent');
  const totalCommissions = properties.filter(p => !p.purpose || p.purpose === 'Sale').reduce((acc, curr) => acc + (Number(curr.commission_fee) || 0), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', display: 'flex', position: 'relative' }}>

      {/* Mobile Sidebar Trigger Floater */}
      {isMobile && (
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#d4af37', border: 'none', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, boxShadow: '0 10px 30px rgba(212,175,55,0.3)', cursor: 'pointer' }}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* 🏛️ EXECUTIVE WORDPRESS-STYLE SIDEBAR */}
      <aside style={{ width: '280px', backgroundColor: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', position: isMobile ? 'fixed' : 'sticky', top: 0, height: '100vh', zIndex: 999, transition: 'transform 0.3s ease', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-280px)', marginLeft: isMobile ? 0 : (sidebarOpen ? 0 : '-280px') }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '12px' }}><Shield size={20} className="text-[#d4af37]" /><h2 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 900, letterSpacing: '1px' }}>LUXE<span style={{ color: '#d4af37', fontWeight: 300 }}>ADMIN</span></h2></div>
        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button onClick={() => { setActiveTab('overview'); if (isMobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'overview' ? 'rgba(212,175,55,0.08)' : 'transparent', color: activeTab === 'overview' ? '#d4af37' : '#888', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}><LayoutDashboard size={16} /> Overview Console</button>
          <button onClick={() => { setActiveTab('leads'); if (isMobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'leads' ? 'rgba(212,175,55,0.08)' : 'transparent', color: activeTab === 'leads' ? '#d4af37' : '#888', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}><Users size={16} /> Lead Interceptor<span style={{ marginLeft: 'auto', fontSize: '10px', background: activeTab === 'leads' ? '#d4af37' : '#222', color: activeTab === 'leads' ? '#000' : '#aaa', padding: '2px 8px', borderRadius: '10px' }}>{leads.length}</span></button>
          <button onClick={() => { setActiveTab('inventory'); if (isMobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'inventory' ? 'rgba(212,175,55,0.08)' : 'transparent', color: activeTab === 'inventory' ? '#d4af37' : '#888', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}><Building2 size={16} /> Portfolio Vault</button>
          <button onClick={() => { setActiveTab('rentals'); if (isMobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'rentals' ? 'rgba(59,130,246,0.08)' : 'transparent', color: activeTab === 'rentals' ? '#3b82f6' : '#888', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}><Key size={16} /> Rental Tracker Hub <span style={{ marginLeft: 'auto', fontSize: '10px', background: activeTab === 'rentals' ? '#3b82f6' : '#222', color: activeTab === 'rentals' ? '#000' : '#aaa', padding: '2px 8px', borderRadius: '10px' }}>{rentalProperties.length}</span></button>
          <button onClick={() => { setActiveTab('finance'); if (isMobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === 'finance' ? 'rgba(212,175,55,0.08)' : 'transparent', color: activeTab === 'finance' ? '#d4af37' : '#888', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}><DollarSign size={16} /> Revenue Engine</button>
        </nav>
        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.03)' }}><button onClick={handleLogout} style={{ width: '100%', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><LogOut size={14} /> Disconnect</button></div>
      </aside>

      {/* Main Content Workspace */}
      <main style={{ flex: 1, padding: isMobile ? '24px 16px' : '40px', boxSizing: 'border-box', overflowX: 'hidden' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#fff' }}>Welcome Back, Commander</h2>
              <p style={{ margin: '4px 0 0 0', color: '#555', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>System Active • Syncing Live Nodes via Multan servers</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '24px', backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}><span style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase' }}>Pipeline Strength</span><strong style={{ display: 'block', fontSize: '28px', color: '#fff', marginTop: '4px' }}>{leads.length} Leads</strong></div>
              <div style={{ padding: '24px', backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}><span style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase' }}>Leased Portfolio</span><strong style={{ display: 'block', fontSize: '28px', color: '#3b82f6', marginTop: '4px' }}>{rentalProperties.length} Rented</strong></div>
              <div style={{ padding: '24px', backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}><span style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase' }}>Locked Commissions</span><strong style={{ display: 'block', fontSize: '28px', color: '#22c55e', marginTop: '4px' }}>${totalCommissions.toLocaleString()}</strong></div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (<div><LeadsPipeline leads={leads} onStatusUpdate={handleUpdateLeadStatus} onDeleteLead={handleDeleteLeadNode} /></div>)}
        {activeTab === 'inventory' && (<div><InventoryManager properties={properties} onAddProperty={handleAddPropertyBridge} onDeleteProperty={handleDeletePropertyNode} /></div>)}

        {/* Active Rental Cashflow Hub */}
        {activeTab === 'rentals' && (
          <div style={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', padding: '32px', borderRadius: '24px' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: '#3b82f6', fontSize: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>Active Rental Cashflow Nodes</h3>
              <p style={{ margin: '4px 0 0 0', color: '#555', fontSize: '11px' }}>Track lease status and monthly rent collections</p>
            </div>

            {rentalProperties.length === 0 ? (
              <p style={{ color: '#444', textAlign: 'center', padding: '30px 0', fontSize: '13px' }}>No active rental listings in vault.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {rentalProperties.map((prop) => (
                  <div key={prop.id} style={{ padding: '20px', backgroundColor: '#111', borderLeft: prop.rent_status === 'Paid' ? '3px solid #22c55e' : '3px solid #ef4444', borderRadius: '0 14px 14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '15px', fontWeight: 600 }}>{prop.title}</h4>
                      <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>{prop.location} • {prop.beds_baths}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', color: '#444', fontSize: '10px', textTransform: 'uppercase' }}>Monthly Rent</span>
                        <strong style={{ color: '#fff', fontSize: '16px' }}>${prop.price.toLocaleString()}/mo</strong>
                      </div>

                      <button
                        onClick={() => handleToggleRentStatus(prop.id, prop.rent_status || 'Pending')}
                        style={{
                          backgroundColor: prop.rent_status === 'Paid' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: prop.rent_status === 'Paid' ? '#22c55e' : '#ef4444',
                          border: prop.rent_status === 'Paid' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {prop.rent_status === 'Paid' ? '✓ Rent Received' : '✗ Rent Pending'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'finance' && (<div><FinancialMatrix properties={properties} leadsCount={leads.length} /></div>)}
      </main>
    </div>
  );
}