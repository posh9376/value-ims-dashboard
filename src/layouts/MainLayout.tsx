import Sidebar from '../components/common/sidebar/Sidebar';
import { useSidebar } from '../context/SideBarContext';
import { Menu } from 'lucide-react';
import React from 'react';
import { Outlet } from 'react-router-dom';

type Props = {
  children?: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  const { openSidebar } = useSidebar();

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 w-full lg:pl-64 relative">
        <header className="lg:bg-transparent lg:shadow-none bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={openSidebar}
              className="p-1 rounded-md hover:bg-gray-200 lg:hidden"
            >
              <Menu size={24} className='text-gray-600 hover:text-gray-900' />
            </button>
            <div className="w-8" />
          </div>
        </header>

        <main className="py-4 px-8">
          <Outlet />
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
