import { supabase } from '../lib/supabase';
import NewsAPI from 'newsapi';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

// 🔒 NewsAPI KAPALI ise servis pasif
let newsapi = null;
if (NEWS_API_KEY) {
  try {
    newsapi = new NewsAPI(NEWS_API_KEY);
  } catch (e) {
    console.warn('NewsAPI init failed, disabled');
    newsapi = null;
  }
}

// ⛔ Pasif cevap
function disabledResponse(reason = 'Market sentiment disabled') {
  return { data: null, error: reason };
}

export const marketSentimentService = {
  async getMarketSentiment(symbol) {
    if (!newsapi) return disabledResponse();

    try {
      const { data: cached } = await supabase
        ?.from('market_sentiment_cache')
        ?.select('*')
        ?.eq('symbol', symbol)
        ?.gt('expires_at', new Date().toISOString())
        ?.single();

      if (cached) {
        return { data: cached, error: null, fromCache: true };
      }

      const sentiment = await this.fetchAndAnalyzeSentiment(symbol);
      if (sentiment?.error) return sentiment;

      await this.cacheSentiment(symbol, sentiment.data);
      return { data: sentiment.data, error: null, fromCache: false };

    } catch (e) {
      console.error('Market sentiment error:', e);
      return disabledResponse();
    }
  },

  async fetchAndAnalyzeSentiment(symbol) {
    if (!newsapi) return disabledResponse();

    try {
      const baseSymbol = symbol?.split('/')?.[0];
      const searchQuery = this.getSearchQuery(baseSymbol);

      const response = await newsapi.v2.everything({
        q: searchQuery,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      });

      if (!response?.articles) throw new Error('News fetch failed');

      const analysis = this.analyzeSentiment(response.articles);

      return {
        data: {
          symbol,
          sentiment_score: analysis.score,
          news_count: analysis.total,
          positive_news: analysis.positive,
          negative_news: analysis.negative,
          neutral_news: analysis.neutral,
          top_headlines: analysis.headlines
        },
        error: null
      };

    } catch (e) {
      console.warn('Sentiment fetch failed, disabled');
      return disabledResponse();
    }
  },

  getSearchQuery(symbol) {
    const map = {
      BTC: 'Bitcoin OR BTC',
      ETH: 'Ethereum OR ETH',
      SOL: 'Solana OR SOL',
      XRP: 'Ripple OR XRP'
    };
    return map[symbol] || `${symbol} cryptocurrency`;
  },

  analyzeSentiment(articles = []) {
    const pos = ['bullish','gain','rise','surge','adoption','growth'];
    const neg = ['bearish','crash','fall','loss','hack','ban'];

    let positive = 0, negative = 0, neutral = 0;
    const headlines = [];

    articles.forEach(a => {
      const text = `${a?.title || ''} ${a?.description || ''}`.toLowerCase();
      let score = 0;

      pos.forEach(k => text.includes(k) && score++);
      neg.forEach(k => text.includes(k) && score--);

      let sentiment = 'neutral';
      if (score > 0) { positive++; sentiment = 'positive'; }
      else if (score < 0) { negative++; sentiment = 'negative'; }
      else neutral++;

      if (headlines.length < 5) {
        headlines.push({
          title: a?.title,
          source: a?.source?.name,
          url: a?.url,
          publishedAt: a?.publishedAt,
          sentiment
        });
      }
    });

    const total = articles.length || 1;
    const score = ((positive - negative) / total) * 100;

    return {
      score: Number(score.toFixed(2)),
      total,
      positive,
      negative,
      neutral,
      headlines
    };
  },

  async cacheSentiment(symbol, data) {
    if (!supabase) return;

    try {
      await supabase
        .from('market_sentiment_cache')
        .upsert({
          symbol,
          ...data,
          cached_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }, { onConflict: 'symbol' });
    } catch (_) {}
  },

  shouldFilterSignal(score, type) {
    if (type === 'BUY' && score < -30) {
      return { filter: true, reason: 'Negative sentiment' };
    }
    if (type === 'SELL' && score > 30) {
      return { filter: true, reason: 'Strong positive sentiment' };
    }
    return { filter: false, reason: 'Sentiment acceptable' };
  }
};

export default marketSentimentService;
 
