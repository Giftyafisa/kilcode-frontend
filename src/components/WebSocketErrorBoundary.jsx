import React from 'react';
import { toast } from 'react-hot-toast';

class WebSocketErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('WebSocket Error:', error, errorInfo);
    toast.error('Connection error. Please refresh the page.');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <p className="text-red-600">Connection error</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WebSocketErrorBoundary; 