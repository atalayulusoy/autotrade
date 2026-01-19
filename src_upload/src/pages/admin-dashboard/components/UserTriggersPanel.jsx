import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const UserTriggersPanel = () => {
  const { user } = useAuth();
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    trigger_name: '',
    condition_type: 'price_above',
    condition_value: '',
    action_type: 'telegram_alert',
    symbol: 'BTC/USDT'
  });

  useEffect(() => {
    if (user) {
      loadTriggers();
    }
  }, [user]);

  const loadTriggers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        ?.from('user_triggers')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      setTriggers(data || []);
    } catch (error) {
      console.error('Error loading triggers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        ?.from('user_triggers')
        ?.insert({
          user_id: user?.id,
          ...formData,
          condition_value: parseFloat(formData?.condition_value)
        });

      if (error) throw error;

      setFormData({
        trigger_name: '',
        condition_type: 'price_above',
        condition_value: '',
        action_type: 'telegram_alert',
        symbol: 'BTC/USDT'
      });
      setShowAddForm(false);
      loadTriggers();
    } catch (error) {
      console.error('Error creating trigger:', error);
      alert('Tetikleyici oluşturulamadı: ' + error?.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrigger = async (triggerId, currentStatus) => {
    try {
      const { error } = await supabase
        ?.from('user_triggers')
        ?.update({ is_active: !currentStatus })
        ?.eq('id', triggerId);

      if (error) throw error;
      loadTriggers();
    } catch (error) {
      console.error('Error toggling trigger:', error);
    }
  };

  const deleteTrigger = async (triggerId) => {
    if (!window.confirm('Bu tetikleyiciyi silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        ?.from('user_triggers')
        ?.delete()
        ?.eq('id', triggerId);

      if (error) throw error;
      loadTriggers();
    } catch (error) {
      console.error('Error deleting trigger:', error);
    }
  };

  const conditionTypes = [
    { value: 'price_above', label: 'Fiyat Üstünde' },
    { value: 'price_below', label: 'Fiyat Altında' },
    { value: 'percentage_gain', label: 'Yüzde Kazanç' },
    { value: 'percentage_loss', label: 'Yüzde Kayıp' },
    { value: 'daily_loss_limit', label: 'Günlük Zarar Limiti' },
    { value: 'position_count', label: 'Pozisyon Sayısı' }
  ];

  const actionTypes = [
    { value: 'telegram_alert', label: 'Telegram Uyarısı' },
    { value: 'email_alert', label: 'Email Uyarısı' },
    { value: 'close_position', label: 'Pozisyon Kapat' },
    { value: 'stop_bot', label: 'Botu Durdur' },
    { value: 'reduce_position', label: 'Pozisyon Azalt' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Özel Tetikleyiciler</h2>
          <p className="text-sm text-slate-400 mt-1">Kendi uyarı kurallarınızı oluşturun</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="default"
        >
          <Icon name="Plus" size={16} />
          Yeni Tetikleyici
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Yeni Tetikleyici Oluştur</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tetikleyici Adı</label>
              <Input
                value={formData?.trigger_name}
                onChange={(e) => setFormData({ ...formData, trigger_name: e?.target?.value })}
                placeholder="Örn: BTC Fiyat Uyarısı"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Koşul Tipi</label>
                <select
                  value={formData?.condition_type}
                  onChange={(e) => setFormData({ ...formData, condition_type: e?.target?.value })}
                  className="w-full bg-slate-900/50 text-white border border-slate-700 rounded-lg px-4 py-2"
                >
                  {conditionTypes?.map((type) => (
                    <option key={type?.value} value={type?.value}>{type?.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Değer</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData?.condition_value}
                  onChange={(e) => setFormData({ ...formData, condition_value: e?.target?.value })}
                  placeholder="Örn: 50000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Aksiyon</label>
                <select
                  value={formData?.action_type}
                  onChange={(e) => setFormData({ ...formData, action_type: e?.target?.value })}
                  className="w-full bg-slate-900/50 text-white border border-slate-700 rounded-lg px-4 py-2"
                >
                  {actionTypes?.map((type) => (
                    <option key={type?.value} value={type?.value}>{type?.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sembol</label>
                <Input
                  value={formData?.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e?.target?.value })}
                  placeholder="BTC/USDT"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'Oluştur'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {loading && triggers?.length === 0 ? (
          <div className="text-center py-8 text-slate-400">Yükleniyor...</div>
        ) : triggers?.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Henüz tetikleyici oluşturmadınız
          </div>
        ) : (
          triggers?.map((trigger) => (
            <div
              key={trigger?.id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{trigger?.trigger_name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trigger?.is_active ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {trigger?.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Koşul:</span>
                      <span className="ml-2 text-slate-200">
                        {conditionTypes?.find(t => t?.value === trigger?.condition_type)?.label} - {trigger?.condition_value}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Aksiyon:</span>
                      <span className="ml-2 text-slate-200">
                        {actionTypes?.find(t => t?.value === trigger?.action_type)?.label}
                      </span>
                    </div>
                    {trigger?.symbol && (
                      <div>
                        <span className="text-slate-400">Sembol:</span>
                        <span className="ml-2 text-slate-200">{trigger?.symbol}</span>
                      </div>
                    )}
                    {trigger?.last_triggered_at && (
                      <div>
                        <span className="text-slate-400">Son Tetikleme:</span>
                        <span className="ml-2 text-slate-200">
                          {new Date(trigger?.last_triggered_at)?.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleTrigger(trigger?.id, trigger?.is_active)}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                    title={trigger?.is_active ? 'Devre Dışı Bırak' : 'Aktif Et'}
                  >
                    <Icon name={trigger?.is_active ? 'Pause' : 'Play'} size={16} className="text-white" />
                  </button>
                  <button
                    onClick={() => deleteTrigger(trigger?.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                    title="Sil"
                  >
                    <Icon name="Trash2" size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserTriggersPanel;