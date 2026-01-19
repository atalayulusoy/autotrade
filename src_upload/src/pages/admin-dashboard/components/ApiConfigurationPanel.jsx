import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ApiConfigurationPanel = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    exchange: 'OKX',
    apiKey: '',
    apiSecret: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [keysResult, usersResult] = await Promise.all([
        supabase?.from('exchange_api_keys')?.select(`
            *,
            user_profiles (full_name, email)
          `)?.order('created_at', { ascending: false }),
        supabase?.from('user_profiles')?.select('id, full_name, email')?.eq('role', 'user')
      ]);

      if (keysResult?.error) throw keysResult?.error;
      if (usersResult?.error) throw usersResult?.error;

      setApiKeys(keysResult?.data || []);
      setUsers(usersResult?.data || []);
    } catch (err) {
      setError(err?.message || 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddApiKey = async (e) => {
    e?.preventDefault();

    try {
      const { error } = await supabase?.from('exchange_api_keys')?.insert({
          user_id: formData?.userId,
          exchange: formData?.exchange,
          api_key: formData?.apiKey,
          api_secret: formData?.apiSecret,
          is_active: true
        });

      if (error) throw error;

      setFormData({ userId: '', exchange: 'OKX', apiKey: '', apiSecret: '' });
      setShowAddForm(false);
      await loadData();
    } catch (err) {
      alert('API anahtarı eklenemedi: ' + err?.message);
    }
  };

  const toggleApiKeyStatus = async (keyId, currentStatus) => {
    try {
      const { error } = await supabase?.from('exchange_api_keys')?.update({ is_active: !currentStatus })?.eq('id', keyId);

      if (error) throw error;
      await loadData();
    } catch (err) {
      alert('Durum güncellenemedi: ' + err?.message);
    }
  };

  const deleteApiKey = async (keyId) => {
    if (!confirm('Bu API anahtarını silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase?.from('exchange_api_keys')?.delete()?.eq('id', keyId);

      if (error) throw error;
      await loadData();
    } catch (err) {
      alert('API anahtarı silinemedi: ' + err?.message);
    }
  };

  const exchangeOptions = [
    { value: 'OKX', label: 'OKX' },
    { value: 'Binance', label: 'Binance' },
    { value: 'Bybit', label: 'Bybit' },
    { value: 'Gate.io', label: 'Gate.io' },
    { value: 'BTCTURK', label: 'BTCTURK' }
  ];

  if (loading) {
    return <div className="text-white text-center py-8">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-8">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">API Anahtar Yönetimi</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="default"
          size="sm"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Yeni API Anahtarı
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-slate-700/50 p-4 rounded-lg mb-4">
          <h3 className="text-white font-semibold mb-4">Yeni API Anahtarı Ekle</h3>
          <form onSubmit={handleAddApiKey} className="space-y-4">
            <Select
              label="Kullanıcı"
              value={formData?.userId}
              onChange={(e) => setFormData({ ...formData, userId: e?.target?.value })}
              required
            >
              <option value="">Kullanıcı seçin</option>
              {users?.map((user) => (
                <option key={user?.id} value={user?.id}>
                  {user?.full_name} ({user?.email})
                </option>
              ))}
            </Select>

            <Select
              label="Borsa"
              value={formData?.exchange}
              onChange={(e) => setFormData({ ...formData, exchange: e?.target?.value })}
              required
            >
              {exchangeOptions?.map((option) => (
                <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </Select>

            <Input
              label="API Key"
              type="text"
              value={formData?.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e?.target?.value })}
              placeholder="API anahtarını giriniz"
              required
            />

            <Input
              label="API Secret"
              type="password"
              value={formData?.apiSecret}
              onChange={(e) => setFormData({ ...formData, apiSecret: e?.target?.value })}
              placeholder="API secret giriniz"
              required
            />

            <div className="flex gap-2">
              <Button type="submit" variant="default" size="sm">
                Kaydet
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddForm(false)}
                variant="outline"
                size="sm"
              >
                İptal
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-slate-400 font-medium py-3 px-4">Kullanıcı</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">Borsa</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">API Key</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">Durum</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys?.map((key) => (
              <tr key={key?.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="py-3 px-4 text-white">
                  {key?.user_profiles?.full_name}
                  <div className="text-xs text-slate-400">{key?.user_profiles?.email}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs font-medium">
                    {key?.exchange}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300 font-mono text-sm">
                  {key?.api_key?.substring(0, 20)}...
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      key?.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={key?.is_active ? 'text-green-400' : 'text-red-400'}>
                      {key?.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleApiKeyStatus(key?.id, key?.is_active)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      {key?.is_active ? 'Devre Dışı' : 'Aktifleştir'}
                    </button>
                    <button
                      onClick={() => deleteApiKey(key?.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {apiKeys?.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          Henüz API anahtarı eklenmemiş
        </div>
      )}
    </div>
  );
};

export default ApiConfigurationPanel;