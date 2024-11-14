import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-message">Страница не найдена</h2>
        <p>Извините, страница, которую вы ищете, не существует или была перемещена.</p>
        <Link to="/offices" className="back-home-button">
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
