import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TradeTable = ({ trades, onRowExpand }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (tradeId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded?.has(tradeId)) {
      newExpanded?.delete(tradeId);
    } else {
      newExpanded?.add(tradeId);
    }
    setExpandedRows(newExpanded);
    if (onRowExpand) {
      onRowExpand(tradeId, !expandedRows?.has(tradeId));
    }
  };

  const getTradeTypeColor = (type) => {
    return type === 'buy' ? 'text-success' : 'text-error';
  };

  const getTradeTypeBg = (type) => {
    return type === 'buy' ? 'bg-success/10' : 'bg-error/10';
  };

  const getProfitColor = (profit) => {
    return profit >= 0 ? 'text-success' : 'text-error';
  };

  if (trades?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 md:p-12 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
            <Icon name="Search" size={32} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
              İşlem Bulunamadı
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Seçilen filtrelere uygun işlem kaydı bulunmamaktadır.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left caption font-semibold text-foreground">Tarih & Saat</th>
              <th className="px-6 py-4 text-left caption font-semibold text-foreground">İşlem ID</th>
              <th className="px-6 py-4 text-left caption font-semibold text-foreground">Parite</th>
              <th className="px-6 py-4 text-left caption font-semibold text-foreground">Tip</th>
              <th className="px-6 py-4 text-right caption font-semibold text-foreground">Miktar</th>
              <th className="px-6 py-4 text-right caption font-semibold text-foreground">Fiyat</th>
              <th className="px-6 py-4 text-right caption font-semibold text-foreground">Toplam</th>
              <th className="px-6 py-4 text-right caption font-semibold text-foreground">Komisyon</th>
              <th className="px-6 py-4 text-right caption font-semibold text-foreground">Net Kar/Zarar</th>
              <th className="px-6 py-4 text-left caption font-semibold text-foreground">Borsa</th>
              <th className="px-6 py-4 text-center caption font-semibold text-foreground">Detay</th>
            </tr>
          </thead>
          <tbody>
            {trades?.map((trade) => (
              <React.Fragment key={trade?.id}>
                <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                    {trade?.timestamp}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                    {trade?.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {trade?.pair}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getTradeTypeBg(trade?.type)} ${getTradeTypeColor(trade?.type)}`}>
                      <Icon name={trade?.type === 'buy' ? 'ArrowUpCircle' : 'ArrowDownCircle'} size={14} />
                      {trade?.type === 'buy' ? 'Alış' : 'Satış'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground text-right data-text">
                    {trade?.amount?.toLocaleString('tr-TR', { minimumFractionDigits: 8, maximumFractionDigits: 8 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground text-right data-text">
                    ₺{trade?.price?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground text-right data-text">
                    ₺{trade?.total?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground text-right data-text">
                    ₺{trade?.fee?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right data-text ${getProfitColor(trade?.profitLoss)}`}>
                    {trade?.profitLoss >= 0 ? '+' : ''}₺{trade?.profitLoss?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigals: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {trade?.exchange}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleRow(trade?.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
                      aria-label={expandedRows?.has(trade?.id) ? 'Detayı gizle' : 'Detayı göster'}
                    >
                      <Icon 
                        name={expandedRows?.has(trade?.id) ? 'ChevronUp' : 'ChevronDown'} 
                        size={20} 
                        className="text-muted-foreground"
                      />
                    </button>
                  </td>
                </tr>
                {expandedRows?.has(trade?.id) && (
                  <tr className="bg-muted/30 border-b border-border">
                    <td colSpan="11" className="px-6 py-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="caption font-semibold text-foreground mb-3">Sinyal Bilgisi</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="caption text-muted-foreground">Kaynak:</span>
                              <span className="caption text-foreground font-medium">{trade?.signalSource}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="caption text-muted-foreground">Sinyal Zamanı:</span>
                              <span className="caption text-foreground">{trade?.signalTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="caption text-muted-foreground">Gecikme:</span>
                              <span className="caption text-foreground">{trade?.executionDelay}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="caption font-semibold text-foreground mb-3">Emir Defteri Durumu</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="caption text-muted-foreground">En İyi Alış:</span>
                              <span className="caption text-foreground data-text">₺{trade?.orderBook?.bestBid?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="caption text-muted-foreground">En İyi Satış:</span>
                              <span className="caption text-foreground data-text">₺{trade?.orderBook?.bestAsk?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="caption text-muted-foreground">Spread:</span>
                              <span className="caption text-foreground">{trade?.orderBook?.spread}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-border">
        {trades?.map((trade) => (
          <div key={trade?.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-foreground mb-1">{trade?.pair}</p>
                <p className="caption text-muted-foreground">{trade?.timestamp}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getTradeTypeBg(trade?.type)} ${getTradeTypeColor(trade?.type)}`}>
                <Icon name={trade?.type === 'buy' ? 'ArrowUpCircle' : 'ArrowDownCircle'} size={14} />
                {trade?.type === 'buy' ? 'Alış' : 'Satış'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="caption text-muted-foreground mb-1">Miktar</p>
                <p className="text-sm text-foreground data-text">
                  {trade?.amount?.toLocaleString('tr-TR', { minimumFractionDigits: 8, maximumFractionDigits: 8 })}
                </p>
              </div>
              <div>
                <p className="caption text-muted-foreground mb-1">Fiyat</p>
                <p className="text-sm text-foreground data-text">
                  ₺{trade?.price?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="caption text-muted-foreground mb-1">Toplam</p>
                <p className="text-sm text-foreground data-text">
                  ₺{trade?.total?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="caption text-muted-foreground mb-1">Net Kar/Zarar</p>
                <p className={`text-sm font-semibold data-text ${getProfitColor(trade?.profitLoss)}`}>
                  {trade?.profitLoss >= 0 ? '+' : ''}₺{trade?.profitLoss?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="caption text-muted-foreground">{trade?.exchange}</span>
              <Button
                variant="ghost"
                size="sm"
                iconName={expandedRows?.has(trade?.id) ? 'ChevronUp' : 'ChevronDown'}
                iconPosition="right"
                onClick={() => toggleRow(trade?.id)}
              >
                {expandedRows?.has(trade?.id) ? 'Gizle' : 'Detay'}
              </Button>
            </div>

            {expandedRows?.has(trade?.id) && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                <div>
                  <h4 className="caption font-semibold text-foreground mb-2">Sinyal Bilgisi</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="caption text-muted-foreground">Kaynak:</span>
                      <span className="caption text-foreground font-medium">{trade?.signalSource}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="caption text-muted-foreground">Sinyal Zamanı:</span>
                      <span className="caption text-foreground">{trade?.signalTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="caption text-muted-foreground">Gecikme:</span>
                      <span className="caption text-foreground">{trade?.executionDelay}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="caption font-semibold text-foreground mb-2">Emir Defteri Durumu</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="caption text-muted-foreground">En İyi Alış:</span>
                      <span className="caption text-foreground data-text">₺{trade?.orderBook?.bestBid?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="caption text-muted-foreground">En İyi Satış:</span>
                      <span className="caption text-foreground data-text">₺{trade?.orderBook?.bestAsk?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="caption text-muted-foreground">Spread:</span>
                      <span className="caption text-foreground">{trade?.orderBook?.spread}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeTable;