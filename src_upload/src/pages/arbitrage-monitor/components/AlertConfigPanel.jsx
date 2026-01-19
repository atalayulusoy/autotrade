import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Save, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';

const AlertConfigPanel = ({ userProfile, minSpread, onUpdate }) => {
  const [config, setConfig] = useState({
    emailEnabled: true,
    pushEnabled: false,
    telegramEnabled: false,
    minSpreadThreshold: 1.0,
    minProfitAmount: 50,
    alertFrequency: 'immediate',
    selectedPairs: []
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tradingPairs = [
    'BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'ADA/USDT', 'SOL/USDT',
    'DOGE/USDT', 'MATIC/USDT', 'DOT/USDT', 'AVAX/USDT', 'LINK/USDT'
  ];

  useEffect(() => {
    loadAlertConfig();
  }, [userProfile]);

  const loadAlertConfig = async () => {
    try {
      const { data } = await supabase
        ?.from('user_triggers')
        ?.select('*')
        ?.eq('user_id', userProfile?.id)
        ?.eq('trigger_name', 'arbitrage_alert')
        ?.single();

      if (data?.metadata) {
        setConfig(data?.metadata);
      }
    } catch (err) {
      console.error('Error loading alert config:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        ?.from('user_triggers')
        ?.upsert({
          user_id: userProfile?.id,
          trigger_name: 'arbitrage_alert',
          condition_type: 'percentage_gain',
          condition_value: config?.minSpreadThreshold,
          action_type: config?.emailEnabled ? 'email_alert' : 'telegram_alert',
          is_active: true,
          metadata: config
        });

      if (error) throw error;
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onUpdate();
    } catch (err) {
      console.error('Error saving alert config:', err);
      alert('Ayarlar kaydedilemedi: ' + err?.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePair = (pair) => {
    setConfig(prev => ({
      ...prev,
      selectedPairs: prev?.selectedPairs?.includes(pair)
        ? prev?.selectedPairs?.filter(p => p !== pair)
        : [...prev?.selectedPairs, pair]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell size={20} className="text-primary" />
          Bildirim Kanalları
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-blue-500" />
              <div>
                <p className="font-medium text-foreground">E-posta Bildirimleri</p>
                <p className="text-sm text-muted-foreground">Fırsatlar e-posta ile gönderilsin</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config?.emailEnabled}
              onChange={(e) => setConfig({ ...config, emailEnabled: e?.target?.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
            <div className="flex items-center gap-3">
              <Smartphone size={20} className="text-green-500" />
              <div>
                <p className="font-medium text-foreground">Push Bildirimleri</p>
                <p className="text-sm text-muted-foreground">Mobil cihaza anlık bildirim</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config?.pushEnabled}
              onChange={(e) => setConfig({ ...config, pushEnabled: e?.target?.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-purple-500" />
              <div>
                <p className="font-medium text-foreground">Telegram Bildirimleri</p>
                <p className="text-sm text-muted-foreground">Telegram üzerinden bildirim</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config?.telegramEnabled}
              onChange={(e) => setConfig({ ...config, telegramEnabled: e?.target?.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Uyarı Eşikleri</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Minimum Spread (%)</label>
            <input
              type="number"
              value={config?.minSpreadThreshold}
              onChange={(e) => setConfig({ ...config, minSpreadThreshold: parseFloat(e?.target?.value) })}
              step="0.1"
              min="0"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">Bu değerin üzerindeki fırsatlar için bildirim alın</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Minimum Kar Miktarı ($)</label>
            <input
              type="number"
              value={config?.minProfitAmount}
              onChange={(e) => setConfig({ ...config, minProfitAmount: parseFloat(e?.target?.value) })}
              step="10"
              min="0"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">Tahmini kar bu miktarın üzerinde olmalı</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Bildirim Sıklığı</label>
            <select
              value={config?.alertFrequency}
              onChange={(e) => setConfig({ ...config, alertFrequency: e?.target?.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
            >
              <option value="immediate">Anında</option>
              <option value="5min">5 Dakikada Bir</option>
              <option value="15min">15 Dakikada Bir</option>
              <option value="hourly">Saatlik</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pair Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">İzlenecek Çiftler</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {tradingPairs?.map(pair => (
            <button
              key={pair}
              onClick={() => togglePair(pair)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                config?.selectedPairs?.includes(pair)
                  ? 'bg-primary text-white' :'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {pair}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          {config?.selectedPairs?.length === 0 ? 'Tüm çiftler izleniyor' : `${config?.selectedPairs?.length} çift seçildi`}
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || saved}
          className="flex items-center gap-2"
        >
          {saved ? (
            <>
              <Check size={16} />
              Kaydedildi
            </>
          ) : (
            <>
              <Save size={16} />
              {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AlertConfigPanel;