import React, { useState } from 'react';
import { QrCode, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [manualInput, setManualInput] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center">
            <QrCode className="mr-2" size={20} />
            Table QR Code
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm p-2"
            aria-label="Close scanner"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-base-200 rounded-lg p-4 text-center">
            <QrCode size={48} className="mx-auto text-base-content/50 mb-2" />
            <p className="text-sm text-base-content/70">
              QR scanner not available in this demo
            </p>
          </div>

          <div className="divider">OR</div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="label">
                <span className="label-text">Enter table number manually:</span>
              </label>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Table 5"
                className="input input-bordered w-full"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={!manualInput.trim()}
            >
              Set Table
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;