import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FailoverStatusPanel = () => {
  const [failoverConfig, setFailoverConfig] = useState([
    {
      id: 1,
      primary: 'Binance',
      backup: 'OKX',
      status: 'standby',
      lastTest: new Date(Date.now() - 3600000),
      autoSwitch: true,
      threshold: 3
    },
    {
      id: 2,
      primary: 'OKX',
      backup: 'Bybit',
      status: 'standby',
      lastTest: new Date(Date.now() - 7200000),
      autoSwitch: true,
      threshold: 3
    },
    {
      id: 3,
      primary: 'Gate.io',
      backup: 'BTCTURK',
      status: 'active',
      lastTest: new Date(Date.now() - 300000),
      autoSwitch: true,
      threshold: 2
    }
  ]);

  const [manualOverride, setManualOverride] = useState(false);

  const handleManualFailover = (id) => {
    setFailoverConfig(prev => prev?.map(config => 
      config?.id === id 
        ? { ...config, status: config?.status === 'active' ? 'standby' : 'active' }
        : config
    ));
  };

  const handleToggleAutoSwitch = (id) => {
    setFailoverConfig(prev => prev?.map(config => 
      config?.id === id 
        ? { ...config, autoSwitch: !config?.autoSwitch }
        : config
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'standby':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/50';
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/50';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/50';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'standby':
        return 'Bekleme';
      case 'active':
        return 'Aktif';
      case 'failed':
        return 'Başarısız';
      default:
        return 'Bilinmiyor';
    }
  };

  const formatTimeSince = (date) => {
    const seconds = Math.floor((Date.now() - date?.getTime()) / 1000);
    if (seconds < 60) return `${seconds} saniye önce`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} dakika önce`;
    const hours = Math.floor(minutes / 60);
    return `${hours} saat önce`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-green-500/10 text-green-400">
            <Icon name="Shield" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Otomatik Yedekleme Durumu</h2>
            <p className="text-slate-400 text-sm">Yedek bağlantı hazırlığı</p>
          </div>
        </div>
        <button
          onClick={() => setManualOverride(!manualOverride)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            manualOverride 
              ? 'bg-orange-600 hover:bg-orange-700 text-white' :'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {manualOverride ? 'Manuel Kontrol Aktif' : 'Manuel Kontrol'}
        </button>
      </div>

      <div className="space-y-4">
        {failoverConfig?.map((config) => (
          <div
            key={config?.id}
            className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Icon name="ArrowRight" size={16} className="text-slate-400" />
                  <span className="font-bold text-white">{config?.primary}</span>
                  <Icon name="ArrowRight" size={16} className="text-slate-400" />
                  <span className="font-bold text-blue-400">{config?.backup}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(config?.status)}`}>
                  {getStatusText(config?.status)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleAutoSwitch(config?.id)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    config?.autoSwitch
                      ? 'bg-green-600 hover:bg-green-700 text-white' :'bg-slate-600 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {config?.autoSwitch ? 'Otomatik Açık' : 'Otomatik Kapalı'}
                </button>
                {manualOverride && (
                  <button
                    onClick={() => handleManualFailover(config?.id)}
                    className="px-3 py-1 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    {config?.status === 'active' ? 'Devre Dışı Bırak' : 'Aktif Et'}
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Son Test:</span>
                <span className="text-slate-300 ml-2">{formatTimeSince(config?.lastTest)}</span>
              </div>
              <div>
                <span className="text-slate-400">Hata Eşiği:</span>
                <span className="text-slate-300 ml-2">{config?.threshold} başarısız deneme</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Otomatik Yedekleme Hakkında</p>
            <p className="text-blue-200/80">
              Birincil borsa bağlantısı belirlenen eşik değerini aştığında, 
              sistem otomatik olarak yedek borsaya geçiş yapar. Manuel kontrol ile 
              bu işlemi kendiniz de yönetebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailoverStatusPanel;