import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import PortfolioAnalytics from './pages/portfolio-analytics';
import Login from './pages/login';
import TradeHistory from './pages/trade-history';
import MarketAnalysis from './pages/market-analysis';
import TradingDashboard from './pages/trading-dashboard';
import Register from './pages/register';
import AdminDashboard from './pages/admin-dashboard';
import PaymentManagement from './pages/payment-management';
import AboutUs from './pages/about-us';
import SupportCenter from './pages/support-center';
import FAQ from './pages/faq';
import Contact from './pages/contact';
import ExchangeApiManagement from './pages/exchange-api-management';
import AdminApiVerification from './pages/admin-api-verification';
import GettingStartedGuide from './pages/getting-started-guide';
import ApiKeyVerificationCenter from './pages/api-key-verification-center';
import SystemHealthMonitor from './pages/system-health-monitor';
import ForgotPassword from './pages/forgot-password/index';
import NotificationPreferences from './pages/notification-preferences';
import AITradeRecommendations from './pages/ai-trade-recommendations';
import PLReportingCenter from './pages/p-l-reporting-center';
import EducationHub from './pages/education-hub';
import ArbitrageMonitor from './pages/arbitrage-monitor';
import LiveTradingChat from './pages/live-trading-chat';
import AdminUserBalanceManagement from './pages/admin-user-balance-management';
import AdminUserManagementHub from './pages/admin-user-management-hub';
import AdminPaymentOperationsCenter from './pages/admin-payment-operations-center';
import AdminTradingMonitor from './pages/admin-trading-monitor';
import AdminContractManagement from './pages/admin-contract-management';
import AdminWebhookConfiguration from './pages/admin-webhook-configuration';
import AdminSystemMetrics from './pages/admin-system-metrics';
import UnifiedRiskDashboard from './pages/unified-risk-dashboard';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<Login />} />
        <Route path="/portfolio-analytics" element={<PortfolioAnalytics />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trade-history" element={<TradeHistory />} />
        <Route path="/market-analysis" element={<MarketAnalysis />} />
        <Route path="/trading-dashboard" element={<TradingDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<Navigate to="/login" replace />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-user-balance-management" element={<AdminUserBalanceManagement />} />
        <Route path="/admin-user-management-hub" element={<AdminUserManagementHub />} />
        <Route path="/admin-payment-operations-center" element={<AdminPaymentOperationsCenter />} />
        <Route path="/admin-trading-monitor" element={<AdminTradingMonitor />} />
        <Route path="/admin-contract-management" element={<AdminContractManagement />} />
        <Route path="/admin-webhook-configuration" element={<AdminWebhookConfiguration />} />
        <Route path="/admin-system-metrics" element={<AdminSystemMetrics />} />
        <Route path="/payment-management" element={<PaymentManagement />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/support-center" element={<SupportCenter />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/exchange-api-management" element={<ExchangeApiManagement />} />
        <Route path="/admin-api-verification" element={<AdminApiVerification />} />
        <Route path="/getting-started-guide" element={<GettingStartedGuide />} />
        <Route path="/api-key-verification-center" element={<ApiKeyVerificationCenter />} />
        <Route path="/system-health-monitor" element={<SystemHealthMonitor />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/notification-preferences" element={<NotificationPreferences />} />
        <Route path="/ai-trade-recommendations" element={<AITradeRecommendations />} />
        <Route path="/p-l-reporting-center" element={<PLReportingCenter />} />
        <Route path="/education-hub" element={<EducationHub />} />
        <Route path="/arbitrage-monitor" element={<ArbitrageMonitor />} />
        <Route path="/live-trading-chat" element={<LiveTradingChat />} />
        <Route path="/unified-risk-dashboard" element={<UnifiedRiskDashboard />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
