import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export const usePermission = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.roles) return false;

    for (const role of user.roles) {
      if (role.permissions && role.permissions.includes(permission)) {
        return true;
      }
    }
    return false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((p) => hasPermission(p));
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions };
};
