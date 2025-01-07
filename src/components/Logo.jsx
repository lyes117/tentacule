import React from 'react';

export default function Logo({ className = '', size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-32 w-32'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <img 
        src="/logo.svg" 
        alt="Tentacule Logo" 
        className="w-full h-full object-contain"
        style={{ filter: 'drop-shadow(0 0 10px rgba(147, 51, 234, 0.3))' }}
      />
    </div>
  );
}
