export type ToastType = 'error' | 'warning' | 'info' | 'success';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, default 5000
  action?: ToastAction;
  timestamp: number;
}

export interface ToastOptions {
  id?: string;
  title?: string;
  duration?: number;
  action?: ToastAction;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private recentMessages: Map<string, number> = new Map(); // deduplication map

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const copy = [...this.toasts];
    this.listeners.forEach((listener) => listener(copy));
  }

  public show(type: ToastType, message: string, options?: ToastOptions): string {
    const now = Date.now();
    const dedupKey = `${type}:${message}`;
    const lastSeen = this.recentMessages.get(dedupKey);

    // Suppress identical toasts within 2 seconds to avoid toast spamming
    if (lastSeen && now - lastSeen < 2000) {
      return '';
    }
    this.recentMessages.set(dedupKey, now);

    // Clean up old deduplication entries
    if (this.recentMessages.size > 50) {
      for (const [key, time] of this.recentMessages.entries()) {
        if (now - time > 10000) {
          this.recentMessages.delete(key);
        }
      }
    }

    const id = options?.id || `toast-${now}-${Math.random().toString(36).substr(2, 6)}`;
    const duration = options?.duration !== undefined ? options.duration : 5000;

    const newToast: ToastItem = {
      id,
      type,
      title: options?.title,
      message,
      duration,
      action: options?.action,
      timestamp: now,
    };

    // Keep maximum 4 toasts visible at a time
    this.toasts = [newToast, ...this.toasts.slice(0, 3)];
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  public dismiss(id: string): void {
    const beforeCount = this.toasts.length;
    this.toasts = this.toasts.filter((t) => t.id !== id);
    if (this.toasts.length !== beforeCount) {
      this.notify();
    }
  }

  public clear(): void {
    this.toasts = [];
    this.notify();
  }

  // Convenience methods
  public error(message: string, options?: ToastOptions): string {
    return this.show('error', message, options);
  }

  public warning(message: string, options?: ToastOptions): string {
    return this.show('warning', message, options);
  }

  public success(message: string, options?: ToastOptions): string {
    return this.show('success', message, options);
  }

  public info(message: string, options?: ToastOptions): string {
    return this.show('info', message, options);
  }
}

export const toast = new ToastManager();
