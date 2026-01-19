import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExchangeCard = ({ exchange, apiKeys, onAddKey, onDeleteKey, onTestConnection }) => {
  const hasKeys = apiKeys?.length > 0;
  const activeKey = apiKeys?.find(k => k?.is_active);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`bg-gradient-to-br ${exchange?.color} p-2 rounded-lg`}>
            <Icon name={exchange?.icon} size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{exchange?.name}</h3>
            <p className="text-xs text-slate-400">
              {hasKeys ? `${apiKeys?.length} anahtar` : 'Yapılandırılmadı'}
            </p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${
          hasKeys && activeKey ? 'bg-green-500' : 'bg-slate-600'
        }`}></div>
      </div>

      {hasKeys ? (
        <div className="space-y-3">
          {apiKeys?.map((key) => (
            <div key={key?.id} className="bg-slate-700/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">API Key</span>
                <div className="flex items-center gap-2">
                  {key?.is_encrypted && (
                    <Icon name="Lock" size={12} className="text-green-400" />
                  )}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    key?.mode === 'REAL' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                  }`}>
                    {key?.mode}
                  </span>
                </div>
              </div>
              <div className="text-white font-mono text-xs truncate">
                {key?.api_key?.substring(0, 20)}...
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${
                  key?.verification_status === 'approved' ? 'text-green-400' :
                  key?.verification_status === 'rejected'? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {key?.verification_status === 'approved' ? '✓ Onaylandı' :
                   key?.verification_status === 'rejected' ? '✗ Reddedildi' : '⏳ Beklemede'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onTestConnection(key?.id)}
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    Test Et
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    onClick={() => onDeleteKey(key?.id)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Sil
                  </button>
                </div>
              </div>
              {key?.last_connection_test && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Icon name="Clock" size={12} />
                  <span>Son test: {new Date(key?.last_connection_test)?.toLocaleString('tr-TR')}</span>
                </div>
              )}
            </div>
          ))}
          <Button
            onClick={onAddKey}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Icon name="Plus" size={14} className="mr-2" />
            Yeni Anahtar Ekle
          </Button>
        </div>
      ) : (
        <Button
          onClick={onAddKey}
          variant="default"
          size="sm"
          className="w-full"
        >
          <Icon name="Plus" size={14} className="mr-2" />
          API Anahtarı Ekle
        </Button>
      )}
    </div>
  );
};

export default ExchangeCard;