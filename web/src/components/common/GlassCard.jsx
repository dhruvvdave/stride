import React from 'react';

const GlassCard = ({ 
  children, 
  className = '',
  blur = 'md',
  shadow = true,
  dark = false,
}) => {
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
        WebkitBackdropFilter: `blur(${blur === 'sm' ? '4px' : blur === 'md' ? '12px' : blur === 'lg' ? '16px' : '24px'})`,
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
