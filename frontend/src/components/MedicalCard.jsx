import React, { useState } from 'react';

export default function MedicalCard() {
  const [details, setDetails] = useState({
    name: 'Santi Behera',
    bloodType: 'O+',
    allergies: 'Penicillin',
    emergencyContact: 'Prafulla Behera (+91 9876543210)'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>🪪 Emergency Medical ID Card</h2>
        <button onClick={handlePrint} style={{ backgroundColor: '#10b981', color: '#064e3b', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          🖨️ Print / Save PDF
        </button>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', padding: '16px', borderRadius: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
          <div><strong style={{ color: '#94a3b8' }}>Full Name:</strong> <div style={{ color: '#fff' }}>{details.name}</div></div>
          <div><strong style={{ color: '#94a3b8' }}>Blood Group:</strong> <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{details.bloodType}</div></div>
          <div><strong style={{ color: '#94a3b8' }}>Allergies:</strong> <div style={{ color: '#fff' }}>{details.allergies}</div></div>
          <div><strong style={{ color: '#94a3b8' }}>Emergency Contact:</strong> <div style={{ color: '#38bdf8' }}>{details.emergencyContact}</div></div>
        </div>
      </div>
    </div>
  );
}