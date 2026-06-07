import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider } from './context/LangContext';
import { SocialNotifProvider } from './context/SocialNotifContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Recommend from './pages/Recommend';
import MovieDetail from './pages/MovieDetail';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SearchResults from './pages/SearchResults';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Compare from './pages/Compare';
import Stats from './pages/Stats';
import Social from './pages/Social';
import UserProfile from './pages/UserProfile';
import SharedList from './pages/SharedList';

function AppShell() {
  const { loginModalOpen, closeLoginModal } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/compare" element={<PrivateRoute><Compare /></PrivateRoute>} />
        <Route path="/stats" element={<PrivateRoute><Stats /></PrivateRoute>} />
        <Route path="/social" element={<PrivateRoute><Social /></PrivateRoute>} />
        <Route path="/shared/:id" element={<PrivateRoute><SharedList /></PrivateRoute>} />
        <Route path="/user/:username" element={<UserProfile />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <LoginModal open={loginModalOpen} onClose={closeLoginModal} />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <BrowserRouter>
          <AuthProvider>
            <WatchlistProvider>
              <SocialNotifProvider>
                <AppShell />
              </SocialNotifProvider>
            </WatchlistProvider>
          </AuthProvider>
        </BrowserRouter>
      </LangProvider>
    </ThemeProvider>
  );
}

export default App;
