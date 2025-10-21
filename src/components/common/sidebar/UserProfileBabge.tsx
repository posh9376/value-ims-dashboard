import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfileBadge = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };
  
  if (!user) return null;
  
  const userInitials = getInitials(user.username);
  
  return (
    <div className="relative">
      <div
        className={`flex items-center space-x-3 p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50`}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div
          className="w-12 h-12 rounded-full bg-blue-500 text-white 
          flex items-center justify-center text-lg font-semibold"
        >
          {userInitials}
        </div>

        <div className="flex-1">
          <div className="font-semibold text-gray-800">{user.username}</div>
          <div className="text-sm text-gray-500 capitalize">
            {user.role}
          </div>
        </div>
        
        <svg
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg z-50">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
  
  export default UserProfileBadge;