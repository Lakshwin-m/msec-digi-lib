import { UserRole } from '@/lib/types';

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

/**
 * Check if user has required role
 */
export const hasRole = (userRole: string | undefined, requiredRoles: string[]): boolean => {
  if (isDev) return true; // Superuser in dev mode
  if (!userRole) return false;
  const role = userRole.toLowerCase();
  return requiredRoles.map(r => r.toLowerCase()).includes(role);
};

/**
 * Check if user is admin
 */
export const isAdmin = (userRole: string | undefined): boolean => {
  if (isDev) return true;
  if (!userRole) return false;
  return userRole.toLowerCase() === 'admin';
};

/**
 * Check if user is HOD or Admin
 */
export const isHODOrAdmin = (userRole: string | undefined): boolean => {
  if (isDev) return true;
  if (!userRole) return false;
  const role = userRole.toLowerCase();
  return role === 'hod' || role === 'admin';
};

/**
 * Check if user can manage subjects
 */
export const canManageSubjects = (userRole: string | undefined): boolean => {
  return isHODOrAdmin(userRole);
};

/**
 * Check if user can manage resources
 */
export const canManageResources = (userRole: string | undefined): boolean => {
  return isHODOrAdmin(userRole);
};

/**
 * Check if user can review requests
 */
export const canReviewRequests = (userRole: string | undefined): boolean => {
  return isHODOrAdmin(userRole);
};

/**
 * Check if user can manage users
 */
export const canManageUsers = (userRole: string | undefined): boolean => {
  return isAdmin(userRole);
};
