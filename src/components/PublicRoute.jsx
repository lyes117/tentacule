import React from 'react';
import { Navigate } from 'react-router-dom';
import useStore from '../lib/store';

export default function PublicRoute({ children }) {
  const { session, initialized } = useStore();

  if (!initialized) {
    return (
      <div className="min-h-screen bg-space-dark flex items-center justify-center">
        <div className="cosmic-spinner" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
