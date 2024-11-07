import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Auth.css';

function Auth({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const loginData = {
      email: credentials.email,
      password: credentials.password,
    };

    axios.post(`${API_URL}/accounts/token/`, loginData, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      Cookies.set('token', response.data.access, { expires: 1 / 24 });
      Cookies.set('refreshToken', response.data.refresh, { expires: 7 });
      setErrorMessage('');
      onLogin(response.data.access, response.data.refresh);
      navigate('/offices');
    })
    .catch(error => {
      setErrorMessage("Login failed. Please check your email and password.");
    });
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}

export default Auth;

