import { useAuth } from '../context/AuthContext';

export type UserRole = 'admin' | 'manager' | 'cashier';

export interface Permissions {
  canViewDashboard: boolean;
  canViewAnalytics: boolean;
  canCreateSale: boolean;
  canProcessReturns: boolean;
  canManageUsers: boolean;
  canManageInventory: boolean;
  canViewInventory: boolean;
  canManageSchools: boolean;
  canViewSchools: boolean;
  canManageSizes: boolean;
  canViewSizes: boolean;
  canManageUniformTypes: boolean;
  canViewUniformTypes: boolean;
}

export const usePermissions = (): Permissions => {
  const { user } = useAuth();
  const role = user?.role as UserRole;

  // Admin has all permissions
  if (role === 'admin') {
    return {
      canViewDashboard: true,
      canViewAnalytics: true,
      canCreateSale: true,
      canProcessReturns: true,
      canManageUsers: true,
      canManageInventory: true,
      canViewInventory: true,
      canManageSchools: true,
      canViewSchools: true,
      canManageSizes: true,
      canViewSizes: true,
      canManageUniformTypes: true,
      canViewUniformTypes: true,
    };
  }

  // Manager has most permissions except user management
  if (role === 'manager') {
    return {
      canViewDashboard: true,
      canViewAnalytics: true,
      canCreateSale: true,
      canProcessReturns: true,
      canManageUsers: false,
      canManageInventory: true,
      canViewInventory: true,
      canManageSchools: true,
      canViewSchools: true,
      canManageSizes: true,
      canViewSizes: true,
      canManageUniformTypes: true,
      canViewUniformTypes: true,
    };
  }

  // Cashier has very limited permissions - only read access and sales
  if (role === 'cashier') {
    return {
      canViewDashboard: false,
      canViewAnalytics: false,
      canCreateSale: true,
      canProcessReturns: false,
      canManageUsers: false,
      canManageInventory: false,
      canViewInventory: true,
      canManageSchools: false,
      canViewSchools: true,
      canManageSizes: false,
      canViewSizes: true,
      canManageUniformTypes: false,
      canViewUniformTypes: true,
    };
  }

  // Default: no permissions for unknown roles
  return {
    canViewDashboard: false,
    canViewAnalytics: false,
    canCreateSale: false,
    canProcessReturns: false,
    canManageUsers: false,
    canManageInventory: false,
    canViewInventory: false,
    canManageSchools: false,
    canViewSchools: false,
    canManageSizes: false,
    canViewSizes: false,
    canManageUniformTypes: false,
    canViewUniformTypes: false,
  };
};

export default usePermissions;