import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { marketSentimentService } from '../../../services/marketSentimentService';

const MarketNewsWidget = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', label: 'Tüm Haberler', icon: 'Newspaper' },
    { id: 'bitcoin', label: 'Bitcoin', icon: 'Bitcoin' },
    { id: 'ethereum', label: 'Ethereum', icon: 'Coins' },
  ];

  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  const loadNews = async () => {
    setLoading(true);
    setError(null);

    try {
      let symbol = 'BTC/USDT';
      if (selectedCategory === 'ethereum') {
        symbol = 'ETH/USDT';
      } else if (selectedCategory === 'bitcoin') {
        symbol = 'BTC/USDT';
      }

      const { data, error: sentimentError } = await marketSentimentService?.getMarketSentiment(symbol);

      if (sentimentError) throw sentimentError;

      if (data?.top_headlines) {
        const formattedNews = data?.top_headlines?.map((headline, index) => ({
          id: index + 1,
          title: headline?.title,
          summary: headline?.title,
          source: headline?.source,
          timestamp: new Date(headline?.publishedAt),
          sentiment: headline?.sentiment,
          impact: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
          image: headline?.image || 'https://images.unsplash.com/photo-1631865382441-b00105810564',
          imageAlt: `Cryptocurrency news: ${headline?.title}`,
          url: headline?.url
        }));

        setNewsItems(formattedNews);
      }
    } catch (err) {
      console.error('News load error:', err);
      setError('Haberler yüklenemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'text-success bg-success/10';
      case 'negative':
        return 'text-error bg-error/10';
      default:
        return 'text-warning bg-warning/10';
    }
  };

  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'high':
        return 'bg-error/10 text-error';
      case 'medium':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 0) {
      return `${hours} saat önce`;
    }
    return `${minutes} dakika önce`;
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Piyasa Haberleri</h3>
        <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Piyasa Haberleri</h3>
        <div className="text-center py-8 text-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Piyasa Haberleri</h3>
        <button
          onClick={loadNews}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          <Icon name="RefreshCw" size={18} />
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => setSelectedCategory(category?.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === category?.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-card'
            }`}
          >
            <Icon name={category?.icon} size={14} />
            {category?.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {newsItems?.map((news) => (
          <a
            key={news?.id}
            href={news?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors border border-border/50"
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-card">
                <Image
                  src={news?.image}
                  alt={news?.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium text-foreground line-clamp-2">
                    {news?.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">{news?.source}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(news?.timestamp)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSentimentColor(news?.sentiment)}`}>
                    {news?.sentiment === 'positive' ? 'Pozitif' : news?.sentiment === 'negative' ? 'Negatif' : 'Nötr'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getImpactBadge(news?.impact)}`}>
                    {news?.impact === 'high' ? 'Yüksek Etki' : news?.impact === 'medium' ? 'Orta Etki' : 'Düşük Etki'}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {newsItems?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Haber bulunamadı
        </div>
      )}
    </div>
  );
};

export default MarketNewsWidget;