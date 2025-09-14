import React from 'react';

interface LoadingDotsProps {
  className?: string;
  dotColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
  className = '',
  dotColor = 'bg-gray-500',
  size = 'md',
}) => {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className={`flex items-center space-x-1.5 ${className}`}>
      <div
        className={`${dotSizes[size]} ${dotColor} rounded-full animate-bounce`}
      ></div>
      <div
        className={`${dotSizes[size]} ${dotColor} rounded-full animate-bounce animation-delay-200`}
      ></div>
      <div
        className={`${dotSizes[size]} ${dotColor} rounded-full animate-bounce animation-delay-400`}
      ></div>
    </div>
  );
};

export default LoadingDots;
