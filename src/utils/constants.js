// Constants for the NASA Weather Dashboard

// API Configuration
export const API_CONFIG = {
  OPEN_METEO_BASE_URL: 'https://archive-api.open-meteo.com/v1/archive',
  OPEN_METEO_FORECAST_URL: 'https://api.open-meteo.com/v1/forecast',
  OPEN_METEO_GEOCODING_URL: 'https://geocoding-api.open-meteo.com/v1/search',
  RATE_LIMIT: 10000, // requests per day
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3
};

// Default Weather Thresholds
export const DEFAULT_THRESHOLDS = {
  veryHot: 32,        // °C
  veryCold: 0,        // °C
  veryWindy: 40,      // km/h
  veryWet: 10,        // mm/day
  veryUncomfortable: 40 // Heat index °C
};

// Analysis Settings
export const DEFAULT_SETTINGS = {
  yearsOfData: 20,
  dateWindow: 7, // ±7 days
  unitSystem: 'metric', // 'metric' or 'imperial'
  confidenceLevel: 0.95 // 95% confidence interval
};

// Weather Condition Codes (WMO)
export const WEATHER_CODES = {
  0: { description: 'Clear sky', icon: 'Clear', color: '#FFD60A' },
  1: { description: 'Mainly clear', icon: 'Partly Cloudy', color: '#FFD60A' },
  2: { description: 'Partly cloudy', icon: 'Cloudy', color: '#8D99AE' },
  3: { description: 'Overcast', icon: 'Overcast', color: '#8D99AE' },
  45: { description: 'Fog', icon: 'Fog', color: '#8D99AE' },
  48: { description: 'Depositing rime fog', icon: 'Fog', color: '#8D99AE' },
  51: { description: 'Light drizzle', icon: 'Light Rain', color: '#4CC9F0' },
  53: { description: 'Moderate drizzle', icon: 'Moderate Rain', color: '#4CC9F0' },
  55: { description: 'Dense drizzle', icon: 'Heavy Rain', color: '#4CC9F0' },
  56: { description: 'Light freezing drizzle', icon: 'Freezing Rain', color: '#4CC9F0' },
  57: { description: 'Dense freezing drizzle', icon: 'Freezing Rain', color: '#4CC9F0' },
  61: { description: 'Slight rain', icon: 'Light Rain', color: '#4CC9F0' },
  63: { description: 'Moderate rain', icon: 'Moderate Rain', color: '#4CC9F0' },
  65: { description: 'Heavy rain', icon: 'Heavy Rain', color: '#4CC9F0' },
  66: { description: 'Light freezing rain', icon: 'Freezing Rain', color: '#4CC9F0' },
  67: { description: 'Heavy freezing rain', icon: 'Freezing Rain', color: '#4CC9F0' },
  71: { description: 'Slight snow fall', icon: 'Light Snow', color: '#FFFFFF' },
  73: { description: 'Moderate snow fall', icon: 'Moderate Snow', color: '#FFFFFF' },
  75: { description: 'Heavy snow fall', icon: 'Heavy Snow', color: '#FFFFFF' },
  77: { description: 'Snow grains', icon: 'Snow', color: '#FFFFFF' },
  80: { description: 'Slight rain showers', icon: 'Light Showers', color: '#4CC9F0' },
  81: { description: 'Moderate rain showers', icon: 'Moderate Showers', color: '#4CC9F0' },
  82: { description: 'Violent rain showers', icon: 'Heavy Showers', color: '#4CC9F0' },
  85: { description: 'Slight snow showers', icon: 'Light Snow Showers', color: '#FFFFFF' },
  86: { description: 'Heavy snow showers', icon: 'Heavy Snow Showers', color: '#FFFFFF' },
  95: { description: 'Thunderstorm', icon: 'Thunderstorm', color: '#7209B7' },
  96: { description: 'Thunderstorm with slight hail', icon: 'Thunderstorm', color: '#7209B7' },
  99: { description: 'Thunderstorm with heavy hail', icon: 'Thunderstorm', color: '#7209B7' }
};

// Color Palette
export const COLORS = {
  nasaBlue: '#0B3D91',
  nasaRed: '#FC3D21',
  deepSpace: '#000814',
  starWhite: '#FFFFFF',
  nebulaPurple: '#7209B7',
  earthCyan: '#4CC9F0',
  successGreen: '#06D6A0',
  warningYellow: '#FFD60A',
  dangerRed: '#EF476F',
  neutralGray: '#8D99AE'
};

// Chart Colors
export const CHART_COLORS = {
  temperature: {
    max: '#EF476F',
    min: '#4CC9F0',
    avg: '#06D6A0'
  },
  precipitation: '#4CC9F0',
  wind: '#FFD60A',
  humidity: '#7209B7',
  pressure: '#8D99AE'
};

// Map Configuration
export const MAP_CONFIG = {
  defaultCenter: [40.7128, -74.0060], // New York City
  defaultZoom: 10,
  minZoom: 2,
  maxZoom: 18,
  tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  large: 1280
};

