import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          animate-spin rounded-full border-4 border-gray-200
          border-t-primary-main
          ${sizeClasses[size]}
        `}
      />
    </div>
  );
};

export default LoadingSpinner;
