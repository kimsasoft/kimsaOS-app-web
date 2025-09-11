"use client";

import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useNotificationStore, type Notification, type NotificationType } from '../../store/notifications';

const getNotificationIcon = (type: NotificationType) => {
  const iconProps = { className: "w-5 h-5 flex-shrink-0" };
  
  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-green-600" data-testid="check-circle-icon" />;
    case 'error':
      return <XCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-red-600" data-testid="alert-circle-icon" />;
    case 'warning':
      return <AlertTriangle {...iconProps} className="w-5 h-5 flex-shrink-0 text-yellow-600" data-testid="alert-triangle-icon" />;
    case 'info':
      return <Info {...iconProps} className="w-5 h-5 flex-shrink-0 text-blue-600" data-testid="info-icon" />;
    default:
      return <Info {...iconProps} data-testid="info-icon" />;
  }
};

const getNotificationStyles = (type: NotificationType) => {
  const baseStyles = "border-l-4 p-4 rounded-md shadow-lg transition-all duration-300 max-w-md";
  
  switch (type) {
    case 'success':
      return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
    case 'error':
      return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
    case 'warning':
      return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
    case 'info':
      return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
    default:
      return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800`;
  }
};

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem = ({ notification }: NotificationItemProps) => {
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  return (
    <div className={getNotificationStyles(notification.type)}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="ml-3 flex-1">
          {notification.title && (
            <h3 className="text-sm font-medium mb-1">
              {notification.title}
            </h3>
          )}
          <p className="text-sm">
            {notification.message}
          </p>
        </div>
        
        {notification.dismissible && (
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={() => removeNotification(notification.id)}
              className="inline-flex text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const NotificationContainer = () => {
  const notifications = useNotificationStore((state) => state.notifications);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
};
