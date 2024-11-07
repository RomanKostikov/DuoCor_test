import React, { useState } from 'react';
import axios from 'axios';

function BookingForm({ workplaceId, onBookingSuccess }) {
  const [bookingData, setBookingData] = useState({ start_time: '', end_time: '' });
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'; // Динамическая переменная URL API

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingPayload = {
      workplace: workplaceId,
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
    };

    axios.post(`${API_URL}/bookings/`, bookingPayload, { // Используем переменную API_URL
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(response => {
        alert('Бронирование успешно!');
        onBookingSuccess();
      })
      .catch(error => {
        const errorMessage = error.response?.data?.non_field_errors?.[0] || 'Не удалось забронировать рабочее место.';
        console.log("Ошибка бронирования:", errorMessage);
        if (errorMessage.includes("already booked")) {
          alert('В данный период место забронировано');
        } else {
          alert(errorMessage);
        }
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Начало:
        <input
          type="datetime-local"
          value={bookingData.start_time}
          onChange={(e) => setBookingData({ ...bookingData, start_time: e.target.value })}
        />
      </label>
      <label>
        Конец:
        <input
          type="datetime-local"
          value={bookingData.end_time}
          onChange={(e) => setBookingData({ ...bookingData, end_time: e.target.value })}
        />
      </label>
      <button type="submit">Забронировать</button>
    </form>
  );
}

export default BookingForm;



