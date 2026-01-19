import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const RiskManagementPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [riskLimits, setRiskLimits] = useState({
    max_position_size_usdt: 1000,
    max_leverage: 3,
    daily_loss_limit_usdt: 500,
    max_open_positions: 5,
    drawdown_alert_threshold: 10
  });
  const [currentDrawdown, setCurrentDrawdown] = useState(0);
  const [showDrawdownAlert, setShowDrawdownAlert] = useState(false);

  useEffect(() => {
    if (user) {
      loadRiskLimits();
      loadCurrentDrawdown();
    }
  }, [user]);

  useEffect(() => {
    if (currentDrawdown >= riskLimits?.drawdown_alert_threshold) {
      setShowDrawdownAlert(true);
    } else {
      setShowDrawdownAlert(false);
    }
  }, [currentDrawdown, riskLimits?.drawdown_alert_threshold]);

  const loadRiskLimits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        ?.from('risk_limits')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.single();

      if (error && error?.code !== 'PGRST116') throw error;

      if (data) {
        setRiskLimits({
          max_position_size_usdt: data?.max_position_size_usdt || 1000,
          max_leverage: data?.max_leverage || 3,
          daily_loss_limit_usdt: data?.daily_loss_limit_usdt || 500,
          max_open_positions: data?.max_open_positions || 5,
          drawdown_alert_threshold: data?.drawdown_alert_threshold || 10
        });
      }
    } catch (error) {
      console.error('Error loading risk limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentDrawdown = async () => {
    try {
      const { data, error } = await supabase
        ?.rpc('calculate_performance_metrics', {
          p_user_id: user?.id,
          p_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)?.toISOString(),
          p_end_date: new Date()?.toISOString()
        });

      if (error) throw error;

      if (data && data?.length > 0) {
        const drawdownPercent = (data?.[0]?.max_drawdown || 0) * 100;
        setCurrentDrawdown(drawdownPercent);
      }
    } catch (error) {
      console.error('Error loading drawdown:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setRiskLimits(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { data: existing } = await supabase
        ?.from('risk_limits')
        ?.select('id')
        ?.eq('user_id', user?.id)
        ?.single();

      if (existing) {
        const { error } = await supabase
          ?.from('risk_limits')
          ?.update(riskLimits)
          ?.eq('user_id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          ?.from('risk_limits')
          ?.insert([{ ...riskLimits, user_id: user?.id }]);

        if (error) throw error;
      }

      alert('Risk limitleri başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving risk limits:', error);
      alert('Risk limitleri kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const getRiskLevel = (leverage) => {
    if (leverage <= 2) return { text: 'Düşük Risk', color: 'text-green-400' };
    if (leverage <= 5) return { text: 'Orta Risk', color: 'text-yellow-400' };
    return { text: 'Yüksek Risk', color: 'text-red-400' };
  };

  const riskLevel = getRiskLevel(riskLimits?.max_leverage);

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="text-center py-8 text-slate-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Risk Yönetimi</h2>
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      {/* Drawdown Alert */}
      {showDrawdownAlert && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Icon name="AlertTriangle" size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-400 font-bold mb-1">Maksimum Drawdown Uyarısı!</h3>
              <p className="text-slate-300 text-sm">
                Mevcut drawdown ({currentDrawdown?.toFixed(1)}%) belirlediğiniz eşik değerini ({riskLimits?.drawdown_alert_threshold}%) aştı. 
                Pozisyonlarınızı gözden geçirmeniz önerilir.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position Sizing Limits */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
              <Icon name="DollarSign" size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold">Pozisyon Büyüklüğü Limiti</h3>
              <p className="text-slate-400 text-sm">Tek bir pozisyon için maksimum tutar</p>
            </div>
          </div>
          <Input
            type="number"
            label="Maksimum Pozisyon Büyüklüğü (USDT)"
            value={riskLimits?.max_position_size_usdt}
            onChange={(e) => handleInputChange('max_position_size_usdt', e?.target?.value)}
            min="0"
            step="100"
            className="w-full"
          />
        </div>

        {/* Leverage Controls */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
              <Icon name="TrendingUp" size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold">Kaldıraç Kontrolü</h3>
              <p className="text-slate-400 text-sm">Maksimum kaldıraç oranı</p>
            </div>
          </div>
          <Input
            type="number"
            label="Maksimum Kaldıraç (x)"
            value={riskLimits?.max_leverage}
            onChange={(e) => handleInputChange('max_leverage', e?.target?.value)}
            min="1"
            max="20"
            step="0.5"
            className="w-full"
          />
          <div className="mt-3 flex items-center gap-2">
            <span className="text-slate-400 text-sm">Risk Seviyesi:</span>
            <span className={`font-bold ${riskLevel?.color}`}>{riskLevel?.text}</span>
          </div>
        </div>

        {/* Daily Loss Limit */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-red-500/10 text-red-400">
              <Icon name="AlertCircle" size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold">Günlük Zarar Limiti</h3>
              <p className="text-slate-400 text-sm">Günlük maksimum zarar tutarı</p>
            </div>
          </div>
          <Input
            type="number"
            label="Günlük Zarar Limiti (USDT)"
            value={riskLimits?.daily_loss_limit_usdt}
            onChange={(e) => handleInputChange('daily_loss_limit_usdt', e?.target?.value)}
            min="0"
            step="50"
            className="w-full"
          />
        </div>

        {/* Max Open Positions */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-green-500/10 text-green-400">
              <Icon name="Layers" size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold">Maksimum Açık Pozisyon</h3>
              <p className="text-slate-400 text-sm">Aynı anda açık olabilecek pozisyon sayısı</p>
            </div>
          </div>
          <Input
            type="number"
            label="Maksimum Açık Pozisyon Sayısı"
            value={riskLimits?.max_open_positions}
            onChange={(e) => handleInputChange('max_open_positions', e?.target?.value)}
            min="1"
            max="20"
            step="1"
            className="w-full"
          />
        </div>
      </div>

      {/* Drawdown Alert Threshold */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-orange-500/10 text-orange-400">
            <Icon name="TrendingDown" size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold">Maksimum Drawdown Uyarı Eşiği</h3>
            <p className="text-slate-400 text-sm">Bu değer aşıldığında uyarı alırsınız</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Uyarı Eşiği (%)"
            value={riskLimits?.drawdown_alert_threshold}
            onChange={(e) => handleInputChange('drawdown_alert_threshold', e?.target?.value)}
            min="1"
            max="50"
            step="1"
            className="w-full"
          />
          <div className="flex flex-col justify-end">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Mevcut Drawdown</p>
              <p className={`text-2xl font-bold ${
                currentDrawdown >= riskLimits?.drawdown_alert_threshold 
                  ? 'text-red-400' :'text-green-400'
              }`}>
                {currentDrawdown?.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Summary */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Icon name="Shield" size={20} className="text-blue-400" />
          Risk Özeti
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Maksimum Risk / Pozisyon</p>
            <p className="text-white text-xl font-bold">{riskLimits?.max_position_size_usdt} USDT</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Toplam Maksimum Risk</p>
            <p className="text-white text-xl font-bold">
              {(riskLimits?.max_position_size_usdt * riskLimits?.max_open_positions)?.toFixed(0)} USDT
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Günlük Koruma</p>
            <p className="text-white text-xl font-bold">{riskLimits?.daily_loss_limit_usdt} USDT</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskManagementPanel;