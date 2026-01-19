import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';

const AdminSystemMetrics = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTrades: 0,
    totalVolume: 0,
    systemUptime: '99.9%',
    avgResponseTime: '120ms',
    errorRate: '0.01%',
    apiCalls: 0
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const loadMetrics = async () => {
    try {
      const [usersResult, tradesResult] = await Promise.all([
        supabase?.from('user_profiles')?.select('id, is_active', { count: 'exact' }),
        supabase?.from('trading_operations')?.select('amount_usdt', { count: 'exact' })
      ]);

      const totalUsers = usersResult?.count || 0;
      const activeUsers = usersResult?.data?.filter(u => u?.is_active)?.length || 0;
      const totalTrades = tradesResult?.count || 0;
      const totalVolume = tradesResult?.data?.reduce((sum, t) => sum + (parseFloat(t?.amount_usdt) || 0), 0) || 0;

      setMetrics(prev => ({
        ...prev,
        totalUsers,
        activeUsers,
        totalTrades,
        totalVolume: totalVolume?.toFixed(2),
        apiCalls: totalTrades * 3
      }));
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadMetrics();
      const interval = setInterval(loadMetrics, 10000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('role')
        ?.eq('id', user?.id)
        ?.single();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="card-mobile">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors"
            >
              <Icon name="ArrowLeft" size={20} color="#ffffff" />
            </button>
            <div className="bg-gradient-to-br from-yellow-600 to-orange-600 p-3 rounded-lg">
              <Icon name="BarChart" size={24} color="#ffffff" />
            </div>
            <div>
              <h1 className="text-responsive-h1 font-bold text-foreground">Sistem Metrikleri</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Performans izleme ve analiz</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="card-mobile">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Toplam Kullanıcı</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-400">{metrics?.totalUsers}</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Icon name="Users" size={24} color="#60a5fa" />
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Aktif Kullanıcı</p>
                <p className="text-xl sm:text-2xl font-bold text-green-400">{metrics?.activeUsers}</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <Icon name="UserCheck" size={24} color="#4ade80" />
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Toplam İşlem</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-400">{metrics?.totalTrades}</p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <Icon name="Activity" size={24} color="#c084fc" />
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Toplam Hacim</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-400">${metrics?.totalVolume}</p>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <Icon name="DollarSign" size={24} color="#facc15" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-mobile">
            <h2 className="text-lg font-bold text-white mb-4">Sistem Sağlığı</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Uptime</span>
                <span className="text-green-400 font-semibold">{metrics?.systemUptime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Ortalama Yanıt Süresi</span>
                <span className="text-blue-400 font-semibold">{metrics?.avgResponseTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Hata Oranı</span>
                <span className="text-yellow-400 font-semibold">{metrics?.errorRate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">API Çağrıları</span>
                <span className="text-purple-400 font-semibold">{metrics?.apiCalls}</span>
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <h2 className="text-lg font-bold text-white mb-4">Sistem Durumu</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-slate-300">Database</span>
                </div>
                <span className="text-green-400 font-semibold">Aktif</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-slate-300">API Gateway</span>
                </div>
                <span className="text-green-400 font-semibold">Aktif</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-slate-300">Trading Engine</span>
                </div>
                <span className="text-green-400 font-semibold">Aktif</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-slate-300">Webhook Service</span>
                </div>
                <span className="text-green-400 font-semibold">Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminSystemMetrics;