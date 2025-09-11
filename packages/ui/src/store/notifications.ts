import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // ms, 0 = no auto dismiss
  dismissible?: boolean;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set) => ({
      notifications: [],

      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random()}`;
        const newNotification: Notification = {
          id,
          duration: 5000, // 5 seconds default
          dismissible: true,
          ...notification,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto dismiss if duration is set
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            set((state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }));
          }, newNotification.duration);
        }
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'notification-store',
    }
  )
);

// Helper functions para usar fácilmente
export const showSuccessNotification = (message: string, title?: string) => {
  useNotificationStore.getState().addNotification({
    type: 'success',
    title,
    message,
  });
};

export const showErrorNotification = (message: string, title?: string) => {
  useNotificationStore.getState().addNotification({
    type: 'error',
    title,
    message,
    duration: 7000, // Errores duran más
  });
};

export const showWarningNotification = (message: string, title?: string) => {
  useNotificationStore.getState().addNotification({
    type: 'warning',
    title,
    message,
  });
};

export const showInfoNotification = (message: string, title?: string) => {
  useNotificationStore.getState().addNotification({
    type: 'info',
    title,
    message,
  });
};

// Custom hook for easier component usage
export const useNotifications = () => {
  const { addNotification, removeNotification, clearAll } = useNotificationStore();

  return {
    success: (message: string, title?: string) => showSuccessNotification(message, title),
    error: (message: string, title?: string) => showErrorNotification(message, title),
    warning: (message: string, title?: string) => showWarningNotification(message, title),
    info: (message: string, title?: string) => showInfoNotification(message, title),
    dismiss: removeNotification,
    clear: clearAll,
  };
};
