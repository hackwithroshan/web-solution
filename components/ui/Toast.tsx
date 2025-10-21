import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { ToastType } from '../../hooks/useToast';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const icons = {
  success: <CheckCircle className="text-green-500" size={20} />,
  error: <AlertTriangle className="text-red-500" size={20} />,
  info: <Info className="text-blue-500" size={20} />,
};

const typeClasses = {
  success: 'bg-green-50 border-green-500',
  error: 'bg-red-50 border-red-500',
  info: 'bg-blue-50 border-blue-500',
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // This allows the exit animation to play before the component is removed.
    const timer = setTimeout(() => {
      setIsExiting(true);
      const exitTimer = setTimeout(onClose, 300); // Duration of the exit animation
      return () => clearTimeout(exitTimer);
    }, 4700); // Start exit animation slightly before auto-dismiss

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const animationClasses = isExiting 
    ? 'animate-fadeOutRight' 
    : 'animate-fadeInRight';

  return (
    // FIX: Removed the inline style object which contained invalid properties for React's style prop.
    // The animations are handled by CSS classes injected into the document head.
    <div
      className={`relative w-full p-4 pr-10 rounded-lg shadow-lg flex items-start gap-3 border-l-4 ${typeClasses[type]} ${animationClasses}`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 text-sm text-gray-800">
        <p className="font-semibold capitalize">{type}</p>
        <p>{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
};

// Add keyframes to a style tag in the head for better support
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-fadeInRight { animation: fadeInRight 0.3s ease-out forwards; }

    @keyframes fadeOutRight {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(100%); }
    }
    .animate-fadeOutRight { animation: fadeOutRight 0.3s ease-in forwards; }
  `;
  document.head.appendChild(style);
}

export default Toast;