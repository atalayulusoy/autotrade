import { supabase } from '../lib/supabase';
import { openaiService } from './openaiService';
import { marketSentimentService } from './marketSentimentService';
const isDemoMode = () => {
  try {
    const v = localStorage.getItem("accountMode") || localStorage.getItem("ACCOUNT_MODE") || "";
    return String(v).toUpperCase() === "DEMO";
  } catch (e) {
    return false;
  }
};

const demoGuard = () => {
  if (isDemoMode()) return { blocked: true };
  return { blocked: false };
};

/**
 * Service for processing trading signals and executing trades
 */
export const tradingSignalService = {
  /**
   * Get pending signals for current user
   */
  async getPendingSignals() {
    if (demoGuard().blocked) return { data: [], error: null };
    try {
      const { data, error } = await supabase
        ?.from('trading_signals')
        ?.select('*')
        ?.eq('status', 'pending')
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get all signals with filtering
   */

  async getSignals(filters = {}) {
    if (demoGuard().blocked) return { data: [], error: null };
    try {
      let query = supabase?.from('trading_signals')?.select('*');

      if (filters?.status) {
        query = query?.eq('status', filters?.status);
      }

      if (filters?.symbol) {
        query = query?.eq('symbol', filters?.symbol);
      }

      if (filters?.startDate) {
        query = query?.gte('created_at', filters?.startDate);
      }

      if (filters?.endDate) {
        query = query?.lte('created_at', filters?.endDate);
      }

      query = query?.order('created_at', { ascending: false })?.limit(filters?.limit || 100);

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get signal history with AI analysis results
   */
  async getSignalHistory(userId, limit = 50) {
      if (demoGuard().blocked) return { data: [], error: null };
  try {
      const { data, error } = await supabase
        ?.from('trading_signals')
        ?.select(`
          *,
          trading_operations(
            id,
            status,
            actual_profit,
            exit_price,
            closed_at
          )
        `)
        ?.eq('user_id', userId)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Process a pending signal and create trading operation
   * Now includes: Market sentiment filtering + Risk limit checks
   */
  async processSignal(signalId, amountUsdt = 20, leverage = 1.0) {
  if (demoGuard().blocked) return { data: null, error: null };
  try {
      // Get signal details
      const { data: signal, error: signalError } = await supabase
        ?.from('trading_signals')
        ?.select('*')
        ?.eq('id', signalId)
        ?.single();

      if (signalError) throw signalError;

      // STEP 1: Check risk limits BEFORE processing
      const { data: riskCheck, error: riskError } = await supabase
        ?.rpc('check_risk_limits', {
          p_user_id: signal?.user_id,
          p_amount_usdt: amountUsdt,
          p_leverage: leverage
        });

      if (riskError) {
        console.error('Risk check error:', riskError);
      }

      if (riskCheck && !riskCheck?.allowed) {
        // Update signal status to blocked
        await supabase
          ?.from('trading_signals')
          ?.update({ 
            status: 'failed',
            processed_at: new Date()?.toISOString()
          })
          ?.eq('id', signalId);

        return { 
          data: null, 
          error: new Error(`Risk limit exceeded: ${riskCheck?.reason}`),
          riskBlocked: true,
          riskDetails: riskCheck
        };
      }

      // STEP 2: Fetch market sentiment
      const { data: sentiment, error: sentimentError } = await marketSentimentService?.getMarketSentiment(signal?.symbol);

      let sentimentScore = 0;
      let sentimentReason = 'Sentiment data unavailable';

      if (sentiment && !sentimentError) {
        sentimentScore = sentiment?.sentiment_score || 0;
        
        // Check if signal should be filtered based on sentiment
        const filterCheck = marketSentimentService?.shouldFilterSignal(
          sentimentScore,
          signal?.signal_type
        );

        if (filterCheck?.filter) {
          // Update signal status to filtered
          await supabase
            ?.from('trading_signals')
            ?.update({ 
              status: 'failed',
              processed_at: new Date()?.toISOString()
            })
            ?.eq('id', signalId);

          return { 
            data: null, 
            error: new Error(filterCheck?.reason),
            sentimentFiltered: true,
            sentimentScore
          };
        }

        sentimentReason = filterCheck?.reason;
      }

      // STEP 3: AI Analysis with market sentiment context
      const { data: aiAnalysis, error: aiError } = await openaiService?.analyzeSignal(signal, {
        volume24h: 'Yüksek',
        volatility: 'Orta',
        trend: 'Yükseliş',
        sentiment_score: sentimentScore,
        sentiment_reason: sentimentReason
      });

      if (aiError) {
        console.error('AI analizi başarısız, varsayılan değerlerle devam ediliyor:', aiError);
      }

      // Use AI recommendations if available
      const recommendedAmount = aiAnalysis?.recommended_amount_usdt || amountUsdt;
      const profitTarget = aiAnalysis?.profit_target_percent || 0.5;

      // Get user's active exchange API key
      const { data: apiKey, error: apiError } = await supabase
        ?.from('exchange_api_keys')
        ?.select('*')
        ?.eq('user_id', signal?.user_id)
        ?.eq('is_active', true)
        ?.limit(1)
        ?.single();

      if (apiError || !apiKey) {
        throw new Error('No active exchange API key found');
      }

      // Update signal status to processing
      await supabase
        ?.from('trading_signals')
        ?.update({ 
          status: 'processing',
          processed_at: new Date()?.toISOString()
        })
        ?.eq('id', signalId);

      // Create trading operation with AI recommendations
      const { data: operation, error: opError } = await supabase
        ?.from('trading_operations')
        ?.insert({
          user_id: signal?.user_id,
          exchange: apiKey?.exchange,
          symbol: signal?.symbol,
          operation_type: signal?.signal_type,
          amount_usdt: recommendedAmount,
          entry_price: signal?.price,
          status: 'waiting'
        })
        ?.select()
        ?.single();

      if (opError) {
        // Mark signal as failed
        await supabase
          ?.from('trading_signals')
          ?.update({ status: 'failed' })
          ?.eq('id', signalId);
        throw opError;
      }

      // Mark signal as executed
      await supabase
        ?.from('trading_signals')
        ?.update({ status: 'executed' })
        ?.eq('id', signalId);

      return { 
        data: { 
          operation, 
          aiAnalysis, 
          sentimentScore,
          sentimentReason,
          riskCheck 
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Calculate sell price with 0.5% profit target
   */
  calculateSellPrice(entryPrice) {
    const profitMargin = 0.005; // 0.5%
    return entryPrice * (1 + profitMargin);
  },

    /**
   * Monitor open positions for UI
   * Priority:
   * 1) positions table (new system)
   * 2) trading_operations table (legacy fallback)
   */
  async monitorPositions() {
    try {
      // 1) NEW: positions table (open positions)
      // Try to read positions first, because UI expects this
      const { data: positions, error: posErr } = await supabase
        ?.from('positions')
        ?.select('*')
        ?.eq('status', 'open')
        ?.order('created_at', { ascending: false })
        ?.limit(50);

      if (!posErr && Array.isArray(positions)) {
        // Normalize to SignalCard shape if needed
        const normalized = positions.map((p) => ({
          id: p?.id,
          symbol: p?.symbol,
          action: p?.side || p?.action || 'BUY',
          price: p?.entry_price ?? p?.price ?? null,
          entry_price: p?.entry_price ?? null,
          amount: p?.amount ?? p?.usdt_amount ?? null,
          pnl: p?.pnl ?? p?.profit ?? 0,
          status: p?.status,
          created_at: p?.created_at ?? p?.opened_at ?? null,
          is_auto: p?.is_auto ?? false,
          is_demo: p?.is_demo ?? p?.test_mode ?? false,
          raw: p
        }));

        return { data: normalized, error: null };
      }

      // 2) FALLBACK: legacy trading_operations table
      const { data: operations, error } = await supabase
        ?.from('trading_operations')
        ?.select('*')
        ?.eq('status', 'waiting')
        ?.eq('operation_type', 'BUY')
        ?.order('created_at', { ascending: false })
        ?.limit(50);

      if (error) throw error;

      const normalizedOps = (operations || []).map((op) => ({
        id: op?.id,
        symbol: op?.symbol,
        action: op?.operation_type || 'BUY',
        price: op?.entry_price ?? op?.price ?? null,
        entry_price: op?.entry_price ?? null,
        amount: op?.amount_usdt ?? op?.amount ?? null,
        pnl: op?.pnl ?? 0,
        status: op?.status,
        created_at: op?.created_at ?? null,
        is_auto: true,
        is_demo: op?.mode === 'TEST' || op?.is_demo === true || false,
        raw: op
      }));

      return { data: normalizedOps, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Execute sell operation
   */
  async executeSell(operationId, exitPrice) {
    try {
      const { data, error } = await supabase
        ?.from('trading_operations')
        ?.update({
          status: 'completed',
          exit_price: exitPrice,
          closed_at: new Date()?.toISOString()
        })
        ?.eq('id', operationId)
        ?.select()
        ?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Subscribe to real-time signal updates
   */
  subscribeToSignals(callback) {
    const subscription = supabase
      ?.channel('trading_signals_channel')
      ?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trading_signals'
        },
        callback
      )
      ?.subscribe();

    return subscription;
  },

  /**
   * Get webhook URL for TradingView integration
   */
  async getWebhookUrl(userId) {
    try {
      const { data, error } = await supabase
        ?.from('user_webhooks')
        ?.select('webhook_token')
        ?.eq('user_id', userId)
        ?.eq('is_active', true)
        ?.single();

      if (error) throw error;

      const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
      const webhookUrl = `${supabaseUrl}/functions/v1/tradingview-webhook?token=${data?.webhook_token}`;

      return { data: webhookUrl, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

export default tradingSignalService;
