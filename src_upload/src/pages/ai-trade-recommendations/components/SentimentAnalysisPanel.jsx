import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, RefreshCw, Newspaper } from 'lucide-react';
import { marketSentimentService } from '../../../services/marketSentimentService';
import Button from '../../../components/ui/Button';

const SentimentAnalysisPanel = ({ symbols }) => {
  const [sentimentData, setSentimentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  useEffect(() => {
    loadSentimentData();
  }, [symbols]);

  const loadSentimentData = async () => {
    setLoading(true);
    const data = [];

    for (const symbol of symbols) {
      const { data: sentiment } = await marketSentimentService?.getMarketSentiment(symbol);
      if (sentiment) {
        data?.push(sentiment);
      }
    }

    setSentimentData(data);
    setLoading(false);
  };

  const getSentimentIcon = (score) => {
    if (score > 30) return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (score < -30) return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <Minus className="w-5 h-5 text-yellow-400" />;
  };

  const getSentimentColor = (score) => {
    if (score > 30) return 'bg-green-500/10 border-green-500/20 text-green-400';
    if (score < -30) return 'bg-red-500/10 border-red-500/20 text-red-400';
    return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
  };

  const getSentimentLabel = (score) => {
    if (score > 50) return 'Çok Pozitif';
    if (score > 30) return 'Pozitif';
    if (score > -30) return 'Nötr';
    if (score > -50) return 'Negatif';
    return 'Çok Negatif';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-400" />
          <h2 className="text-white font-semibold text-xl">Piyasa Duyarlılık Analizi</h2>
        </div>
        <Button
          onClick={loadSentimentData}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-slate-400">Piyasa duyarlılığı analiz ediliyor...</p>
        </div>
      )}

      {/* Sentiment Grid */}
      {!loading && sentimentData?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sentimentData?.map(sentiment => (
            <div
              key={sentiment?.symbol}
              onClick={() => setSelectedSymbol(sentiment)}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">{sentiment?.symbol}</h3>
                {getSentimentIcon(sentiment?.sentiment_score)}
              </div>

              <div className={`px-3 py-2 rounded-lg border mb-3 ${getSentimentColor(sentiment?.sentiment_score)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{getSentimentLabel(sentiment?.sentiment_score)}</span>
                  <span className="text-lg font-bold">{sentiment?.sentiment_score?.toFixed(0)}</span>
                </div>
              </div>

              <div className="w-full bg-slate-700/50 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all ${
                    sentiment?.sentiment_score > 30 ? 'bg-green-500' :
                    sentiment?.sentiment_score < -30 ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(Math.abs(sentiment?.sentiment_score), 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-slate-400 mb-1">Pozitif</p>
                  <p className="text-green-400 font-semibold">{sentiment?.positive_news}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 mb-1">Nötr</p>
                  <p className="text-yellow-400 font-semibold">{sentiment?.neutral_news}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 mb-1">Negatif</p>
                  <p className="text-red-400 font-semibold">{sentiment?.negative_news}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed View */}
      {selectedSymbol && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">{selectedSymbol?.symbol} - Detaylı Analiz</h3>
            <button
              onClick={() => setSelectedSymbol(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {selectedSymbol?.top_headlines?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Newspaper className="w-5 h-5 text-blue-400" />
                  <h4 className="text-blue-400 font-semibold">Son Haberler</h4>
                </div>
                <div className="space-y-3">
                  {selectedSymbol?.top_headlines?.map((headline, index) => (
                    <a
                      key={index}
                      href={headline?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {headline?.image && (
                          <img
                            src={headline?.image}
                            alt={headline?.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium mb-1 line-clamp-2">
                            {headline?.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">{headline?.source}</span>
                            <span className="text-slate-500">•</span>
                            <span className={`font-medium ${
                              headline?.sentiment === 'positive' ? 'text-green-400' :
                              headline?.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {headline?.sentiment === 'positive' ? 'Pozitif' :
                               headline?.sentiment === 'negative' ? 'Negatif' : 'Nötr'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalysisPanel;