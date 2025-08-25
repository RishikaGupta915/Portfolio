import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Sun,
  Wifi,
  Battery,
  Volume2,
  ChevronUp,
  ChevronDown,
  Calendar,
  MapPin,
} from 'lucide-react';

function Taskbar({ apps }) {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: 28,
    condition: 'Sunny',
    humidity: 65,
    windSpeed: 12,
    location: 'Delhi, India',
  });
  const [showWeatherDetails, setShowWeatherDetails] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest('.weather-popup') &&
        !event.target.closest('.weather-button')
      ) {
        setShowWeatherDetails(false);
      }
      if (
        !event.target.closest('.calendar-popup') &&
        !event.target.closest('.calendar-button')
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Later: fetch weather from API
  useEffect(() => {
    fetch(
      'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/India?unitGroup=metric&key=N5Y39EFD59FKNAFQSJ9E5QKJV&contentType=json'
    )
      .then((res) => res.json())
      .then((data) =>
        setWeather({
          temp: Math.round(data.currentConditions.temp),
          condition: data.currentConditions.conditions,
          humidity: data.currentConditions.humidity,
          windSpeed: Math.round(data.currentConditions.windspeed),
          location: 'Delhi, India',
        })
      )
      .catch(() => {
        // Fallback data if API fails
        setWeather({
          temp: 28,
          condition: 'Sunny',
          humidity: 65,
          windSpeed: 12,
          location: 'Delhi, India',
        });
      });
  }, []);

  // Generate calendar days
  const generateCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const calendarDays = generateCalendar(time);
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed bottom-0 left-0 w-full h-12 bg-black/60 backdrop-blur-md flex items-center justify-between px-4 border-t border-white/10">
      {/* Start Button */}
      <button className="p-2 rounded hover:bg-white/20 transition">
        <img src="/icons/start.png" alt="Start" className="h-6 w-6" />
      </button>

      {/* App Icons */}
      <div className="flex space-x-4">
        {apps.map((app, index) => (
          <button
            key={index}
            className="p-2 hover:bg-white/20 rounded transition"
          >
            <img src={app.icon} alt={app.name} className="h-6 w-6" />
          </button>
        ))}
      </div>

      {/* Right Side: Weather + Time + System Tray */}
      <div className="flex items-center space-x-4 text-white text-sm relative">
        {/* Weather Widget */}
        <div className="relative weather-popup">
          <button
            onClick={() => setShowWeatherDetails(!showWeatherDetails)}
            className="weather-button flex items-center space-x-1 p-2 rounded hover:bg-white/20 transition"
          >
            {weather.condition.toLowerCase().includes('sun') ? (
              <Sun size={16} />
            ) : (
              <Cloud size={16} />
            )}
            <span>{weather.temp}°C</span>
            {showWeatherDetails ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronUp size={12} />
            )}
          </button>

          {/* Weather Details Popup */}
          {showWeatherDetails && (
            <div className="absolute bottom-full mb-2 left-0 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-4 min-w-[200px] shadow-xl z-50">
              <div className="flex items-center space-x-2 mb-3">
                <MapPin size={14} />
                <span className="text-xs font-medium">{weather.location}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span className="font-medium">{weather.temp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Condition:</span>
                  <span className="font-medium">{weather.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span>Humidity:</span>
                  <span className="font-medium">{weather.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Wind Speed:</span>
                  <span className="font-medium">{weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Tray */}
        <div className="flex space-x-2">
          <Wifi size={16} />
          <Volume2 size={16} />
          <Battery size={16} />
        </div>

        {/* Time + Date */}
        <div className="relative calendar-popup">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="calendar-button p-1 rounded hover:bg-white/20 transition text-center"
          >
            <div>
              {time.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className="text-xs">
              {time.getDate().toString().padStart(2, '0')}-
              {(time.getMonth() + 1).toString().padStart(2, '0')}-
              {time.getFullYear()}
            </div>
          </button>

          {/* Calendar Popup */}
          {showCalendar && (
            <div className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-xl z-50 min-w-[280px]">
              {/* Header */}
              <div className="flex items-center justify-center mb-4">
                <h3 className="text-lg font-bold text-white">
                  {monthNames[time.getMonth()]} {time.getFullYear()}
                </h3>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center p-2 text-white/50 text-xs font-bold"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`text-center p-2 rounded text-sm font-medium ${
                      day === time.getDate()
                        ? 'bg-blue-500 text-white shadow-lg'
                        : day
                        ? 'text-white/80 hover:bg-white/10 cursor-pointer'
                        : ''
                    }`}
                  >
                    {day || ''}
                  </div>
                ))}
              </div>

              {/* Today info - simplified */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="text-sm text-center text-white/70">
                  {time.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Taskbar;
