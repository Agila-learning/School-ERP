import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usePermission } from '../hooks/usePermission';
import type { RootState } from '../../store';

interface PermissionRouteProps {
  requiredPermission?: string;
  requiredAnyPermission?: string[];
  requiredAllPermissions?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  requiredPermission,
  requiredAnyPermission,
  requiredAllPermissions,
  children,
  fallback,
}) => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  let isAuthorized = true;

  if (requiredPermission && !hasPermission(requiredPermission)) {
    isAuthorized = false;
  }

  if (requiredAnyPermission && !hasAnyPermission(requiredAnyPermission)) {
    isAuthorized = false;
  }

  if (requiredAllPermissions && !hasAllPermissions(requiredAllPermissions)) {
    isAuthorized = false;
  }

  if (!isAuthorized) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
