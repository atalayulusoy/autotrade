// FRONTEND OPENAI TAMAMEN KAPALI

function disabled() {
  return { data: null, error: "OpenAI disabled" };
}

export const openaiService = {
  async analyzeSignal() {
    return disabled();
  },

  async analyzeMarketSentiment() {
    return disabled();
  },

  async analyzeTradingPerformance() {
    return disabled();
  },

  async analyzePortfolioStrategy() {
    return disabled();
  },
};

export default openaiService;

