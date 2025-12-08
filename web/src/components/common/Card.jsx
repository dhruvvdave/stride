import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md',
  onClick,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  const clickableClass = onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-fast' : '';
  
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-gray-200
        ${paddingClasses[padding]} 
        ${shadowClasses[shadow]} 
        ${clickableClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
