import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const AddApiKeyModal = ({ exchange, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    mode: 'TEST'
  });
  const [showSecret, setShowSecret] = useState(false);

  const encryptData = (data) => {
    const encryptionKey = import.meta.env?.VITE_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    return CryptoJS?.AES?.encrypt(data, encryptionKey)?.toString();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!formData?.apiKey || !formData?.apiSecret) {
      alert('API Key ve Secret alanları zorunludur');
      return;
    }

    try {
      setLoading(true);

      // Encrypt sensitive data before sending
      const encryptedApiKey = encryptData(formData?.apiKey);
      const encryptedApiSecret = encryptData(formData?.apiSecret);
      const encryptedPassphrase = formData?.passphrase ? encryptData(formData?.passphrase) : null;

      const { error } = await supabase
        ?.from('exchange_api_keys')
        ?.insert({
          user_id: user?.id,
          exchange: exchange?.id,
          api_key: encryptedApiKey,
          api_secret: encryptedApiSecret,
          passphrase: encryptedPassphrase,
          mode: formData?.mode,
          is_encrypted: true,
          verification_status: formData?.mode === 'TEST' ? 'approved' : 'pending',
          is_active: true
        });

      if (error) throw error;

      // Log activity
      await supabase
        ?.from('activity_logs')
        ?.insert({
          user_id: user?.id,
          action_type: 'api_key_added',
          action_description: `${exchange?.name} API anahtarı eklendi (${formData?.mode} modu)`,
          metadata: {
            exchange: exchange?.id,
            mode: formData?.mode,
            encrypted: true
          }
        });

      alert('API anahtarı başarıyla eklendi');
      onClose();
    } catch (error) {
      console.error('Error adding API key:', error);
      alert('API anahtarı eklenemedi: ' + error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`bg-gradient-to-br ${exchange?.color} p-2 rounded-lg`}>
              <Icon name={exchange?.icon} size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{exchange?.name} API</h2>
              <p className="text-sm text-slate-400">API anahtarı ekle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Selection */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              İşlem Modu
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'TEST' })}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  formData?.mode === 'TEST' ?'bg-gradient-to-r from-yellow-600 to-orange-600 text-white' :'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Icon name="TestTube" size={16} className="inline mr-2" />
                TEST
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'REAL' })}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  formData?.mode === 'REAL' ?'bg-gradient-to-r from-green-600 to-emerald-600 text-white' :'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Icon name="DollarSign" size={16} className="inline mr-2" />
                REAL
              </button>
            </div>
            {formData?.mode === 'REAL' && (
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ REAL mod için admin onayı gereklidir
              </p>
            )}
          </div>

          {/* API Key */}
          <Input
            label="API Key"
            type="text"
            value={formData?.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e?.target?.value })}
            placeholder="API anahtarınızı giriniz"
            required
          />

          {/* API Secret */}
          <div className="relative">
            <Input
              label="API Secret"
              type={showSecret ? 'text' : 'password'}
              value={formData?.apiSecret}
              onChange={(e) => setFormData({ ...formData, apiSecret: e?.target?.value })}
              placeholder="API secret giriniz"
              required
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-9 text-slate-400 hover:text-white"
            >
              <Icon name={showSecret ? 'EyeOff' : 'Eye'} size={16} />
            </button>
          </div>

          {/* Passphrase (optional) */}
          {(exchange?.id === 'OKX' || exchange?.id === 'Gate.io') && (
            <Input
              label="Passphrase (Opsiyonel)"
              type="password"
              value={formData?.passphrase}
              onChange={(e) => setFormData({ ...formData, passphrase: e?.target?.value })}
              placeholder="Passphrase giriniz"
            />
          )}

          {/* Security Notice */}
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Icon name="Lock" size={16} className="text-blue-400 mt-0.5" />
              <div className="text-xs text-blue-200">
                <p className="font-semibold mb-1">Güvenlik</p>
                <p>API anahtarlarınız AES-256 ile şifrelenerek saklanır. Sadece siz ve yetkili adminler erişebilir.</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="default"
              className="flex-1"
              loading={loading}
              disabled={loading}
            >
              <Icon name="Save" size={16} className="mr-2" />
              Kaydet
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              İptal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddApiKeyModal;