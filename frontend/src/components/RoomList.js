import React from 'react';
import { Link } from 'react-router-dom';

function RoomList({ rooms }) {
  return (
    <div>
      {rooms.map(room => (
        <div key={room.id} className="room-item">
          <h3>Комната {room.number} (Вместимость: {room.capacity})</h3>
          <Link to={`/rooms/${room.id}`} state={{ roomNumber: room.number }}>
            Посмотреть рабочие места
          </Link>
        </div>
      ))}
    </div>
  );
}

export default RoomList;


