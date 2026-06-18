import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const dismiss = id => setToasts(t => t.filter(x => x.id !== id));

  const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => {
          const Icon = ICONS[t.type] || Info;
          const colors = { success: '#4a7c59', error: '#b54a4a', info: '#1a1a1a' };
          return (
            <div key={t.id} style={{
              background: colors[t.type] || colors.info, color: 'white',
              padding: '12px 18px', borderRadius: 8, display: 'flex',
              alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              animation: 'slideIn .2s ease', maxWidth: 320, fontSize: '.875rem', fontWeight: 500,
            }}>
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{t.message}</span>
              <button onClick={() => dismiss(t.id)} style={{ color: 'rgba(255,255,255,.7)', display: 'flex', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform: translateX(20px); } }`}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
