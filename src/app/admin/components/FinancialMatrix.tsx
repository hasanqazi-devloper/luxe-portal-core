'use client';

import React from 'react';
import { DollarSign, Wallet, Target, Key, ArrowUpRight } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  beds_baths: string;
  commission_fee: number;
  purpose?: string;
  rent_status?: string;
}

interface FinancialMatrixProps {
  properties: Property[];
  leadsCount: number;
}

export default function FinancialMatrix({ properties, leadsCount }: FinancialMatrixProps) {
  // Separate Sales vs Rentals Nodes
  const salesProperties = properties.filter(p => !p.purpose || p.purpose === 'Sale');
  const rentalProperties = properties.filter(p => p.purpose === 'Rent');

  const grossCommissions = salesProperties.reduce((acc, curr) => acc + (Number(curr.commission_fee) || 0), 0);
  const netTakeHome = grossCommissions * 0.7; 

  // 🏠 RENTAL MONITORING METRICS
  const monthlyRentalCashflow = rentalProperties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const totalSecurityDeposits = rentalProperties.reduce((acc, curr) => acc + (Number(curr.commission_fee) || 0), 0);

  const monthlyTarget = 500000;
  // Total overall revenue tracked towards target
  const combinedRevenue = grossCommissions + monthlyRentalCashflow;
  const targetProgress = Math.min((combinedRevenue / monthlyTarget) * 100, 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Gross Sales Commissions */}
        <div style={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Sales Commissions</span>
            <div style={{ backgroundColor: 'rgba(212,175,55,0.05)', padding: '8px', borderRadius: '10px', color: '#d4af37' }}><DollarSign size={16} /></div>
          </div>
          <strong style={{ display: 'block', fontSize: '32px', color: '#fff', fontWeight: 900 }}>${grossCommissions.toLocaleString()}</strong>
          <span style={{ color: '#555', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>From {salesProperties.length} Active Sales Assets</span>
        </div>

        {/* Card 2: Net Take-Home Pocket */}
        <div style={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(34,197,94,0.1)', padding: '24px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Net Take-Home (70/30 Split)</span>
            <div style={{ backgroundColor: 'rgba(34,197,94,0.05)', padding: '8px', borderRadius: '10px', color: '#22c55e' }}><Wallet size={16} /></div>
          </div>
          <strong style={{ display: 'block', fontSize: '32px', color: '#22c55e', fontWeight: 900 }}>${netTakeHome.toLocaleString()}</strong>
          <span style={{ color: '#555', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>Agency operational split factored out</span>
        </div>

        {/* 🔑 Card 3: NEW EXTRA BRAND NEW RENTAL CASHFLOW TRACKER */}
        <div style={{ backgroundColor: '#0d0d0d', border: '1px solid rgba(59,130,246,0.1)', padding: '24px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Rent Cashflow</span>
            <div style={{ backgroundColor: 'rgba(59,130,246,0.05)', padding: '8px', borderRadius: '10px', color: '#3b82f6' }}><Key size={16} /></div>
          </div>
          <strong style={{ display: 'block', fontSize: '32px', color: '#3b82f6', fontWeight: 900 }}>${monthlyRentalCashflow.toLocaleString()}</strong>
          <span style={{ color: '#555', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            Secured Deposits: ${totalSecurityDeposits.toLocaleString()}
          </span>
        </div>

      </div>

      {/* TARGET ACCELERATOR BAR */}
      <div style={{ backgroundColor: '#0d0d0d', border: '1px dashed rgba(255,255,255,0.05)', padding: '28px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={16} style={{ color: '#d4af37' }} />
            <h4 style={{ margin: 0, color: '#fff', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Agency Velocity Target (Sales + Rent)</h4>
          </div>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{targetProgress.toFixed(1)}% Achieved</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#151515', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ width: `${targetProgress}%`, height: '100%', backgroundColor: '#d4af37', borderRadius: '10px', boxShadow: '0 0 15px rgba(212,175,55,0.4)', transition: 'width 1s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: '11px', textTransform: 'uppercase' }}>
          <span>Combined Volume: ${combinedRevenue.toLocaleString()}</span>
          <span>Target Milestone: ${monthlyTarget.toLocaleString()}</span>
        </div>
      </div>

    </div>
  );
}