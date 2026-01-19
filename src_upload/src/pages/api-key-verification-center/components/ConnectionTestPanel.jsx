import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ConnectionTestPanel = ({ apiKeys, onTestConnection }) => {
  const [testing, setTesting] = React.useState(null);

  const handleTest = async (keyId) => {
    setTesting(keyId);
    await onTestConnection(keyId);
    setTesting(null);
  };

  const getStatusColor = (status) => {
    if (status === 'success') return 'text-green-400';
    if (status === 'failed') return 'text-red-400';
    return 'text-slate-400';
  };

  const getStatusIcon = (status) => {
    if (status === 'success') return 'CheckCircle';
    if (status === 'failed') return 'XCircle';
    return 'HelpCircle';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Icon name="Activity" size={20} />
        Bağlantı Test Paneli
      </h2>

      <p className="text-slate-400 text-sm mb-4">
        API anahtarlarının borsalara bağlantısını test edin ve doğrulayın.
      </p>

      {apiKeys?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Database" size={48} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Henüz API anahtarı yok</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {apiKeys?.map((key) => (
            <div
              key={key?.id}
              className="bg-slate-700/30 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-900/50 p-2 rounded-lg">
                    <Icon name="Key" size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{key?.exchange}</h3>
                    <p className="text-xs text-slate-400">
                      {key?.user_profiles?.full_name}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  key?.mode === 'REAL' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                }`}>
                  {key?.mode}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon 
                    name={getStatusIcon(key?.connection_status)} 
                    size={16} 
                    className={getStatusColor(key?.connection_status)} 
                  />
                  <span className={`text-sm ${getStatusColor(key?.connection_status)}`}>
                    {key?.connection_status === 'success' ? 'Başarılı' :
                     key?.connection_status === 'failed' ? 'Başarısız' : 'Test Edilmedi'}
                  </span>
                </div>
                {key?.last_connection_test && (
                  <span className="text-xs text-slate-400">
                    {new Date(key?.last_connection_test)?.toLocaleString('tr-TR')}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleTest(key?.id)}
                disabled={testing === key?.id}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                {testing === key?.id ? (
                  <>
                    <Icon name="Loader" size={16} className="animate-spin" />
                    Test Ediliyor...
                  </>
                ) : (
                  <>
                    <Icon name="Play" size={16} />
                    Bağlantı Testi Yap
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Test Info */}
      <div className="mt-4 bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Icon name="Info" size={16} className="text-blue-400 mt-0.5" />
          <div className="text-xs text-blue-200">
            <p className="font-semibold mb-1">Test Hakkında</p>
            <p>Bağlantı testi, API anahtarının geçerli olduğunu ve borsaya erişim sağladığını doğrular.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTestPanel;