import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmergencyStopButton = ({ onStop }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEmergencyStop = async () => {
    try {
      setLoading(true);

      // Get all open positions
      const { data: openPositions, error: fetchError } = await supabase
        ?.from('trading_operations')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.in('status', ['pending', 'executed'])
        ?.is('sell_price', null);

      if (fetchError) throw fetchError;

      if (!openPositions || openPositions?.length === 0) {
        alert('Kapatılacak açık pozisyon bulunamadı.');
        setShowConfirm(false);
        return;
      }

      // Update all positions to cancelled status
      const { error: updateError } = await supabase
        ?.from('trading_operations')
        ?.update({
          status: 'cancelled',
          updated_at: new Date()?.toISOString()
        })
        ?.eq('user_id', user?.id)
        ?.in('status', ['pending', 'executed'])
        ?.is('sell_price', null);

      if (updateError) throw updateError;

      // Log the emergency stop action
      await supabase
        ?.from('activity_logs')
        ?.insert({
          user_id: user?.id,
          action_type: 'emergency_stop',
          action_description: `Acil durdurma butonu kullanıldı. ${openPositions?.length} pozisyon kapatıldı.`,
          metadata: { positions_closed: openPositions?.length }
        });

      alert(`Başarılı! ${openPositions?.length} pozisyon kapatıldı.`);
      setShowConfirm(false);
      onStop?.();
    } catch (error) {
      console.error('Error during emergency stop:', error);
      alert('Acil durdurma başarısız: ' + error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-red-500/20">
          <Icon name="AlertTriangle" size={20} className="text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">Acil Durdurma</h3>
          <p className="text-xs text-slate-400">Tüm pozisyonları anlık kapat</p>
        </div>
      </div>

      {!showConfirm ? (
        <Button
          onClick={() => setShowConfirm(true)}
          className="w-full bg-red-500 hover:bg-red-600 text-white"
        >
          <Icon name="Power" size={16} />
          Acil Durdur
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="bg-red-500/20 rounded-lg p-3 text-sm text-red-200">
            <p className="font-medium mb-1">⚠️ Uyarı!</p>
            <p>Tüm açık pozisyonlar kapatılacak ve botlar durdurulacak. Bu işlem geri alınamaz.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setShowConfirm(false)}
              variant="outline"
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              onClick={handleEmergencyStop}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {loading ? 'Durduruluyor...' : 'Onayla'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyStopButton;