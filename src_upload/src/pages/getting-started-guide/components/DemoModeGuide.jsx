import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DemoModeGuide = ({ userProgress, onComplete }) => {
  const navigate = useNavigate();
  const hasTestMode = userProgress?.apiKeys?.some(k => k?.mode === 'TEST');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="TestTube" size={24} className="text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Adım 3: Demo Mod ile Test</h2>
      </div>

      <p className="text-slate-300 mb-6">
        Demo mod, gerçek para riski olmadan trading botunuzu test etmenizi sağlar. Stratejilerinizi deneyin ve sistemi öğrenin.
      </p>

      {/* Status Check */}
      {hasTestMode ? (
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Icon name="CheckCircle" size={24} className="text-green-400" />
            <div>
              <p className="text-white font-semibold">TEST Modu Aktif</p>
              <p className="text-green-200 text-sm">Demo hesabınız kullanıma hazır</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Icon name="AlertTriangle" size={24} className="text-yellow-400" />
            <div>
              <p className="text-white font-semibold">TEST Modu API Anahtarı Gerekli</p>
              <p className="text-yellow-200 text-sm">Önce TEST modunda bir API anahtarı ekleyin</p>
            </div>
          </div>
        </div>
      )}

      {/* Demo Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Wallet" size={20} className="text-blue-400" />
            <h4 className="text-white font-semibold">Sanal Bakiye</h4>
          </div>
          <p className="text-slate-300 text-sm mb-2">
            10,000 USDT sanal bakiye ile başlayın. Gerçek piyasa verilerini kullanarak işlem yapın.
          </p>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="TrendingUp" size={20} className="text-green-400" />
            <h4 className="text-white font-semibold">Gerçek Piyasa Verileri</h4>
          </div>
          <p className="text-slate-300 text-sm mb-2">
            Canlı piyasa fiyatları ve gerçek zamanlı verilerle test edin. Gerçek deneyim yaşayın.
          </p>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="BarChart" size={20} className="text-purple-400" />
            <h4 className="text-white font-semibold">Performans Takibi</h4>
          </div>
          <p className="text-slate-300 text-sm mb-2">
            Kar/zarar, kazanma oranı ve diğer metrikleri izleyin. Stratejinizi optimize edin.
          </p>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Shield" size={20} className="text-yellow-400" />
            <h4 className="text-white font-semibold">Risk Yönetimi</h4>
          </div>
          <p className="text-slate-300 text-sm mb-2">
            Stop-loss, take-profit ve trailing stop özelliklerini test edin. Güvenli öğrenin.
          </p>
        </div>
      </div>

      {/* Testing Checklist */}
      <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="ClipboardCheck" className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-semibold mb-2">Test Kontrol Listesi:</p>
            <ul className="space-y-1">
              <li>✓ Manuel alım/satım işlemi yapın</li>
              <li>✓ Otomatik trading botunu aktif edin</li>
              <li>✓ Stop-loss ve take-profit ayarlayın</li>
              <li>✓ Farklı coin'lerle test edin</li>
              <li>✓ Performans raporlarını inceleyin</li>
              <li>✓ En az 1 hafta demo modda işlem yapın</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => navigate('/trading-dashboard')}
          variant="default"
          className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          disabled={!hasTestMode}
        >
          <Icon name="Play" size={16} className="mr-2" />
          Demo Modda İşlem Yap
        </Button>
        <Button
          onClick={onComplete}
          variant="outline"
          className="flex-1"
        >
          <Icon name="ArrowRight" size={16} className="mr-2" />
          Sonraki Adıma Geç
        </Button>
      </div>

      {/* Tips */}
      <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Lightbulb" className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-semibold mb-1">İpucu</p>
            <p>Demo modda en az 1-2 hafta test yapmanızı öneririz. Farklı piyasa koşullarında botunuzun nasıl çalıştığını gözlemleyin.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoModeGuide;