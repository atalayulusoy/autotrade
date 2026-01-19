import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const UnifiedRiskDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [riskSettings, setRiskSettings] = useState({
    max_drawdown_percent: 15,
    daily_loss_limit_usdt: 500,
    max_leverage: 3,
    max_open_positions: 5,
    auto_halt_enabled: true,
    halt_on_drawdown_percent: 20,
    position_size_caps: [
      { pair: 'BTC/USDT', max_size_usdt: 1000 },
      { pair: 'ETH/USDT', max_size_usdt: 800 },
      { pair: 'XRP/USDT', max_size_usdt: 500 },
      { pair: 'ADA/USDT', max_size_usdt: 400 },
      { pair: 'SOL/USDT', max_size_usdt: 600 }
    ]
  });
  const [currentMetrics, setCurrentMetrics] = useState({
    current_drawdown: 0,
    daily_loss: 0,
    open_positions: 0,
    trading_halted: false
  });
  const [exchanges] = useState(['Binance', 'OKX', 'Bybit', 'Gate.io', 'BTCTURK']);

  useEffect(() => {
    if (user) {
      loadRiskSettings();
      loadCurrentMetrics();
    }
  }, [user]);

  const loadRiskSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        ?.from('unified_risk_settings')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.single();

      if (error && error?.code !== 'PGRST116') throw error;

      if (data) {
        setRiskSettings({
          max_drawdown_percent: data?.max_drawdown_percent || 15,
          daily_loss_limit_usdt: data?.daily_loss_limit_usdt || 500,
          max_leverage: data?.max_leverage || 3,
          max_open_positions: data?.max_open_positions || 5,
          auto_halt_enabled: data?.auto_halt_enabled ?? true,
          halt_on_drawdown_percent: data?.halt_on_drawdown_percent || 20,
          position_size_caps: data?.position_size_caps || riskSettings?.position_size_caps
        });
      }
    } catch (error) {
      console.error('Error loading risk settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentMetrics = async () => {
    try {
      const { data: positions } = await supabase
        ?.from('trading_operations')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.eq('status', 'waiting');

      const today = new Date();
      today?.setHours(0, 0, 0, 0);

      const { data: todayTrades } = await supabase
        ?.from('trading_operations')
        ?.select('actual_profit')
        ?.eq('user_id', user?.id)
        ?.gte('created_at', today?.toISOString());

      const dailyLoss = todayTrades?.reduce((sum, t) => sum + (t?.actual_profit < 0 ? Math.abs(t?.actual_profit) : 0), 0) || 0;

      const { data: metricsData } = await supabase
        ?.rpc('calculate_performance_metrics', {
          p_user_id: user?.id,
          p_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)?.toISOString(),
          p_end_date: new Date()?.toISOString()
        });

      const drawdownPercent = metricsData?.[0]?.max_drawdown ? (metricsData?.[0]?.max_drawdown * 100) : 0;

      setCurrentMetrics({
        current_drawdown: drawdownPercent,
        daily_loss: dailyLoss,
        open_positions: positions?.length || 0,
        trading_halted: false
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      const { data: existing } = await supabase
        ?.from('unified_risk_settings')
        ?.select('id')
        ?.eq('user_id', user?.id)
        ?.single();

      if (existing) {
        const { error } = await supabase
          ?.from('unified_risk_settings')
          ?.update({ ...riskSettings, updated_at: new Date()?.toISOString() })
          ?.eq('user_id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          ?.from('unified_risk_settings')
          ?.insert([{ ...riskSettings, user_id: user?.id }]);

        if (error) throw error;
      }

      alert('Risk ayarları başarıyla kaydedildi!');
      loadCurrentMetrics();
    } catch (error) {
      console.error('Error saving risk settings:', error);
      alert('Risk ayarları kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleEmergencyHalt = async () => {
    if (!confirm('Tüm borsalarda işlemleri durdurmak istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        ?.from('user_profiles')
        ?.update({ trading_enabled: false })
        ?.eq('id', user?.id);

      if (error) throw error;

      setCurrentMetrics(prev => ({ ...prev, trading_halted: true }));
      alert('Tüm işlemler durduruldu!');
    } catch (error) {
      console.error('Error halting trading:', error);
      alert('İşlemler durdurulurken hata oluştu.');
    }
  };

  const updatePositionCap = (pair, value) => {
    setRiskSettings(prev => ({
      ...prev,
      position_size_caps: prev?.position_size_caps?.map(cap =>
        cap?.pair === pair ? { ...cap, max_size_usdt: parseFloat(value) || 0 } : cap
      )
    }));
  };

  const getRiskLevelColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-400 bg-red-500/10';
    if (percentage >= 70) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-green-400 bg-green-500/10';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-mobile">
        {/* Header - Mobile Optimized */}
        <div className="card-mobile">
          <div className="flex-mobile-col">
            <div>
              <h1 className="text-responsive-h1 font-bold text-foreground mb-2">Birleşik Risk Yönetimi</h1>
              <p className="text-sm text-muted-foreground">Tüm borsalar için merkezi risk kontrol paneli</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={handleEmergencyHalt}
                className="btn-touch-primary bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
              >
                <Icon name="AlertTriangle" size={18} className="mr-2" />
                Acil Durdur
              </Button>
              <Button
                onClick={handleSaveSettings}
                loading={saving}
                disabled={saving}
                className="btn-touch-primary bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
              >
                {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
              </Button>
            </div>
          </div>
        </div>

        {/* Current Metrics Overview - Mobile Grid */}
        <div className="grid-mobile-2 lg:grid-cols-4">
          <div className={`card-mobile-compact ${getRiskLevelColor(currentMetrics?.current_drawdown, riskSettings?.max_drawdown_percent)}`}>
            <div className="flex items-center justify-between mb-2">
              <Icon name="TrendingDown" size={20} />
              <span className="text-xl sm:text-2xl font-bold">{currentMetrics?.current_drawdown?.toFixed(1)}%</span>
            </div>
            <p className="text-xs sm:text-sm opacity-80">Mevcut Drawdown</p>
            <p className="text-xs mt-1">Limit: {riskSettings?.max_drawdown_percent}%</p>
          </div>

          <div className={`card-mobile-compact ${getRiskLevelColor(currentMetrics?.daily_loss, riskSettings?.daily_loss_limit_usdt)}`}>
            <div className="flex items-center justify-between mb-2">
              <Icon name="DollarSign" size={20} />
              <span className="text-xl sm:text-2xl font-bold">${currentMetrics?.daily_loss?.toFixed(0)}</span>
            </div>
            <p className="text-xs sm:text-sm opacity-80">Günlük Zarar</p>
            <p className="text-xs mt-1">Limit: ${riskSettings?.daily_loss_limit_usdt}</p>
          </div>

          <div className={`card-mobile-compact ${getRiskLevelColor(currentMetrics?.open_positions, riskSettings?.max_open_positions)}`}>
            <div className="flex items-center justify-between mb-2">
              <Icon name="Layers" size={20} />
              <span className="text-xl sm:text-2xl font-bold">{currentMetrics?.open_positions}</span>
            </div>
            <p className="text-xs sm:text-sm opacity-80">Açık Pozisyonlar</p>
            <p className="text-xs mt-1">Limit: {riskSettings?.max_open_positions}</p>
          </div>

          <div className={`card-mobile-compact ${currentMetrics?.trading_halted ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}>
            <div className="flex items-center justify-between mb-2">
              <Icon name={currentMetrics?.trading_halted ? 'XCircle' : 'CheckCircle'} size={20} />
              <span className="text-base sm:text-xl font-bold">{currentMetrics?.trading_halted ? 'DURDURULDU' : 'AKTİF'}</span>
            </div>
            <p className="text-xs sm:text-sm opacity-80">İşlem Durumu</p>
            <p className="text-xs mt-1">Tüm Borsalar</p>
          </div>
        </div>

        {/* Global Risk Limits - Mobile Optimized */}
        <div className="card-mobile">
          <h2 className="text-responsive-h2 font-bold text-foreground mb-6 flex items-center gap-2">
            <Icon name="Shield" size={20} className="text-primary" />
            Global Risk Limitleri
          </h2>

          <div className="grid-mobile-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Maksimum Drawdown (%)
              </label>
              <Input
                type="number"
                value={riskSettings?.max_drawdown_percent}
                onChange={(e) => setRiskSettings(prev => ({ ...prev, max_drawdown_percent: parseFloat(e?.target?.value) || 0 }))}
                min="0"
                max="100"
                step="1"
                className="input-mobile"
              />
              <p className="text-xs text-muted-foreground mt-1">Portföy değerindeki maksimum düşüş oranı</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Günlük Zarar Limiti (USDT)
              </label>
              <Input
                type="number"
                value={riskSettings?.daily_loss_limit_usdt}
                onChange={(e) => setRiskSettings(prev => ({ ...prev, daily_loss_limit_usdt: parseFloat(e?.target?.value) || 0 }))}
                min="0"
                step="50"
                className="input-mobile"
              />
              <p className="text-xs text-muted-foreground mt-1">Günlük maksimum zarar tutarı</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Maksimum Kaldıraç (x)
              </label>
              <Input
                type="number"
                value={riskSettings?.max_leverage}
                onChange={(e) => setRiskSettings(prev => ({ ...prev, max_leverage: parseFloat(e?.target?.value) || 0 }))}
                min="1"
                max="125"
                step="1"
                className="input-mobile"
              />
              <p className="text-xs text-muted-foreground mt-1">İzin verilen maksimum kaldıraç oranı</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Maksimum Açık Pozisyon
              </label>
              <Input
                type="number"
                value={riskSettings?.max_open_positions}
                onChange={(e) => setRiskSettings(prev => ({ ...prev, max_open_positions: parseInt(e?.target?.value) || 0 }))}
                min="1"
                max="50"
                step="1"
                className="input-mobile"
              />
              <p className="text-xs text-muted-foreground mt-1">Aynı anda açık olabilecek maksimum pozisyon sayısı</p>
            </div>
          </div>
        </div>

        {/* Auto Halt Configuration - Mobile Optimized */}
        <div className="card-mobile">
          <h2 className="text-responsive-h2 font-bold text-foreground mb-6 flex items-center gap-2">
            <Icon name="AlertTriangle" size={20} className="text-warning" />
            Otomatik Durdurma
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium text-foreground mb-1">Otomatik Durdurma Etkin</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Risk limitleri aşıldığında işlemleri otomatik durdur</p>
              </div>
              <button
                onClick={() => setRiskSettings(prev => ({ ...prev, auto_halt_enabled: !prev?.auto_halt_enabled }))}
                className={`min-w-touch min-h-touch flex-shrink-0 relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                  riskSettings?.auto_halt_enabled ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                    riskSettings?.auto_halt_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {riskSettings?.auto_halt_enabled && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Durdurma Drawdown Eşiği (%)
                </label>
                <Input
                  type="number"
                  value={riskSettings?.halt_on_drawdown_percent}
                  onChange={(e) => setRiskSettings(prev => ({ ...prev, halt_on_drawdown_percent: parseFloat(e?.target?.value) || 0 }))}
                  min="0"
                  max="100"
                  step="1"
                  className="input-mobile"
                />
                <p className="text-xs text-muted-foreground mt-1">Bu drawdown seviyesine ulaşıldığında tüm işlemler durdurulur</p>
              </div>
            )}
          </div>
        </div>

        {/* Position Size Caps - Mobile Optimized */}
        <div className="card-mobile">
          <h2 className="text-responsive-h2 font-bold text-foreground mb-6 flex items-center gap-2">
            <Icon name="Layers" size={20} className="text-primary" />
            Parite Bazlı Pozisyon Limitleri
          </h2>

          <div className="space-y-3">
            {riskSettings?.position_size_caps?.map((cap, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-lg bg-muted">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm sm:text-base">{cap?.pair}</p>
                  <p className="text-xs text-muted-foreground">Maksimum pozisyon büyüklüğü</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Input
                    type="number"
                    value={cap?.max_size_usdt}
                    onChange={(e) => updatePositionCap(cap?.pair, e?.target?.value)}
                    min="0"
                    step="100"
                    className="input-mobile w-full sm:w-32"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">USDT</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exchange Coverage - Mobile Optimized */}
        <div className="card-mobile">
          <h2 className="text-responsive-h2 font-bold text-foreground mb-6 flex items-center gap-2">
            <Icon name="Globe" size={20} className="text-primary" />
            Borsa Kapsamı
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {exchanges?.map((exchange) => (
              <div key={exchange} className="card-mobile-compact bg-muted text-center">
                <Icon name="CheckCircle" size={20} className="text-success mx-auto mb-2" />
                <p className="font-medium text-foreground text-sm">{exchange}</p>
                <p className="text-xs text-success mt-1">Aktif</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium mb-1">Birleşik Risk Yönetimi</p>
                <p className="text-xs text-muted-foreground">
                  Bu ayarlar tüm bağlı borsalarda otomatik olarak uygulanır. Risk limitleri aşıldığında
                  sistem tüm borsalarda işlemleri durdurur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UnifiedRiskDashboard;