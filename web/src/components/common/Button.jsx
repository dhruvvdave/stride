import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false, 
  type = 'button',
  className = '',
  fullWidth = false,
}) => {
  const baseClasses = 'font-semibold rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-main text-white hover:bg-primary-dark focus:ring-primary-main shadow-md',
    secondary: 'bg-transparent text-primary-main border-2 border-primary-main hover:bg-primary-lighter focus:ring-primary-main',
    danger: 'bg-danger-main text-white hover:bg-danger-dark focus:ring-danger-main shadow-md',
    text: 'bg-transparent text-primary-main hover:bg-primary-lighter focus:ring-primary-main',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
