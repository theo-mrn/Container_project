import { toast } from 'sonner';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive';
}

export const useToast = () => {
  const showToast = ({ title, description, variant = 'default' }: ToastOptions) => {
    switch (variant) {
      case 'success':
        toast.success(title, {
          description
        });
        break;
      case 'destructive':
        toast.error(title, {
          description
        });
        break;
      default:
        toast(title, {
          description
        });
    }
  };

  return { toast: showToast };
}; 