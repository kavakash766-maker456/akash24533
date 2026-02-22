'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; type: ToastType; }

const ToastContext = createContext<{ toast: (msg: string, type?: ToastType) => void }>({
  toast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const icons = { success: <CheckCircle className="w-5 h-5 text-green-400"/>, error: <XCircle className="w-5 h-5 text-red-400"/>, info: <AlertCircle className="w-5 h-5 text-blue-400"/> };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-xl min-w-[280px] animate-in slide-in-from-right">
            {icons[t.type]}
            <p className="text-sm text-white flex-1">{t.message}</p>
            <button onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}>
              <X className="w-4 h-4 text-gray-500 hover:text-white"/>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
