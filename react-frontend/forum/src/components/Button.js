'use client';

import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    onClick,
    className = '',
    ...props
}) => {
    // Define base styles
    const baseStyles = 'font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background';

    // Define variant styles
    const variantStyles = {
        primary: 'bg-[#1b9f67] hover:bg-[#158a56] text-white',
        secondary: 'bg-transparent hover:bg-[#2c2b4d] text-white border border-[#1b9f67]',
        ghost: 'bg-transparent hover:bg-[#1b9f67]/10 text-[#1b9f67]',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
    };

    // Define size styles
    const sizeStyles = {
        small: 'py-1 px-3 text-sm',
        medium: 'py-2 px-4',
        large: 'py-3 px-6 text-lg',
    };

    // Combine all styles
    const buttonStyles = `
    ${baseStyles} 
    ${variantStyles[variant]} 
    ${sizeStyles[size]} 
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

    return (
        <button
            className={buttonStyles}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;