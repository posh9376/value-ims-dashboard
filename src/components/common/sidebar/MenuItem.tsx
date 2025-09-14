import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';

interface SubMenuItem {
  title: string;
  path: string;
  icon?: LucideIcon;
}

interface MenuItemInterface {
  title: string;
  path?: string;
  icon: LucideIcon;
  children?: SubMenuItem[];
}

interface MenuItemProps {
  item: MenuItemInterface;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-gray-900`}
        >
          <item.icon size={20} />
          <span>{item.title}</span>
          {isOpen ? (
            <ChevronDown size={16} className="ml-auto" />
          ) : (
            <ChevronRight size={16} className="ml-auto" />
          )}
        </button>
        {isOpen && (
          <ul className="pl-6 space-y-1">
            {item.children.map((child, index) => {
              const getClassName = ({ isActive }: { isActive: boolean }) => {
                return `w-full flex items-center space-x-2 p-2 rounded-md ${
                  isActive
                    ? 'bg-gray-200 text-gray-900'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`;
              };

              return (
                <li key={index}>
                  <NavLink to={child.path} className={getClassName}>
                    {child.icon && <child.icon size={16} />}
                    <span>{child.title}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path!}
      className={({ isActive }) => {
        return `w-full flex items-center space-x-2 p-2 rounded-md ${
          isActive
            ? 'bg-gray-200 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
        }`;
      }}
    >
      <item.icon size={20} />
      <span>{item.title}</span>
      <ChevronRight size={16} className="ml-auto" />
    </NavLink>
  );
};

export default MenuItem;
