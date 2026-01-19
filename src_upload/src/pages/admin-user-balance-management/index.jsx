import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { fetchUserBalances, formatBalanceData, calculateTotalValue } from '../../services/exchangeBalanceService';

const AdminUserBalanceManagement = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
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

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select(`
          id,
          full_name,
          email,
          balance,
          subscription_plan,
          is_active,
          created_at,
          exchange_api_keys!user_id (
            id,
            exchange,
            is_active,
            connection_status
          )
        `)
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Kullanıcılar yüklenemedi: ' + error?.message);
    }
  };

  const handleFetchBalance = async (userId) => {
    setFetchingBalance(true);
    setSelectedUser(userId);
    
    try {
      const result = await fetchUserBalances(userId);
      
      if (result?.success) {
        const formattedData = formatBalanceData(result?.balances);
        const totalValue = calculateTotalValue(result?.balances);
        
        setBalanceData({
          userId,
          balances: formattedData,
          totalValue,
          timestamp: new Date()?.toISOString()
        });
        
        setExpandedUser(userId);
      } else {
        alert('Bakiye çekilemedi: ' + (result?.error || result?.message));
        setBalanceData(null);
      }
    } catch (error) {
      console.error('Balance fetch error:', error);
      alert('Bakiye çekilemedi: ' + error?.message);
      setBalanceData(null);
    } finally {
      setFetchingBalance(false);
    }
  };

  const filteredUsers = users?.filter(user => {
    const searchLower = searchTerm?.toLowerCase();
    return (user?.full_name?.toLowerCase()?.includes(searchLower) || user?.email?.toLowerCase()?.includes(searchLower));
  });

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
      <div className="space-y-6">
        {/* Header */}
        <div className="card-mobile">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-lg">
                <Icon name="Wallet" size={24} color="#ffffff" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Kullanıcı Bakiye Yönetimi
                </h1>
                <p className="text-sm text-muted-foreground">
                  Exchange bakiyelerini görüntüle ve izle
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin-dashboard')}
              className="flex items-center gap-2"
            >
              <Icon name="ArrowLeft" size={16} />
              Geri Dön
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="card-mobile">
          <Input
            placeholder="Kullanıcı ara (isim veya e-posta)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            icon="Search"
          />
        </div>

        {/* Users Table */}
        <div className="card-mobile">
          <h2 className="text-lg font-bold text-white mb-4">Kullanıcı Bakiyeleri (Salt Okunur)</h2>
          <p className="text-sm text-slate-400 mb-6">Exchange bakiyelerini görüntüleyin. Bakiye düzenleme yapılamaz, sadece gerçek zamanda exchange'lerden veri çekilir.</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Kullanıcı</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Bağlı Exchange'ler</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Durum</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers?.map((user) => (
                  <React.Fragment key={user?.id}>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">{user?.full_name}</div>
                          <div className="text-sm text-slate-400">{user?.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {user?.exchange_api_keys?.length > 0 ? (
                            user?.exchange_api_keys?.map((key, idx) => (
                              <span
                                key={idx}
                                className={`text-xs px-2 py-1 rounded ${
                                  key?.is_active
                                    ? 'bg-blue-900/50 text-blue-300' :'bg-slate-700 text-slate-400'
                                }`}
                              >
                                {key?.exchange}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">Bağlı exchange yok</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            user?.is_active
                              ? 'bg-green-900/50 text-green-300' :'bg-red-900/50 text-red-300'
                          }`}
                        >
                          {user?.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => handleFetchBalance(user?.id)}
                          loading={fetchingBalance && selectedUser === user?.id}
                          disabled={!user?.exchange_api_keys || user?.exchange_api_keys?.length === 0}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                          <Icon name="RefreshCw" size={14} />
                          Bakiye Çek
                        </Button>
                      </td>
                    </tr>

                    {/* Expanded Balance Details */}
                    {expandedUser === user?.id && balanceData && (
                      <tr>
                        <td colSpan="4" className="py-4 px-4 bg-slate-800/50">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold text-white">Exchange Bakiyeleri (OKX, Binance, Bybit, Gate.io, BTCTURK)</h3>
                              <button
                                onClick={() => setExpandedUser(null)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Icon name="X" size={20} />
                              </button>
                            </div>

                            {balanceData?.map((exchange, idx) => (
                              <div key={idx} className="bg-slate-900/50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                      exchange?.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                                    }`} />
                                    <h4 className="font-bold text-white">{exchange?.exchange}</h4>
                                  </div>
                                  {exchange?.timestamp && (
                                    <span className="text-xs text-slate-400">
                                      {new Date(exchange?.timestamp)?.toLocaleString('tr-TR')}
                                    </span>
                                  )}
                                </div>

                                {exchange?.status === 'error' ? (
                                  <div className="text-red-400 text-sm">
                                    Hata: {exchange?.error}
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {exchange?.assets?.length > 0 ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {exchange?.assets?.map((asset, assetIdx) => (
                                          <div key={assetIdx} className="bg-slate-800/50 rounded p-3">
                                            <div className="flex items-center justify-between">
                                              <span className="font-semibold text-white">{asset?.currency}</span>
                                              <span className="text-green-400 font-bold">
                                                {asset?.total?.toFixed(8)}
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                                              <span>Serbest: {asset?.free?.toFixed(8)}</span>
                                              <span>Kullanımda: {asset?.used?.toFixed(8)}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-slate-400 text-sm">Bakiye bulunamadı</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}

                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <Icon name="Info" size={20} color="#60a5fa" />
                                <div className="text-sm text-blue-300">
                                  <p className="font-semibold mb-1">Bilgilendirme:</p>
                                  <p>Bu bakiyeler doğrudan exchange'lerden (OKX, Binance, Bybit, Gate.io, BTCTURK) çekilmektedir. Bakiye düzenleme yapamaz, sadece görüntüleyebilirsiniz. Kullanıcıların gerçek exchange bakiyelerini görüyorsunuz.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminUserBalanceManagement;
