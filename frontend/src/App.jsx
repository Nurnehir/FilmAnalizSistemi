import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><div className="text-white p-8">Dashboard (FAZ 8)</div></PrivateRoute>} />
          <Route path="/recommend" element={<PrivateRoute><div className="text-white p-8">Recommend (FAZ 8)</div></PrivateRoute>} />
          <Route path="/watchlist" element={<PrivateRoute><div className="text-white p-8">Watchlist (FAZ 8)</div></PrivateRoute>} />
          <Route path="/movie/:id" element={<div className="text-white p-8">Movie Detail (FAZ 8)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
