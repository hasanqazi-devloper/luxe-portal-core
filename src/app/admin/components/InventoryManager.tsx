'use client';

import React, { useState } from 'react';
import { Plus, MapPin, Trash2, Key, DollarSign } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  beds_baths: string;
  commission_fee: number;
  purpose?: string; // 👈 New Column: 'Sale' or 'Rent'
  rent_status?: string; // 👈 New Column: 'Paid', 'Pending', or 'N/A'
}

interface InventoryManagerProps {
  properties: Property[];
  onAddProperty: (propertyData: any) => Promise<boolean>;
  onDeleteProperty: (id: string) => void;
}

export default function InventoryManager({ properties, onAddProperty, onDeleteProperty }: InventoryManagerProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [bedsBaths, setBedsBaths] = useState('');
  const [commission, setCommission] = useState('');
  const [purpose, setPurpose] = useState('Sale'); // 👈 Default Purpose
  const [formLoading, setFormLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    // Injecting purpose with default rent_status if it's a rental property
    const success = await onAddProperty({ 
      title, 
      price: parseFloat(price), 
      location, 
      beds_baths: bedsBaths, 
      commission_fee: parseFloat(commission) || 0,
      purpose,
      rent_status: purpose === 'Rent' ? 'Pending' : 'N/A'
    });
    
    if (success) { 
      setTitle(''); setPrice(''); setLocation(''); setBedsBaths(''); setCommission(''); setPurpose('Sale'); 
    }
    setFormLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* INPUT FORM WITH PURPOSE CONTROL */}
      <section style={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', padding: '32px', borderRadius: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#d4af37', fontSize: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>Inject Portfolio Listing</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#555', fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px' }}>Deal Purpose</label>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={{ width: '100%', padding: '14px', backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '13px', boxSizing: 'border-box', cursor: 'pointer' }}>
                <option value="Sale">For Sale (Direct Listing)</option>
                <option value="Rent">For Rent (Lease Node)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#555', fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px' }}>Asset Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. DHA Phase 1 Apartment" style={{ width: '100%', padding: '14px', backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#555', fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px' }}>{purpose === 'Rent' ? 'Monthly Rent ($)' : 'Market Value ($)'}</label>
              <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price/Rent..." style={{ width: '100%', padding: '14px', backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#555', fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px' }}>{purpose === 'Rent' ? 'Security Deposit ($)' : 'Commission Cut ($)'}</label>
              <input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} placeholder="Fee/Deposit..." style={{ width: '100%', padding: '14px', backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#555', fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px' }}>Geographic Vector & Specs</label>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location..." style={{ width: '100%', padding: '14px', backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }} />
              <input type="text" required value={bedsBaths} onChange={(e) => setBedsBaths(e.target.value)} placeholder="e.g. 3 Beds" style={{ width: '100%', padding: '14px', backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <button type="submit" disabled={formLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#d4af37', border: 'none', borderRadius: '12px', color: '#000', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {formLoading ? 'Syncing...' : <><Plus size={14} /> Commit Node to Vault</>}
          </button>
        </form>
      </section>

      {/* SECURE VAULT WITH HYBRID BADGES */}
      <section style={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', padding: '32px', borderRadius: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '16px', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px' }}>Secure Vault Inventory</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '400px', overflowY: 'auto' }}>
          {properties.map((prop) => (
            <div key={prop.id} style={{ padding: '16px', backgroundColor: '#111', borderLeft: prop.purpose === 'Rent' ? '3px solid #3b82f6' : '3px solid #d4af37', borderRadius: '0 14px 14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: 600 }}>{prop.title}</h4>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px', backgroundColor: prop.purpose === 'Rent' ? 'rgba(59,130,246,0.1)' : 'rgba(212,175,55,0.1)', color: prop.purpose === 'Rent' ? '#3b82f6' : '#d4af37' }}>
                    {prop.purpose || 'Sale'}
                  </span>
                </div>
                <span style={{ color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={12} /> {prop.location}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ display: 'block', color: '#fff', fontSize: '14px' }}>
                    ${prop.price.toLocaleString()}{prop.purpose === 'Rent' && '/mo'}
                  </strong>
                  <span style={{ color: prop.purpose === 'Rent' ? '#3b82f6' : '#22c55e', fontSize: '11px' }}>
                    {prop.purpose === 'Rent' ? `Deposit: $${prop.commission_fee}` : `Cut: $${prop.commission_fee}`}
                  </span>
                </div>
                <button onClick={() => { if(confirm("Are you sure?")) onDeleteProperty(prop.id) }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}