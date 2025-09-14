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
    School
  } from 'lucide-react';
  
  export const SidebarItems = [
    { title: 'Dashboard', icon: Home, path: '/' },
    { title: 'Inventory', icon: Package, path: '/inventory' },
    { title: 'Sales', icon: DollarSign, path: '/sales' },
    { title: 'Schools', icon: School, path: '/schools' },
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
  