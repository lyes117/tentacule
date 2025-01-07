import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../lib/store';

export default function AuthGuard({ children }) {
  const session = useStore((state) => state.session);
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
