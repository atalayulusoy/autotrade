import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ApiIntegrationForm = ({ exchanges, onComplete, onRefresh }) => {
  const navigate = useNavigate();
  const [selectedExchange, setSelectedExchange] = useState(null);

  const handleAddApiKey = () => {
    // Navigate to API management page
    navigate('/exchange-api-management');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="Link" size={24} className="text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Adım 2: API Entegrasyonu</h2>
      </div>
      
      <p className="text-slate-300 mb-6">
        Aldığınız API anahtarını sisteme ekleyerek botunuzu borsanıza bağlayın. İlk kurulumda TEST modu önerilir.
      </p>

      {/* Exchange Selection */}
      <div>
        <label className="text-sm font-medium text-slate-300 mb-3 block">
          Borsanızı Seçin
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exchanges?.map((exchange) => (
            <button
              key={exchange?.id}
              onClick={() => setSelectedExchange(exchange)}
              className={`bg-slate-700/30 rounded-lg p-4 border-2 transition-all hover:bg-slate-700/50 ${
                selectedExchange?.id === exchange?.id ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-transparent'
              }`}
            >
              <div className={`bg-gradient-to-br ${exchange?.color} p-3 rounded-lg w-fit mb-3`}>
                <Icon name={exchange?.icon} size={24} className="text-white" />
              </div>
              <h3 className="text-white font-semibold">{exchange?.name}</h3>
              <p className="text-slate-400 text-sm">API anahtarı ekle</p>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {selectedExchange && (
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="Info" className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-2">API Anahtarı Ekleme:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Aşağıdaki butona tıklayarak API Yönetimi sayfasına gidin</li>
                <li>{selectedExchange?.name} kartında "API Ekle" butonuna tıklayın</li>
                <li>API Key ve API Secret bilgilerinizi girin</li>
                <li>İlk kurulum için "TEST" modunu seçin</li>
                <li>"Kaydet" butonuna tıklayın</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Mode Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="TestTube" size={20} className="text-yellow-400" />
            <h4 className="text-white font-semibold">TEST Modu</h4>
          </div>
          <ul className="text-sm text-yellow-200 space-y-1">
            <li>• Sanal para ile işlem yapılır</li>
            <li>• Gerçek para riski yoktur</li>
            <li>• Anında aktif olur (onay gerekmez)</li>
            <li>• Strateji testleri için idealdir</li>
          </ul>
        </div>

        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="DollarSign" size={20} className="text-green-400" />
            <h4 className="text-white font-semibold">REAL Modu</h4>
          </div>
          <ul className="text-sm text-green-200 space-y-1">
            <li>• Gerçek para ile işlem yapılır</li>
            <li>• Admin onayı gerektirir</li>
            <li>• Kar/zarar gerçektir</li>
            <li>• Deneyim kazandıktan sonra önerilir</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleAddApiKey}
          variant="default"
          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          <Icon name="Key" size={16} className="mr-2" />
          API Yönetimi Sayfasına Git
        </Button>
        <Button
          onClick={() => {
            onRefresh();
            onComplete();
          }}
          variant="outline"
          className="flex-1"
        >
          <Icon name="RefreshCw" size={16} className="mr-2" />
          API Ekledim, Devam Et
        </Button>
      </div>

      {/* Security Notice */}
      <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Shield" className="w-5 h-5 text-slate-400 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-semibold mb-1">Güvenlik</p>
            <p>API anahtarlarınız AES-256 şifreleme ile korunur ve güvenli sunucularda saklanır. Withdrawal (para çekme) izni vermeyin.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiIntegrationForm;