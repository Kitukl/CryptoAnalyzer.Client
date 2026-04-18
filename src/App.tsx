import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import CoinDetailPage from './pages/CoinDetailPage'; // Додано імпорт
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { ConfigProvider, theme } from 'antd';

function App() {
  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <Router>
        <div className="flex min-h-screen bg-[#0B0E14] text-white">
          {/* Фіксований сайдбар зліва */}
          <Sidebar />

          {/* Основний контент із відступом ml-64 (ширина сайдбара) */}
          <main className="flex-1 ml-64 p-10 overflow-x-hidden min-h-screen">
            <Routes>
              {/* Публічні маршрути */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/confirm-email" element={<ConfirmEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />

                <Route path="/coin/:coinId" element={<CoinDetailPage />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;