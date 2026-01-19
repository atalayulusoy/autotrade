import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PaymentMethodSelector = ({ onPaymentComplete }) => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('iban');
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [ibanData, setIbanData] = useState({
    ibanNumber: '',
    bankName: '',
    accountHolderName: '',
    amount: 7500
  });

  const [cashData, setCashData] = useState({
    location: '',
    amount: 7500
  });

  const planOptions = [
    { value: 'basic', label: 'Temel Paket - 7500 TL/ay' },
    { value: 'premium', label: 'Premium Paket - 12500 TL/ay' },
    { value: 'enterprise', label: 'Elit Paket - 20000 TL/ay' }
  ];

  const handlePlanChange = (e) => {
    const plan = e?.target?.value;
    setSelectedPlan(plan);
    
    const amount = plan === 'basic' ? 7500 : plan === 'premium' ? 12500 : 20000;
    setIbanData(prev => ({ ...prev, amount }));
    setCashData(prev => ({ ...prev, amount }));
  };

  const handleIbanSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: insertError } = await supabase?.from('payments')?.insert({
        user_id: user?.id,
        amount: ibanData?.amount,
        payment_method: 'iban',
        payment_status: 'pending',
        subscription_plan: selectedPlan,
        iban_number: ibanData?.ibanNumber,
        bank_name: ibanData?.bankName,
        account_holder_name: ibanData?.accountHolderName,
        transaction_reference: `IBAN-${Date.now()}`
      });

      if (insertError) throw insertError;

      setSuccess('IBAN ödeme talebiniz alındı. Admin onayından sonra paketiniz aktif olacaktır.');
      setIbanData({ ibanNumber: '', bankName: '', accountHolderName: '', amount: 7500 });
      onPaymentComplete?.();
    } catch (err) {
      setError(err?.message || 'Ödeme kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCashSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: insertError } = await supabase?.from('payments')?.insert({
        user_id: user?.id,
        amount: cashData?.amount,
        payment_method: 'cash',
        payment_status: 'pending',
        subscription_plan: selectedPlan,
        cash_payment_location: cashData?.location,
        transaction_reference: `CASH-${Date.now()}`
      });

      if (insertError) throw insertError;

      setSuccess('Nakit ödeme talebiniz alındı. Belirtilen lokasyonda ödeme yapabilirsiniz.');
      setCashData({ location: '', amount: 7500 });
      onPaymentComplete?.();
    } catch (err) {
      setError(err?.message || 'Ödeme kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Ödeme Yöntemi Seçin</h2>
        <p className="text-slate-400 text-sm">IBAN veya nakit ödeme ile abonelik satın alın</p>
      </div>

      {/* Plan Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Paket Seçimi</label>
        <Select
          value={selectedPlan}
          onChange={handlePlanChange}
          options={planOptions}
          className="w-full"
        />
      </div>

      {/* Payment Method Tabs */}
      <div className="flex gap-4 border-b border-slate-700">
        <button
          onClick={() => setSelectedMethod('iban')}
          className={`pb-3 px-4 font-medium transition-colors ${
            selectedMethod === 'iban' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon name="Building" size={18} />
            <span>IBAN / Banka Transferi</span>
          </div>
        </button>
        <button
          onClick={() => setSelectedMethod('cash')}
          className={`pb-3 px-4 font-medium transition-colors ${
            selectedMethod === 'cash' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon name="Banknote" size={18} />
            <span>Nakit Ödeme</span>
          </div>
        </button>
      </div>

      {/* IBAN Payment Form */}
      {selectedMethod === 'iban' && (
        <form onSubmit={handleIbanSubmit} className="space-y-4">
          <Input
            label="IBAN Numaranız"
            placeholder="TR00 0000 0000 0000 0000 0000 00"
            value={ibanData?.ibanNumber}
            onChange={(e) => setIbanData(prev => ({ ...prev, ibanNumber: e?.target?.value }))}
            required
          />

          <Input
            label="Banka Adı"
            placeholder="Örn: Garanti BBVA"
            value={ibanData?.bankName}
            onChange={(e) => setIbanData(prev => ({ ...prev, bankName: e?.target?.value }))}
            required
          />

          <Input
            label="Hesap Sahibi Adı"
            placeholder="Ad Soyad"
            value={ibanData?.accountHolderName}
            onChange={(e) => setIbanData(prev => ({ ...prev, accountHolderName: e?.target?.value }))}
            required
          />

          <Input
            label="Tutar (TL)"
            type="number"
            value={ibanData?.amount}
            disabled
          />

          {/* Bank Transfer Details */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Icon name="Building" size={18} className="text-blue-400" />
              Banka Hesap Bilgileri
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">IBAN:</span>
                <span className="text-white font-mono">TR44 0015 7000 0000 0160 2461 39</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Banka:</span>
                <span className="text-white">EnPara</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hesap Sahibi:</span>
                <span className="text-white">Atalay Ulusoy Safran</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-700/30">
              <p className="text-xs text-blue-300">
                💡 Ödeme açıklamasına kullanıcı e-posta adresinizi yazınız.
              </p>
            </div>
          </div>

          <Button type="submit" fullWidth loading={loading} disabled={loading}>
            Ödeme Talebini Gönder
          </Button>
        </form>
      )}

      {/* Cash Payment Form */}
      {selectedMethod === 'cash' && (
        <form onSubmit={handleCashSubmit} className="space-y-4">
          <div className="bg-orange-900/30 border border-orange-700/50 rounded-lg p-4">
            <p className="text-orange-300 text-sm font-medium mb-2">Nakit Ödeme Noktaları:</p>
            <p className="text-orange-200 text-xs mb-1">• İstanbul Ofis: Levent Mahallesi, Büyükdere Cad. No:201</p>
            <p className="text-orange-200 text-xs mb-1">• Ankara Ofis: Çankaya, Atatürk Bulvarı No:123</p>
            <p className="text-orange-200 text-xs">• İzmir Ofis: Alsancak, Kıbrıs Şehitleri Cad. No:45</p>
          </div>

          <Select
            label="Ödeme Lokasyonu"
            value={cashData?.location}
            onChange={(e) => setCashData(prev => ({ ...prev, location: e?.target?.value }))}
            options={[
              { value: '', label: 'Lokasyon seçin', disabled: true },
              { value: 'istanbul', label: 'İstanbul Ofis - Levent' },
              { value: 'ankara', label: 'Ankara Ofis - Çankaya' },
              { value: 'izmir', label: 'İzmir Ofis - Alsancak' }
            ]}
            required
          />

          <Input
            label="Tutar (TL)"
            type="number"
            value={cashData?.amount}
            disabled
          />

          <Button type="submit" fullWidth loading={loading} disabled={loading}>
            Nakit Ödeme Talebini Gönder
          </Button>
        </form>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="CheckCircle" size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="AlertCircle" size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;