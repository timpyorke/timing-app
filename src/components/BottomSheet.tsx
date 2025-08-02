import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  maxHeight = 'max-h-[90vh]'
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={handleBackdropClick}
      />
      
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`
          relative w-full bg-base-100 rounded-t-2xl shadow-2xl
          transform transition-transform duration-300 ease-out
          ${maxHeight} overflow-hidden
          ${className}
        `}
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-base-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-4 border-b border-base-200">
            <h2 className="text-lg font-bold text-base-content">{title}</h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;