import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TradingMonitorPanel = () => {
  const [operations, setOperations] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('operations');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [operationsResult, signalsResult] = await Promise.all([
        supabase?.from('trading_operations')?.select(`
            *,
            user_profiles (full_name, email)
          `)?.order('created_at', { ascending: false })?.limit(50),
        supabase?.from('trading_signals')?.select(`
            *,
            user_profiles (full_name, email)
          `)?.order('received_at', { ascending: false })?.limit(50)
      ]);

      if (operationsResult?.error) throw operationsResult?.error;
      if (signalsResult?.error) throw signalsResult?.error;

      setOperations(operationsResult?.data || []);
      setSignals(signalsResult?.data || []);
    } catch (err) {
      setError(err?.message || 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-900/50 text-yellow-300',
      executed: 'bg-blue-900/50 text-blue-300',
      completed: 'bg-green-900/50 text-green-300',
      failed: 'bg-red-900/50 text-red-300',
      cancelled: 'bg-gray-900/50 text-gray-300'
    };
    return colors?.[status] || 'bg-slate-900/50 text-slate-300';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Bekliyor',
      executed: 'Alış Yapıldı',
      completed: 'Tamamlandı',
      failed: 'Başarısız',
      cancelled: 'İptal Edildi'
    };
    return labels?.[status] || status;
  };

  if (loading) {
    return <div className="text-white text-center py-8">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-8">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">İşlem İzleme</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveView('operations')}
            variant={activeView === 'operations' ? 'default' : 'outline'}
            size="sm"
          >
            Trading İşlemleri
          </Button>
          <Button
            onClick={() => setActiveView('signals')}
            variant={activeView === 'signals' ? 'default' : 'outline'}
            size="sm"
          >
            Sinyaller
          </Button>
          <Button onClick={loadData} variant="outline" size="sm">
            <Icon name="RefreshCw" size={16} />
          </Button>
        </div>
      </div>

      {activeView === 'operations' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 font-medium py-3 px-4">Kullanıcı</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Borsa</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Sembol</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Miktar</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Alış Fiyatı</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Satış Fiyatı</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Kar</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Durum</th>
              </tr>
            </thead>
            <tbody>
              {operations?.map((op) => (
                <tr key={op?.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-4 text-white">
                    {op?.user_profiles?.full_name}
                    <div className="text-xs text-slate-400">{op?.user_profiles?.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs font-medium">
                      {op?.exchange}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{op?.symbol}</td>
                  <td className="py-3 px-4 text-slate-300">${parseFloat(op?.amount_usdt || 0)?.toFixed(2)}</td>
                  <td className="py-3 px-4 text-slate-300">
                    {op?.buy_price ? `$${parseFloat(op?.buy_price)?.toFixed(2)}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {op?.sell_price ? `$${parseFloat(op?.sell_price)?.toFixed(2)}` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {op?.actual_profit ? (
                      <span className={parseFloat(op?.actual_profit) >= 0 ? 'text-green-400' : 'text-red-400'}>
                        ${parseFloat(op?.actual_profit)?.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(op?.status)}`}>
                      {getStatusLabel(op?.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {operations?.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              Henüz işlem bulunmuyor
            </div>
          )}
        </div>
      )}

      {activeView === 'signals' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 font-medium py-3 px-4">Kullanıcı</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Tip</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Sembol</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Fiyat</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Alındı</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Durum</th>
              </tr>
            </thead>
            <tbody>
              {signals?.map((signal) => (
                <tr key={signal?.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-4 text-white">
                    {signal?.user_profiles?.full_name}
                    <div className="text-xs text-slate-400">{signal?.user_profiles?.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      signal?.signal_type === 'buy' ?'bg-green-900/50 text-green-300' :'bg-red-900/50 text-red-300'
                    }`}>
                      {signal?.signal_type === 'buy' ? 'ALIŞ' : 'SATIŞ'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{signal?.symbol}</td>
                  <td className="py-3 px-4 text-slate-300">
                    {signal?.price ? `$${parseFloat(signal?.price)?.toFixed(2)}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-sm">
                    {new Date(signal?.received_at)?.toLocaleString('tr-TR')}
                  </td>
                  <td className="py-3 px-4">
                    {signal?.processed ? (
                      <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs font-medium">
                        İşlendi
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded text-xs font-medium">
                        Bekliyor
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {signals?.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              Henüz sinyal bulunmuyor
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TradingMonitorPanel;