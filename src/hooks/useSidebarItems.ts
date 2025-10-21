import {
  Home,
  Package,
  DollarSign,
  HandCoins,
  ChartNoAxesGantt,
  ClipboardMinus,
  Users,
  BarChart3,
  MoveVertical,
  School,
  Shirt
} from 'lucide-react';
import { usePermissions } from './usePermissions';

export interface SidebarItem {
  title: string;
  icon: any;
  path?: string;
  children?: SidebarItem[];
}

export const useSidebarItems = (): SidebarItem[] => {
  const permissions = usePermissions();

  const allItems: SidebarItem[] = [
    { title: 'Dashboard', icon: Home, path: '/' },
    { title: 'Inventory', icon: Package, path: '/inventory' },
    { title: 'Sales', icon: DollarSign, path: '/sales' },
    { title: 'Schools', icon: School, path: '/schools' },
    { title: 'Uniform Types', icon: Shirt, path: '/uniform-types' },
    { title: 'Sizes', icon: MoveVertical, path: '/sizes' },
    { title: 'Users', icon: Users, path: '/users' },
    {
      title: 'Finance',
      icon: HandCoins,
      children: [
        {
          title: 'Overview',
          path: '/finance/overview',
          icon: ChartNoAxesGantt,
        },
        {
          title: 'Transactions',
          path: '/finance/transactions',
          icon: ClipboardMinus,
        },
      ],
    },
    { title: 'Analytics', icon: BarChart3, path: '/analytics' },
  ];

  // Filter items based on permissions
  const filteredItems = allItems.filter(item => {
    switch (item.path) {
      case '/':
        return permissions.canViewDashboard;
      case '/inventory':
        return permissions.canViewInventory;
      case '/sales':
        return permissions.canCreateSale; // Cashiers can access sales
      case '/schools':
        return permissions.canViewSchools;
      case '/uniform-types':
        return permissions.canViewUniformTypes;
      case '/sizes':
        return permissions.canViewSizes;
      case '/users':
        return permissions.canManageUsers; // Only managers and admins can see users
      case '/analytics':
        return permissions.canViewAnalytics;
      default:
        // For Finance section, check if user has any dashboard/analytics permissions
        if (item.title === 'Finance') {
          return permissions.canViewAnalytics;
        }
        return true;
    }
  });

  return filteredItems;
};

export default useSidebarItems;