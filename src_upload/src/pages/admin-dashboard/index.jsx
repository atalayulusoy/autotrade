import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTrades: 0,
    totalVolume: 0,
    systemHealth: 'healthy'
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadMetrics();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('role')?.eq('id', user?.id)?.single();

      if (error) throw error;

      if (data?.role !== 'admin') {
        await signOut();
        navigate('/login');
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    } catch (error) {
      console.error('Admin check error:', error);
      navigate('/login');
    }
  };

  const loadMetrics = async () => {
    try {
      const [usersResult, tradesResult] = await Promise.all([
        supabase?.from('user_profiles')?.select('id, is_active', { count: 'exact' }),
        supabase?.from('trading_operations')?.select('amount_usdt, actual_profit', { count: 'exact' })
      ]);

      const totalUsers = usersResult?.count || 0;
      const activeUsers = usersResult?.data?.filter(u => u?.is_active)?.length || 0;
      const totalTrades = tradesResult?.count || 0;
      const totalVolume = tradesResult?.data?.reduce((sum, t) => sum + (parseFloat(t?.amount_usdt) || 0), 0) || 0;

      setMetrics({
        totalUsers,
        activeUsers,
        totalTrades,
        totalVolume: totalVolume?.toFixed(2),
        systemHealth: 'healthy'
      });
    } catch (error) {
      console.error('Metrics load error:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground">Yükleniyor...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-mobile">
        {/* Header - Mobile Optimized */}
        <div className="card-mobile">
          <div className="flex-mobile-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-red-600 to-orange-600 p-3 rounded-lg flex-shrink-0">
                <Icon name="Shield" size={20} color="#ffffff" />
              </div>
              <div>
                <h1 className="text-responsive-h1 font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Sistem yönetimi ve izleme merkezi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs sm:text-sm text-success font-medium">Sistem Aktif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid - Mobile Responsive */}
        <div className="grid-mobile-2 lg:grid-cols-4">
          <div className="card-mobile-compact bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-blue-300 mb-1">Toplam Kullanıcı</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{metrics?.totalUsers}</p>
              </div>
              <div className="bg-blue-600/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Icon name="Users" size={20} color="#60a5fa" />
              </div>
            </div>
          </div>

          <div className="card-mobile-compact bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-green-300 mb-1">Aktif Kullanıcı</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{metrics?.activeUsers}</p>
              </div>
              <div className="bg-green-600/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Icon name="UserCheck" size={20} color="#4ade80" />
              </div>
            </div>
          </div>

          <div className="card-mobile-compact bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-purple-300 mb-1">Toplam İşlem</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{metrics?.totalTrades}</p>
              </div>
              <div className="bg-purple-600/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Icon name="Activity" size={20} color="#c084fc" />
              </div>
            </div>
          </div>

          <div className="card-mobile-compact bg-gradient-to-br from-orange-900/30 to-orange-800/30 border-orange-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-orange-300 mb-1">Toplam Hacim</p>
                <p className="text-xl sm:text-2xl font-bold text-white">${metrics?.totalVolume}</p>
              </div>
              <div className="bg-orange-600/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Icon name="DollarSign" size={20} color="#fb923c" />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions - Mobile Grid */}
        <div className="grid-mobile-2 lg:grid-cols-3">
          <button
            onClick={() => navigate('/admin-user-management-hub')}
            className="card-mobile-compact hover:border-primary/50 transition-all active:scale-95 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <Icon name="Users" size={20} className="text-blue-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Kullanıcı Yönetimi</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Kullanıcıları yönet, abonelikleri kontrol et
            </p>
          </button>

          <button
            onClick={() => navigate('/admin-api-verification')}
            className="card-mobile-compact hover:border-primary/50 transition-all active:scale-95 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-600/20 p-3 rounded-lg">
                <Icon name="Key" size={20} className="text-green-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">API Doğrulama</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              API anahtarı doğrulama isteklerini incele
            </p>
          </button>

          <button
            onClick={() => navigate('/admin-trading-monitor')}
            className="card-mobile-compact hover:border-primary/50 transition-all active:scale-95 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-600/20 p-3 rounded-lg">
                <Icon name="Activity" size={20} className="text-purple-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">İşlem İzleme</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Canlı işlemleri ve performansı izle
            </p>
          </button>

          <button
            onClick={() => navigate('/admin-payment-operations-center')}
            className="card-mobile-compact hover:border-primary/50 transition-all active:scale-95 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-600/20 p-3 rounded-lg">
                <Icon name="CreditCard" size={20} className="text-yellow-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Ödeme İşlemleri</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Ödeme ve abonelik işlemlerini yönet
            </p>
          </button>

          <button
            onClick={() => navigate('/admin-webhook-configuration')}
            className="card-mobile-compact hover:border-primary/50 transition-all active:scale-95 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-600/20 p-3 rounded-lg">
                <Icon name="Webhook" size={20} className="text-red-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Webhook Yapılandırma</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              TradingView webhook ayarlarını yönet
            </p>
          </button>

          <button
            onClick={() => navigate('/admin-system-metrics')}
            className="card-mobile-compact hover:border-primary/50 transition-all active:scale-95 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-cyan-600/20 p-3 rounded-lg">
                <Icon name="BarChart3" size={20} className="text-cyan-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Sistem Metrikleri</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sistem performansı ve sağlık durumu
            </p>
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;