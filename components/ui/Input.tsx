import React, { useState, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  label?: string;
  variant?: 'dark' | 'light';
}

const Input: React.FC<InputProps> = ({ icon, type, label, variant = 'dark', className, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const isLightTheme = variant === 'light';

  const variantStyles = isLightTheme
    ? 'py-2 bg-white text-gray-900 border-gray-300 focus:ring-cyan-500 focus:border-cyan-500 rounded-md'
    : 'py-3 bg-[#3A3A4A] text-gray-200 border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-lg';

  const labelStyles = isLightTheme ? 'text-gray-700' : 'text-gray-300';

  const passwordToggleHover = isLightTheme ? 'hover:text-gray-800' : 'hover:text-white';

  return (
    <div>
      {label && <label htmlFor={props.id} className={`block text-sm font-medium mb-1 ${labelStyles}`}>{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`w-full border shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 ${variantStyles} ${icon ? 'pl-11' : 'px-4'} ${isPassword ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 ${passwordToggleHover} focus:outline-none`}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
