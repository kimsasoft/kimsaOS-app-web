"use client";

import { 
  useNotificationStore, 
  showSuccessNotification, 
  showErrorNotification, 
  showWarningNotification, 
  showInfoNotification,
  type NotificationType 
} from '../store/notifications';

export const useNotifications = () => {
  const { addNotification, removeNotification, clearAll } = useNotificationStore();

  return {
    // Helper methods
    success: showSuccessNotification,
    error: showErrorNotification, 
    warning: showWarningNotification,
    info: showInfoNotification,

    // Advanced usage
    show: (type: NotificationType, message: string, title?: string, options?: { duration?: number; dismissible?: boolean }) => {
      addNotification({
        type,
        message,
        title,
        ...options,
      });
    },

    // Control methods
    remove: removeNotification,
    clear: clearAll,
  };
};
