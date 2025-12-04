import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Advisories = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [weatherData, setWeatherData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      fetchWeatherAdvisory();
    }
  }, [userLocation]);

  /**
   * Fetch user location information (district, coordinates)
   */
  const fetchUserLocation = async () => {
    try {
      const response = await userAPI.getProfile();
      const profile = response.data;
      if (profile.location?.coordinates && profile.address?.district) {
        const [longitude, latitude] = profile.location.coordinates;
        setUserLocation({
          district: profile.address.district,
          latitude,
          longitude,
        });
      } else {
        setError(t('advisory.noLocation'));
      }
    } catch (err) {
      console.error('Failed to fetch user location:', err);
      setError(t('advisory.locationError'));
    }
  };

  /**
   * Fetch weather data from Open-Meteo API
   */
  const fetchWeatherAdvisory = async () => {
    try {
      setLoading(true);
      setError('');

      const { latitude, longitude } = userLocation;
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to fetch weather data:', err);
      setError(t('advisory.weatherError'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get weather icon based on weathercode
   */
  const getWeatherIcon = (code) => {
    const iconMap = {
      0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
      45: '🌫️', 48: '🌫️',
      51: '🌦️', 53: '🌦️', 55: '🌧️',
      56: '🌧️', 57: '🌧️',
      61: '🌧️', 63: '🌧️', 65: '🌧️',
      66: '🌧️', 67: '🌧️',
      71: '🌨️', 73: '🌨️', 75: '❄️',
      77: '❄️',
      80: '🌦️', 81: '🌧️', 82: '⛈️',
      85: '🌨️', 86: '❄️',
      95: '⛈️', 96: '⛈️', 99: '⛈️',
    };
    return iconMap[code] || '🌡️';
  };

  /**
   * Generate advisory messages based on weather parameters
   */
  const generateAdvisories = (dayData) => {
    const advisories = [];

    // Temperature advisories
    if (dayData.tempMax > 40) {
      advisories.push({
        type: 'highTemp',
        message: t('advisory.highTemp'),
        level: 'high',
        icon: '🌡️',
      });
    } else if (dayData.tempMin < 5) {
      advisories.push({
        type: 'frost',
        message: t('advisory.frostAlert'),
        level: 'high',
        icon: '❄️',
      });
    }

    // Watering recommendation based on precipitation
    const precipitation = dayData.precipitation || 0;
    if (precipitation < 2) {
      advisories.push({
        type: 'watering',
        message: t('advisory.wateringNeeded'),
        level: 'medium',
        icon: '💧',
      });
    } else if (precipitation > 20) {
      advisories.push({
        type: 'excessRain',
        message: t('advisory.excessRain'),
        level: 'medium',
        icon: '🌧️',
      });
    }

    // Wind alert
    const windSpeed = dayData.windSpeed || 0;
    if (windSpeed > 30) {
      advisories.push({
        type: 'highWind',
        message: t('advisory.highWind'),
        level: 'high',
        icon: '💨',
      });
    }

    // Disease alert (based on precipitation and weather code - rain codes indicate wet conditions)
    const weathercode = dayData.weathercode || 0;
    const isRainyWeather = weathercode >= 51 && weathercode <= 67 || weathercode >= 80 && weathercode <= 82 || weathercode >= 95 && weathercode <= 99;
    if (isRainyWeather && precipitation > 10) {
      advisories.push({
        type: 'disease',
        message: t('advisory.diseaseAlert'),
        level: 'high',
        icon: '⚠️',
      });
    }

    // Fertilizer advisory (based on weather conditions)
    if (precipitation > 5 && precipitation < 15 && dayData.tempMax > 20 && dayData.tempMax < 35) {
      advisories.push({
        type: 'fertilizer',
        message: t('advisory.fertilizerGood'),
        level: 'low',
        icon: '🌾',
      });
    }

    return advisories;
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
      return t('advisory.today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('advisory.tomorrow');
    } else {
      return date.toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : 'en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }
  };

  /**
   * Get alert background color
   */
  const getAlertColor = (level) => {
    switch (level) {
      case 'high':
        return 'bg-red-50 border-red-300';
      case 'medium':
        return 'bg-yellow-50 border-yellow-300';
      case 'low':
        return 'bg-green-50 border-green-300';
      default:
        return 'bg-gray-50 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">{t('advisory.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!weatherData || !weatherData.daily) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          {t('advisory.noData')}
        </div>
      </div>
    );
  }

  const dailyData = weatherData.daily;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('advisory.title')}</h1>
          {userLocation && (
            <p className="text-gray-600 mt-2">
              🌍 {t('advisory.district')}: {userLocation.district}
            </p>
          )}
        </div>
        <button
          onClick={fetchWeatherAdvisory}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <span>🔄</span>
          {t('common.refresh')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dailyData.time.map((date, index) => {
          const dayData = {
            date,
            tempMax: dailyData.temperature_2m_max[index],
            tempMin: dailyData.temperature_2m_min[index],
            precipitation: dailyData.precipitation_sum[index],
            windSpeed: dailyData.wind_speed_10m_max[index],
            weathercode: dailyData.weathercode[index],
          };

          const advisories = generateAdvisories(dayData);
          const hasHighAlerts = advisories.some((a) => a.level === 'high');

          return (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-lg overflow-hidden border-2 ${
                hasHighAlerts ? 'border-red-400' : 'border-gray-200'
              } hover:shadow-xl transition-shadow`}
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{formatDate(date)}</h3>
                    <p className="text-sm opacity-90">
                      {dayData.tempMax}°C / {dayData.tempMin}°C
                    </p>
                  </div>
                  <div className="text-4xl">{getWeatherIcon(dayData.weathercode)}</div>
                </div>
              </div>

              {/* Weather Parameters */}
              <div className="p-4 space-y-2 bg-gray-50">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💧</span>
                      <span className="text-gray-600">{t('advisory.precipitation')}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{dayData.precipitation?.toFixed(1) || 0} mm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💨</span>
                      <span className="text-gray-600">{t('advisory.wind')}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{dayData.windSpeed?.toFixed(1) || 0} km/h</span>
                  </div>
                </div>
              </div>

              {/* Advisories */}
              <div className="p-4 space-y-2">
                {advisories.length > 0 ? (
                  advisories.map((advisory, advIndex) => (
                    <div
                      key={advIndex}
                      className={`p-3 rounded-lg border ${getAlertColor(advisory.level)}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{advisory.icon}</span>
                        <p className="text-sm font-medium text-gray-800 flex-1">
                          {advisory.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-lg border bg-green-50 border-green-300">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✅</span>
                      <p className="text-sm font-medium text-gray-800">
                        {t('advisory.allGood')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Advisories;
