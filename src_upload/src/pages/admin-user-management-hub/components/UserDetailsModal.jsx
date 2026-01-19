import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const UserDetailsModal = ({ user, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [telegramId, setTelegramId] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    balance: 0,
    subscription_plan: 'free_trial'
  });

  useEffect(() => {
    loadUserDetails();
  }, [user?.id]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);

      // Load user profile
      const { data: profile, error: profileError } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', user?.id)
        ?.single();

      if (profileError) throw profileError;
      setUserData(profile);
      setFormData({
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        balance: profile?.balance || 0,
        subscription_plan: profile?.subscription_plan || 'free_trial'
      });

      // Load Telegram ID
      const { data: notifData } = await supabase
        ?.from('notification_preferences')
        ?.select('telegram_chat_id')
        ?.eq('user_id', user?.id)
        ?.single();

      setTelegramId(notifData?.telegram_chat_id || '');

      // Load API keys
      const { data: keysData } = await supabase
        ?.from('exchange_api_keys')
        ?.select('*')
        ?.eq('user_id', user?.id);

      setApiKeys(keysData || []);

      // Load recent trades
      const { data: tradesData } = await supabase
        ?.from('trading_operations')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.order('created_at', { ascending: false })
        ?.limit(5);

      setRecentTrades(tradesData || []);
    } catch (error) {
      console.error('Error loading user details:', error);
      alert('Kullanıcı detayları yüklenemedi: ' + error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Update user profile
      const { error: updateError } = await supabase
        ?.from('user_profiles')
        ?.update({
          full_name: formData?.full_name,
          email: formData?.email,
          balance: parseFloat(formData?.balance),
          subscription_plan: formData?.subscription_plan,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', user?.id);

      if (updateError) throw updateError;

      // Update Telegram ID
      if (telegramId) {
        const { error: notifError } = await supabase
          ?.from('notification_preferences')
          ?.upsert({
            user_id: user?.id,
            telegram_chat_id: telegramId,
            updated_at: new Date()?.toISOString()
          }, { onConflict: 'user_id' });

        if (notifError) console.error('Telegram ID update error:', notifError);
      }

      alert('Kullanıcı bilgileri güncellendi');
      setEditMode(false);
      await loadUserDetails();
    } catch (error) {
      console.error('Error saving user details:', error);
      alert('Güncelleme başarısız: ' + error?.message);
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
      await loadUserDetails();
      alert('API anahtarı güncellendi');
    } catch (error) {
      console.error('Error updating API key:', error);
      alert('API anahtarı güncellenemedi: ' + error?.message);
    }
  };

  const handlePackageChange = async () => {
    if (!selectedPackage || selectedMonths < 1 || selectedMonths > 12) {
      alert('Lütfen geçerli bir paket ve ay seçin (1-12 ay)');
      return;
    }

    try {
      setLoading(true);

      const startDate = new Date();
      const endDate = new Date();
      endDate?.setMonth(endDate?.getMonth() + selectedMonths);

      const { error } = await supabase
        ?.from('user_profiles')
        ?.update({
          subscription_plan: selectedPackage,
          subscription_start_date: startDate?.toISOString(),
          subscription_end_date: endDate?.toISOString(),
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', user?.id);

      if (error) throw error;

      alert(`Paket başarıyla güncellendi: ${selectedMonths} ay ${selectedPackage}`);
      setShowPackageModal(false);
      await loadUserDetails();
    } catch (error) {
      console.error('Error updating package:', error);
      alert('Paket güncellenemedi: ' + error?.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full border border-slate-700">
          <div className="text-white text-center py-8">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full border border-slate-700 my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Icon name="User" size={24} />
            Kullanıcı Detayları
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Icon name="Info" size={18} />
                Temel Bilgiler
              </h4>
              {!editMode && (
                <Button
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-1"
                >
                  <Icon name="Edit" size={14} />
                  Düzenle
                </Button>
              )}
            </div>

            {editMode ? (
              <div className="space-y-3">
                <Input
                  label="Kullanıcı Adı"
                  value={formData?.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e?.target?.value }))}
                />
                <Input
                  label="E-posta"
                  type="email"
                  value={formData?.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e?.target?.value }))}
                />
                <Input
                  label="Telegram ID"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e?.target?.value)}
                  placeholder="Telegram Chat ID"
                />
                <Input
                  label="Bakiye (TL)"
                  type="number"
                  step="0.01"
                  value={formData?.balance}
                  onChange={(e) => setFormData(prev => ({ ...prev, balance: e?.target?.value }))}
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
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} loading={loading} fullWidth>
                    Kaydet
                  </Button>
                  <Button variant="outline" onClick={() => setEditMode(false)} fullWidth>
                    İptal
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Kullanıcı Adı</p>
                    <p className="text-white font-medium">{userData?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">E-posta</p>
                    <p className="text-white font-medium">{userData?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Telegram ID</p>
                    <p className="text-white font-medium">{telegramId || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Bakiye</p>
                    <p className="text-green-400 font-semibold">₺{parseFloat(userData?.balance || 0)?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Abonelik</p>
                    <p className="text-white font-medium">
                      {userData?.subscription_plan === 'free_trial' ? 'Deneme' :
                       userData?.subscription_plan === 'basic' ? 'Temel' :
                       userData?.subscription_plan === 'premium' ? 'Premium' :
                       userData?.subscription_plan === 'enterprise' ? 'Elit' : 'Bilinmiyor'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Kayıt Tarihi</p>
                    <p className="text-white font-medium">{new Date(userData?.created_at)?.toLocaleDateString('tr-TR')}</p>
                  </div>
                  {userData?.subscription_end_date && (
                    <>
                      <div>
                        <p className="text-sm text-slate-400">Abonelik Başlangıç</p>
                        <p className="text-white font-medium">{new Date(userData?.subscription_start_date)?.toLocaleDateString('tr-TR')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Abonelik Bitiş</p>
                        <p className="text-white font-medium">{new Date(userData?.subscription_end_date)?.toLocaleDateString('tr-TR')}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => setShowPackageModal(true)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Icon name="Package" size={16} />
                    Paket Değiştir
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* API Keys */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Icon name="Key" size={18} />
              API Anahtarları ({apiKeys?.length})
            </h4>
            {apiKeys?.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {apiKeys?.map((key) => (
                  <div key={key?.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-400">{key?.exchange}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          key?.is_active ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                        }`}>
                          {key?.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          key?.verification_status === 'approved' ? 'bg-green-900/50 text-green-300' :
                          key?.verification_status === 'rejected'? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'
                        }`}>
                          {key?.verification_status === 'approved' ? 'Onaylı' :
                           key?.verification_status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-slate-400">API Key</label>
                        <input
                          type="text"
                          value={key?.api_key}
                          onChange={(e) => handleApiKeyUpdate(key?.id, 'api_key', e?.target?.value)}
                          className="w-full px-2 py-1 bg-slate-900 text-white text-xs rounded border border-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">API Secret</label>
                        <input
                          type="password"
                          value={key?.api_secret}
                          onChange={(e) => handleApiKeyUpdate(key?.id, 'api_secret', e?.target?.value)}
                          className="w-full px-2 py-1 bg-slate-900 text-white text-xs rounded border border-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      {key?.passphrase && (
                        <div>
                          <label className="text-xs text-slate-400">Passphrase</label>
                          <input
                            type="password"
                            value={key?.passphrase}
                            onChange={(e) => handleApiKeyUpdate(key?.id, 'passphrase', e?.target?.value)}
                            className="w-full px-2 py-1 bg-slate-900 text-white text-xs rounded border border-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">API anahtarı bulunmuyor</p>
            )}
          </div>

          {/* Recent Trades */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Icon name="TrendingUp" size={18} />
              Son İşlemler ({recentTrades?.length})
            </h4>
            {recentTrades?.length > 0 ? (
              <div className="space-y-2">
                {recentTrades?.map((trade) => (
                  <div key={trade?.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-600 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{trade?.symbol}</span>
                        <span className="text-xs text-slate-400">{trade?.exchange}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(trade?.created_at)?.toLocaleString('tr-TR')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">${parseFloat(trade?.amount_usdt || 0)?.toFixed(2)}</div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        trade?.status === 'completed' ? 'bg-green-900/50 text-green-300' :
                        trade?.status === 'failed'? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'
                      }`}>
                        {trade?.status === 'completed' ? 'Tamamlandı' :
                         trade?.status === 'failed' ? 'Başarısız' :
                         trade?.status === 'pending' ? 'Bekliyor' : trade?.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">İşlem bulunamadı</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-700">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>
      {/* Package Change Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Icon name="Package" size={20} />
                Paket Değiştir
              </h3>
              <button onClick={() => setShowPackageModal(false)} className="text-slate-400 hover:text-white">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Abonelik Paketi</label>
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e?.target?.value)}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="free_trial">7 Günlük Deneme</option>
                  <option value="basic">Temel Paket</option>
                  <option value="premium">Premium Paket</option>
                  <option value="enterprise">Elit Paket</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Süre (Ay)</label>
                <select
                  value={selectedMonths}
                  onChange={(e) => setSelectedMonths(parseInt(e?.target?.value))}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]?.map(month => (
                    <option key={month} value={month}>{month} Ay</option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  <Icon name="Info" size={14} className="inline mr-1" />
                  Seçilen süre sonunda kullanıcının trading işlemleri otomatik olarak devre dışı bırakılacaktır.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handlePackageChange} loading={loading} fullWidth>
                  Paketi Güncelle
                </Button>
                <Button variant="outline" onClick={() => setShowPackageModal(false)} fullWidth>
                  İptal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailsModal;
