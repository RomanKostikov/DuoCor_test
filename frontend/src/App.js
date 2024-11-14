import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Register from './components/Register';
import Auth from './components/Auth';
import OfficeList from './components/OfficeList';
import Room from './components/Room';
import NotFound from './components/NotFound';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/accounts/token/refresh/`, {
            refresh: refreshToken
          });
          localStorage.setItem('token', response.data.access);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Не удалось обновить токен:", error);
          handleLogout();
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
  };

  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <p>Загрузка...</p>;
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/offices" : "/login"} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Auth onLogin={handleLogin} />} />
          <Route
            path="/offices"
            element={
              <ProtectedRoute>
                <OfficeList onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms/:roomId"
            element={
              <ProtectedRoute>
                <Room />
              </ProtectedRoute>
            }
          />
          {/* Маршрут для обработки ошибки 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

