import React, { useState, useEffect } from 'react';
import BookingForm from './BookingForm';
import axios from 'axios';

function Workplace({ workplace }) {
  const [bookings, setBookings] = useState([]);
  const [isOccupied, setIsOccupied] = useState(false);

  // Получаем URL API из переменной окружения
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  const fetchAvailabilityInfo = () => {
    axios
      .get(`${API_URL}/bookings/upcoming_availability/${workplace.id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then(response => {
        console.log("Full response data:", response.data);
        setIsOccupied(response.data.is_occupied);

        if (response.data.bookings) {
          setBookings(response.data.bookings);
        } else {
          console.warn("No bookings data found in response");
          setBookings([]);
        }
      })
      .catch(error => {
        console.error("Failed to fetch availability info:", error);
      });
  };

  useEffect(() => {
    fetchAvailabilityInfo();
  }, []);

  const formatUTCDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <li>
      <h3>Рабочее место {workplace.number} - {isOccupied ? 'Занято' : 'Свободно'}</h3>

      <h4>Занятые периоды:</h4>
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <p key={booking.id}>
            Занято {booking.user?.username || "Неизвестно"} с {booking.start_time ? formatUTCDate(booking.start_time) : "Неизвестно"} до {booking.end_time ? formatUTCDate(booking.end_time) : "Неизвестно"}
          </p>
        ))
      ) : (
        <p>Нет бронирований</p>
      )}

      <BookingForm
        workplaceId={workplace.id}
        onBookingSuccess={fetchAvailabilityInfo}
      />
    </li>
  );
}

export default Workplace;
