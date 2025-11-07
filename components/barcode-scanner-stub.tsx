'use client';

import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type BarcodeScannerStubProps = {
  onScan: (barcode: string) => void;
};

export function BarcodeScannerStub({ onScan }: BarcodeScannerStubProps) {
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManual, setShowManual] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const handleDemoScan = () => {
    onScan('4901330571481');
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-40 border-2 border-emerald-500 rounded-lg relative">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        <Camera className="absolute top-4 left-4 w-6 h-6 text-white" />

        <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
          Point camera at barcode
        </p>
      </div>

      <Button
        onClick={handleDemoScan}
        variant="outline"
        className="w-full"
      >
        Demo Scan (Test Product)
      </Button>

      {!showManual ? (
        <Button
          onClick={() => setShowManual(true)}
          variant="secondary"
          className="w-full"
        >
          Enter Barcode Manually
        </Button>
      ) : (
        <form onSubmit={handleManualSubmit} className="w-full space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter barcode..."
              className="flex-1"
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowManual(false);
                setManualBarcode('');
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
            Submit
          </Button>
        </form>
      )}
    </div>
  );
}
