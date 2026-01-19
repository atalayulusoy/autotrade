import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const PerformanceBreakdownTable = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'profit', direction: 'desc' });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig?.key === key && sortConfig?.direction === 'desc' ? 'asc' : 'desc'
    });
  };

  const filteredData = data?.filter(item =>
    item?.pair?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    item?.exchange?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const sortedData = [...filteredData]?.sort((a, b) => {
    const aValue = a?.[sortConfig?.key];
    const bValue = b?.[sortConfig?.key];
    
    if (sortConfig?.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const SortIcon = ({ columnKey }) => {
    if (sortConfig?.key !== columnKey) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-primary" />
      : <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">
            Performans Dağılımı
          </h3>
          <p className="caption text-muted-foreground">
            İşlem çifti bazında detaylı analiz
          </p>
        </div>
        
        <div className="w-full lg:w-64">
          <Input
            type="search"
            placeholder="Çift veya borsa ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('pair')}
                  className="flex items-center gap-2 caption font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  İşlem Çifti
                  <SortIcon columnKey="pair" />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('exchange')}
                  className="flex items-center gap-2 caption font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Borsa
                  <SortIcon columnKey="exchange" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('trades')}
                  className="flex items-center justify-end gap-2 caption font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  İşlem Sayısı
                  <SortIcon columnKey="trades" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('winRate')}
                  className="flex items-center justify-end gap-2 caption font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  Başarı Oranı
                  <SortIcon columnKey="winRate" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('profit')}
                  className="flex items-center justify-end gap-2 caption font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  Kar/Zarar
                  <SortIcon columnKey="profit" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('roi')}
                  className="flex items-center justify-end gap-2 caption font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  ROI
                  <SortIcon columnKey="roi" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData?.map((item, index) => (
              <tr 
                key={index}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="caption font-medium text-foreground">{item?.pair}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="caption text-muted-foreground">{item?.exchange}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="caption text-foreground data-text">{item?.trades}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full"
                        style={{ width: `${item?.winRate}%` }}
                      />
                    </div>
                    <span className="caption text-foreground data-text whitespace-nowrap">
                      {item?.winRate}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`caption font-medium data-text whitespace-nowrap ${
                    item?.profit >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {item?.profit >= 0 ? '+' : ''}{item?.profit?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`caption font-medium data-text whitespace-nowrap ${
                    item?.roi >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {item?.roi >= 0 ? '+' : ''}{item?.roi}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedData?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Sonuç bulunamadı</p>
        </div>
      )}
    </div>
  );
};

export default PerformanceBreakdownTable;