import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import MainLayout from '../../layouts/MainLayout';

const NotificationPreferences = () => {
  const { user, userProfile } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Local toggle states
  const [toggles, setToggles] = useState({
    tradingSignals: true,
    priceAlerts: true,
    orderUpdates: true,
    dailySummary: false,
    weeklyReport: true,
    vibration: true,
    sound: true,
    badgeCount: true
  });

  useEffect(() => {
    if (user) {
      loadPreferences();
      loadNotificationHistory();
      loadUnreadCount();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await notificationService?.getPreferences(user?.id);
      setPreferences(data);
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationHistory = async () => {
    try {
      const data = await notificationService?.getNotificationHistory(user?.id, 20);
      setNotificationHistory(data || []);
    } catch (err) {
      console.error('Error loading notification history:', err);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService?.getUnreadCount(user?.id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await notificationService?.updatePreferences(user?.id, preferences);
      setSuccess('Bildirim tercihleri başarıyla kaydedildi!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService?.markAsRead(notificationId);
      loadNotificationHistory();
      loadUnreadCount();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleToggle = (key) => {
    setToggles(prev => ({
      ...prev,
      [key]: !prev?.[key]
    }));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'price_alert':
        return 'TrendingUp';
      case 'pnl_alert':
        return 'DollarSign';
      case 'connectivity_alert':
        return 'Wifi';
      case 'trade_alert':
        return 'Activity';
      case 'risk_limit_alert':
        return 'AlertTriangle';
      default:
        return 'Bell';
    }
  };

  const getChannelBadge = (channel) => {
    const badges = {
      telegram: { icon: 'Send', color: 'bg-blue-500/10 text-blue-400' },
      email: { icon: 'Mail', color: 'bg-green-500/10 text-green-400' },
      in_app: { icon: 'Bell', color: 'bg-purple-500/10 text-purple-400' },
    };
    return badges?.[channel] || badges?.in_app;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12 text-white">Yükleniyor...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-responsive-h1 font-bold text-foreground mb-2">
              Bildirim Tercihleri
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Bildirim ayarlarınızı yönetin
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card-mobile">
            <h2 className="text-responsive-h2 font-semibold text-foreground mb-4">
              Anlık Bildirimler
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">İşlem Sinyalleri</p>
                  <p className="text-xs text-muted-foreground">Yeni sinyal bildirimleri alın</p>
                </div>
                <button 
                  onClick={() => handleToggle('tradingSignals')}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    toggles?.tradingSignals ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    toggles?.tradingSignals ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Fiyat Uyarıları</p>
                  <p className="text-xs text-muted-foreground">Fiyat hedef bildirimleri</p>
                </div>
                <button 
                  onClick={() => handleToggle('priceAlerts')}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    toggles?.priceAlerts ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    toggles?.priceAlerts ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Emir Güncellemeleri</p>
                  <p className="text-xs text-muted-foreground">Emir gerçekleşme bildirimleri</p>
                </div>
                <button 
                  onClick={() => handleToggle('orderUpdates')}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    toggles?.orderUpdates ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    toggles?.orderUpdates ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <h2 className="text-responsive-h2 font-semibold text-foreground mb-4">
              E-posta Bildirimleri
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Günlük Özet</p>
                  <p className="text-xs text-muted-foreground">Günlük performans raporu</p>
                </div>
                <button 
                  onClick={() => handleToggle('dailySummary')}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    toggles?.dailySummary ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    toggles?.dailySummary ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Haftalık Rapor</p>
                  <p className="text-xs text-muted-foreground">Haftalık analiz e-postası</p>
                </div>
                <button 
                  onClick={() => handleToggle('weeklyReport')}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    toggles?.weeklyReport ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    toggles?.weeklyReport ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-mobile">
          <h2 className="text-responsive-h2 font-semibold text-foreground mb-4">
            Mobil Uygulama Ayarları
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Titreşim</p>
                <p className="text-xs text-muted-foreground">Bildirimde titreşim</p>
              </div>
              <button 
                onClick={() => handleToggle('vibration')}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  toggles?.vibration ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  toggles?.vibration ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Ses</p>
                <p className="text-xs text-muted-foreground">Uyarılarda ses çal</p>
              </div>
              <button 
                onClick={() => handleToggle('sound')}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  toggles?.sound ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  toggles?.sound ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Rozet Sayısı</p>
                <p className="text-xs text-muted-foreground">Uygulama simgesinde okunmamış sayısını göster</p>
              </div>
              <button 
                onClick={() => handleToggle('badgeCount')}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  toggles?.badgeCount ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  toggles?.badgeCount ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationPreferences;