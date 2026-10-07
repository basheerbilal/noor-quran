import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  RefreshCw,
} from 'lucide-react';
import { toast, ToastItem } from '../../utils/toast';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((updatedToasts) => {
      setToasts(updatedToasts);
    });
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-[100] flex flex-col-reverse gap-2.5 max-w-sm w-[calc(100vw-24px)] pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => toast.dismiss(item.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastCardProps {
  item: ToastItem;
  onDismiss: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ item, onDismiss }) => {
  const isNetwork =
    item.title?.toLowerCase().includes('network') ||
    item.title?.toLowerCase().includes('offline') ||
    item.message.toLowerCase().includes('internet') ||
    item.message.toLowerCase().includes('network');

  const getIcon = () => {
    switch (item.type) {
      case 'error':
        return isNetwork ? (
          <WifiOff className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
        );
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />;
    }
  };

  const getStyles = () => {
    switch (item.type) {
      case 'error':
        return 'bg-[#fff5f5] dark:bg-[#1a0f10] border-rose-200 dark:border-rose-900/40 text-rose-950 dark:text-rose-100 shadow-rose-900/10';
      case 'warning':
        return 'bg-[#fffcf0] dark:bg-[#191508] border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-100 shadow-amber-900/10';
      case 'success':
        return 'bg-[#f0fdf4] dark:bg-[#07190f] border-emerald-200 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-100 shadow-emerald-900/10';
      case 'info':
      default:
        return 'bg-[#f8fafc] dark:bg-[#091420] border-sky-200 dark:border-sky-900/40 text-sky-950 dark:text-sky-100 shadow-sky-900/10';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 12, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      className={`pointer-events-auto p-4 rounded-2xl border shadow-lg flex items-start gap-3 transition-all ${getStyles()}`}
      role="alert"
    >
      <div className="pt-0.5">{getIcon()}</div>

      <div className="flex-1 min-w-0 pr-1">
        {item.title && (
          <h4 className="text-xs font-bold leading-tight mb-0.5 tracking-wide">
            {item.title}
          </h4>
        )}
        <p className="text-xs leading-relaxed opacity-90 break-words">
          {item.message}
        </p>

        {item.action && (
          <button
            onClick={() => {
              item.action?.onClick();
              onDismiss();
            }}
            className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/80 dark:bg-black/40 border border-current/20 hover:bg-white dark:hover:bg-black/60 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{item.action.label}</span>
          </button>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-opacity cursor-pointer shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
