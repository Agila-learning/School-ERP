import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store';
import { logoutUser, setActivePortal } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

// Role normalization helper
const normalizeRole = (name: string) => name?.toUpperCase()?.replace(/\s+/g, '_')?.trim() || '';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isLoading, error, activePortal } = useSelector((state: RootState) => state.auth);

  const isAuthenticated = !!user;

  // Aggregate all permissions from all assigned roles
  const permissions: string[] = user?.roles?.reduce((acc: string[], role: any) => {
    if (role?.permissions && Array.isArray(role.permissions)) {
      return [...acc, ...role.permissions];
    }
    return acc;
  }, []) || [];

  // Normalized role names (UPPER_CASE_WITH_UNDERSCORES)
  const roleNames: string[] = user?.roles?.map((role: any) => normalizeRole(role?.code || role?.name)) || [];

  // Original role names (as stored in DB)
  const rawRoleNames: string[] = user?.roles?.map((role: any) => role?.name || role?.code) || [];

  // ─── Permission Check ───
  const hasPermission = (requiredPermission: string): boolean => {
    if (!isAuthenticated) return false;
    return permissions.includes('*') || permissions.includes(requiredPermission);
  };

  // ─── Role Check ───
  const hasRole = (requiredRole: string): boolean => {
    if (!isAuthenticated) return false;
    const normalizedRequired = normalizeRole(requiredRole);
    return roleNames.includes(normalizedRequired);
  };

  // ─── Primary Role (highest-priority role for sidebar/dashboard selection) ───
  const ROLE_PRIORITY = [
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL',
    'KINDERGARTEN_TEACHER', 'KINDERGARTEN_STAFF',
    'TEACHER', 'CLASS_TEACHER', 'CLASS_COORDINATOR',
    'PARENT', 'STUDENT',
    'DRIVER', 'TRANSPORT_MANAGER',
    'LIBRARIAN', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'SPORTS_COACH',
    'FINANCE_ADMIN', 'HR_ADMIN',
    'HOSTEL_WARDEN', 'OFFICE_ADMIN', 'ADMISSION_STAFF',
  ];

  let primaryRole = roleNames[0] || 'UNKNOWN';
  for (const priority of ROLE_PRIORITY) {
    if (roleNames.includes(priority)) {
      primaryRole = priority;
      break;
    }
  }

  // ─── Convenience Role Booleans ───
  const isAdmin = hasRole('ADMIN') || hasRole('SCHOOL_ADMIN');
  const isSuperAdmin = hasRole('SUPER_ADMIN');
  const isPrincipal = hasRole('PRINCIPAL') || hasRole('VICE_PRINCIPAL');
  const isTeacher = hasRole('TEACHER') || hasRole('CLASS_TEACHER');
  const isClassCoordinator = hasRole('CLASS_COORDINATOR') || (
    user?.responsibilities?.some((r: any) => r.isClassCoordinator) ?? false
  );
  const isStudent = hasRole('STUDENT');
  const isParent = hasRole('PARENT');
  const isDriver = hasRole('DRIVER');
  const isTransportManager = hasRole('TRANSPORT_MANAGER');
  const isLibrarian = hasRole('LIBRARIAN');
  const isLabTechnician = hasRole('LAB_INCHARGE') || hasRole('LAB_TECHNICIAN');
  const isSportsCoach = hasRole('SPORTS_COACH');
  const isFinanceAdmin = hasRole('FINANCE_ADMIN') || hasRole('ACCOUNTANT');
  const isHrAdmin = hasRole('HR_ADMIN') || hasRole('HR');
  const isHostelWarden = hasRole('HOSTEL_WARDEN');
  const isOfficeStaff = hasRole('OFFICE_ADMIN') || hasRole('ADMISSION_STAFF');
  const isKindergartenStaff = hasRole('KINDERGARTEN_TEACHER') || hasRole('KINDERGARTEN_STAFF');

  // ─── Teacher Responsibilities ───
  const responsibilities = user?.responsibilities || [];

  // Classes where the user is a class coordinator
  const coordinatedClasses = responsibilities
    .filter((r: any) => r.isClassCoordinator)
    .map((r: any) => r.classId);

  // ─── Logout & Navigation ───
  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleSwitchPortal = (portalPath: string) => {
    dispatch(setActivePortal(portalPath));
    navigate(portalPath);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    activePortal,
    permissions,
    roleNames,
    rawRoleNames,
    primaryRole,
    hasPermission,
    hasRole,
    // Convenience booleans
    isAdmin,
    isSuperAdmin,
    isPrincipal,
    isTeacher,
    isClassCoordinator,
    isStudent,
    isParent,
    isDriver,
    isTransportManager,
    isLibrarian,
    isLabTechnician,
    isSportsCoach,
    isFinanceAdmin,
    isHrAdmin,
    isHostelWarden,
    isOfficeStaff,
    isKindergartenStaff,
    // Responsibilities
    responsibilities,
    coordinatedClasses,
    // Actions
    logout: handleLogout,
    switchPortal: handleSwitchPortal,
  };
};
