import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-2xs overflow-y-auto">
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-lg border border-zinc-200 shadow-xl p-6 text-left my-8 max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-zinc-100">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
