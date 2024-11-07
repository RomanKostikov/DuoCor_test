import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Workplace from './Workplace';
import './Room.css';

function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [roomNumber, setRoomNumber] = useState(location.state?.roomNumber || roomId);
  const [workplaces, setWorkplaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    if (!location.state?.roomNumber) {
      axios.get(`${API_URL}/rooms/${roomId}/`)
        .then(response => {
          setRoomNumber(response.data.number);
        })
        .catch(error => {
          console.error("Ошибка при получении номера комнаты:", error);
        });
    }
  }, [location.state, roomId, API_URL]);

  useEffect(() => {
    axios.get(`${API_URL}/rooms/${roomId}/workplaces/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(response => {
        setWorkplaces(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Ошибка при получении рабочих мест:", error);
        setLoading(false);
      });
  }, [roomId, API_URL]);

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="room-container">
      <button onClick={() => navigate(-1)}>Назад</button>
      <h2>Рабочие места в комнате {roomNumber}</h2>
      <div>
        {workplaces.map(workplace => (
          <div key={workplace.id} className="workplace-item">
            <Workplace workplace={workplace} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Room;

