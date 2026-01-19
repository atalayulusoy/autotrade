import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';


const AdminTradingMonitor = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [trades, setTrades] = useState([]);
  const [metrics, setMetrics] = useState({
    activeTrades: 0,
    totalVolume: 0,
    totalProfit: 0,
    successRate: 0
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadTrades();
      loadMetrics();
      const interval = setInterval(() => {
        loadTrades();
        loadMetrics();
      }, 5000);
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

  const loadTrades = async () => {
    try {
      const { data, error } = await supabase
        ?.from('trading_operations')
        ?.select(`
          *,
          user_profiles (
            full_name,
            email
          )
        `)
        ?.order('created_at', { ascending: false })
        ?.limit(50);

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Error loading trades:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase
        ?.from('trading_operations')
        ?.select('status, amount_usdt, actual_profit');

      if (error) throw error;

      const activeTrades = data?.filter(t => t?.status === 'open')?.length || 0;
      const totalVolume = data?.reduce((sum, t) => sum + (parseFloat(t?.amount_usdt) || 0), 0) || 0;
      const totalProfit = data?.reduce((sum, t) => sum + (parseFloat(t?.actual_profit) || 0), 0) || 0;
      const successfulTrades = data?.filter(t => t?.status === 'closed' && parseFloat(t?.actual_profit) > 0)?.length || 0;
      const totalClosedTrades = data?.filter(t => t?.status === 'closed')?.length || 1;
      const successRate = ((successfulTrades / totalClosedTrades) * 100)?.toFixed(2);

      setMetrics({
        activeTrades,
        totalVolume: totalVolume?.toFixed(2),
        totalProfit: totalProfit?.toFixed(2),
        successRate
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
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
            <div className="bg-gradient-to-br from-orange-600 to-red-600 p-3 rounded-lg">
              <Icon name="Activity" size={24} color="#ffffff" />
            </div>
            <div>
              <h1 className="text-responsive-h1 font-bold text-foreground">Trading İzleme</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Canlı işlem takibi ve analiz</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="card-mobile">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Aktif İşlemler</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-400">{metrics?.activeTrades}</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Icon name="TrendingUp" size={24} color="#60a5fa" />
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Toplam Hacim</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-400">${metrics?.totalVolume}</p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <Icon name="DollarSign" size={24} color="#c084fc" />
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Toplam Kar</p>
                <p className="text-xl sm:text-2xl font-bold text-green-400">${metrics?.totalProfit}</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <Icon name="TrendingUp" size={24} color="#4ade80" />
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Başarı Oranı</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-400">{metrics?.successRate}%</p>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <Icon name="Target" size={24} color="#facc15" />
              </div>
            </div>
          </div>
        </div>

        <div className="card-mobile">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Son İşlemler</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Kullanıcı</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Coin</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Miktar</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Kar/Zarar</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Durum</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {trades?.map((trade) => (
                  <tr key={trade?.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{trade?.user_profiles?.full_name}</p>
                        <p className="text-xs text-slate-400">{trade?.user_profiles?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white font-semibold">{trade?.coin_symbol}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300">${parseFloat(trade?.amount_usdt || 0)?.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          parseFloat(trade?.actual_profit) > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        ${parseFloat(trade?.actual_profit || 0)?.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trade?.status === 'open' ?'bg-blue-500/20 text-blue-400'
                            : trade?.status === 'closed' ?'bg-green-500/20 text-green-400' :'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {trade?.status === 'open' ? 'Açık' : trade?.status === 'closed' ? 'Kapalı' : 'İptal'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 text-sm">
                        {new Date(trade?.created_at)?.toLocaleString('tr-TR')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminTradingMonitor;