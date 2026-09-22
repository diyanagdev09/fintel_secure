import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PortfolioPage from './pages/PortfolioPage.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import IPOPage from './pages/IPOPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DataUploadPage from './pages/DataUploadPage.jsx';
import ProcessingComparisonPage from './pages/ProcessingComparisonPage.jsx';
import VisualizationPage from './pages/VisualizationPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import SecurityModulePage from './pages/SecurityModulePage.jsx';
import CasesPage from './pages/CasesPage.jsx';
import RulesLabPage from './pages/RulesLabPage.jsx';
import StocksPage from './pages/StocksPage.jsx';
import StockDetailPage from './pages/StockDetailPage.jsx';
import ScreenerPage from './pages/ScreenerPage.jsx';
import AdminRiskCommandCenterPage from './pages/AdminRiskCommandCenterPage.jsx';
import LearnPage from './pages/LearnPage.jsx';
import MarketPage from './pages/MarketPage.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { DataProvider } from './context/DataContext.jsx';

function Content() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d141c',
            color: '#e5edf3',
            border: '1px solid #223140',
            fontSize: '11px',
          },
        }}
      />

      <ErrorBoundary>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* PROTECTED APPLICATION */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >

            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/upload" element={<DataUploadPage />} />

            <Route
              path="/processing"
              element={<ProcessingComparisonPage />}
            />

            <Route
              path="/visualization"
              element={<VisualizationPage />}
            />

            <Route
              path="/insights"
              element={<VisualizationPage />}
            />

            <Route
              path="/market"
              element={<MarketPage />}
            />
            
            <Route
              path="/history"
              element={<HistoryPage />}
            />

            <Route
              path="/security"
              element={<SecurityModulePage />}
            />

            <Route
              path="/cases"
              element={<CasesPage />}
            />

            <Route
              path="/rules"
              element={<RulesLabPage />}
            />

            <Route
              path="/market"
              element={
                <Navigate to="/stocks" replace />
              }
            />

            <Route
              path="/stocks"
              element={<StocksPage />}
            />

            <Route
              path="/stocks/:symbol"
              element={<StockDetailPage />}
            />

            <Route
              path="/screener"
              element={<ScreenerPage />}
            />

            <Route
              path="/learn"
              element={<LearnPage />}
            />

            <Route
              path="/ipos"
              element={<IPOPage />}
            />

            <Route
              path="/portfolio"
              element={<PortfolioPage />}
            />

            <Route
              path="/admin/risk"
              element={<AdminRiskCommandCenterPage />}
            />

          </Route>

          {/* FALLBACK */}
          <Route
            path="*"
            element={
              <Navigate
                to={currentUser ? '/dashboard' : '/'}
                replace
              />
            }
          />

        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Content />
      </DataProvider>
    </AuthProvider>
  );
}