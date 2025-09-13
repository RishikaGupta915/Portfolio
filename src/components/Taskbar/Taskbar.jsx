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

function Taskbar({ apps, allApps }) {
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
  const [search, setSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filteredApps, setFilteredApps] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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
      if (
        !event.target.closest('.search-popup') &&
        !event.target.closest('.search-input')
      ) {
        setShowSearchResults(false);
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
        setWeather({
          temp: 28,
          condition: 'Sunny',
          humidity: 65,
          windSpeed: 12,
          location: 'Delhi, India',
        });
      });
  }, []);

  // Search functionality - search through ALL apps, not just taskbar apps
  useEffect(() => {
    if (search.trim() && allApps && allApps.length > 0) {
      const filtered = allApps.filter(
        (app) =>
          app.name.toLowerCase().includes(search.toLowerCase()) ||
          app.category.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredApps(filtered);
      setShowSearchResults(true);
    } else {
      setFilteredApps([]);
      setShowSearchResults(false);
    }
  }, [search, allApps]);

  const handleSearchSelect = (app) => {
    app.onClick();
    setSearch('');
    setShowSearchResults(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && filteredApps.length > 0) {
      handleSearchSelect(filteredApps[0]);
    } else if (e.key === 'Escape') {
      setSearch('');
      setShowSearchResults(false);
      e.target.blur();
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    // Debug logging
    console.log('Search value:', value);
    console.log('Available allApps:', allApps);
  };
  const generateCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

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
      {/* Search Bar */}
      <div className="flex items-center space-x-2 min-w-[200px] relative">
        <div className="relative flex-1 search-popup">
          <input
            type="text"
            placeholder="Search apps..."
            value={search}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => {
              if (search.trim() && filteredApps.length > 0) {
                setShowSearchResults(true);
              }
            }}
            className="search-input w-full h-8 px-3 pl-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
          />
          <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/60">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && filteredApps.length > 0 && (
            <div className="absolute bottom-full mb-2 left-0 w-full bg-black/95 backdrop-blur-md border border-white/30 rounded-lg shadow-xl z-[9999] overflow-hidden max-h-48 overflow-y-auto">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleSearchSelect(app)}
                  className="w-full flex items-center space-x-3 px-3 py-3 hover:bg-white/20 transition-colors text-left border-b border-white/10 last:border-b-0"
                >
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-5 h-5 object-contain flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">
                      {app.name}
                    </span>
                    <span className="text-white/60 text-xs capitalize">
                      {app.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {showSearchResults && search.trim() && filteredApps.length === 0 && (
            <div className="absolute bottom-full mb-2 left-0 w-full bg-black/95 backdrop-blur-md border border-white/30 rounded-lg shadow-xl z-[9999] px-3 py-3">
              <span className="text-white/60 text-sm">
                No apps found for "{search}"
              </span>
            </div>
          )}
        </div>
      </div>

      {/* App Icons */}
      <div className="flex space-x-4">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={app.onClick}
            className="flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-white/20 transition-colors group"
            title={app.name}
          >
            <img
              src={app.icon}
              alt={app.name}
              className="w-6 h-6 object-contain group-hover:scale-110 transition-transform"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                console.warn(`Failed to load icon for ${app.name}`);
              }}
            />
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
