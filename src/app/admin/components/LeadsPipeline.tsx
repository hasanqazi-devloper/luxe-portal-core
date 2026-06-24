'use client';

import React from 'react';
import { Mail, Phone, Briefcase, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/src/lib/supabase'; // 🚀 Linked straight to your core database client node

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  property_interest: string; // ⚡ Aligned with your live database schema keys
  status: string;
  created_at?: string;
}

interface LeadsPipelineProps {
  leads: Lead[];
  onStatusUpdate: (id: string, newStatus: string) => void;
  onDeleteLead: (id: string) => void; 
}

export default function LeadsPipeline({ leads, onStatusUpdate, onDeleteLead }: LeadsPipelineProps) {
  
  // ⚡ Live Database Status Update Trigger
  const handleStatusChange = async (id: string, currentStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: currentStatus })
        .eq('id', id);

      if (error) throw error;
      onStatusUpdate(id, currentStatus);
    } catch (err) {
      console.error("Status synchronization failed:", err);
      alert("Failed to update pipeline node status.");
    }
  };

  // 🗑️ Live Database Destructive Drop Trigger
  const handleLeadDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onDeleteLead(id);
    } catch (err) {
      console.error("Database deletion fault:", err);
      alert("Failed to drop lead node from database.");
    }
  };

  return (
    <section style={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', padding: '32px', borderRadius: '24px', height: '100%' }}>
      
      {/* Dynamic Counter Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>Live Lead Interceptor</h3>
          <p style={{ margin: '4px 0 0 0', color: '#555', fontSize: '11px' }}>Real-time client synchronization nodes</p>
        </div>
        <span style={{ fontSize: '11px', backgroundColor: 'rgba(212,175,55,0.05)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.1)', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>{leads.length} Total</span>
      </div>

      {leads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#444' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 12px auto', display: 'block', color: '#333' }} />
          <p style={{ fontSize: '13px', margin: 0 }}>No dynamic inquiries intercepted yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
          {leads.map((lead) => (
            <div key={lead.id} style={{ padding: '20px', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', position: 'relative' }}>
              
              {/* Actions Wrapper for Status + Delete */}
              <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select 
                  value={lead.status || 'New'} 
                  onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                  style={{ backgroundColor: lead.status === 'New' || !lead.status ? 'rgba(212,175,55,0.08)' : lead.status === 'Contacted' ? 'rgba(59,130,246,0.08)' : 'rgba(34,197,94,0.08)', color: lead.status === 'New' || !lead.status ? '#d4af37' : lead.status === 'Contacted' ? '#3b82f6' : '#22c55e', border: 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="New" style={{ background: '#111', color: '#fff' }}>New Lead</option>
                  <option value="Contacted" style={{ background: '#111', color: '#fff' }}>Contacted</option>
                  <option value="Qualified" style={{ background: '#111', color: '#fff' }}>Qualified</option>
                </select>

                <button 
                  onClick={() => { if(confirm("Are you sure you want to completely purge this lead node?")) handleLeadDelete(lead.id) }} 
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Lead Information */}
              <h4 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '15px', fontWeight: 600 }}>{lead.name}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#a1a1aa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={13} style={{ color: '#444' }} /> {lead.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={13} style={{ color: '#444' }} /> {lead.phone || 'N/A'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d4af37', fontWeight: 500, marginTop: '4px' }}><Briefcase size={13} /> {lead.property_interest || 'Acquisition Interest'}</div>
              </div>

              {lead.phone && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'flex-end' }}>
                  <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#22c55e', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> Instant Connect via WhatsApp
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}