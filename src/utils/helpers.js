// Utility functions for the NASA Weather Dashboard

// Format temperature with proper units
export const formatTemperature = (temp, unit = 'metric') => {
  if (unit === 'imperial') {
    return `${(temp * 9/5 + 32).toFixed(1)}°F`;
  }
  return `${temp.toFixed(1)}°C`;
};

// Format wind speed with proper units
export const formatWindSpeed = (speed, unit = 'metric') => {
  if (unit === 'imperial') {
    return `${(speed * 0.621371).toFixed(1)} mph`;
  }
  return `${speed.toFixed(1)} km/h`;
};

// Format precipitation
export const formatPrecipitation = (precip) => {
  return `${precip.toFixed(1)} mm`;
};

// Calculate heat index
export const calculateHeatIndex = (temp, humidity) => {
  // Convert to Fahrenheit for calculation
  const tempF = temp * 9/5 + 32;
  
  // Heat index calculation (simplified)
  const hi = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity
    - 0.22475541 * tempF * humidity - 6.83783e-3 * tempF * tempF
    - 5.481717e-2 * humidity * humidity + 1.22874e-3 * tempF * tempF * humidity
    + 8.5282e-4 * tempF * humidity * humidity - 1.99e-6 * tempF * tempF * humidity * humidity;
  
  // Convert back to Celsius
  return (hi - 32) * 5/9;
};

// Get weather condition description
export const getWeatherCondition = (code) => {
  const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return conditions[code] || 'Unknown condition';
};

// Get weather icon based on condition
export const getWeatherIcon = (code) => {
  if (code === 0 || code === 1) return 'Clear';
  if (code === 2 || code === 3) return 'Cloudy';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 86) return 'Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Partly Cloudy';
};

// Format date for display
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Format date for API calls
export const formatDateForAPI = (date) => {
  return date.toISOString().split('T')[0];
};

// Calculate date range for historical analysis
export const getDateRange = (targetDate, windowDays = 7) => {
  const date = new Date(targetDate);
  const start = new Date(date);
  start.setDate(date.getDate() - windowDays);
  const end = new Date(date);
  end.setDate(date.getDate() + windowDays);
  
  return {
    start: formatDateForAPI(start),
    end: formatDateForAPI(end)
  };
};

// Generate shareable URL
export const generateShareableURL = (location, date, thresholds) => {
  const params = new URLSearchParams({
    lat: location.lat,
    lng: location.lng,
    name: location.name,
    date: date,
    hot: thresholds.veryHot,
    cold: thresholds.veryCold,
    windy: thresholds.veryWindy,
    wet: thresholds.veryWet,
    uncomfortable: thresholds.veryUncomfortable
  });
  
  return `${window.location.origin}?${params.toString()}`;
};

// Parse shareable URL parameters
export const parseShareableURL = () => {
  const params = new URLSearchParams(window.location.search);
  
  if (params.has('lat') && params.has('lng')) {
    return {
      location: {
        lat: parseFloat(params.get('lat')),
        lng: parseFloat(params.get('lng')),
        name: params.get('name') || 'Selected Location'
      },
      date: params.get('date') || new Date().toISOString().split('T')[0],
      thresholds: {
        veryHot: parseFloat(params.get('hot')) || 32,
        veryCold: parseFloat(params.get('cold')) || 0,
        veryWindy: parseFloat(params.get('windy')) || 40,
        veryWet: parseFloat(params.get('wet')) || 10,
        veryUncomfortable: parseFloat(params.get('uncomfortable')) || 40
      }
    };
  }
  
  return null;
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Validate coordinates
export const isValidCoordinates = (lat, lng) => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// Calculate distance between two coordinates
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Local storage helpers
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
};

// Error handling helpers
export const handleError = (error, context = 'Unknown error') => {
  console.error(`${context}:`, error);
  
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

// API response validation
export const validateAPIResponse = (response) => {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid API response format');
  }
  
  return true;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error);
    return false;
  }
};
