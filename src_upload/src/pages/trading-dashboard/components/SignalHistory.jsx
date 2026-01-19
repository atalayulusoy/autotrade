import React, { useState, useEffect } from 'react';
import { History, Filter, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { tradingSignalService } from '../../../services/tradingSignalService';
import { useAuth } from '../../../contexts/AuthContext';

const SignalHistory = () => {
  const { userProfile } = useAuth();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    symbol: '',
    signalType: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userProfile?.id) {
      loadSignalHistory();
    }
  }, [userProfile, filters]);

  const loadSignalHistory = async () => {
    setLoading(true);
    const { data, error } = await tradingSignalService?.getSignalHistory(userProfile?.id, 50);
    if (data && !error) {
      setSignals(data);
    }
    setLoading(false);
  };

  const filteredSignals = signals?.filter((signal) => {
    const matchesStatus = filters?.status === 'all' || signal?.status === filters?.status;
    const matchesType = filters?.signalType === 'all' || signal?.signal_type === filters?.signalType;
    const matchesSearch = !searchTerm || signal?.symbol?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'executed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'processing':
        return 'text-blue-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-slate-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-semibold text-base">Sinyal Geçmişi</h2>
        </div>
        <button
          onClick={loadSignalHistory}
          disabled={loading}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors disabled:opacity-50">

          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Sembol ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />

        </div>
        <select
          value={filters?.status}
          onChange={(e) => setFilters({ ...filters, status: e?.target?.value })}
          className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500">

          <option value="all">Tüm Durumlar</option>
          <option value="pending">Beklemede</option>
          <option value="processing">İşleniyor</option>
          <option value="executed">Gerçekleşti</option>
          <option value="failed">Başarısız</option>
        </select>
        <select
          value={filters?.signalType}
          onChange={(e) => setFilters({ ...filters, signalType: e?.target?.value })}
          className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500">

          <option value="all">Tüm Tipler</option>
          <option value="BUY">Alış</option>
          <option value="SELL">Satış</option>
        </select>
        <div className="flex items-center gap-2 bg-slate-700/30 rounded-lg px-4 py-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-sm">{filteredSignals?.length} Sinyal</span>
        </div>
      </div>
      {/* Signal List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ?
        <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-400 mt-2">Yükleniyor...</p>
          </div> :
        filteredSignals?.length === 0 ?
        <div className="text-center py-8">
            <History className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">Henüz sinyal geçmişi yok</p>
          </div> :

        filteredSignals?.map((signal) =>
        <div
          key={signal?.id}
          className="bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors">

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
              signal?.signal_type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`
              }>
                    {signal?.signal_type === 'BUY' ?
                <TrendingUp className="w-4 h-4" /> :

                <TrendingDown className="w-4 h-4" />
                }
                  </div>
                  <div>
                    <p className="text-white font-medium">{signal?.symbol}</p>
                    <p className="text-slate-400 text-xs">{formatDate(signal?.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getStatusColor(signal?.status)}`}>
                    {signal?.status}
                  </p>
                  <p className="text-slate-400 text-xs">${signal?.price?.toFixed(2)}</p>
                </div>
              </div>
              {signal?.trading_operations?.[0] &&
          <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                  <span className="text-slate-400 text-xs">Kar/Zarar:</span>
                  <span className={`text-sm font-semibold ${
            signal?.trading_operations?.[0]?.actual_profit > 0 ?
            'text-green-400' : 'text-red-400'}`
            }>
                    ${signal?.trading_operations?.[0]?.actual_profit?.toFixed(2)}
                  </span>
                </div>
          }
            </div>
        )
        }
      </div>
    </div>);

};

export default SignalHistory;