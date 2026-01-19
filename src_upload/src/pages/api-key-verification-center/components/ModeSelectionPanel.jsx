import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ModeSelectionPanel = ({ apiKeys, onModeChange }) => {
  const [selectedKey, setSelectedKey] = useState(null);
  const [newMode, setNewMode] = useState(null);

  const handleModeChange = async () => {
    if (!selectedKey || !newMode) return;
    await onModeChange(selectedKey, newMode);
    setSelectedKey(null);
    setNewMode(null);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Icon name="Settings" size={20} />
        Mod Seçim Paneli
      </h2>

      <p className="text-slate-400 text-sm mb-4">
        API anahtarlarının işlem modunu (TEST/REAL) değiştirin.
      </p>

      {apiKeys?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Database" size={48} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Henüz API anahtarı yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* API Key Selection */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              API Anahtarı Seçin
            </label>
            <select
              value={selectedKey || ''}
              onChange={(e) => setSelectedKey(e?.target?.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seçiniz...</option>
              {apiKeys?.map((key) => (
                <option key={key?.id} value={key?.id}>
                  {key?.exchange} - {key?.user_profiles?.full_name} ({key?.mode})
                </option>
              ))}
            </select>
          </div>

          {/* Current Mode Display */}
          {selectedKey && (
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2">Mevcut Durum</h4>
              {(() => {
                const key = apiKeys?.find(k => k?.id === selectedKey);
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Borsa:</span>
                      <span className="text-white font-semibold">{key?.exchange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kullanıcı:</span>
                      <span className="text-white">{key?.user_profiles?.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mevcut Mod:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        key?.mode === 'REAL' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                      }`}>
                        {key?.mode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Durum:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        key?.verification_status === 'approved' ? 'bg-green-900/50 text-green-300' :
                        key?.verification_status === 'rejected'? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'
                      }`}>
                        {key?.verification_status === 'approved' ? 'Onaylı' :
                         key?.verification_status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Mode Selection */}
          {selectedKey && (
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Yeni Mod Seçin
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setNewMode('TEST')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    newMode === 'TEST' ?'border-yellow-500 bg-yellow-900/30' :'border-slate-600 bg-slate-700/30 hover:bg-slate-700/50'
                  }`}
                >
                  <Icon name="TestTube" size={24} className="text-yellow-400 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">TEST</p>
                  <p className="text-slate-400 text-xs">Sanal para</p>
                </button>
                <button
                  onClick={() => setNewMode('REAL')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    newMode === 'REAL' ?'border-green-500 bg-green-900/30' :'border-slate-600 bg-slate-700/30 hover:bg-slate-700/50'
                  }`}
                >
                  <Icon name="DollarSign" size={24} className="text-green-400 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">REAL</p>
                  <p className="text-slate-400 text-xs">Gerçek para</p>
                </button>
              </div>
            </div>
          )}

          {/* Apply Button */}
          {selectedKey && newMode && (
            <Button
              onClick={handleModeChange}
              variant="default"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Icon name="Save" size={16} className="mr-2" />
              Modu Değiştir
            </Button>
          )}
        </div>
      )}

      {/* Warning */}
      <div className="mt-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Icon name="AlertTriangle" size={16} className="text-yellow-400 mt-0.5" />
          <div className="text-xs text-yellow-200">
            <p className="font-semibold mb-1">Uyarı</p>
            <p>REAL moda geçiş yapıldığında, API anahtarı otomatik olarak "Bekliyor" durumuna alınır ve yeniden onay gerektirir.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectionPanel;