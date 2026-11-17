import React, { useEffect, useRef, useState } from 'react';
import { Gauge, X } from 'lucide-react';

interface OdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOdometer: number;
  onSave: (newOdometer: number) => void;
}

export const OdometerModal: React.FC<OdometerModalProps> = ({
  isOpen,
  onClose,
  currentOdometer,
  onSave,
}) => {
  const [val, setVal] = useState<string>(currentOdometer.toString());
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    inputRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const previous = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      if (previous && document.contains(previous) && typeof previous.focus === 'function') {
        previous.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid odometer mileage.');
      return;
    }
    if (num < currentOdometer) {
      if (
        !window.confirm(
          `New odometer (${num.toLocaleString()} mi) is lower than current (${currentOdometer.toLocaleString()} mi). Are you sure?`
        )
      ) {
        return;
      }
    }
    onSave(num);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="odometer-modal-title"
        className="w-full max-w-sm rounded-2xl border border-slate-700/80 bg-slate-900 p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-blue-400">
            <Gauge className="w-5 h-5" />
            <h3 id="odometer-modal-title" className="font-semibold text-slate-100">
              Update Odometer
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="block text-xs font-medium text-slate-400 mb-1">
              Current Reading
            </div>
            <div className="text-sm font-mono text-slate-300">
              {currentOdometer.toLocaleString()} miles
            </div>
          </div>

          <div>
            <label
              htmlFor="odometer-reading-input"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              New Odometer (miles)
            </label>
            <input
              id="odometer-reading-input"
              ref={inputRef}
              type="number"
              step="1"
              value={val}
              onChange={(e) => {
                setVal(e.target.value);
                setError('');
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-lg text-slate-100 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            {error && (
              <p role="alert" className="mt-1 text-xs text-rose-400">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Save Reading
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
