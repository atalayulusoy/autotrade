import React from 'react';
import Icon from '../../../components/AppIcon';

const AccountModeToggle = ({ mode, onModeChange, testBalance, realBalances }) => {
  const totalRealBalance = realBalances?.reduce((sum, exchange) => sum + (exchange?.balance || 0), 0) || 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 pl-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="Wallet" className="w-5 h-5 text-blue-400" />
        <h2 className="text-white font-semibold">Hesap Modu</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onModeChange('TEST')}
          className={`relative px-4 py-3 rounded-lg font-medium transition-all ${
          mode === 'TEST' ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/30' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`
          }>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <Icon name="TestTube" className="w-4 h-4" />
              <span className="text-sm font-bold">DEMO</span>
            </div>
            <span className="text-xs opacity-90">{testBalance?.toFixed(2)} USDT</span>
          </div>
          {mode === 'TEST' &&
          <div className="absolute top-1 right-1">
              <Icon name="Check" className="w-4 h-4" />
            </div>
          }
        </button>

        <button
          onClick={() => onModeChange('REAL')}
          className={`relative px-4 py-3 rounded-lg font-medium transition-all ${
          mode === 'REAL' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`
          }>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <Icon name="DollarSign" className="w-4 h-4" />
              <span className="text-sm font-bold">REAL</span>
            </div>
            <span className="text-xs opacity-90">{totalRealBalance?.toFixed(2)} USDT</span>
          </div>
          {mode === 'REAL' &&
          <div className="absolute top-1 right-1">
              <Icon name="Check" className="w-4 h-4" />
            </div>
          }
        </button>
      </div>

      <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
        <div className="flex items-start gap-2">
          <Icon name="Info" className="w-4 h-4 text-blue-400 mt-0.5" />
          <div className="text-xs text-slate-300">
            {mode === 'TEST' ?
            <span>Test modunda sanal bakiye ile işlem yapıyorsunuz. Gerçek para kullanılmaz.</span> :

            <span>Gerçek modda borsalarınızdaki gerçek bakiye ile işlem yapıyorsunuz.</span>
            }
          </div>
        </div>
      </div>

      {mode === 'REAL' && realBalances?.length > 0 &&
      <div className="mt-3 space-y-2">
          <div className="text-xs text-slate-400 font-medium">Borsa Bakiyeleri:</div>
          {realBalances?.map((exchange, index) =>
        <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
              <span className="text-xs text-slate-300">{exchange?.name}</span>
              <span className="text-xs text-white font-medium">{exchange?.balance?.toFixed(2)} USDT</span>
            </div>
        )}
        </div>
      }
    </div>);

};

export default AccountModeToggle;