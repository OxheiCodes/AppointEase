import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import AuthLoginPage from './pages/AuthLoginPage.jsx';
import AuthSignupPage from './pages/AuthSignupPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import OwnerDashboardPage from './pages/OwnerDashboardPage.jsx';
import PublicBookingPage from './pages/PublicBookingPage.jsx';
import DashboardRedirectPage from './pages/DashboardRedirectPage.jsx';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/login" element={<AuthLoginPage />} />
        <Route path="/auth/signup" element={<AuthSignupPage />} />
        <Route path="/auth/account" element={<AccountPage />} />
        <Route path="/dashboard" element={<DashboardRedirectPage />} />
        <Route path="/bookings" element={<BookingPage />} />
        <Route path="/owner-dashboard" element={<OwnerDashboardPage />} />
        <Route path="/public-booking" element={<PublicBookingPage />} />
      </Routes>
    </div>
  );
}

export default App;
