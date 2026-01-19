import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AdminPaymentOperationsCenter = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [metrics, setMetrics] = useState({
    pendingPayments: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    refundRequests: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadPaymentData();
      loadSubscriptions();
      loadMetrics();
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

  const loadPaymentData = async () => {
    try {
      const { data, error } = await supabase
        ?.from('payment_transactions')
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
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('id, full_name, email, subscription_plan, subscription_end_date, balance')
        ?.order('subscription_end_date', { ascending: true });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      const [transactionsResult, subscriptionsResult] = await Promise.all([
        supabase?.from('payment_transactions')?.select('amount, status', { count: 'exact' }),
        supabase?.from('user_profiles')?.select('subscription_plan', { count: 'exact' })
      ]);

      const pendingPayments = transactionsResult?.data?.filter(t => t?.status === 'pending')?.length || 0;
      const totalRevenue = transactionsResult?.data
        ?.filter(t => t?.status === 'completed')
        ?.reduce((sum, t) => sum + (parseFloat(t?.amount) || 0), 0) || 0;
      const activeSubscriptions = subscriptionsResult?.data?.filter(s => s?.subscription_plan !== 'free_trial')?.length || 0;
      const refundRequests = transactionsResult?.data?.filter(t => t?.status === 'refund_requested')?.length || 0;

      setMetrics({
        pendingPayments,
        totalRevenue: totalRevenue?.toFixed(2),
        activeSubscriptions,
        refundRequests
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleVerifyPayment = async (transactionId) => {
    try {
      const { error } = await supabase
        ?.from('payment_transactions')
        ?.update({ status: 'completed', verified_at: new Date()?.toISOString() })
        ?.eq('id', transactionId);

      if (error) throw error;
      alert('Ödeme onaylandı!');
      loadPaymentData();
      loadMetrics();
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Ödeme onaylanamadı: ' + error?.message);
    }
  };

  const handleRejectPayment = async (transactionId) => {
    try {
      const { error } = await supabase
        ?.from('payment_transactions')
        ?.update({ status: 'rejected', verified_at: new Date()?.toISOString() })
        ?.eq('id', transactionId);

      if (error) throw error;
      alert('Ödeme reddedildi!');
      loadPaymentData();
      loadMetrics();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Ödeme reddedilemedi: ' + error?.message);
    }
  };

  const handleProcessRefund = async (transactionId) => {
    try {
      const { error } = await supabase
        ?.from('payment_transactions')
        ?.update({ status: 'refunded', refunded_at: new Date()?.toISOString() })
        ?.eq('id', transactionId);

      if (error) throw error;
      alert('İade işlendi!');
      loadPaymentData();
      loadMetrics();
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('İade işlenemedi: ' + error?.message);
    }
  };

  const filteredTransactions = transactions?.filter(t => {
    const matchesSearch = t?.user_profiles?.full_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         t?.user_profiles?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         t?.transaction_id?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    if (activeTab === 'pending') return t?.status === 'pending' && matchesSearch;
    if (activeTab === 'completed') return t?.status === 'completed' && matchesSearch;
    if (activeTab === 'refund') return (t?.status === 'refund_requested' || t?.status === 'refunded') && matchesSearch;
    return matchesSearch;
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="card-mobile">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors"
              >
                <Icon name="ArrowLeft" size={20} color="#ffffff" />
              </button>
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-lg">
                <Icon name="CreditCard" size={24} color="#ffffff" />
              </div>
              <div>
                <h1 className="text-responsive-h1 font-bold text-foreground">
                  Ödeme İşlemleri Merkezi
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Ödeme yönetimi ve finansal kontrol
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="card-mobile">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Bekleyen Ödemeler</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-400">{metrics?.pendingPayments}</p>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <Icon name="Clock" size={24} color="#facc15" />
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Toplam Gelir</p>
                <p className="text-xl sm:text-2xl font-bold text-green-400">₺{metrics?.totalRevenue}</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <Icon name="TrendingUp" size={24} color="#4ade80" />
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Aktif Abonelikler</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-400">{metrics?.activeSubscriptions}</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Icon name="Users" size={24} color="#60a5fa" />
              </div>
            </div>
          </div>

          <div className="card-mobile">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">İade Talepleri</p>
                <p className="text-xl sm:text-2xl font-bold text-red-400">{metrics?.refundRequests}</p>
              </div>
              <div className="bg-red-500/10 p-3 rounded-lg">
                <Icon name="AlertCircle" size={24} color="#f87171" />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Management */}
        <div className="card-mobile">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">İşlem Yönetimi</h2>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Kullanıcı veya işlem ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="w-full sm:w-64"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'pending' ?'bg-yellow-500 text-white' :'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Bekleyen ({metrics?.pendingPayments})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'completed'
                  ? 'bg-green-500 text-white' :'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Tamamlanan
            </button>
            <button
              onClick={() => setActiveTab('refund')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'refund' ?'bg-red-500 text-white' :'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              İadeler ({metrics?.refundRequests})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'all' ?'bg-blue-500 text-white' :'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Tümü
            </button>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Kullanıcı</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">İşlem ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Tutar</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Durum</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Tarih</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      İşlem bulunamadı
                    </td>
                  </tr>
                ) : (
                  filteredTransactions?.map((transaction) => (
                    <tr key={transaction?.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{transaction?.user_profiles?.full_name}</p>
                          <p className="text-xs text-slate-400">{transaction?.user_profiles?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300 font-mono text-sm">
                          {transaction?.transaction_id || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-green-400 font-semibold">
                          ₺{parseFloat(transaction?.amount || 0)?.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction?.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : transaction?.status === 'pending' ?'bg-yellow-500/20 text-yellow-400'
                              : transaction?.status === 'refunded' ?'bg-blue-500/20 text-blue-400' :'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {transaction?.status === 'completed'
                            ? 'Tamamlandı'
                            : transaction?.status === 'pending' ?'Bekliyor'
                            : transaction?.status === 'refunded' ?'İade Edildi' :'Reddedildi'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300 text-sm">
                          {new Date(transaction?.created_at)?.toLocaleDateString('tr-TR')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {transaction?.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => handleVerifyPayment(transaction?.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                              >
                                Onayla
                              </Button>
                              <Button
                                onClick={() => handleRejectPayment(transaction?.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                              >
                                Reddet
                              </Button>
                            </>
                          )}
                          {transaction?.status === 'refund_requested' && (
                            <Button
                              onClick={() => handleProcessRefund(transaction?.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                            >
                              İade Et
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="card-mobile">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Abonelik Yönetimi</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Kullanıcı</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Bitiş Tarihi</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Bakiye</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions?.slice(0, 10)?.map((sub) => (
                  <tr key={sub?.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{sub?.full_name}</p>
                        <p className="text-xs text-slate-400">{sub?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sub?.subscription_plan === 'premium' ?'bg-purple-500/20 text-purple-400'
                            : sub?.subscription_plan === 'professional' ?'bg-blue-500/20 text-blue-400' :'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {sub?.subscription_plan === 'premium' ?'Premium'
                          : sub?.subscription_plan === 'professional' ?'Professional' :'Deneme'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 text-sm">
                        {sub?.subscription_end_date
                          ? new Date(sub?.subscription_end_date)?.toLocaleDateString('tr-TR')
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-green-400 font-semibold">
                        ₺{parseFloat(sub?.balance || 0)?.toFixed(2)}
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

export default AdminPaymentOperationsCenter;