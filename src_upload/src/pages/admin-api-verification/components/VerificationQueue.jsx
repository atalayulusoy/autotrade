import React from 'react';
import Icon from '../../../components/AppIcon';

const VerificationQueue = ({ pendingKeys, onSelectKey, selectedKeyId }) => {
  const getExchangeColor = (exchange) => {
    const colors = {
      'Binance': 'from-yellow-600 to-orange-600',
      'OKX': 'from-blue-600 to-cyan-600',
      'Bybit': 'from-purple-600 to-pink-600',
      'Gate.io': 'from-green-600 to-emerald-600',
      'BTCTURK': 'from-red-600 to-rose-600'
    };
    return colors?.[exchange] || 'from-slate-600 to-slate-700';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Icon name="List" size={20} />
        Doğrulama Kuyruğu
      </h2>

      {pendingKeys?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="text-green-500 mx-auto mb-3" />
          <p className="text-slate-400">Bekleyen API anahtarı yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingKeys?.map((key) => (
            <div
              key={key?.id}
              onClick={() => onSelectKey(key)}
              className={`bg-slate-700/30 rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-700/50 ${
                selectedKeyId === key?.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`bg-gradient-to-br ${getExchangeColor(key?.exchange)} p-2 rounded-lg`}>
                    <Icon name="Key" size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{key?.exchange}</h3>
                    <p className="text-xs text-slate-400">
                      {key?.user_profiles?.full_name} • {key?.user_profiles?.email}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  key?.mode === 'REAL' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                }`}>
                  {key?.mode}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">API Key:</span>
                  <span className="text-white font-mono text-xs">{key?.api_key?.substring(0, 20)}...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Gönderim:</span>
                  <span className="text-white text-xs">
                    {new Date(key?.created_at)?.toLocaleString('tr-TR')}
                  </span>
                </div>
                {key?.is_encrypted && (
                  <div className="flex items-center gap-2 text-green-400 text-xs">
                    <Icon name="Lock" size={12} />
                    <span>Şifrelenmiş</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerificationQueue;