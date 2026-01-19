import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const VerificationDetails = ({ apiKey, onVerify, onClose }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm('Bu API anahtarını onaylamak istediğinizden emin misiniz?')) return;
    setLoading(true);
    await onVerify(apiKey?.id, 'approved', notes);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!notes?.trim()) {
      alert('Lütfen red nedeni giriniz');
      return;
    }
    if (!confirm('Bu API anahtarını reddetmek istediğinizden emin misiniz?')) return;
    setLoading(true);
    await onVerify(apiKey?.id, 'rejected', notes);
    setLoading(false);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Icon name="FileText" size={20} />
          Detaylar
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white"
        >
          <Icon name="X" size={20} />
        </button>
      </div>

      {/* User Info */}
      <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
        <h3 className="text-white font-semibold text-sm">Kullanıcı Bilgileri</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Ad Soyad:</span>
            <span className="text-white">{apiKey?.user_profiles?.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">E-posta:</span>
            <span className="text-white text-xs">{apiKey?.user_profiles?.email}</span>
          </div>
        </div>
      </div>

      {/* Exchange Info */}
      <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
        <h3 className="text-white font-semibold text-sm">Borsa Bilgileri</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Borsa:</span>
            <span className="text-white font-semibold">{apiKey?.exchange}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Mod:</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              apiKey?.mode === 'REAL' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
            }`}>
              {apiKey?.mode}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Şifreleme:</span>
            <span className="text-white">
              {apiKey?.is_encrypted ? (
                <span className="text-green-400 flex items-center gap-1">
                  <Icon name="Lock" size={12} />
                  Aktif
                </span>
              ) : (
                <span className="text-red-400">Yok</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* API Key Info */}
      <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
        <h3 className="text-white font-semibold text-sm">API Anahtar Bilgileri</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-slate-400 block mb-1">API Key:</span>
            <div className="bg-slate-900/50 rounded p-2 font-mono text-xs text-white break-all">
              {apiKey?.api_key?.substring(0, 40)}...
            </div>
          </div>
          {apiKey?.passphrase && (
            <div className="flex items-center gap-2 text-blue-400 text-xs">
              <Icon name="Key" size={12} />
              <span>Passphrase mevcut</span>
            </div>
          )}
        </div>
      </div>

      {/* Submission Info */}
      <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
        <h3 className="text-white font-semibold text-sm">Gönderim Bilgileri</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Tarih:</span>
            <span className="text-white text-xs">
              {new Date(apiKey?.created_at)?.toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Durum:</span>
            <span className="text-yellow-400">Beklemede</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-slate-300 mb-2 block">
          Notlar / Red Nedeni
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e?.target?.value)}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Onay/red notlarınızı giriniz..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleApprove}
          variant="default"
          className="flex-1 bg-green-600 hover:bg-green-700"
          loading={loading}
          disabled={loading}
        >
          <Icon name="CheckCircle" size={16} className="mr-2" />
          Onayla
        </Button>
        <Button
          onClick={handleReject}
          variant="destructive"
          className="flex-1"
          loading={loading}
          disabled={loading}
        >
          <Icon name="XCircle" size={16} className="mr-2" />
          Reddet
        </Button>
      </div>

      {/* Security Warning */}
      <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Icon name="AlertTriangle" size={16} className="text-red-400 mt-0.5" />
          <div className="text-xs text-red-200">
            <p className="font-semibold mb-1">Güvenlik Uyarısı</p>
            <p>REAL mod onayları dikkatli yapılmalıdır. Kullanıcının gerçek fonlarına erişim sağlar.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDetails;