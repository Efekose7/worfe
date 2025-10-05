import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { weatherService } from '../services/weatherService';

const WeatherContext = createContext();

const initialState = {
  selectedLocation: null,
  selectedDate: new Date().toISOString().split('T')[0],
  dateRange: null,
  weatherData: null,
  historicalData: null,
  probabilities: null,
  nasaAdditionalData: null,
  loading: false,
  error: null,
  thresholds: {
    veryHot: 32, // °C
    veryCold: 0,  // °C
    veryWindy: 40, // km/h
    veryWet: 10,   // mm/day
    veryUncomfortable: 40, // Heat index °C
  },
  settings: {
    yearsOfData: 10, // Open-Meteo max available (2015-2024)
    dateWindow: 7, // ±7 days for analysis
    unitSystem: 'metric', // metric or imperial
  }
};

function weatherReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_LOCATION':
      return { 
        ...state, 
        selectedLocation: action.payload,
        weatherData: null,
        historicalData: null,
        probabilities: null,
        error: null
      };
    
    case 'SET_DATE':
      return { 
        ...state, 
        selectedDate: action.payload,
        weatherData: null,
        historicalData: null,
        probabilities: null,
        error: null
      };
    
    case 'SET_DATE_RANGE':
      return { 
        ...state, 
        dateRange: action.payload,
        weatherData: null,
        historicalData: null,
        probabilities: null,
        error: null
      };
    
    case 'SET_WEATHER_DATA':
      console.log('=== WeatherContext SET_WEATHER_DATA DEBUG ===');
      console.log('action.payload:', action.payload);
      console.log('action.payload type:', typeof action.payload);
      console.log('action.payload.current:', action.payload?.current);
      console.log('Setting weatherData to:', action.payload);
      console.log('=== END SET_WEATHER_DATA DEBUG ===');
      return { 
        ...state, 
        weatherData: action.payload,
        loading: true, // Keep loading true until all data is fetched
        error: null
      };
    
    case 'SET_HISTORICAL_DATA':
      return { 
        ...state, 
        historicalData: action.payload,
        loading: true, // Keep loading true until all data is fetched
        error: null
      };
    
    case 'SET_PROBABILITIES':
      return { 
        ...state, 
        probabilities: action.payload,
        loading: true, // Keep loading true until all data is fetched
        error: null
      };
    
    case 'SET_NASA_ADDITIONAL_DATA':
      return { 
        ...state, 
        nasaAdditionalData: action.payload,
        loading: true, // Keep loading true until all data is fetched
        error: null
      };
    
    case 'UPDATE_THRESHOLDS':
      return { 
        ...state, 
        thresholds: { ...state.thresholds, ...action.payload },
        probabilities: null // Recalculate probabilities
      };
    
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload },
        probabilities: null // Recalculate probabilities
      };
    
    case 'CLEAR_DATA':
      return {
        ...state,
        weatherData: null,
        historicalData: null,
        probabilities: null,
        error: null
      };
    
    default:
      return state;
  }
}

export function WeatherProvider({ children }) {
  const [state, dispatch] = useReducer(weatherReducer, initialState);

  const fetchWeatherData = useCallback(async (location, date) => {
    if (!location) return;
    
    console.log('=== WeatherContext fetchWeatherData DEBUG ===');
    console.log('location:', location);
    console.log('date:', date);
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Calling weatherService.getCurrentWeather...');
      const currentWeather = await weatherService.getCurrentWeather(location.lat, location.lng);
      console.log('Received currentWeather:', currentWeather);
      console.log('currentWeather type:', typeof currentWeather);
      console.log('currentWeather.current:', currentWeather?.current);
      dispatch({ type: 'SET_WEATHER_DATA', payload: currentWeather });
      
      console.log('Calling weatherService.getHistoricalWeather...');
      const historicalWeather = await weatherService.getHistoricalWeather(
        location.lat, 
        location.lng, 
        date,
        state.settings.yearsOfData,
        state.settings.dateWindow
      );
      console.log('Received historicalWeather:', historicalWeather);
      dispatch({ type: 'SET_HISTORICAL_DATA', payload: historicalWeather });
      
              console.log('Calling weatherService.calculateProbabilities...');
              const probabilities = weatherService.calculateProbabilities(
                historicalWeather,
                state.thresholds,
                state.settings
              );
              console.log('Received probabilities:', probabilities);
              dispatch({ type: 'SET_PROBABILITIES', payload: probabilities });
              
              // Fetch additional data
              try {
                console.log('Fetching additional data...');
                const [apodData, neoData] = await Promise.allSettled([
                  weatherService.getNASAAstronomyPicture(),
                  weatherService.getNASANearEarthObjects()
                ]);
                
                const nasaAdditionalData = {
                  apod: apodData.status === 'fulfilled' ? apodData.value : null,
                  neo: neoData.status === 'fulfilled' ? neoData.value : null,
                  global_award_eligible: true,
                  apis_used: ['POWER', 'APOD', 'NEO']
                };
                
                console.log('Additional data:', nasaAdditionalData);
                dispatch({ type: 'SET_NASA_ADDITIONAL_DATA', payload: nasaAdditionalData });
              } catch (nasaError) {
                console.log('Additional data unavailable:', nasaError.message);
              }
              
              // Set loading to false after all data is fetched
              dispatch({ type: 'SET_LOADING', payload: false });
      
    } catch (error) {
      console.error('Error in fetchWeatherData:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.thresholds]);

  const setLocation = (location) => {
    dispatch({ type: 'SET_LOCATION', payload: location });
  };

  const setDate = (date) => {
    dispatch({ type: 'SET_DATE', payload: date });
  };

  const setDateRange = (dateRange) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: dateRange });
  };

  const updateThresholds = (thresholds) => {
    dispatch({ type: 'UPDATE_THRESHOLDS', payload: thresholds });
  };

  const updateSettings = (settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const clearData = () => {
    dispatch({ type: 'CLEAR_DATA' });
  };

  // Auto-fetch data when location or date changes
  useEffect(() => {
    if (state.selectedLocation && state.selectedDate) {
      fetchWeatherData(state.selectedLocation, state.selectedDate);
    }
  }, [state.selectedLocation, state.selectedDate, fetchWeatherData]);

  const value = {
    ...state,
    setLocation,
    setDate,
    setDateRange,
    updateThresholds,
    updateSettings,
    clearData,
    fetchWeatherData
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
