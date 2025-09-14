const UserProfileBadge = () => {
    const userName = 'Eric amenya';
  
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map((word: string) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };
  
    const userInitials = getInitials(userName);
  
    return (
      <div
        className={`flex items-center space-x-3 p-4 border-b border-gray-200`}
      >

        <div
        className="w-12 h-12 rounded-full bg-blue-500 text-white 
        flex items-center justify-center text-lg font-semibold"
        >
        {userInitials}
        </div>

        <div className="flex-1">
          <div className="font-semibold text-gray-800">{userName}</div>
          <div className="text-sm text-gray-500 capitalize">
            admin
          </div>
        </div>
      </div>
    );
  };
  
  export default UserProfileBadge;