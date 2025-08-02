import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface MerchantClosedModalProps {
  isOpen: boolean;
  title: string;
  message: string;
}

const MerchantClosedModal: React.FC<MerchantClosedModalProps> = ({
  isOpen,
  title,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop - blocks everything */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-base-100 rounded-2xl shadow-2xl p-6 m-4 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center">
            <Clock size={32} className="text-warning" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-4 text-base-content">
          {title}
        </h2>

        {/* Message */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-warning flex-shrink-0 mt-0.5" />
            <p className="text-base-content text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-base-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2 text-base-content">
            What you can do:
          </h3>
          <ul className="text-xs text-base-content/70 space-y-1">
            <li>• Check back later when we reopen</li>
            <li>• Follow our social media for updates</li>
            <li>• Contact us for more information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MerchantClosedModal;