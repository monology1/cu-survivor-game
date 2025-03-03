import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           variant = 'primary',
                                           className = '',
                                           disabled = false,
                                           ...props
                                       }) => {
    const baseStyles = "px-5 py-2.5 rounded-md font-medium transition-colors cursor-pointer text-white";

    const variantStyles = {
        primary: "bg-green-600 hover:bg-green-700",
        secondary: "bg-blue-600 hover:bg-blue-700",
        danger: "bg-red-600 hover:bg-red-700"
    };

    const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;