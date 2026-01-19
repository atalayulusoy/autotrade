import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';


const UserEditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    balance: user?.balance || 0,
    subscription_plan: user?.subscription_plan || 'free_trial',
    telegram_chat_id: ''
  });
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  const loadUserData = async () => {
    try {
      setLoadingData(true);
      
      // Load Telegram ID from notification_preferences
      const { data: notifData } = await supabase
        ?.from('notification_preferences')
        ?.select('telegram_chat_id')
        ?.eq('user_id', user?.id)
        ?.single();
      
      if (notifData?.telegram_chat_id) {
        setFormData(prev => ({ ...prev, telegram_chat_id: notifData?.telegram_chat_id }));
      }

      // Load API keys
      const { data: keysData } = await supabase
        ?.from('exchange_api_keys')
        ?.select('*')
        ?.eq('user_id', user?.id);
      
      setApiKeys(keysData || []);
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);

    try {
      const updates = {
        full_name: formData?.full_name,
        email: formData?.email,
        balance: parseFloat(formData?.balance),
        subscription_plan: formData?.subscription_plan
      };

      if (formData?.subscription_plan === 'free_trial') {
        updates.trial_end_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)?.toISOString();
      } else {
        updates.subscription_start_date = new Date()?.toISOString();
        updates.subscription_end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)?.toISOString();
      }

      const { error } = await supabase
        ?.from('user_profiles')
        ?.update(updates)
        ?.eq('id', user?.id);

      if (error) throw error;

      // Update Telegram ID
      if (formData?.telegram_chat_id) {
        const { error: notifError } = await supabase
          ?.from('notification_preferences')
          ?.upsert({
            user_id: user?.id,
            telegram_chat_id: formData?.telegram_chat_id,
            updated_at: new Date()?.toISOString()
          }, { onConflict: 'user_id' });
        
        if (notifError) console.error('Telegram ID update error:', notifError);
      }

      onSave?.();
      onClose?.();
    } catch (err) {
      alert('Güncelleme başarısız: ' + err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeyUpdate = async (keyId, field, value) => {
    try {
      const { error } = await supabase
        ?.from('exchange_api_keys')
        ?.update({ [field]: value })
        ?.eq('id', keyId);
      
      if (error) throw error;
      await loadUserData();
    } catch (err) {
      alert('API key güncellenemedi: ' + err?.message);
    }
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700">
          <div className="text-white text-center py-8">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700 my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Kullanıcıyı Düzenle</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Kullanıcı Adı"
            value={formData?.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e?.target?.value }))}
            required
          />

          <Input
            label="E-posta"
            type="email"
            value={formData?.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e?.target?.value }))}
            required
          />

          <Input
            label="Telegram ID"
            value={formData?.telegram_chat_id}
            onChange={(e) => setFormData(prev => ({ ...prev, telegram_chat_id: e?.target?.value }))}
            placeholder="Telegram Chat ID"
          />

          <Input
            label="Bakiye (TL)"
            type="number"
            step="0.01"
            value={formData?.balance}
            onChange={(e) => setFormData(prev => ({ ...prev, balance: e?.target?.value }))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Abonelik Paketi</label>
            <select
              value={formData?.subscription_plan}
              onChange={(e) => setFormData(prev => ({ ...prev, subscription_plan: e?.target?.value }))}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="free_trial">7 Günlük Deneme</option>
              <option value="basic">Temel Paket</option>
              <option value="premium">Premium Paket</option>
              <option value="enterprise">Elit Paket</option>
            </select>
          </div>

          {/* API Keys Section */}
          <div className="border-t border-slate-700 pt-4 mt-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Icon name="Key" size={18} />
              API Anahtarları
            </h4>
            {apiKeys?.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {apiKeys?.map((key) => (
                  <div key={key?.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-400">{key?.exchange}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        key?.is_active ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                      }`}>
                        {key?.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-slate-400">API Key</label>
                        <input
                          type="text"
                          value={key?.api_key}
                          onChange={(e) => handleApiKeyUpdate(key?.id, 'api_key', e?.target?.value)}
                          className="w-full px-2 py-1 bg-slate-800 text-white text-xs rounded border border-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">API Secret</label>
                        <input
                          type="password"
                          value={key?.api_secret}
                          onChange={(e) => handleApiKeyUpdate(key?.id, 'api_secret', e?.target?.value)}
                          className="w-full px-2 py-1 bg-slate-800 text-white text-xs rounded border border-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      {key?.passphrase && (
                        <div>
                          <label className="text-xs text-slate-400">Passphrase</label>
                          <input
                            type="password"
                            value={key?.passphrase}
                            onChange={(e) => handleApiKeyUpdate(key?.id, 'passphrase', e?.target?.value)}
                            className="w-full px-2 py-1 bg-slate-800 text-white text-xs rounded border border-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Bu kullanıcının API anahtarı bulunmuyor</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} fullWidth>
              İptal
            </Button>
            <Button type="submit" loading={loading} disabled={loading} fullWidth>
              Kaydet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserManagementPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError(err?.message || 'Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase?.from('user_profiles')?.update({ is_active: !currentStatus })?.eq('id', userId);

      if (error) throw error;
      await loadUsers();
    } catch (err) {
      alert('Durum güncellenemedi: ' + err?.message);
    }
  };

  const filteredUsers = users?.filter(user =>
    user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    user?.full_name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  if (loading) {
    return <div className="text-white text-center py-8">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-8">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={loadUsers}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Kullanıcı Yönetimi</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
          />
          <Button onClick={loadUsers} variant="outline" size="sm">
            <Icon name="RefreshCw" size={16} />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-slate-400 font-medium py-3 px-4">Kullanıcı</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">E-posta</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">Rol</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">Abonelik</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">Bakiye</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">Durum</th>
              <th className="text-left text-slate-400 font-medium py-3 px-4">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map((user) => (
              <tr key={user?.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.full_name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white font-medium">{user?.full_name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-300">{user?.email}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user?.role === 'admin' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'
                  }`}>
                    {user?.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-purple-400 text-sm">
                    {user?.subscription_plan === 'free_trial' ? 'Deneme' :
                     user?.subscription_plan === 'basic' ? 'Temel' :
                     user?.subscription_plan === 'premium' ? 'Premium' :
                     user?.subscription_plan === 'enterprise' ? 'Elit' : 'Yok'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-green-400 font-medium">
                    {parseFloat(user?.balance || 0)?.toFixed(2)} TL
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleUserStatus(user?.id, user?.is_active)}
                    className="flex items-center gap-2"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      user?.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className={`text-sm ${
                      user?.is_active ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {user?.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </button>
                </td>
                <td className="py-3 px-4">
                  <Button
                    onClick={() => setEditingUser(user)}
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="Edit" size={16} />
                    <span className="ml-1">Düzenle</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers?.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          Kullanıcı bulunamadı
        </div>
      )}
    </div>
  );
};

export default UserManagementPanel;