import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export const Toast = ({ type, message, onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl glass-panel border border-[#00f3ff]/30 shadow-2xl animate-bounce">
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-[#00f3ff]" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-500" />
      )}
      <span className="text-sm font-medium text-white">{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
