import { X, LogOut } from 'lucide-react';
import { useSidebar } from '../../../context/SideBarContext';
import UserProfileBadge from './UserProfileBabge';
import MenuItem from './MenuItem';
import { useSidebarItems } from '../../../hooks/useSidebarItems';

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const sidebarItems = useSidebarItems();

  const logout = () => {
      console.log('logout');
  }

  
  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30
          h-full w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:h-screen
          flex flex-col overflow-hidden
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <UserProfileBadge />
        <div
          className={`flex items-center justify-between p-4`}
        >
          <button
            onClick={closeSidebar}
            className={`p-1 rounded-md lg:hidden text-black hover:bg-gray-200`}
          >
            <X size={24} />
          </button>
        </div>

        <nav
          className={`flex-1 p-4 overflow-y-auto`}
        >
          <ul className="space-y-4">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <MenuItem item={item} />
              </li>
            ))}
          </ul>
        </nav>

        {/* <div
          className={`border-t p-4 space-y-2 border-gray-200`}
        >
          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 p-2 rounded-md hover:bg-red-100 text-red-600 hover:text-red-700"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div> */}
      </aside>
    </>
  );
};

export default Sidebar;
