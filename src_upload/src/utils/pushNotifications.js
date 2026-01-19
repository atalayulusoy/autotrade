export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendPushNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      tag: 'trading-notification',
      requireInteraction: false,
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification?.close();
    };

    return notification;
  }
  return null;
};

export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker?.ready;
    const subscription = await registration?.pushManager?.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.VITE_VAPID_PUBLIC_KEY || ''
      )
    });
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='?.repeat((4 - base64String?.length % 4) % 4);
  const base64 = (base64String + padding)?.replace(/\-/g, '+')?.replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData?.length; ++i) {
    outputArray[i] = rawData?.charCodeAt(i);
  }
  return outputArray;
}

export const notifyTradingSignal = (signal) => {
  sendPushNotification('New Trading Signal', {
    body: `${signal?.type?.toUpperCase()} ${signal?.coin} at $${signal?.price}`,
    icon: '/favicon.ico',
    tag: `signal-${signal?.id}`,
    data: { url: '/trading-dashboard', signal }
  });
};

export const notifyPriceAlert = (coin, price, condition) => {
  sendPushNotification('Price Alert', {
    body: `${coin} ${condition} $${price}`,
    icon: '/favicon.ico',
    tag: `price-alert-${coin}`,
    data: { url: '/market-analysis' }
  });
};

export const notifyOrderFilled = (order) => {
  sendPushNotification('Order Filled', {
    body: `${order?.type} order for ${order?.amount} ${order?.coin} filled at $${order?.price}`,
    icon: '/favicon.ico',
    tag: `order-${order?.id}`,
    data: { url: '/trade-history', order }
  });
};