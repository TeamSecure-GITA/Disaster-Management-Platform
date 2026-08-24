import React, { useEffect, useState } from 'react';
import localforage from 'localforage';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    async function loadTickets() {
      const keys = await localforage.keys();
      const ticketKeys = keys.filter(k => k.startsWith('support_ticket_'));
      const items = await Promise.all(ticketKeys.map(k => localforage.getItem(k)));
      setTickets(items);
    }
    loadTickets();
  }, []);

  return (
    <div style={{ padding: '20px', color: '#fff', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🎫 Support Tickets Panel</h2>
      {tickets.length === 0 ? <p style={{ color: '#94a3b8' }}>No tickets submitted.</p> : (
        tickets.map(t => (
          <div key={t.id} style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #334155' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem' }}>{t.text}</p>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Submitted: {new Date(t.timestamp).toLocaleString()}</span>
          </div>
        ))
      )}
    </div>
  );
}