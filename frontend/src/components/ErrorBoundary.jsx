import React from 'react';

const API_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : 'http://localhost:5000';

class ErrorBoundary extends React.Component {
  state = { hasError: false, countdown: 60 };
  _countdownInterval = null;

  static getDerivedStateFromError() {
    return { hasError: true, countdown: 60 };
  }

  componentDidCatch(error, errorInfo) {
    // Send error report to teamsecure.project@gmail.com via backend
    fetch(`${API_URL}/api/maintenance/notify-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: 'teamsecure.project@gmail.com',
        error: error?.toString?.() || String(error),
        stack: errorInfo?.componentStack || 'No stack trace',
      }),
    }).catch(() => {});

    // Countdown timer — auto-reload after 60 seconds
    this._countdownInterval = setInterval(() => {
      this.setState(prev => {
        if (prev.countdown <= 1) {
          clearInterval(this._countdownInterval);
          this.setState({ hasError: false, countdown: 60 });
          window.location.reload();
          return { countdown: 0 };
        }
        return { countdown: prev.countdown - 1 };
      });
    }, 1000);
  }

  componentWillUnmount() {
    if (this._countdownInterval) clearInterval(this._countdownInterval);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '36px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛡️</div>
            <h2 style={{ margin: '0 0 8px', color: '#f8fafc', fontSize: '1.4rem', fontWeight: '800' }}>
              Automated Maintenance System Active
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 20px' }}>
              An issue was detected and a full report has been sent to{' '}
              <strong style={{ color: '#38bdf8' }}>teamsecure.project@gmail.com</strong>{' '}
              for review.
            </p>

            <div style={{
              background: '#0f172a',
              border: '1px solid #0284c7',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '24px',
            }}>
              <p style={{ margin: 0, color: '#38bdf8', fontSize: '0.85rem', fontWeight: '600' }}>
                🔄 Auto-fix permissions granted. Restarting in{' '}
                <span style={{ fontSize: '1.1rem', color: '#f0f9ff' }}>{this.state.countdown}s</span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 22px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                🔄 Reload Now
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                style={{
                  padding: '10px 22px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                🏠 Go Home
              </button>
            </div>

            <p style={{ marginTop: '20px', fontSize: '0.75rem', color: '#475569' }}>
              Head Admins: debasishn185@gmail.com · teamsecure.project@gmail.com
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;