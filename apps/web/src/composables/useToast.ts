import { ref } from 'vue';

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ToastMessage extends ToastOptions {
  id: number;
}

// Global state para não precisar de store complexa
const toasts = ref<ToastMessage[]>([]);
let nextId = 0;

export const useToast = () => {
  const showToast = (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { message: options } : options;
    
    const id = nextId++;
    const toast: ToastMessage = {
      id,
      message: opts.message,
      type: opts.type || 'info',
      duration: opts.duration || 4000
    };
    
    toasts.value.push(toast);
    
    setTimeout(() => {
      removeToast(id);
    }, toast.duration);
  };
  
  const success = (message: string, duration?: number) => showToast({ message, type: 'success', duration });
  const error = (message: string, duration?: number) => showToast({ message, type: 'error', duration });
  const warning = (message: string, duration?: number) => showToast({ message, type: 'warning', duration });
  const info = (message: string, duration?: number) => showToast({ message, type: 'info', duration });
  
  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };
  
  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    removeToast
  };
};
