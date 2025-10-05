const express = require('express');
const cors = require('cors');
const path = require('path');
const { weatherService } = require('./src/services/weatherService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Parse location parameter (supports both formats)
function parseLocation(locationParam) {
  try {
    // Remove any extra characters and normalize
    let cleanLocation = locationParam.replace(/[°]/g, '').replace(/[NSEW]/g, '');
    
    // Handle different formats
    if (cleanLocation.includes(',')) {
      const [lat, lng] = cleanLocation.split(',').map(coord => parseFloat(coord.trim()));
      return { lat, lng };
    } else if (cleanLocation.includes(' ')) {
      const [lat, lng] = cleanLocation.split(' ').map(coord => parseFloat(coord.trim()));
      return { lat, lng };
    } else {
      throw new Error('Invalid location format');
    }
  } catch (error) {
    throw new Error(`Invalid location format: ${locationParam}. Expected format: "lat,lng" or "lat lng"`);
  }
}

// Main weather endpoint
app.get('/worfe/weather/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { date, format = 'json' } = req.query;
    
    console.log('🌍 Weather request received:', { location, date, format });
    
    // Parse location
    const { lat, lng } = parseLocation(location);
    
    // Set default date if not provided
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Default thresholds
    const thresholds = {
      veryHot: 32,
      veryCold: 0,
      veryWindy: 40,
      veryWet: 10,
      veryUncomfortable: 40
    };
    
    // Default settings
    const settings = {
      yearsOfData: 20,
      dateWindow: 7,
      unitSystem: 'metric'
    };
    
    // Fetch current weather
    console.log('📡 Fetching current weather for:', { lat, lng });
    const currentWeather = await weatherService.getCurrentWeather(lat, lng);
    console.log('✅ Current weather received:', { 
      data_source: currentWeather.data_source,
      temperature: currentWeather.current?.temperature_2m,
      humidity: currentWeather.current?.relative_humidity_2m
    });
    
    // Fetch historical weather
    console.log('📡 Fetching historical weather for:', { lat, lng, targetDate });
    const historicalWeather = await weatherService.getHistoricalWeather(
      lat, 
      lng, 
      targetDate,
      settings.yearsOfData,
      settings.dateWindow
    );
    console.log('✅ Historical weather received:', { 
      data_source: historicalWeather.data_source,
      totalDays: historicalWeather.rawData?.length,
      statistics: {
        temperatureMax: historicalWeather.statistics?.temperature?.max?.length,
        precipitation: historicalWeather.statistics?.precipitation?.length,
        windSpeed: historicalWeather.statistics?.windSpeed?.length
      }
    });
    
    // Calculate probabilities
    const probabilities = weatherService.calculateProbabilities(
      historicalWeather,
      thresholds,
      settings
    );
    
    // Prepare response data
    const responseData = {
      location: {
        coordinates: { lat, lng },
        formatted: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°W`
      },
      analysis: {
        target_date: targetDate,
        analysis_date: new Date().toISOString(),
        data_source: 'NASA POWER API',
        nasa_attribution: 'NASA GES DISC',
        methodology: 'Historical Weather Pattern Analysis',
        disclaimer: 'This is NOT a weather forecast - based on historical data only'
      },
      current_weather: currentWeather,
      historical_analysis: {
        probabilities: probabilities.probabilities,
        climate_trends: probabilities.climateTrends,
        trends: probabilities.trends,
        confidence_intervals: probabilities.confidenceIntervals,
        statistics: probabilities.statistics,
        date_range: probabilities.dateRange,
        total_days: probabilities.totalDays
      },
      raw_historical_data: historicalWeather
    };
    
    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Return data based on format
    if (format === 'csv') {
      const csvData = weatherService.exportToCSV(
        { targetDate }, 
        probabilities, 
        { lat, lng, name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°W` }
      );
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="worfe-weather-${lat}-${lng}.csv"`);
      res.send(csvData);
    } else {
      res.json(responseData);
    }
    
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(400).json({
      error: 'Failed to fetch weather data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Current weather only endpoint
app.get('/worfe/weather/:location/current', async (req, res) => {
  try {
    const { location } = req.params;
    const { lat, lng } = parseLocation(location);
    
    const currentWeather = await weatherService.getCurrentWeather(lat, lng);
    
    res.json({
      location: { lat, lng },
      current_weather: currentWeather,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Current Weather API Error:', error);
    res.status(400).json({
      error: 'Failed to fetch current weather',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Historical analysis only endpoint
app.get('/worfe/weather/:location/historical', async (req, res) => {
  try {
    const { location } = req.params;
    const { date, format = 'json' } = req.query;
    const { lat, lng } = parseLocation(location);
    
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const thresholds = {
      veryHot: 32,
      veryCold: 0,
      veryWindy: 40,
      veryWet: 10,
      veryUncomfortable: 40
    };
    
    const settings = {
      yearsOfData: 20,
      dateWindow: 7,
      unitSystem: 'metric'
    };
    
    const historicalWeather = await weatherService.getHistoricalWeather(
      lat, 
      lng, 
      targetDate,
      settings.yearsOfData,
      settings.dateWindow
    );
    
    const probabilities = weatherService.calculateProbabilities(
      historicalWeather,
      thresholds,
      settings
    );
    
    const responseData = {
      location: { lat, lng },
      target_date: targetDate,
      historical_analysis: {
        probabilities: probabilities.probabilities,
        climate_trends: probabilities.climateTrends,
        trends: probabilities.trends,
        confidence_intervals: probabilities.confidenceIntervals,
        statistics: probabilities.statistics,
        date_range: probabilities.dateRange,
        total_days: probabilities.totalDays
      },
      raw_data: historicalWeather
    };
    
    if (format === 'csv') {
      const csvData = weatherService.exportToCSV(
        { targetDate }, 
        probabilities, 
        { lat, lng, name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°W` }
      );
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="worfe-historical-${lat}-${lng}.csv"`);
      res.send(csvData);
    } else {
      res.json(responseData);
    }
    
  } catch (error) {
    console.error('Historical Weather API Error:', error);
    res.status(400).json({
      error: 'Failed to fetch historical weather data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Probabilities only endpoint
app.get('/worfe/weather/:location/probabilities', async (req, res) => {
  try {
    const { location } = req.params;
    const { date } = req.query;
    const { lat, lng } = parseLocation(location);
    
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const thresholds = {
      veryHot: 32,
      veryCold: 0,
      veryWindy: 40,
      veryWet: 10,
      veryUncomfortable: 40
    };
    
    const settings = {
      yearsOfData: 20,
      dateWindow: 7,
      unitSystem: 'metric'
    };
    
    const historicalWeather = await weatherService.getHistoricalWeather(
      lat, 
      lng, 
      targetDate,
      settings.yearsOfData,
      settings.dateWindow
    );
    
    const probabilities = weatherService.calculateProbabilities(
      historicalWeather,
      thresholds,
      settings
    );
    
    res.json({
      location: { lat, lng },
      target_date: targetDate,
      probabilities: probabilities.probabilities,
      climate_trends: probabilities.climateTrends,
      confidence_intervals: probabilities.confidenceIntervals,
      analysis_period: probabilities.dateRange,
      total_days: probabilities.totalDays
    });
    
  } catch (error) {
    console.error('Probabilities API Error:', error);
    res.status(400).json({
      error: 'Failed to calculate probabilities',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/worfe/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Worfe Weather API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// NASA data endpoint
app.get('/worfe/nasa-data/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { lat, lng } = parseLocation(location);
    
    // Direct NASA POWER API call
    const nasaUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOT,WS2M,RH2M&community=RE&longitude=${lng}&latitude=${lat}&start=20200101&end=20231231&format=JSON`;
    
    const nasaResponse = await fetch(nasaUrl);
    if (!nasaResponse.ok) {
      throw new Error('Failed to fetch NASA POWER data');
    }
    
    const nasaData = await nasaResponse.json();
    
    res.json({
      location: { lat, lng },
      nasa_data: nasaData,
      data_source: 'NASA POWER API',
      nasa_attribution: 'NASA GES DISC',
      nasa_power_url: 'https://power.larc.nasa.gov',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('NASA Data API Error:', error);
    res.status(400).json({
      error: 'Failed to fetch NASA data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// NASA Astronomy Picture of the Day endpoint
app.get('/worfe/nasa-apod', async (req, res) => {
  try {
    const apodData = await weatherService.getNASAAstronomyPicture();
    
    if (!apodData) {
      throw new Error('Failed to fetch NASA APOD data');
    }
    
    res.json({
      nasa_apod: apodData,
      data_source: 'NASA APOD',
      nasa_attribution: 'NASA APOD',
      nasa_apod_url: 'https://apod.nasa.gov/apod/',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('NASA APOD API Error:', error);
    res.status(400).json({
      error: 'Failed to fetch NASA APOD data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced NASA data endpoint
app.get('/worfe/nasa-enhanced/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { lat, lng } = parseLocation(location);
    const { start_date, end_date } = req.query;
    
    const startDate = start_date || '20200101';
    const endDate = end_date || '20231231';
    
    const enhancedData = await weatherService.getEnhancedNASAData(lat, lng, startDate, endDate);
    
    res.json({
      location: { lat, lng },
      nasa_enhanced_data: enhancedData,
      data_source: 'NASA POWER API (Enhanced)',
      nasa_attribution: 'NASA POWER',
      parameters_included: [
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
      global_award_eligible: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Enhanced NASA Data API Error:', error);
    res.status(400).json({
      error: 'Failed to fetch enhanced NASA data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API documentation endpoint
app.get('/worfe/docs', (req, res) => {
  res.json({
    service: 'Worfe Weather API - NASA Earth Observation Data',
    version: '2.0.0',
    description: 'NASA Earth Observation Data + Historical Weather Analysis API',
    endpoints: {
      'GET /worfe/weather/:location': {
        description: 'Complete weather analysis (current + historical + probabilities)',
        parameters: {
          location: 'Latitude,Longitude (e.g., "40.6730,-73.8386" or "40.6730°N,-73.8386°W")',
          date: 'Target date for analysis (optional, defaults to today)',
          format: 'Response format: json or csv (optional, defaults to json)'
        },
        example: '/worfe/weather/40.6730,-73.8386?date=2024-01-15&format=json'
      },
      'GET /worfe/weather/:location/current': {
        description: 'Current weather data only',
        example: '/worfe/weather/40.6730,-73.8386/current'
      },
      'GET /worfe/weather/:location/historical': {
        description: 'Historical weather analysis only',
        parameters: {
          date: 'Target date for analysis (optional)',
          format: 'Response format: json or csv (optional)'
        },
        example: '/worfe/weather/40.6730,-73.8386/historical?date=2024-01-15'
      },
      'GET /worfe/weather/:location/probabilities': {
        description: 'Weather probabilities only',
        parameters: {
          date: 'Target date for analysis (optional)'
        },
        example: '/worfe/weather/40.6730,-73.8386/probabilities?date=2024-01-15'
      },
      'GET /worfe/nasa-data/:location': {
        description: 'Direct NASA POWER API data access',
        parameters: {
          location: 'Latitude,Longitude (e.g., "40.6730,-73.8386")'
        },
        example: '/worfe/nasa-data/40.6730,-73.8386',
        nasa_attribution: 'NASA GES DISC - Goddard Earth Sciences Data and Information Services Center'
      },
      'GET /worfe/nasa-apod': {
        description: 'NASA Astronomy Picture of the Day',
        example: '/worfe/nasa-apod',
        nasa_attribution: 'NASA Astronomy Picture of the Day'
      },
      'GET /worfe/nasa-enhanced/:location': {
        description: 'Enhanced NASA POWER API data with comprehensive Earth observation parameters',
        parameters: {
          location: 'Latitude,Longitude (e.g., "40.6730,-73.8386")',
          start_date: 'Start date in YYYYMMDD format (optional, default: 20200101)',
          end_date: 'End date in YYYYMMDD format (optional, default: 20231231)'
        },
        example: '/worfe/nasa-enhanced/40.6730,-73.8386?start_date=20200101&end_date=20231231',
        nasa_attribution: 'NASA POWER',
        global_award_eligible: true
      },
      'GET /worfe/health': {
        description: 'API health check'
      },
      'GET /worfe/docs': {
        description: 'API documentation'
      }
    },
    nasa_data_usage: 'NASA POWER API',
    platform: 'Historical Weather Analysis Platform',
    disclaimer: 'This API provides historical weather analysis, not forecasts'
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🌍 Worfe Weather API Server running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/worfe/docs`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/worfe/health`);
  console.log(`🌡️ Example: http://localhost:${PORT}/worfe/weather/40.6730,-73.8386`);
});
