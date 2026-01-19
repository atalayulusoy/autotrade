import React from 'react';
import Icon from '../../../components/AppIcon';

const TransactionHistory = ({ payments }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-green-400 bg-green-900/30';
      case 'pending': return 'text-yellow-400 bg-yellow-900/30';
      case 'failed': return 'text-red-400 bg-red-900/30';
      case 'cancelled': return 'text-gray-400 bg-gray-900/30';
      default: return 'text-slate-400 bg-slate-900/30';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'Tamamlandı';
      case 'pending': return 'Beklemede';
      case 'failed': return 'Başarısız';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getMethodText = (method) => {
    switch(method) {
      case 'iban': return 'IBAN Transferi';
      case 'cash': return 'Nakit Ödeme';
      case 'credit_card': return 'Kredi Kartı';
      default: return method;
    }
  };

  const getPlanText = (plan) => {
    switch(plan) {
      case 'free_trial': return '1 Günlük Deneme';
      case 'basic': return 'Temel Paket';
      case 'premium': return 'Premium Paket';
      case 'enterprise': return 'Kurumsal Paket';
      default: return plan;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">İşlem Geçmişi</h2>
        <p className="text-slate-400 text-sm">Tüm ödeme işlemlerinizi görüntüleyin</p>
      </div>

      {payments?.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Receipt" size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Henüz ödeme işlemi bulunmuyor</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments?.map((payment) => (
            <div
              key={payment?.id}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-900/50 p-2 rounded-lg">
                    <Icon name="Receipt" size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{getPlanText(payment?.subscription_plan)}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {new Date(payment?.created_at)?.toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">{parseFloat(payment?.amount)?.toFixed(2)} TL</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(payment?.payment_status)}`}>
                    {getStatusText(payment?.payment_status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-600">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Ödeme Yöntemi</p>
                  <p className="text-white text-sm">{getMethodText(payment?.payment_method)}</p>
                </div>
                {payment?.transaction_reference && (
                  <div>
                    <p className="text-slate-400 text-xs mb-1">İşlem No</p>
                    <p className="text-white text-sm font-mono text-xs">{payment?.transaction_reference}</p>
                  </div>
                )}
              </div>

              {payment?.payment_method === 'iban' && payment?.iban_number && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">IBAN</p>
                  <p className="text-white text-sm font-mono">{payment?.iban_number}</p>
                  <p className="text-slate-400 text-xs mt-1">{payment?.bank_name}</p>
                </div>
              )}

              {payment?.payment_method === 'cash' && payment?.cash_payment_location && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Ödeme Lokasyonu</p>
                  <p className="text-white text-sm">{payment?.cash_payment_location}</p>
                </div>
              )}

              {payment?.notes && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <p className="text-slate-400 text-xs mb-1">Not</p>
                  <p className="text-white text-sm">{payment?.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;