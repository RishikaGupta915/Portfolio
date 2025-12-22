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
    condition: 'Clear',
    humidity: 65,
    windSpeed: 12,
    location: 'Mumbai, India',
  });
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [geoStatus, setGeoStatus] = useState({ state: 'idle', message: '' });
  const requestLocationWeatherRef = React.useRef(null);
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

  useEffect(() => {
    const MUMBAI = { lat: 19.076, lon: 72.8777, label: 'Mumbai, India' };
    const COORDS_CACHE_KEY = 'taskbarWeatherCoords';

    const conditionFromWeatherCode = (code) => {
      if (code === 0) return 'Clear';
      if (code === 1) return 'Mainly clear';
      if (code === 2) return 'Partly cloudy';
      if (code === 3) return 'Overcast';
      if (code === 45 || code === 48) return 'Fog';
      if (code >= 51 && code <= 57) return 'Drizzle';
      if (code >= 61 && code <= 67) return 'Rain';
      if (code >= 71 && code <= 77) return 'Snow';
      if (code >= 80 && code <= 82) return 'Showers';
      if (code >= 95) return 'Thunderstorm';
      return 'Cloudy';
    };

    const reverseGeocodeLabel = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
            lat
          )}&longitude=${encodeURIComponent(lon)}&localityLanguage=en`
        );
        if (!res.ok) return null;
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision;
        const country = data.countryName;
        if (!city && !country) return null;
        if (city && country) return `${city}, ${country}`;
        return city || country;
      } catch {
        return null;
      }
    };

    const fetchWeatherForCoords = async (lat, lon, fallbackLabel) => {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
        lat
      )}&longitude=${encodeURIComponent(
        lon
      )}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=celsius&wind_speed_unit=kmh`;

      const [weatherRes, label] = await Promise.all([
        fetch(weatherUrl),
        reverseGeocodeLabel(lat, lon),
      ]);

      if (!weatherRes.ok) throw new Error('Weather fetch failed');
      const weatherData = await weatherRes.json();

      const current = weatherData?.current;
      const temp = current?.temperature_2m;
      const humidity = current?.relative_humidity_2m;
      const windSpeed = current?.wind_speed_10m;
      const weatherCode = current?.weather_code;

      setWeather({
        temp: Number.isFinite(temp) ? Math.round(temp) : 0,
        condition: Number.isFinite(weatherCode)
          ? conditionFromWeatherCode(weatherCode)
          : 'Cloudy',
        humidity: Number.isFinite(humidity) ? Math.round(humidity) : 0,
        windSpeed: Number.isFinite(windSpeed) ? Math.round(windSpeed) : 0,
        location: label || fallbackLabel || 'Your location',
      });
    };

    let cancelled = false;
    let refreshTimer = 0;

    const load = async ({ requestedByUser = false } = {}) => {
      setWeatherLoading(true);

      // Show last known location quickly (then refresh with live geolocation if allowed).
      try {
        const cached = JSON.parse(
          localStorage.getItem(COORDS_CACHE_KEY) || 'null'
        );
        if (
          cached &&
          typeof cached.lat === 'number' &&
          typeof cached.lon === 'number' &&
          Number.isFinite(cached.lat) &&
          Number.isFinite(cached.lon)
        ) {
          await fetchWeatherForCoords(cached.lat, cached.lon, 'Your location');
        }
      } catch {
        // ignore cache errors
      }

      const applyFallback = async () => {
        try {
          await fetchWeatherForCoords(MUMBAI.lat, MUMBAI.lon, MUMBAI.label);
        } catch {
          // Keep the default Mumbai values if even the API fails.
        }
      };

      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      if (!window.isSecureContext && !isLocalhost) {
        setGeoStatus({
          state: 'insecure',
          message: 'Location requires HTTPS to work.',
        });
        await applyFallback();
        if (!cancelled) setWeatherLoading(false);
        return;
      }

      const geoloc = navigator.geolocation;
      if (!geoloc) {
        setGeoStatus({
          state: 'unavailable',
          message: 'Location not available.',
        });
        await applyFallback();
        if (!cancelled) setWeatherLoading(false);
        return;
      }

      // If permissions API is supported, reflect it.
      try {
        if (navigator.permissions?.query) {
          const perm = await navigator.permissions.query({
            name: 'geolocation',
          });
          if (perm?.state === 'denied') {
            setGeoStatus({
              state: 'denied',
              message: 'Location blocked. Allow it in browser settings.',
            });
            await applyFallback();
            if (!cancelled) setWeatherLoading(false);
            return;
          }
        }
      } catch {
        // ignore permissions API errors
      }

      setGeoStatus({
        state: 'requesting',
        message: requestedByUser ? 'Requesting location…' : '',
      });

      geoloc.getCurrentPosition(
        async (pos) => {
          if (cancelled) return;
          try {
            await fetchWeatherForCoords(
              pos.coords.latitude,
              pos.coords.longitude,
              'Your location'
            );
            try {
              localStorage.setItem(
                COORDS_CACHE_KEY,
                JSON.stringify({
                  lat: pos.coords.latitude,
                  lon: pos.coords.longitude,
                  ts: Date.now(),
                })
              );
            } catch {
              
            }
            setGeoStatus({ state: 'granted', message: '' });
          } catch {
            await applyFallback();
            setGeoStatus({
              state: 'error',
              message: 'Could not load weather.',
            });
          }
          if (!cancelled) setWeatherLoading(false);
        },
        async (err) => {
          if (cancelled) return;
          if (err?.code === 1) {
            setGeoStatus({
              state: 'denied',
              message:
                'Location blocked. Allow it in the browser prompt/settings.',
            });
          } else if (err?.code === 3) {
            setGeoStatus({
              state: 'timeout',
              message: 'Location request timed out.',
            });
          } else {
            setGeoStatus({
              state: 'error',
              message: 'Could not get your location.',
            });
          }

          await applyFallback();
          if (!cancelled) setWeatherLoading(false);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 }
      );
    };

    requestLocationWeatherRef.current = (opts) => load(opts);

    load();
    refreshTimer = window.setInterval(load, 10 * 60 * 1000);

    return () => {
      cancelled = true;
      if (refreshTimer) window.clearInterval(refreshTimer);
    };
  }, []);

  // Search functionality 
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
            {weather.condition.toLowerCase().includes('clear') ||
            weather.condition.toLowerCase().includes('sun') ? (
              <Sun size={16} />
            ) : (
              <Cloud size={16} />
            )}
            <span>{weatherLoading ? '--' : `${weather.temp}°C`}</span>
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

              {geoStatus.state !== 'granted' && (
                <div className="mb-3">
                  {geoStatus.message && (
                    <div className="text-[11px] text-white/70 mb-2">
                      {geoStatus.message}
                    </div>
                  )}
                  <button
                    onClick={() =>
                      requestLocationWeatherRef.current?.({
                        requestedByUser: true,
                      })
                    }
                    className="no-drag text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition text-white"
                  >
                    Use my location
                  </button>
                </div>
              )}

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
