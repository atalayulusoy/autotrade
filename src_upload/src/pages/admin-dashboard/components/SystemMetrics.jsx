import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemMetrics = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon name="Users" size={20} className="text-blue-400" />
            <span className="text-slate-400 text-sm">Toplam Kullanıcı</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-white">{metrics?.totalUsers || 0}</p>
        <div className="mt-2 text-xs text-slate-400">
          Aktif: {metrics?.activeUsers || 0}
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon name="Activity" size={20} className="text-green-400" />
            <span className="text-slate-400 text-sm">Toplam İşlem</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-white">{metrics?.totalTrades || 0}</p>
        <div className="mt-2 text-xs text-green-400">
          Aktif işlemler izleniyor
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon name="DollarSign" size={20} className="text-yellow-400" />
            <span className="text-slate-400 text-sm">Toplam Hacim</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-white">${metrics?.totalVolume || '0.00'}</p>
        <div className="mt-2 text-xs text-slate-400">
          USDT cinsinden
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon name="Shield" size={20} className="text-green-400" />
            <span className="text-slate-400 text-sm">Sistem Durumu</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-xl font-bold text-green-400">Sağlıklı</p>
        </div>
        <div className="mt-2 text-xs text-slate-400">
          Tüm sistemler çalışıyor
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;