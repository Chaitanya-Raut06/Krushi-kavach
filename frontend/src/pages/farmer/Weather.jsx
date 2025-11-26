import { useState, useEffect } from 'react';
import { weatherAPI } from '../../services/api';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Weather = () => {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserLocation();
    fetchWeather();
  }, []);

  /**
   * Fetch user location information (district, taluka, coordinates)
   */
  const fetchUserLocation = async () => {
    try {
      const response = await userAPI.getProfile();
      const profile = response.data;
      if (profile.location?.coordinates && profile.address) {
        setUserLocation({
          district: profile.address.district || 'Unknown',
          taluka: profile.address.taluka || 'Unknown',
          coordinates: profile.location.coordinates,
        });
      }
    } catch (err) {
      console.error('Failed to fetch user location:', err);
    }
  };

  /**
   * Map Open-Meteo weather_code to human-readable description with emoji
   */
  const getWeatherDescription = (code) => {
    const weatherMap = {
      0: { text: 'Clear sky', emoji: '☀️', description: 'Sunny and clear' },
      1: { text: 'Mainly clear', emoji: '🌤️', description: 'Mostly sunny' },
      2: { text: 'Partly cloudy', emoji: '⛅', description: 'Partly cloudy' },
      3: { text: 'Overcast', emoji: '☁️', description: 'Cloudy' },
      45: { text: 'Fog', emoji: '🌫️', description: 'Foggy conditions' },
      48: { text: 'Depositing rime fog', emoji: '🌫️', description: 'Foggy with frost' },
      51: { text: 'Light drizzle', emoji: '🌦️', description: 'Light drizzle' },
      53: { text: 'Moderate drizzle', emoji: '🌦️', description: 'Moderate drizzle' },
      55: { text: 'Dense drizzle', emoji: '🌧️', description: 'Heavy drizzle' },
      56: { text: 'Light freezing drizzle', emoji: '🌧️', description: 'Light freezing rain' },
      57: { text: 'Dense freezing drizzle', emoji: '🌧️', description: 'Heavy freezing rain' },
      61: { text: 'Slight rain', emoji: '🌧️', description: 'Light rain' },
      63: { text: 'Moderate rain', emoji: '🌧️', description: 'Moderate rain' },
      65: { text: 'Heavy rain', emoji: '🌧️', description: 'Heavy rain' },
      66: { text: 'Light freezing rain', emoji: '🌧️', description: 'Light freezing rain' },
      67: { text: 'Heavy freezing rain', emoji: '🌧️', description: 'Heavy freezing rain' },
      71: { text: 'Slight snow', emoji: '🌨️', description: 'Light snow' },
      73: { text: 'Moderate snow', emoji: '🌨️', description: 'Moderate snow' },
      75: { text: 'Heavy snow', emoji: '❄️', description: 'Heavy snow' },
      77: { text: 'Snow grains', emoji: '❄️', description: 'Snow grains' },
      80: { text: 'Slight rain showers', emoji: '🌦️', description: 'Light rain showers' },
      81: { text: 'Moderate rain showers', emoji: '🌧️', description: 'Moderate rain showers' },
      82: { text: 'Violent rain showers', emoji: '⛈️', description: 'Heavy rain showers' },
      85: { text: 'Slight snow showers', emoji: '🌨️', description: 'Light snow showers' },
      86: { text: 'Heavy snow showers', emoji: '❄️', description: 'Heavy snow showers' },
      95: { text: 'Thunderstorm', emoji: '⛈️', description: 'Thunderstorm' },
      96: { text: 'Thunderstorm with slight hail', emoji: '⛈️', description: 'Thunderstorm with hail' },
      99: { text: 'Thunderstorm with heavy hail', emoji: '⛈️', description: 'Severe thunderstorm' },
    };
    return weatherMap[code] || { text: 'Unknown', emoji: '🌡️', description: 'Weather data unavailable' };
  };

  /**
   * Convert wind direction in degrees to compass direction
   */
  const getWindDirection = (degrees) => {
    if (degrees === null || degrees === undefined) return 'N/A';
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    }
  };

  /**
   * Fetch weather data from backend API
   */
  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await weatherAPI.getWeather();
      setWeather(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather data. Please ensure your profile has a valid farm location.');
    } finally {
      setLoading(false);
    }
  };

  // Extract current weather data
  const currentWeather = weather?.current ? {
    temperature: Math.round(weather.current.temperature_2m),
    feelsLike: Math.round(weather.current.apparent_temperature),
    humidity: Math.round(weather.current.relative_humidity_2m),
    windSpeed: Math.round(weather.current.wind_speed_10m),
    precipitation: weather.current.precipitation || 0,
    weatherCode: weather.current.weather_code,
    time: weather.current.time,
  } : null;

  // Extract daily forecast data
  const dailyForecast = weather?.daily ? weather.daily.time.map((date, index) => ({
    date,
    maxTemp: Math.round(weather.daily.temperature_2m_max[index]),
    minTemp: Math.round(weather.daily.temperature_2m_min[index]),
    weatherCode: weather.daily.weather_code[index],
    precipitation: weather.daily.precipitation_sum[index] || 0,
    precipitationProbability: weather.daily.precipitation_probability_max[index] || 0,
  })) : [];

  const currentWeatherInfo = currentWeather ? getWeatherDescription(currentWeather.weatherCode) : null;

  return (
    <div className="weather-page-container">
      <style>{`
        .weather-page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .weather-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
        }

        .weather-title {
          font-size: 2.5rem;
          color: #2d5016;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .weather-subtitle {
          font-size: 1.1rem;
          color: #666;
        }

        .refresh-button {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .refresh-button:hover {
          background: #218838;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .refresh-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
        }

        .loading-container {
          text-align: center;
          padding: 60px 20px;
          font-size: 1.2rem;
          color: #666;
          background: white;
          border-radius: 15px;
          margin: 20px 0;
        }

        .error-container {
          background: #f8d7da;
          color: #721c24;
          padding: 20px;
          border-radius: 10px;
          border: 2px solid #f5c6cb;
          margin: 20px 0;
          text-align: center;
          font-size: 1.1rem;
        }

        .location-badge {
          background: #fff3cd;
          color: #856404;
          padding: 12px 20px;
          border-radius: 25px;
          display: inline-block;
          margin: 10px 0;
          font-weight: 600;
          font-size: 1rem;
        }

        .current-weather-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 40px;
          color: white;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .current-weather-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .weather-condition {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .weather-emoji {
          font-size: 5rem;
          line-height: 1;
        }

        .weather-text {
          display: flex;
          flex-direction: column;
        }

        .weather-main-text {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .weather-description {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .temperature-display {
          text-align: right;
        }

        .temperature-main {
          font-size: 5rem;
          font-weight: bold;
          line-height: 1;
          margin-bottom: 10px;
        }

        .temperature-feels-like {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .weather-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .weather-detail-item {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 20px;
          border-radius: 15px;
          text-align: center;
        }

        .weather-detail-label {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 8px;
        }

        .weather-detail-value {
          font-size: 1.8rem;
          font-weight: bold;
        }

        .weather-detail-unit {
          font-size: 1rem;
          opacity: 0.8;
        }

        .forecast-section {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .forecast-title {
          font-size: 1.8rem;
          color: #2d5016;
          margin-bottom: 25px;
          font-weight: bold;
        }

        .forecast-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .forecast-card {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          transition: transform 0.3s, box-shadow 0.3s;
          border: 2px solid transparent;
        }

        .forecast-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          border-color: #28a745;
        }

        .forecast-date {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2d5016;
          margin-bottom: 15px;
        }

        .forecast-emoji {
          font-size: 3rem;
          margin-bottom: 10px;
        }

        .forecast-condition {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 15px;
        }

        .forecast-temp {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .forecast-temp-max {
          font-size: 1.5rem;
          font-weight: bold;
          color: #2d5016;
        }

        .forecast-temp-min {
          font-size: 1.3rem;
          color: #666;
        }

        .forecast-precipitation {
          font-size: 0.85rem;
          color: #666;
          margin-top: 10px;
        }

        .precipitation-high {
          color: #dc3545;
          font-weight: 600;
        }

        .precipitation-medium {
          color: #ffc107;
          font-weight: 600;
        }

        .precipitation-low {
          color: #28a745;
        }

        @media (max-width: 768px) {
          .weather-page-container {
            padding: 10px;
          }

          .weather-title {
            font-size: 1.8rem;
          }

          .current-weather-card {
            padding: 25px;
          }

          .weather-emoji {
            font-size: 3.5rem;
          }

          .temperature-main {
            font-size: 3.5rem;
          }

          .weather-main-text {
            font-size: 1.5rem;
          }

          .forecast-grid {
            grid-template-columns: 1fr;
          }

          .weather-details-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="weather-header">
        <h1 className="weather-title">🌾 Farm Weather Information</h1>
        <p className="weather-subtitle">Current weather conditions and 7-day forecast for your farm</p>
        {userLocation && (
          <div className="location-badge">
            🌍 {userLocation.district}, {userLocation.taluka}
          </div>
        )}
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={fetchWeather}
            disabled={loading}
            className="refresh-button"
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh Weather'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          ⏳ Fetching weather data for your farm location...
        </div>
      )}

      {error && !loading && (
        <div className="error-container">
          ⚠️ {error}
        </div>
      )}

      {currentWeather && currentWeatherInfo && !loading && (
        <>
          {/* Current Weather Card */}
          <div className="current-weather-card">
            <div className="current-weather-header">
              <div className="weather-condition">
                <div className="weather-emoji">{currentWeatherInfo.emoji}</div>
                <div className="weather-text">
                  <div className="weather-main-text">{currentWeatherInfo.text}</div>
                  <div className="weather-description">{currentWeatherInfo.description}</div>
                </div>
              </div>
              <div className="temperature-display">
                <div className="temperature-main">{currentWeather.temperature}°C</div>
                <div className="temperature-feels-like">Feels like {currentWeather.feelsLike}°C</div>
              </div>
            </div>

            <div className="weather-details-grid">
              <div className="weather-detail-item">
                <div className="weather-detail-label">💧 Humidity</div>
                <div className="weather-detail-value">
                  {currentWeather.humidity}
                  <span className="weather-detail-unit">%</span>
                </div>
              </div>

              <div className="weather-detail-item">
                <div className="weather-detail-label">💨 Wind Speed</div>
                <div className="weather-detail-value">
                  {currentWeather.windSpeed}
                  <span className="weather-detail-unit"> km/h</span>
                </div>
              </div>

              <div className="weather-detail-item">
                <div className="weather-detail-label">🌧️ Precipitation</div>
                <div className="weather-detail-value">
                  {currentWeather.precipitation.toFixed(1)}
                  <span className="weather-detail-unit"> mm</span>
                </div>
              </div>

              <div className="weather-detail-item">
                <div className="weather-detail-label">🕐 Updated</div>
                <div className="weather-detail-value" style={{ fontSize: '1rem' }}>
                  {new Date(currentWeather.time).toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          {dailyForecast.length > 0 && (
            <div className="forecast-section">
              <h2 className="forecast-title">📅 7-Day Weather Forecast</h2>
              <div className="forecast-grid">
                {dailyForecast.map((day, index) => {
                  const dayWeather = getWeatherDescription(day.weatherCode);
                  const precipClass = day.precipitationProbability >= 70 
                    ? 'precipitation-high' 
                    : day.precipitationProbability >= 40 
                    ? 'precipitation-medium' 
                    : 'precipitation-low';
                  
                  return (
                    <div key={index} className="forecast-card">
                      <div className="forecast-date">{formatDate(day.date)}</div>
                      <div className="forecast-emoji">{dayWeather.emoji}</div>
                      <div className="forecast-condition">{dayWeather.text}</div>
                      <div className="forecast-temp">
                        <span className="forecast-temp-max">{day.maxTemp}°</span>
                        <span className="forecast-temp-min">/{day.minTemp}°</span>
                      </div>
                      {day.precipitation > 0 && (
                        <div className="forecast-precipitation">
                          🌧️ {day.precipitation.toFixed(1)} mm
                        </div>
                      )}
                      {day.precipitationProbability > 0 && (
                        <div className={`forecast-precipitation ${precipClass}`}>
                          💧 {day.precipitationProbability}% chance
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {!weather && !loading && !error && (
        <div className="error-container">
          No weather data available. Please ensure your profile has a valid farm location.
        </div>
      )}
    </div>
  );
};

export default Weather;
