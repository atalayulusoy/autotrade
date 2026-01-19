import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PLDetailTable = ({ transactions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 10;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTransactions = [...(transactions || [])]?.sort((a, b) => {
    let aVal = a?.[sortField];
    let bVal = b?.[sortField];

    if (sortField === 'date') {
      aVal = new Date(a?.date?.split('.')?.reverse()?.join('-'));
      bVal = new Date(b?.date?.split('.')?.reverse()?.join('-'));
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedTransactions?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = sortedTransactions?.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <Icon name="ChevronsUpDown" size={14} className="text-slate-500" />;
    return sortDirection === 'asc' ? (
      <Icon name="ChevronUp" size={14} className="text-blue-400" />
    ) : (
      <Icon name="ChevronDown" size={14} className="text-blue-400" />
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Icon name="Table" size={20} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white">İşlem Detayları</h3>
          <span className="ml-auto text-sm text-slate-400">
            {transactions?.length || 0} işlem
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/30">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  Tarih
                  <SortIcon field="date" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center gap-1">
                  Sembol
                  <SortIcon field="symbol" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Borsa
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                Alış
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                Satış
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                Miktar
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                onClick={() => handleSort('profit')}
              >
                <div className="flex items-center justify-end gap-1">
                  Kar/Zarar
                  <SortIcon field="profit" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                ROI
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {paginatedTransactions?.map((transaction) => (
              <tr key={transaction?.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-300">{transaction?.date}</td>
                <td className="px-4 py-3 text-sm font-medium text-white">{transaction?.symbol}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{transaction?.exchange}</td>
                <td className="px-4 py-3 text-sm text-slate-300 text-right">
                  {transaction?.buyPrice?.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300 text-right">
                  {transaction?.sellPrice?.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300 text-right">
                  {transaction?.quantity?.toFixed(4)}
                </td>
                <td className={`px-4 py-3 text-sm font-medium text-right ${
                  transaction?.profit >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction?.profit >= 0 ? '+' : ''}{transaction?.profit?.toFixed(2)} USDT
                </td>
                <td className={`px-4 py-3 text-sm font-medium text-right ${
                  transaction?.roi >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction?.roi >= 0 ? '+' : ''}{transaction?.roi}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
          <div className="text-sm text-slate-400">
            Sayfa {currentPage} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PLDetailTable;