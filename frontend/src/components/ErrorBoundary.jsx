import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Notify team secure immediately
    fetch('/api/maintenance/notify-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: 'teamsecure.project@gmail.com',
        error: error.toString(),
        stack: errorInfo.componentStack
      })
    }).catch(() => {});

    // Wait 1 minute (60,000ms), then auto-reload to self-fix
    setTimeout(() => {
      this.setState({ hasError: false });
      window.location.reload();
    }, 60000);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
          <h2>Automated Maintenance System Active</h2>
          <p>An issue was detected and reported to <strong>teamsecure.project@gmail.com</strong>.</p>
          <p>Granting auto-fix permissions. System restarting in 60 seconds...</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;