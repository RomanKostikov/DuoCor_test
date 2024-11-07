import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './OfficeList.css';

function OfficeList({ onLogout }) {
  const [offices, setOffices] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';  // Устанавливаем базовый URL API

  useEffect(() => {
    axios.get(`${API_URL}/offices/`)
      .then(response => setOffices(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, [API_URL]);

  return (
    <div className="office-list">
      <h1>Список офисов</h1>
      <button onClick={onLogout}>Logout</button>
      {offices.map(office => (
        <div key={office.id} className="office-item">
          <h2>{office.name}</h2>
          <p><strong>Адрес:</strong> {office.address}</p>
          <p><strong>Всего комнат:</strong> {office.total_rooms}</p>
          {office.rooms.map(room => (
            <div key={room.id}>
              <h3>Комната {room.number} (Вместимость: {room.capacity})</h3>
              <Link to={`/rooms/${room.id}`}>Посмотреть рабочие места</Link>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default OfficeList;
