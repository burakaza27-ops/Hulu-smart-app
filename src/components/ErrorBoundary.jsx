import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('HULU Error Boundary:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', padding: 40, textAlign: 'center', color: '#A0A0A5'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#EF4444', marginBottom: 20
          }}>
            <AlertTriangle size={28} />
          </div>
          <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h3>
          <p style={{ fontSize: 13, lineHeight: 1.5, maxWidth: 280, marginBottom: 24 }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg, #D4AF37, #8b6914)',
              color: '#000', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
