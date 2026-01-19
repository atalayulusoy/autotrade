import React, { useEffect, useState } from 'react';
import Icon from './AppIcon';
import { requestNotificationPermission, subscribeToPushNotifications } from '../utils/pushNotifications';

const MobileNotificationBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        setShowBanner(true);
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      await subscribeToPushNotifications();
      setPermission('granted');
      setShowBanner(false);
    }
  };

  if (!showBanner || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed top-16 lg:top-4 left-4 right-4 z-300 animate-slideUp">
      <div className="card-mobile bg-primary/10 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Icon name="Bell" size={20} color="#2563eb" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Enable Push Notifications
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Get real-time alerts for trading signals, price changes, and order updates
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleEnableNotifications}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors min-h-touch"
              >
                Enable
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-card transition-colors min-h-touch"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileNotificationBanner;