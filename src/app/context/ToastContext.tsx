import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface ToastOptions {
  error?: boolean;
  action?: { label: string; onClick: () => void };
}
interface ToastItem extends ToastOptions {
  id: number;
  message: string;
}

const ToastContext = createContext<(message: string, options?: ToastOptions) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);

  const dismiss = (id: number) => setItems((list) => list.filter((t) => t.id !== id));

  const show = useCallback((message: string, options: ToastOptions = {}) => {
    const id = nextId.current++;
    setItems((list) => [...list.slice(-2), { id, message, ...options }]);
    timers.current.push(window.setTimeout(() => dismiss(id), 5000));
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {items.length > 0 && (
        <div className="g-toastpos">
          {items.map((t) => (
            <div key={t.id} className={`g-toast${t.error ? " g-toast--error" : ""}`} role="status">
              <i className={`i ${t.error ? "i-alert" : "i-check"}`} />
              <span>{t.message}</span>
              {t.action && (
                <button
                  className="g-btn g-btn--ghost g-btn--sm"
                  type="button"
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                >
                  {t.action.label}
                </button>
              )}
              <button className="g-iconbtn" type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
                <i className="i i-x" />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
