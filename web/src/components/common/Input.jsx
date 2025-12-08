import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  error, 
  disabled = false,
  required = false,
  className = '',
  name,
  id,
}) => {
  const inputId = id || name;
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-900 mb-2"
        >
          {label}
          {required && <span className="text-danger-main ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-3 rounded-md border transition-all duration-fast
          ${error 
            ? 'border-danger-main focus:border-danger-main focus:ring-danger-main' 
            : 'border-gray-400 focus:border-primary-main focus:ring-primary-main'
          }
          ${disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-white'}
          focus:outline-none focus:ring-2 focus:ring-offset-0
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-main">{error}</p>
      )}
    </div>
  );
};

export default Input;
