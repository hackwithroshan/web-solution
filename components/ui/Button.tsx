import React from 'react';

// FIX: Update Button component to support polymorphism with an 'as' prop.
// This allows it to render as a different element type (e.g., a Link) and accept corresponding props.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps & { [key: string]: any }> = ({
  as: Component = 'button',
  children,
  className,
  variant = 'primary',
  ...props
}) => {
  const baseStyles = 'px-6 py-2.5 rounded-full font-semibold text-white transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-xl';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 focus:ring-gray-500',
  };

  return (
    <Component className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </Component>
  );
};

export default React.memo(Button);