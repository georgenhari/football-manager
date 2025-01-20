import { useState } from "react";

interface PriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (price: number) => void;
    playerName: string;
  }
  
  export default function PriceModal({ isOpen, onClose, onSubmit, playerName }: PriceModalProps) {
    const [price, setPrice] = useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (price && !isNaN(parseFloat(price))) {
        onSubmit(parseFloat(price));
        setPrice('');
        onClose();
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-bold mb-4">List Player for Transfer</h3>
          <p className="text-gray-600 mb-4">
            Set asking price for {playerName}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asking Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                List Player
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };