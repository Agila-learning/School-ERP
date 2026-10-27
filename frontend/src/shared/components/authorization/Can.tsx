import React from 'react';
import { useAuth } from '../../../modules/auth/hooks/useAuth';

interface CanProps {
  permission?: string;
  role?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const Can: React.FC<CanProps> = ({ permission, role, children, fallback = null }) => {
  const { hasPermission, hasRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <>{fallback}</>;

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default Can;