// Animation Durations
export const ANIMATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 1000
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  API_ERROR: 'Weather data service is temporarily unavailable. Please try again later.',
  LOCATION_ERROR: 'Unable to find the specified location. Please try a different search.',
  DATA_ERROR: 'Unable to fetch weather data for this location and date.',
  EXPORT_ERROR: 'Failed to export data. Please try again.',
  GENERIC_ERROR: 'An unexpected error occurred. Please refresh the page and try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  DATA_LOADED: 'Weather data loaded successfully',
  EXPORT_SUCCESS: 'Data exported successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  LOCATION_SELECTED: 'Location selected successfully'
};

// Loading Messages
export const LOADING_MESSAGES = [
  'Fetching weather data...',
  'Analyzing historical patterns...',
  'Calculating probabilities...',
  'Processing climate data...',
  'Generating visualizations...'
];

// File Export Configuration
export const EXPORT_CONFIG = {
  CSV: {
    mimeType: 'text/csv',
    extension: '.csv',
    delimiter: ','
  },
  JSON: {
    mimeType: 'application/json',
    extension: '.json',
    prettyPrint: true
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  SELECTED_LOCATION: 'nasa_weather_selected_location',
  SELECTED_DATE: 'nasa_weather_selected_date',
  THRESHOLDS: 'nasa_weather_thresholds',
  SETTINGS: 'nasa_weather_settings',
  CACHED_DATA: 'nasa_weather_cached_data',
  USER_PREFERENCES: 'nasa_weather_user_preferences'
};

// Cache Configuration
export const CACHE_CONFIG = {
  TTL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MAX_ENTRIES: 100,
  CLEANUP_INTERVAL: 60 * 60 * 1000 // 1 hour
};

// Accessibility Configuration
export const A11Y_CONFIG = {
  FOCUS_VISIBLE: true,
  HIGH_CONTRAST: false,
  REDUCED_MOTION: false,
  SCREEN_READER: false
};

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  LAZY_LOAD_OFFSET: 100,
  VIRTUAL_SCROLL_THRESHOLD: 1000
};

// Worfe Platform Information
export const NASA_CHALLENGE = {
  year: 2025,
  theme: 'Will It Rain On My Parade?',
  track: 'Earth and Space',
  category: 'Best Use of Data',
  team: 'Your Team Name',
  repository: 'https://github.com/your-username/nasa-weather-dashboard',
  nasa_data_usage: 'NASA POWER API + NASA GES DISC Earth Observation Data',
  global_award_eligible: true,
  challenge_url: 'https://www.spaceappschallenge.org/2025/challenges/will-it-rain-on-my-parade/'
};

// Data Attribution - Updated for Global Award Eligibility
export const ATTRIBUTION = {
  nasa: {
    name: 'NASA POWER API',
    url: 'https://power.larc.nasa.gov',
    description: 'NASA Earth observation data for weather and climate analysis',
    nasa_attribution: 'NASA GES DISC',
    global_award_eligible: true
  },
  nasaGESDISC: {
    name: 'NASA GES DISC',
    url: 'https://disc.gsfc.nasa.gov',
    description: 'NASA Earth observation datasets and climate data',
    nasa_attribution: 'NASA GES DISC',
    global_award_eligible: true
  },
  nasaAPOD: {
    name: 'NASA Astronomy Picture of the Day',
    url: 'https://apod.nasa.gov/apod/',
    description: 'NASA daily astronomy images and explanations',
    nasa_attribution: 'NASA Astronomy Picture of the Day',
    global_award_eligible: true
  },
  nasaEnhanced: {
    name: 'NASA POWER API (Enhanced)',
    url: 'https://power.larc.nasa.gov',
    description: 'Enhanced NASA Earth observation data with comprehensive parameters',
    nasa_attribution: 'NASA POWER',
    parameters: [
      'Temperature (T2M, T2M_MAX, T2M_MIN)',
      'Precipitation (PRECTOT, PRECTOTCORR)',
      'Wind Speed (WS2M, WS10M, WS50M)',
      'Humidity (RH2M, RH10M)',
      'Pressure (PS, SLP)',
      'Solar Radiation (ALLSKY_SFC_SW_DWN, ALLSKY_SFC_LW_DWN)',
      'Clear Sky Radiation (CLRSKY_SFC_SW_DWN, CLRSKY_SFC_LW_DWN)',
      'Dew Point and Wet Bulb (T2MDEW, T2MWET)',
      'Specific Humidity and Wind Components (QV2M, U2M, V2M)'
    ],
    global_award_eligible: true
  },
  openMeteo: {
    name: 'Open-Meteo Historical Weather API',
    url: 'https://open-meteo.com',
    license: 'CC BY 4.0',
    description: 'Backup weather data source (secondary)',
    global_award_eligible: false
  },
  openStreetMap: {
    name: 'OpenStreetMap',
    url: 'https://www.openstreetmap.org',
    license: 'ODbL',
    description: 'Open source mapping data'
  }
};
