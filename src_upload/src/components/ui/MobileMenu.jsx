import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext';

const MobileMenu = ({ isOpen = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, signOut } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState({
    binance: 'connected',
    coinbase: 'connected',
    kraken: 'disconnected'
  });

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/trading-dashboard',
      icon: 'LayoutDashboard',
      tooltip: 'Trading control center'
    },
    {
      label: 'AI Önerileri',
      path: '/ai-trade-recommendations',
      icon: 'Brain',
      tooltip: 'AI-powered trade recommendations'
    },
    {
      label: 'Arbitraj Takibi',
      path: '/arbitrage-monitor',
      icon: 'Zap',
      tooltip: 'Arbitrage opportunity tracking'
    },
    {
      label: 'Kar/Zarar Raporu',
      path: '/p-l-reporting-center',
      icon: 'FileText',
      tooltip: 'Monthly and yearly P&L reporting'
    },
    {
      label: 'Eğitim Merkezi',
      path: '/education-hub',
      icon: 'GraduationCap',
      tooltip: 'Video courses and webinars'
    },
    {
      label: 'Piyasa Analizi',
      path: '/market-analysis',
      icon: 'TrendingUp',
      tooltip: 'Market intelligence and trends'
    },
    {
      label: 'İşlem Geçmişi',
      path: '/trade-history',
      icon: 'History',
      tooltip: 'Transaction tracking and analysis'
    },
    {
      label: 'Portföy Analizi',
      path: '/portfolio-analytics',
      icon: 'PieChart',
      tooltip: 'Performance reporting and insights'
    },
    {
      label: 'Ödeme Yönetimi',
      path: '/payment-management',
      icon: 'CreditCard',
      tooltip: 'Subscription and payment management'
    },
    {
      label: 'Başlangıç Kılavuzu',
      path: '/getting-started-guide',
      icon: 'BookOpen',
      tooltip: 'Getting started guide and tutorials'
    },
    {
      label: 'API Doğrulama',
      path: '/api-key-verification-center',
      icon: 'Key',
      tooltip: 'API key verification center',
      adminOnly: true
    },
    {
      label: 'Sistem Sağlığı',
      path: '/system-health-monitor',
      icon: 'Activity',
      tooltip: 'System health monitoring'
    },
    {
      label: 'Exchange API',
      path: '/exchange-api-management',
      icon: 'Settings',
      tooltip: 'Exchange API management'
    },
    {
      label: 'Bildirimler',
      path: '/notification-preferences',
      icon: 'Bell',
      tooltip: 'Notification preferences'
    }
  ];

  const filteredNavigationItems = navigationItems.filter((item) => {
    if (item?.adminOnly && userProfile?.role !== 'admin') {
      return false;
    }
    return true;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(prev => ({
        ...prev,
        binance: Math.random() > 0.1 ? 'connected' : 'disconnected',
        coinbase: Math.random() > 0.1 ? 'connected' : 'disconnected',
        kraken: Math.random() > 0.2 ? 'disconnected' : 'connected'
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e?.target === e?.currentTarget && onClose) {
      onClose();
    }
  };

  const getConnectionColor = (status) => {
    return status === 'connected' ? 'text-success' : 'text-error';
  };

  const connectedCount = Object.values(connectionStatus)?.filter(s => s === 'connected')?.length;

  if (!isOpen) return null;

  return (
    <div 
      className="mobile-menu-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
              <Icon name="Bitcoin" size={28} color="#ffffff" />
            </div>
            <span className="text-xl font-semibold text-foreground font-heading">Atalay Ulusoy</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-card transition-colors min-h-touch min-w-touch"
            aria-label="Close menu"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <div className="space-y-2">
            {filteredNavigationItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg transition-all duration-250 min-h-touch ${
                  location?.pathname === item?.path
                    ? 'bg-primary text-primary-foreground glow-primary'
                    : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95'
                }`}
                aria-label={item?.label}
                aria-current={location?.pathname === item?.path ? 'page' : undefined}
              >
                <Icon name={item?.icon} size={24} />
                <span className="font-medium text-lg">{item?.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-border pb-safe-bottom">
          <button
            onClick={async () => {
              await signOut?.();
              handleNavigation('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-3"
          >
            <Icon name="LogOut" size={20} />
            <span className="font-medium text-lg">Çıkış</span>
          </button>
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="caption text-muted-foreground">Exchange Status</span>
              <span className="caption font-medium text-foreground">
                {connectedCount}/3
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="caption text-muted-foreground">Binance</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${connectionStatus?.binance === 'connected' ? 'bg-success' : 'bg-error'}`} />
                  <span className={`caption ${getConnectionColor(connectionStatus?.binance)}`}>
                    {connectionStatus?.binance}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="caption text-muted-foreground">Coinbase</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${connectionStatus?.coinbase === 'connected' ? 'bg-success' : 'bg-error'}`} />
                  <span className={`caption ${getConnectionColor(connectionStatus?.coinbase)}`}>
                    {connectionStatus?.coinbase}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="caption text-muted-foreground">Kraken</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${connectionStatus?.kraken === 'connected' ? 'bg-success' : 'bg-error'}`} />
                  <span className={`caption ${getConnectionColor(connectionStatus?.kraken)}`}>
                    {connectionStatus?.kraken}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
