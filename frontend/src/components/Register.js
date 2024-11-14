import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirm) {
      setErrorMessage("Пароли не совпадают.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/accounts/register/`, formData);
      setSuccessMessage("Регистрация прошла успешно! Вы можете войти в систему.");
      setErrorMessage('');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data) {
        const errors = error.response.data;
        handleErrors(errors);
      } else {
        setErrorMessage("Не удалось зарегистрироваться. Пожалуйста, попробуйте снова.");
      }
    }
  };

  const handleErrors = (errors) => {
    let translatedErrors = [];
    if (errors.username) {
      translatedErrors.push(`Имя пользователя: ${translateUsernameErrors(errors.username)}`);
    }
    if (errors.email) {
      translatedErrors.push(`Email: ${translateEmailErrors(errors.email)}`);
    }
    if (errors.password) {
      translatedErrors.push(`Пароль: ${translatePasswordErrors(errors.password)}`);
    }
    setErrorMessage(translatedErrors.join('. '));
  };

  const translateUsernameErrors = (usernameErrors) => {
    return usernameErrors.map((error) => {
      if (error.includes("A user with that username already exists")) {
        return "Пользователь с таким именем уже существует.";
      }
      return error;
    }).join(', ');
  };

  const translateEmailErrors = (emailErrors) => {
    return emailErrors.map((error) => {
      if (error.includes("Enter a valid email address")) {
        return "Введите правильный адрес электронной почты.";
      }
      return error;
    }).join(', ');
  };

  const translatePasswordErrors = (passwordErrors) => {
    return passwordErrors.map((error) => {
      if (error.includes("This password is too short")) {
        return "Пароль слишком короткий. Должен содержать не менее 8 символов.";
      }
      if (error.includes("This password is too common")) {
        return "Пароль слишком простой. Пожалуйста, используйте более сложный пароль.";
      }
      if (error.includes("This password is entirely numeric")) {
        return "Пароль не может состоять только из цифр.";
      }
      return error;
    }).join(', ');
  };

  return (
    <div className="register-container">
      <h2>Регистрация</h2>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Имя пользователя:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Пароль:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Подтвердите пароль:</label>
          <input
            type="password"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
}

export default Register;
