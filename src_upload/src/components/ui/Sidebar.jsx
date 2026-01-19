import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isCollapsed = false }) => {
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
      label: 'Canlı Sohbet',
      path: '/live-trading-chat',
      icon: 'MessageCircle',
      tooltip: 'Live trading chat and collaboration'
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

  // Add Admin Dashboard for admin users
  const filteredNavigationItems = navigationItems.filter((item) => {
    if (item?.adminOnly && userProfile?.role !== 'admin') {
      return false;
    }
    return true;
  });

  const allNavigationItems = userProfile?.role === 'admin'
    ? [
        {
          label: 'Admin Panel',
          path: '/admin-dashboard',
          icon: 'Shield',
          tooltip: 'Admin dashboard and management',
          isAdmin: true
        },
        ...filteredNavigationItems
      ]
    : filteredNavigationItems;

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

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getConnectionColor = (status) => {
    return status === 'connected' ? 'text-success' : 'text-error';
  };

  const connectedCount = Object.values(connectionStatus)?.filter(s => s === 'connected')?.length;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Icon name="Bitcoin" size={28} color="#ffffff" />
        </div>
        {!isCollapsed && (
          <span className="sidebar-logo-text">Atalay Ulusoy</span>
        )}
      </div>
      <nav className="sidebar-nav scrollbar-thin">
        {allNavigationItems?.map((item) => (
          <button
            key={item?.path}
            onClick={() => handleNavigation(item?.path)}
            className={`sidebar-nav-item ${location?.pathname === item?.path ? 'active' : ''} ${
              item?.isAdmin ? 'bg-red-900/20 border-l-2 border-red-500' : ''
            }`}
            title={item?.tooltip}
            aria-label={item?.label}
          >
            <Icon name={item?.icon} size={20} />
            {!isCollapsed && (
              <span className="font-medium">{item?.label}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-connection-status">
        <div className="flex items-center justify-between mb-2">
          <span className="caption text-muted-foreground">Exchange Status</span>
          <span className="caption font-medium text-foreground">
            {connectedCount}/3
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="caption text-muted-foreground">Binance</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${connectionStatus?.binance === 'connected' ? 'bg-success' : 'bg-error'}`} />
              <span className={`caption ${getConnectionColor(connectionStatus?.binance)}`}>
                {connectionStatus?.binance}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="caption text-muted-foreground">Coinbase</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${connectionStatus?.coinbase === 'connected' ? 'bg-success' : 'bg-error'}`} />
              <span className={`caption ${getConnectionColor(connectionStatus?.coinbase)}`}>
                {connectionStatus?.coinbase}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="caption text-muted-foreground">Kraken</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${connectionStatus?.kraken === 'connected' ? 'bg-success' : 'bg-error'}`} />
              <span className={`caption ${getConnectionColor(connectionStatus?.kraken)}`}>
                {connectionStatus?.kraken}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <button
          onClick={async () => {
            await signOut?.();
            navigate('/login');
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Icon name="LogOut" size={16} />
          {!isCollapsed && <span>Çıkış</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
