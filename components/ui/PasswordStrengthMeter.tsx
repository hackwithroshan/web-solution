import React from 'react';

interface PasswordStrengthMeterProps {
  password?: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  const getStrength = (pass: string) => {
    let score = 0;
    const hasLowerCase = /[a-z]/.test(pass);
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSymbols = /[^a-zA-Z0-9]/.test(pass);

    if (pass.length > 0) score++;
    if (pass.length >= 8) score++;
    if (hasLowerCase && hasUpperCase) score++;
    if (hasNumbers) score++;
    if (hasSymbols) score++;

    return score;
  };

  const score = getStrength(password);

  const getStrengthProps = () => {
    switch (score) {
      case 0:
      case 1:
      case 2:
        return { label: 'Weak', color: 'bg-red-500', width: '25%' };
      case 3:
        return { label: 'Medium', color: 'bg-yellow-500', width: '50%' };
      case 4:
        return { label: 'Good', color: 'bg-blue-500', width: '75%' };
      case 5:
        return { label: 'Strong', color: 'bg-green-500', width: '100%' };
      default:
        return { label: '', color: 'bg-gray-200', width: '0%' };
    }
  };

  const strength = getStrengthProps();

  // Show a placeholder to prevent layout shift
  if (password.length === 0) {
    return (
        <div className="mt-2 h-6" aria-live="polite">
            <div className="w-full bg-gray-600 rounded-full h-1.5 mt-3.5">
                <div className="h-1.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
        </div>
    );
  }

  return (
    <div className="mt-2 h-6" aria-live="polite">
      <div className="w-full bg-gray-600 rounded-full h-1.5 relative">
        <div 
          className={`h-1.5 rounded-full transition-all duration-300 ${strength.color}`} 
          style={{ width: strength.width }}
        ></div>
      </div>
       <span className={`text-xs font-semibold mt-1 block ${
        score <= 2 ? 'text-red-400' : score === 3 ? 'text-yellow-400' : score === 4 ? 'text-blue-400' : 'text-green-400'
      }`}>
          {strength.label}
        </span>
    </div>
  );
};

export default PasswordStrengthMeter;
