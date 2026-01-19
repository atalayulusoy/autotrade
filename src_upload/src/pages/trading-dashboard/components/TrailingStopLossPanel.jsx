import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TrailingStopLossPanel = ({ operationId, currentPrice, symbol }) => {
  const { user } = useAuth();
  const [trailingPercentage, setTrailingPercentage] = useState('2.0');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const enableTrailingStop = async () => {
    try {
      setLoading(true);
      const percentage = parseFloat(trailingPercentage);
      const stopPrice = currentPrice * (1 - percentage / 100);

      const { error } = await supabase
        ?.from('trailing_stop_loss')
        ?.insert({
          user_id: user?.id,
          operation_id: operationId,
          initial_price: currentPrice,
          trailing_percentage: percentage,
          highest_price: currentPrice,
          stop_price: stopPrice,
          is_active: true
        });

      if (error) throw error;

      setIsActive(true);
      alert('Trailing Stop Loss aktif edildi!');
    } catch (error) {
      console.error('Error enabling trailing stop:', error);
      alert('Trailing Stop Loss aktif edilemedi: ' + error?.message);
    } finally {
      setLoading(false);
    }
  };

  const disableTrailingStop = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        ?.from('trailing_stop_loss')
        ?.update({ is_active: false })
        ?.eq('operation_id', operationId)
        ?.eq('is_active', true);

      if (error) throw error;

      setIsActive(false);
      alert('Trailing Stop Loss devre dışı bırakıldı!');
    } catch (error) {
      console.error('Error disabling trailing stop:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Shield" size={18} className="text-green-400" />
        <h3 className="font-semibold text-white">Trailing Stop Loss</h3>
        <span className={`ml-auto px-2 py-1 rounded text-xs font-medium ${
          isActive ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'
        }`}>
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Takip Yüzdes i (%)</label>
          <Input
            type="number"
            step="0.1"
            value={trailingPercentage}
            onChange={(e) => setTrailingPercentage(e?.target?.value)}
            disabled={isActive}
            placeholder="2.0"
          />
          <p className="text-xs text-slate-500 mt-1">
            Fiyat %{trailingPercentage} düştüğünde otomatik satış
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Mevcut Fiyat:</span>
            <span className="text-white font-medium">{currentPrice?.toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Stop Fiyatı:</span>
            <span className="text-red-400 font-medium">
              {(currentPrice * (1 - parseFloat(trailingPercentage) / 100))?.toFixed(2)} USDT
            </span>
          </div>
        </div>

        {!isActive ? (
          <Button
            onClick={enableTrailingStop}
            disabled={loading || !trailingPercentage}
            className="w-full"
          >
            {loading ? 'Aktif Ediliyor...' : 'Trailing Stop Aktif Et'}
          </Button>
        ) : (
          <Button
            onClick={disableTrailingStop}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Devre Dışı Bırakılıyor...' : 'Devre Dışı Bırak'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TrailingStopLossPanel;