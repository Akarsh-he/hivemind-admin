import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RequireRole = ({ allowedRoles, children, onUnauthorized }) => {
  const { role, admin, authLoading } = useAuth();

  const userRole = role ? role.toLowerCase() : null;
  const isAuthorized = userRole && allowedRoles.map(r => r.toLowerCase()).includes(userRole);

  useEffect(() => {
    if (!authLoading && admin && !isAuthorized) {
      if (onUnauthorized) {
        onUnauthorized('Access Denied: Insufficient permissions.');
      }
    }
  }, [authLoading, admin, isAuthorized, onUnauthorized]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-400 font-mono">
        <div className="w-5 h-5 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin mr-3" />
        Verifying permissions...
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAuthorized) {
    return <Navigate to="/admin/overview" replace />;
  }

  return children;
};

export default RequireRole;
