import React from 'react';
import Icon from '../../../components/AppIcon';


const PLFilterPanel = ({
  viewMode,
  selectedYear,
  selectedMonth,
  filters,
  onYearChange,
  onMonthChange,
  onFilterChange
}) => {
  const currentYear = new Date()?.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Ocak' },
    { value: 2, label: 'Şubat' },
    { value: 3, label: 'Mart' },
    { value: 4, label: 'Nisan' },
    { value: 5, label: 'Mayıs' },
    { value: 6, label: 'Haziran' },
    { value: 7, label: 'Temmuz' },
    { value: 8, label: 'Ağustos' },
    { value: 9, label: 'Eylül' },
    { value: 10, label: 'Ekim' },
    { value: 11, label: 'Kasım' },
    { value: 12, label: 'Aralık' }
  ];

  const exchanges = [
    { value: 'all', label: 'Tüm Borsalar' },
    { value: 'binance', label: 'Binance' },
    { value: 'okx', label: 'OKX' },
    { value: 'bybit', label: 'Bybit' },
    { value: 'gateio', label: 'Gate.io' },
    { value: 'btcturk', label: 'BTCTURK' }
  ];

  const strategies = [
    { value: 'all', label: 'Tüm Stratejiler' },
    { value: 'scalping', label: 'Scalping' },
    { value: 'swing', label: 'Swing Trading' },
    { value: 'dca', label: 'DCA' },
    { value: 'grid', label: 'Grid Trading' }
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Filter" size={20} className="text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Filtreler</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Year Selection */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Yıl</label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e?.target?.value))}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {years?.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Month Selection (only for monthly view) */}
        {viewMode === 'monthly' && (
          <div>
            <label className="block text-sm text-slate-400 mb-2">Ay</label>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(parseInt(e?.target?.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {months?.map((month) => (
                <option key={month?.value} value={month?.value}>
                  {month?.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Exchange Filter */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Borsa</label>
          <select
            value={filters?.exchange}
            onChange={(e) => onFilterChange('exchange', e?.target?.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {exchanges?.map((exchange) => (
              <option key={exchange?.value} value={exchange?.value}>
                {exchange?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Strategy Filter */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Strateji</label>
          <select
            value={filters?.strategyType}
            onChange={(e) => onFilterChange('strategyType', e?.target?.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {strategies?.map((strategy) => (
              <option key={strategy?.value} value={strategy?.value}>
                {strategy?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default PLFilterPanel;