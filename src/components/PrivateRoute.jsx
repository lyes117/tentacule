import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../lib/store';

export default function PrivateRoute({ children }) {
  const location = useLocation();
  const { session, initialized } = useStore();

  if (!initialized) {
    return null;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
