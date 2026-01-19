import React, { useState } from 'react';
import { Settings, Zap, Shield, Target, Save } from 'lucide-react';
import Button from '../../../components/ui/Button';

const AIConfigPanel = () => {
  const [config, setConfig] = useState({
    model: 'gpt-5-mini',
    reasoningEffort: 'medium',
    verbosity: 'medium',
    riskTolerance: 'medium',
    minConfidence: 70,
    maxPositionSize: 100,
    autoExecute: false,
    sentimentWeight: 50,
    technicalWeight: 50
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage?.setItem('ai_trade_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setConfig({
      model: 'gpt-5-mini',
      reasoningEffort: 'medium',
      verbosity: 'medium',
      riskTolerance: 'medium',
      minConfidence: 70,
      maxPositionSize: 100,
      autoExecute: false,
      sentimentWeight: 50,
      technicalWeight: 50
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-purple-400" />
        <h2 className="text-white font-semibold text-xl">AI Konfigürasyonu</h2>
      </div>

      {/* Model Settings */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold">Model Ayarları</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm mb-2 block">AI Modeli</label>
            <select
              value={config?.model}
              onChange={(e) => setConfig({ ...config, model: e?.target?.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="gpt-5">GPT-5 (En İyi Performans)</option>
              <option value="gpt-5-mini">GPT-5 Mini (Hızlı & Ekonomik)</option>
              <option value="gpt-5-nano">GPT-5 Nano (Ultra Hızlı)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-2 block">Reasoning Effort</label>
            <select
              value={config?.reasoningEffort}
              onChange={(e) => setConfig({ ...config, reasoningEffort: e?.target?.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="minimal">Minimal (En Hızlı)</option>
              <option value="low">Düşük</option>
              <option value="medium">Orta (Önerilen)</option>
              <option value="high">Yüksek (En Detaylı)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-2 block">Verbosity (Detay Seviyesi)</label>
            <select
              value={config?.verbosity}
              onChange={(e) => setConfig({ ...config, verbosity: e?.target?.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="low">Düşük (Kısa)</option>
              <option value="medium">Orta (Dengeli)</option>
              <option value="high">Yüksek (Detaylı)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Risk Settings */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-yellow-400" />
          <h3 className="text-white font-semibold">Risk Yönetimi</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm mb-2 block">Risk Toleransı</label>
            <select
              value={config?.riskTolerance}
              onChange={(e) => setConfig({ ...config, riskTolerance: e?.target?.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="low">Düşük (Muhafazakar)</option>
              <option value="medium">Orta (Dengeli)</option>
              <option value="high">Yüksek (Agresif)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-2 block">
              Minimum Güven Skoru: {config?.minConfidence}%
            </label>
            <input
              type="range"
              min="50"
              max="95"
              value={config?.minConfidence}
              onChange={(e) => setConfig({ ...config, minConfidence: Number(e?.target?.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>50%</span>
              <span>95%</span>
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-2 block">
              Maksimum Pozisyon Büyüklüğü: ${config?.maxPositionSize}
            </label>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={config?.maxPositionSize}
              onChange={(e) => setConfig({ ...config, maxPositionSize: Number(e?.target?.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>$10</span>
              <span>$500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Weights */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-semibold">Analiz Ağırlıkları</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm mb-2 block">
              Sentiment Ağırlığı: {config?.sentimentWeight}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config?.sentimentWeight}
              onChange={(e) => {
                const value = Number(e?.target?.value);
                setConfig({ 
                  ...config, 
                  sentimentWeight: value,
                  technicalWeight: 100 - value
                });
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-2 block">
              Teknik Analiz Ağırlığı: {config?.technicalWeight}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config?.technicalWeight}
              onChange={(e) => {
                const value = Number(e?.target?.value);
                setConfig({ 
                  ...config, 
                  technicalWeight: value,
                  sentimentWeight: 100 - value
                });
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Auto Execution */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold mb-1">Otomatik İşlem</h3>
            <p className="text-slate-400 text-sm">
              Yüksek güvenli önerileri otomatik olarak işleme al
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config?.autoExecute}
              onChange={(e) => setConfig({ ...config, autoExecute: e?.target?.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Kaydedildi!' : 'Ayarları Kaydet'}
        </Button>
        <Button
          onClick={handleReset}
          className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Sıfırla
        </Button>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-blue-400 text-sm leading-relaxed">
          <strong>Not:</strong> Bu ayarlar AI önerilerinin nasıl oluşturulacağını etkiler.
          Daha yüksek reasoning effort ve verbosity daha detaylı analiz sağlar ancak daha uzun süre alır.
        </p>
      </div>
    </div>
  );
};

export default AIConfigPanel;