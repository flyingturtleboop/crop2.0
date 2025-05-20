import React, { createContext, useContext, useState, ReactNode } from 'react';

export type NotificationType = 'success' | 'error';
interface Notification { id: number; message: string; type: NotificationType }

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
}
const NotificationContext = createContext<NotificationContextType>({
  notify: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const notify = (message: string, type: NotificationType = 'success') => {
    const id = Date.now();
    setNotification({ id, message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div
            key={notification.id}
            className={`px-4 py-2 rounded shadow whitespace-nowrap ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {notification.message}
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
