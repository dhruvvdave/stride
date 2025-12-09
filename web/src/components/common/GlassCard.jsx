import React from 'react';

const GlassCard = ({ 
  children, 
  className = '',
  blur = 'md',
  shadow = true,
  dark = false,
}) => {
  const blurValues = {
    sm: '4px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  };

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  const bgClass = dark 
    ? 'bg-black/80' 
    : 'bg-white/80';

  const shadowClass = shadow ? 'shadow-lg' : '';

  return (
    <div 
      className={`${bgClass} ${blurClasses[blur]} ${shadowClass} rounded-xl ${className}`}
      style={{
        WebkitBackdropFilter: `blur(${blurValues[blur]})`,
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
