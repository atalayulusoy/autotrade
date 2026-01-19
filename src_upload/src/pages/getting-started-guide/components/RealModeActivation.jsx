import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RealModeActivation = ({ userProgress, onComplete }) => {
  const navigate = useNavigate();
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  
  const hasRealMode = userProgress?.apiKeys?.some(k => k?.mode === 'REAL');
  const hasApprovedRealMode = userProgress?.apiKeys?.some(k => k?.mode === 'REAL' && k?.verification_status === 'approved');
  const hasPendingRealMode = userProgress?.apiKeys?.some(k => k?.mode === 'REAL' && k?.verification_status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="DollarSign" size={24} className="text-green-400" />
        <h2 className="text-2xl font-bold text-white">Adım 4: Gerçek Mod Aktivasyonu</h2>
      </div>

      <p className="text-slate-300 mb-6">
        Demo modda yeterli deneyim kazandıktan sonra gerçek para ile işlem yapmaya başlayabilirsiniz. REAL mod için admin onayı gereklidir.
      </p>

      {/* Status Check */}
      {hasApprovedRealMode ? (
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Icon name="CheckCircle" size={24} className="text-green-400" />
            <div>
              <p className="text-white font-semibold">REAL Modu Aktif</p>
              <p className="text-green-200 text-sm">Gerçek işlemlere başlayabilirsiniz</p>
            </div>
          </div>
        </div>
      ) : hasPendingRealMode ? (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Icon name="Clock" size={24} className="text-yellow-400" />
            <div>
              <p className="text-white font-semibold">REAL Mod Onay Bekliyor</p>
              <p className="text-yellow-200 text-sm">API anahtarınız admin tarafından inceleniyor</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Icon name="Info" size={24} className="text-blue-400" />
            <div>
              <p className="text-white font-semibold">REAL Mod API Anahtarı Ekleyin</p>
              <p className="text-blue-200 text-sm">API Yönetimi sayfasından REAL modda API anahtarı ekleyin</p>
            </div>
          </div>
        </div>
      )}

      {/* Requirements */}
      <div className="bg-slate-700/30 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Icon name="ClipboardCheck" size={20} />
          REAL Mod Gereksinimleri
        </h4>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" size={16} className="text-green-400 mt-0.5" />
            <span>Demo modda en az 1 hafta test deneyimi</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" size={16} className="text-green-400 mt-0.5" />
            <span>Trading stratejilerini anlamak ve test etmek</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" size={16} className="text-green-400 mt-0.5" />
            <span>Risk yönetimi araçlarını kullanabilmek</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" size={16} className="text-green-400 mt-0.5" />
            <span>REAL mod API anahtarı eklemek</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="CheckCircle" size={16} className="text-green-400 mt-0.5" />
            <span>Admin onayı almak (1-2 iş günü)</span>
          </li>
        </ul>
      </div>

      {/* Risk Warning */}
      <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="AlertTriangle" className="w-6 h-6 text-red-400 mt-0.5" />
          <div className="text-sm text-red-200">
            <p className="font-semibold mb-2">Risk Uyarısı</p>
            <ul className="space-y-1">
              <li>• Kripto para ticareti yüksek risk içerir</li>
              <li>• Kaybetmeyi göze alabileceğiniz miktarla işlem yapın</li>
              <li>• Geçmiş performans gelecek kazançları garanti etmez</li>
              <li>• Stop-loss kullanarak riskinizi sınırlayın</li>
              <li>• Piyasa volatilitesine hazırlıklı olun</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Risk Acknowledgment */}
      <div className="bg-slate-700/30 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={riskAcknowledged}
            onChange={(e) => setRiskAcknowledged(e?.target?.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-300">
            Kripto para ticaretinin risklerini anladım ve kabul ediyorum. Kaybetmeyi göze alabileceğim miktarla işlem yapacağım.
          </span>
        </label>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
          <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
            <Icon name="TestTube" size={16} />
            TEST Modu
          </h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>✓ Sanal para</li>
            <li>✓ Risk yok</li>
            <li>✓ Anında aktif</li>
            <li>✓ Öğrenme için ideal</li>
          </ul>
        </div>

        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
          <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
            <Icon name="DollarSign" size={16} />
            REAL Modu
          </h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>✓ Gerçek para</li>
            <li>⚠ Gerçek risk</li>
            <li>⏱ Admin onayı gerekli</li>
            <li>✓ Gerçek kar potansiyeli</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => navigate('/exchange-api-management')}
          variant="default"
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          disabled={!riskAcknowledged}
        >
          <Icon name="Key" size={16} className="mr-2" />
          REAL Mod API Ekle
        </Button>
        {hasApprovedRealMode && (
          <Button
            onClick={() => {
              onComplete();
              navigate('/trading-dashboard');
            }}
            variant="default"
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Icon name="Play" size={16} className="mr-2" />
            İşlemlere Başla
          </Button>
        )}
      </div>

      {/* Support */}
      <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="HelpCircle" className="w-5 h-5 text-slate-400 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-semibold mb-1">Yardıma mı ihtiyacınız var?</p>
            <p>REAL mod aktivasyonu veya diğer konularda destek için <a href="/support-center" className="text-blue-400 hover:underline">Destek Merkezi</a>'ne başvurabilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealModeActivation;