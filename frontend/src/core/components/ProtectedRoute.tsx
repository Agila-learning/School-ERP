import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../modules/auth/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedPermissions?: string[];
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedPermissions, allowedRoles }) => {
  const { isAuthenticated, hasPermission, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Extract all normalized roles
  const userRolesList = [
    user?.role,
    ...(Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : (r.name || r.code)) : [])
  ].filter(Boolean).map(r => String(r).toUpperCase().replace(/\s+/g, '_'));

  // ONLY actual SUPER_ADMIN possesses superadmin platform authority
  const isSuperAdmin = userRolesList.includes('SUPER_ADMIN');

  // Check if route strictly requires SUPER_ADMIN
  const requiresSuperAdmin = allowedRoles?.some(r => {
    const norm = r.toUpperCase().replace(/\s+/g, '_');
    return norm === 'SUPER_ADMIN' || norm === 'SUPERADMIN';
  });

  if (requiresSuperAdmin && !isSuperAdmin) {
    console.warn(`Access Denied: Super Admin credentials required for ${location.pathname}`);
    return <Navigate to="/unauthorized" state={{ from: location.pathname, reason: 'Super Admin credentials required' }} replace />;
  }

  // Verify Role match if allowedRoles is specified
  let isAuthorized = true;

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase().replace(/\s+/g, '_'));
    const hasRoleMatch = isSuperAdmin || userRolesList.some(userRole => {
      if (normalizedAllowed.includes(userRole)) return true;
      if (normalizedAllowed.includes('ADMIN') && (userRole === 'SCHOOL_ADMIN' || userRole.includes('ADMIN') || userRole === 'PRINCIPAL')) return true;
      if (normalizedAllowed.includes('STAFF') && (userRole.includes('STAFF') || userRole.includes('TEACHER') || userRole.includes('HR') || userRole.includes('ADMIN') || userRole === 'SCHOOL_ADMIN')) return true;
      return false;
    });

    if (!hasRoleMatch) {
      isAuthorized = false;
    }
  }

  // Verify Permission match if allowedPermissions is specified
  if (isAuthorized && allowedPermissions && allowedPermissions.length > 0) {
    if (!isSuperAdmin) {
      const hasPermMatch = allowedPermissions.some(permission => hasPermission(permission));
      if (!hasPermMatch) {
        isAuthorized = false;
      }
    }
  }

  if (!isAuthorized) {
    console.warn(`Access Denied: User role [${userRolesList.join(', ')}] does not have permission for route: ${location.pathname}`);
    return <Navigate to="/unauthorized" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

