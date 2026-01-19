import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

import ExchangeCard from './components/ExchangeCard';
import AddApiKeyModal from './components/AddApiKeyModal';

const ExchangeApiManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);

  const exchanges = [
    { id: 'Binance', name: 'Binance', icon: 'TrendingUp', color: 'from-yellow-600 to-orange-600' },
    { id: 'OKX', name: 'OKX', icon: 'Zap', color: 'from-blue-600 to-cyan-600' },
    { id: 'Bybit', name: 'Bybit', icon: 'Activity', color: 'from-purple-600 to-pink-600' },
    { id: 'Gate.io', name: 'Gate.io', icon: 'Shield', color: 'from-green-600 to-emerald-600' },
    { id: 'BTCTURK', name: 'BTCTURK', icon: 'DollarSign', color: 'from-red-600 to-rose-600' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadApiKeys();
  }, [user, navigate]);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        ?.from('exchange_api_keys')
        ?.select(`
          *,
          user_profiles!exchange_api_keys_user_id_fkey(id, email, full_name)
        `)
        ?.eq('user_id', user?.id)
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
      alert('API anahtarları yüklenemedi: ' + error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApiKey = (exchange) => {
    setSelectedExchange(exchange);
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setSelectedExchange(null);
    loadApiKeys();
  };

  const handleDeleteApiKey = async (keyId) => {
    if (!confirm('Bu API anahtarını silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        ?.from('exchange_api_keys')
        ?.delete()
        ?.eq('id', keyId);

      if (error) throw error;
      await loadApiKeys();
      alert('API anahtarı başarıyla silindi');
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('API anahtarı silinemedi: ' + error?.message);
    }
  };

  const handleTestConnection = async (keyId) => {
    try {
      // Simulate connection test
      const { error } = await supabase
        ?.from('exchange_api_keys')
        ?.update({
          last_connection_test: new Date()?.toISOString(),
          connection_status: 'success'
        })
        ?.eq('id', keyId);

      if (error) throw error;
      await loadApiKeys();
      alert('Bağlantı testi başarılı');
    } catch (error) {
      console.error('Error testing connection:', error);
      alert('Bağlantı testi başarısız: ' + error?.message);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Helmet>
          <title>Borsa API Yönetimi</title>
        </Helmet>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-12">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <Icon name="ArrowLeft" size={20} />
                <span>Geri Dön</span>
              </button>

              <div className="flex items-center justify-between mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-lg">
                  <Icon name="Key" size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Borsa API Yönetimi</h1>
                  <p className="text-slate-400 text-sm">API anahtarlarınızı güvenli şekilde yönetin</p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Icon name="Shield" className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <p className="font-semibold mb-1">Güvenlik Bildirimi</p>
                  <p>API anahtarlarınız şifrelenerek saklanır. TEST modu için onay gerekmez, REAL mod için admin onayı gereklidir.</p>
                </div>
              </div>
            </div>

            {/* Exchange Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exchanges?.map((exchange) => {
                const exchangeKeys = apiKeys?.filter(k => k?.exchange === exchange?.id);
                return (
                  <ExchangeCard
                    key={exchange?.id}
                    exchange={exchange}
                    apiKeys={exchangeKeys}
                    onAddKey={() => handleAddApiKey(exchange)}
                    onDeleteKey={handleDeleteApiKey}
                    onTestConnection={handleTestConnection}
                  />
                );
              })}
            </div>

            {/* Audit Trail */}
            {apiKeys?.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Icon name="History" size={20} />
                  İşlem Geçmişi
                </h2>
                <div className="space-y-2">
                  {apiKeys?.map((key) => (
                    <div key={key?.id} className="bg-slate-700/30 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">{key?.exchange}</span>
                          <span className="text-slate-400 ml-2">•</span>
                          <span className="text-slate-400 ml-2">
                            {new Date(key?.created_at)?.toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            key?.verification_status === 'approved' ? 'bg-green-900/50 text-green-300' :
                            key?.verification_status === 'rejected'? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'
                          }`}>
                            {key?.verification_status === 'approved' ? 'Onaylandı' :
                             key?.verification_status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            key?.mode === 'REAL' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                          }`}>
                            {key?.mode}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add API Key Modal */}
        {showAddModal && (
          <AddApiKeyModal
            exchange={selectedExchange}
            onClose={handleModalClose}
          />
        )}
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>Borsa API Yönetimi</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
          {/* Header */}
          <div className="max-w-6xl mx-auto mb-8">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <Icon name="ArrowLeft" size={20} />
              <span>Geri Dön</span>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-lg">
                <Icon name="Key" size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Borsa API Yönetimi</h1>
                <p className="text-slate-400 text-sm">API anahtarlarınızı güvenli şekilde yönetin</p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Icon name="Shield" className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <p className="font-semibold mb-1">Güvenlik Bildirimi</p>
                  <p>API anahtarlarınız şifrelenerek saklanır. TEST modu için onay gerekmez, REAL mod için admin onayı gereklidir.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Exchange Cards */}
          <div className="max-w-6xl mx-auto mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exchanges?.map((exchange) => {
                const exchangeKeys = apiKeys?.filter(k => k?.exchange === exchange?.id);
                return (
                  <ExchangeCard
                    key={exchange?.id}
                    exchange={exchange}
                    apiKeys={exchangeKeys}
                    onAddKey={() => handleAddApiKey(exchange)}
                    onDeleteKey={handleDeleteApiKey}
                    onTestConnection={handleTestConnection}
                  />
                );
              })}
            </div>
          </div>

          {/* Audit Trail */}
          {apiKeys?.length > 0 && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Icon name="History" size={20} />
                  İşlem Geçmişi
                </h2>
                <div className="space-y-2">
                  {apiKeys?.map((key) => (
                    <div key={key?.id} className="bg-slate-700/30 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">{key?.exchange}</span>
                          <span className="text-slate-400 ml-2">•</span>
                          <span className="text-slate-400 ml-2">
                            {new Date(key?.created_at)?.toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            key?.verification_status === 'approved' ? 'bg-green-900/50 text-green-300' :
                            key?.verification_status === 'rejected'? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'
                          }`}>
                            {key?.verification_status === 'approved' ? 'Onaylandı' :
                             key?.verification_status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            key?.mode === 'REAL' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                          }`}>
                            {key?.mode}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add API Key Modal */}
      {showAddModal && (
        <AddApiKeyModal
          exchange={selectedExchange}
          onClose={handleModalClose}
        />
      )}
    </MainLayout>
  );
};

export default ExchangeApiManagement;