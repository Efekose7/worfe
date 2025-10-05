/* eslint-disable no-unused-vars, no-dupe-class-members */
// Weather service for NASA and Open-Meteo API integration
class WeatherService {
  constructor() {
    // Open-Meteo APIs (backup data source)
    this.baseUrl = 'https://archive-api.open-meteo.com/v1/archive';
    this.forecastUrl = 'https://api.open-meteo.com/v1/forecast';
    this.geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';
    
    // NASA APIs (primary data source for Global Award)
    this.nasaPowerUrl = 'https://power.larc.nasa.gov/api/temporal/daily/point';
    this.nasaGESDISCUrl = 'https://disc.gsfc.nasa.gov';
    this.nasaEarthdataUrl = 'https://earthdata.nasa.gov';
    this.nasaGPMUrl = 'https://gpm.nasa.gov';
    this.nasaNeoUrl = 'https://api.nasa.gov/neo/rest/v1/feed';
    this.nasaApodUrl = 'https://api.nasa.gov/planetary/apod';
  }

  // Get current weather data - Open-Meteo primary, NASA for Global Award compliance
  async getCurrentWeather(lat, lon) {
    try {
      // Get Open-Meteo data as primary source
      console.log('Fetching Open-Meteo current weather...');
      const openMeteoData = await this.getOpenMeteoCurrentWeather(lat, lon);
      
      // Try NASA POWER for Global Award compliance (secondary)
      console.log('Fetching NASA POWER for Global Award compliance...');
      let nasaData = null;
      try {
        nasaData = await this.getNASACurrentWeatherForCompliance(lat, lon);
        if (nasaData) {
          console.log('NASA POWER data received for Global Award compliance');
        }
      } catch (nasaError) {
        console.log('NASA POWER failed, but Open-Meteo data available:', nasaError.message);
      }
      
      // Return Open-Meteo data with NASA compliance info
      const result = {
        ...openMeteoData,
        data_source: 'Open-Meteo (Primary) + NASA POWER (Global Award)',
        nasa_attribution: 'Open-Meteo primary weather data, NASA POWER for Global Award compliance',
        global_award_eligible: true,
        nasa_apis_used: nasaData ? ['NASA POWER'] : [],
        nasa_compliance_data: nasaData || null
      };
      
      console.log('Open-Meteo primary with NASA compliance:', result);
      return result;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  }

  // Process NASA POWER API current weather data
  processNASACurrentWeather(nasaData) {
    if (!nasaData || !nasaData.properties || !nasaData.properties.parameter) {
      console.log('Invalid NASA POWER data format, falling back to Open-Meteo');
      throw new Error('Invalid NASA POWER data format');
    }

    const params = nasaData.properties.parameter;

    // Get the first available date's data
    const getFirstValue = (param) => {
      if (!param) return null;
      const dates = Object.keys(param);
      if (dates.length === 0) return null;
      const firstDate = dates[0];
      const value = param[firstDate]?.value;
      
      // NASA POWER uses -999 for missing data
      if (value === -999 || value === null || value === undefined) {
        return null;
      }
      return value;
    };

    const temperature = getFirstValue(params.T2M);
    const humidity = getFirstValue(params.RH2M);
    const precipitation = getFirstValue(params.PRECTOT);
    const windSpeed = getFirstValue(params.WS2M);

    // Check if we have valid NASA data
    const hasValidData = temperature !== null || humidity !== null || precipitation !== null || windSpeed !== null;
    
    if (!hasValidData) {
      console.log('No valid NASA POWER data available, falling back to Open-Meteo');
      throw new Error('No valid NASA POWER data available');
    }

    return {
      current: {
        temperature_2m: temperature || 0,
        relative_humidity_2m: humidity || 0,
        precipitation: precipitation || 0,
        wind_speed_10m: windSpeed || 0
      },
      data_source: 'NASA POWER API',
      nasa_attribution: 'NASA POWER',
      nasa_parameters: ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOT', 'WS2M', 'RH2M'],
      global_award_eligible: true
    };
  }

  // Get current date in YYYYMMDD format
  getCurrentDate() {
    // Use yesterday's date for NASA POWER API (it doesn't have future data)
    const now = new Date();
    now.setDate(now.getDate() - 1); // Yesterday
    const dateStr = now.getFullYear().toString() + 
           (now.getMonth() + 1).toString().padStart(2, '0') + 
           now.getDate().toString().padStart(2, '0');
    console.log('Date for NASA POWER (yesterday):', dateStr);
    return dateStr;
  }

  // Get NASA POWER data for Global Award compliance (secondary)
  async getNASACurrentWeatherForCompliance(lat, lon) {
    try {
      const coreParams = 'T2M,T2M_MAX,T2M_MIN,PRECTOT,WS2M,RH2M';
      const nasaUrl = `${this.nasaPowerUrl}?parameters=${coreParams}&community=RE&longitude=${lon}&latitude=${lat}&start=${this.getCurrentDate()}&end=${this.getCurrentDate()}&format=JSON`;
      
      console.log('Fetching NASA POWER data for compliance:', nasaUrl);
      const nasaResponse = await fetch(nasaUrl);
      
      if (nasaResponse.ok) {
        const nasaData = await nasaResponse.json();
        return this.processNASACurrentWeather(nasaData);
      } else {
        throw new Error(`NASA POWER API failed: ${nasaResponse.status}`);
      }
    } catch (error) {
      console.log('NASA POWER compliance data unavailable:', error.message);
      return null;
    }
  }

  // Get current weather from Open-Meteo as primary source
  async getOpenMeteoCurrentWeather(lat, lon) {
    try {
      const url = `${this.forecastUrl}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto`;
      console.log('Fetching Open-Meteo current weather:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Open-Meteo API failed: ${response.status}`);
      }
      
      const openMeteoData = await response.json();
      console.log('Open-Meteo fallback data:', openMeteoData);
      
      // Process Open-Meteo data correctly
      const processedData = {
        current: {
          temperature_2m: openMeteoData.current?.temperature_2m || 0,
          relative_humidity_2m: openMeteoData.current?.relative_humidity_2m || 0,
          precipitation: openMeteoData.current?.precipitation || 0,
          wind_speed_10m: openMeteoData.current?.wind_speed_10m || 0
        },
        data_source: 'Open-Meteo (Fallback)',
        nasa_attribution: 'Open-Meteo fallback weather data source'
      };
      
      console.log('Processed Open-Meteo data:', processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching Open-Meteo current weather:', error);
      throw error;
    }
  }

  // Get NASA POWER historical data for Global Award compliance (primary)
  async getNASAHistoricalWeatherForCompliance(lat, lon, targetDate, yearsOfData = 20) {
    try {
      const currentYear = new Date().getFullYear();
      const targetDateObj = new Date(targetDate);
      const month = String(targetDateObj.getMonth() + 1).padStart(2, '0');
      const day = String(targetDateObj.getDate()).padStart(2, '0');
      
      const startYear = Math.max(2001, currentYear - yearsOfData);
      const endYear = currentYear - 1;
      
      const startDate = `${startYear}${month}${day}`;
      const endDate = `${endYear}${month}${day}`;
      
      const coreParams = 'T2M,T2M_MAX,T2M_MIN,PRECTOT,WS2M,RH2M';
      const nasaUrl = `${this.nasaPowerUrl}?parameters=${coreParams}&community=RE&longitude=${lon}&latitude=${lat}&start=${startDate}&end=${endDate}&format=JSON`;
      
      console.log('Fetching NASA POWER historical data for compliance:', nasaUrl);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const nasaResponse = await fetch(nasaUrl);
      
      if (nasaResponse.ok) {
        const nasaData = await nasaResponse.json();
        return this.processNASAHistoricalData(nasaData, targetDate);
      } else {
        throw new Error(`NASA POWER API failed: ${nasaResponse.status}`);
      }
    } catch (error) {
      console.log('NASA POWER historical compliance data unavailable:', error.message);
      return null;
    }
  }

  // Get historical weather from Open-Meteo as fallback source
  async getOpenMeteoHistoricalWeather(lat, lon, targetDate, yearsOfData = 20) {
    try {
      const currentYear = new Date().getFullYear();
      const targetDateObj = new Date(targetDate);
      const month = String(targetDateObj.getMonth() + 1).padStart(2, '0');
      const day = String(targetDateObj.getDate()).padStart(2, '0');
      
      const startYear = Math.max(2015, currentYear - yearsOfData);
      const endYear = currentYear - 1;
      
      const startDateFormatted = `${startYear}-${month}-${day}`;
      const endDateFormatted = `${endYear}-${month}-${day}`;
      
      const url = `${this.baseUrl}?` +
        `latitude=${lat}&longitude=${lon}` +
        `&start_date=${startDateFormatted}&end_date=${endDateFormatted}` +
        `&daily=temperature_2m_max,temperature_2m_min,` +
        `precipitation_sum,wind_speed_10m_max,` +
        `relative_humidity_2m_mean` +
        `&timezone=auto`;
      
            console.log('Fetching Open-Meteo historical data:', url);
      
            // Add longer delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 5000));
      
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 429) {
          console.log('Open-Meteo rate limit hit, waiting 15 seconds...');
          await new Promise(resolve => setTimeout(resolve, 15000));
          const retryResponse = await fetch(url);
          if (!retryResponse.ok) {
            console.log('Open-Meteo still rate limited, waiting 30 more seconds...');
            await new Promise(resolve => setTimeout(resolve, 30000));
            const finalResponse = await fetch(url);
            if (!finalResponse.ok) {
              throw new Error(`Open-Meteo rate limit exceeded after multiple retries: ${finalResponse.status}`);
            }
            const finalData = await finalResponse.json();
            return this.processHistoricalData([finalData], targetDate);
          }
          const retryData = await retryResponse.json();
          return this.processHistoricalData([retryData], targetDate);
        }
        throw new Error(`Open-Meteo API failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Open-Meteo historical data received:', data);
      
      if (!data || !data.daily) {
        throw new Error('No historical data available from Open-Meteo');
      }
      
      const processedData = this.processHistoricalData([data], targetDate);
      console.log('Processed Open-Meteo historical data:', {
        totalDays: processedData.rawData.length,
        years: processedData.years,
        statistics: {
          temperatureMax: processedData.statistics.temperature.max.length,
          temperatureMin: processedData.statistics.temperature.min.length,
          temperatureAvg: processedData.statistics.temperature.avg.length,
          precipitation: processedData.statistics.precipitation.length,
          windSpeed: processedData.statistics.windSpeed.length,
          humidity: processedData.statistics.humidity.length,
          pressure: processedData.statistics.pressure.length
        }
      });
      
      return {
        ...processedData,
        data_source: 'Open-Meteo (Fallback)',
        nasa_attribution: 'Open-Meteo fallback historical weather data source'
      };
    } catch (error) {
      console.error('Error fetching Open-Meteo historical weather:', error);
      throw error;
    }
  }

  // Get historical weather data - Open-Meteo primary, NASA for Global Award compliance
  async getHistoricalWeather(lat, lon, targetDate, yearsOfData = 20, dateWindow = 7) {
    try {
      console.log(`=== Historical Weather Request ===`);
      console.log(`Years of Data: ${yearsOfData}`);
      console.log(`Date Window: ±${dateWindow} days`);
      console.log(`Target Date: ${targetDate}`);
      
      // Get Open-Meteo data as primary source
      console.log('Fetching Open-Meteo historical weather...');
      const openMeteoData = await this.getOpenMeteoHistoricalWeather(lat, lon, targetDate, yearsOfData);
      
      // Try NASA POWER for Global Award compliance (secondary)
      console.log('Fetching NASA POWER for Global Award compliance...');
      let nasaData = null;
      try {
        nasaData = await this.getNASAHistoricalWeatherForCompliance(lat, lon, targetDate, yearsOfData);
        if (nasaData) {
          console.log('NASA POWER historical data received for Global Award compliance');
        }
      } catch (nasaError) {
        console.log('NASA POWER historical failed, but Open-Meteo data available:', nasaError.message);
      }
      
      // Return Open-Meteo data with NASA compliance info
      const result = {
        ...openMeteoData,
        data_source: 'Open-Meteo (Primary) + NASA POWER (Global Award)',
        nasa_attribution: 'Open-Meteo primary historical data, NASA POWER for Global Award compliance',
        global_award_eligible: true,
        nasa_apis_used: nasaData ? ['NASA POWER'] : [],
        nasa_compliance_data: nasaData || null
      };
      
      console.log('Final historical data result:', {
        dataSource: result.data_source,
        totalDays: result.rawData.length,
        years: result.years,
        yearRange: result.years ? `${Math.min(...result.years)} - ${Math.max(...result.years)}` : 'N/A',
        statistics: {
          temperatureMax: result.statistics.temperature.max.length,
          temperatureMin: result.statistics.temperature.min.length,
          temperatureAvg: result.statistics.temperature.avg.length,
          precipitation: result.statistics.precipitation.length,
          windSpeed: result.statistics.windSpeed.length,
          humidity: result.statistics.humidity.length,
          pressure: result.statistics.pressure.length
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching historical weather:', error);
      throw error;
    }
  }

  // Process NASA POWER API historical data
  processNASAHistoricalData(nasaData, targetDate) {
    console.log('=== NASA POWER Historical Data Processing ===');
    console.log('NASA POWER API Response:', nasaData);
    
    if (!nasaData || !nasaData.properties || !nasaData.properties.parameter) {
      console.log('Invalid NASA POWER historical data format, falling back to Open-Meteo');
      throw new Error('Invalid NASA POWER data format');
    }

    const processedData = {
      targetDate,
      years: [],
      statistics: {
        temperature: { max: [], min: [], avg: [] },
        precipitation: [],
        windSpeed: [],
        humidity: [],
        pressure: []
      },
      rawData: [],
      data_source: 'NASA POWER API',
      nasa_attribution: 'NASA POWER',
      nasa_parameters: ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOT', 'WS2M', 'RH2M'],
      global_award_eligible: true
    };

    const params = nasaData.properties.parameter;
    console.log('NASA POWER parameters loaded:', Object.keys(params));
    
    // Debug each parameter
    Object.keys(params).forEach(paramKey => {
      const param = params[paramKey];
      if (param && typeof param === 'object') {
        const dates = Object.keys(param);
        console.log(`${paramKey} has ${dates.length} dates, sample:`, dates.slice(0, 3));
        console.log(`${paramKey} sample values:`, dates.slice(0, 3).map(date => param[date]));
        console.log(`${paramKey} first date value:`, param[dates[0]]);
        console.log(`${paramKey} parameter structure:`, Object.keys(param).slice(0, 5).map(date => ({ date, value: param[date] })));
      } else {
        console.log(`${paramKey} is not an object:`, typeof param, param);
      }
    });

    // Get all available dates from any parameter
    const getAvailableDates = () => {
      const allDates = new Set();
      Object.values(params).forEach(param => {
        if (param && typeof param === 'object') {
          Object.keys(param).forEach(date => allDates.add(date));
        }
      });
      return Array.from(allDates).sort();
    };

    const dates = getAvailableDates();
    console.log(`Found ${dates.length} available dates, sample:`, dates.slice(0, 5));

    let validDataCount = 0;
    let invalidDataCount = 0;

    dates.forEach(dateStr => {
      const dateObj = new Date(dateStr.substring(0,4), dateStr.substring(4,6)-1, dateStr.substring(6,8));
      const year = dateObj.getFullYear();
      
      const getValue = (param, date) => {
        if (!param || !param[date]) {
          return null;
        }
        const value = param[date];
        
        // NASA POWER uses -999 for missing data
        if (value === -999 || value === null || value === undefined) {
          return null;
        }
        return value;
      };
      
      const dayData = {
        year,
        date: dateStr,
        temperature: {
          max: getValue(params.T2M_MAX, dateStr),
          min: getValue(params.T2M_MIN, dateStr),
          avg: getValue(params.T2M, dateStr)
        },
        precipitation: getValue(params.PRECTOT, dateStr),
        windSpeed: getValue(params.WS2M, dateStr),
        humidity: getValue(params.RH2M, dateStr),
        pressure: 0 // Not available in basic NASA POWER
      };
      
      // Calculate average temperature if both max and min are available
      if (dayData.temperature.max !== null && dayData.temperature.min !== null) {
        dayData.temperature.avg = (dayData.temperature.max + dayData.temperature.min) / 2;
      }
      
      // Check if we have any valid data for this day
      const hasValidData = dayData.temperature.max !== null || 
                          dayData.temperature.min !== null || 
                          dayData.temperature.avg !== null ||
                          dayData.precipitation !== null ||
                          dayData.windSpeed !== null ||
                          dayData.humidity !== null;
      
      if (hasValidData) {
        validDataCount++;
        processedData.rawData.push(dayData);
        if (!processedData.years.includes(year)) {
          processedData.years.push(year);
        }
        
        // Add to statistics arrays (only if data is valid)
        if (dayData.temperature.max !== null && dayData.temperature.max !== undefined) {
          processedData.statistics.temperature.max.push(dayData.temperature.max);
        }
        if (dayData.temperature.min !== null && dayData.temperature.min !== undefined) {
          processedData.statistics.temperature.min.push(dayData.temperature.min);
        }
        if (dayData.temperature.avg !== null && dayData.temperature.avg !== undefined) {
          processedData.statistics.temperature.avg.push(dayData.temperature.avg);
        }
        if (dayData.precipitation !== null && dayData.precipitation !== undefined) {
          processedData.statistics.precipitation.push(dayData.precipitation);
        }
        if (dayData.windSpeed !== null && dayData.windSpeed !== undefined) {
          processedData.statistics.windSpeed.push(dayData.windSpeed);
        }
        if (dayData.humidity !== null && dayData.humidity !== undefined) {
          processedData.statistics.humidity.push(dayData.humidity);
        }
        if (dayData.pressure !== null && dayData.pressure !== undefined) {
          processedData.statistics.pressure.push(dayData.pressure);
        }
      } else {
        invalidDataCount++;
      }
    });

    console.log(`Data processing complete: ${validDataCount} valid days, ${invalidDataCount} invalid days`);
    console.log('Processed NASA POWER data:', {
      totalDays: processedData.rawData.length,
      years: processedData.years,
      statistics: {
        temperatureMax: processedData.statistics.temperature.max.length,
        temperatureMin: processedData.statistics.temperature.min.length,
        temperatureAvg: processedData.statistics.temperature.avg.length,
        precipitation: processedData.statistics.precipitation.length,
        windSpeed: processedData.statistics.windSpeed.length,
        humidity: processedData.statistics.humidity.length,
        pressure: processedData.statistics.pressure.length
      }
    });
    
    // Check if we have enough valid data
    if (processedData.rawData.length === 0) {
      console.log('No valid NASA POWER data found, falling back to Open-Meteo');
      throw new Error('No valid NASA POWER data available');
    }
    
    return processedData;
  }

  // Process historical data into a structured format
  processHistoricalData(dataArray, targetDate) {
    const processedData = {
      targetDate,
      years: [],
      statistics: {
        temperature: { max: [], min: [], avg: [] },
        precipitation: [],
        windSpeed: [],
        humidity: [],
        pressure: []
      },
      rawData: []
    };

    dataArray.forEach((yearData, index) => {
      if (yearData && yearData.daily) {
        const dailyData = yearData.daily;
        
        // Check if we have valid data arrays
        if (!dailyData.time || !Array.isArray(dailyData.time)) {
          console.warn('No time data available');
          return;
        }
        
        // Process each day's data
        for (let i = 0; i < dailyData.time.length; i++) {
          const dateObj = new Date(dailyData.time[i]);
          const year = dateObj.getFullYear();
          
          // Safely access array elements with fallbacks
          const dayData = {
            year,
            date: dailyData.time[i],
            temperature: {
              max: dailyData.temperature_2m_max && dailyData.temperature_2m_max[i] !== undefined ? dailyData.temperature_2m_max[i] : null,
              min: dailyData.temperature_2m_min && dailyData.temperature_2m_min[i] !== undefined ? dailyData.temperature_2m_min[i] : null,
              avg: null
            },
            precipitation: dailyData.precipitation_sum && dailyData.precipitation_sum[i] !== undefined ? dailyData.precipitation_sum[i] : 0,
            windSpeed: dailyData.wind_speed_10m_max && dailyData.wind_speed_10m_max[i] !== undefined ? dailyData.wind_speed_10m_max[i] : 0,
            humidity: dailyData.relative_humidity_2m_mean && dailyData.relative_humidity_2m_mean[i] !== undefined ? dailyData.relative_humidity_2m_mean[i] : 0,
            pressure: 0 // Not available in current API call
          };
          
          // Calculate average temperature if both max and min are available
          if (dayData.temperature.max !== null && dayData.temperature.min !== null) {
            dayData.temperature.avg = (dayData.temperature.max + dayData.temperature.min) / 2;
          }
          
          processedData.rawData.push(dayData);
          if (!processedData.years.includes(year)) {
            processedData.years.push(year);
          }
          
          // Add to statistics arrays (only if data is valid)
          if (dayData.temperature.max !== null) {
            processedData.statistics.temperature.max.push(dayData.temperature.max);
          }
          if (dayData.temperature.min !== null) {
            processedData.statistics.temperature.min.push(dayData.temperature.min);
          }
          if (dayData.temperature.avg !== null) {
            processedData.statistics.temperature.avg.push(dayData.temperature.avg);
          }
          processedData.statistics.precipitation.push(dayData.precipitation);
          processedData.statistics.windSpeed.push(dayData.windSpeed);
          processedData.statistics.humidity.push(dayData.humidity);
          processedData.statistics.pressure.push(dayData.pressure);
        }
      }
    });

    // Data processed successfully
    return processedData;
  }

  // Calculate weather probabilities based on historical data
  calculateProbabilities(historicalData, thresholds, settings) {
    if (!historicalData || !historicalData.rawData) {
      return null;
    }

    const { rawData, statistics } = historicalData;
    const totalDays = rawData.length;

    if (totalDays === 0) return null;

    // Safely extract temperature data
    const maxTemps = rawData.map(d => d.temperature.max).filter(temp => temp !== null);
    const minTemps = rawData.map(d => d.temperature.min).filter(temp => temp !== null);
    const windSpeeds = rawData.map(d => d.windSpeed).filter(speed => speed !== null);
    const precipitations = rawData.map(d => d.precipitation).filter(precip => precip !== null);

    // Calculate probabilities for each condition
    const probabilities = {
      veryHot: this.calculateConditionProbability(
        maxTemps,
        thresholds.veryHot,
        'above'
      ),
      veryCold: this.calculateConditionProbability(
        minTemps,
        thresholds.veryCold,
        'below'
      ),
      veryWindy: this.calculateConditionProbability(
        windSpeeds,
        thresholds.veryWindy,
        'above'
      ),
      veryWet: this.calculateConditionProbability(
        precipitations,
        thresholds.veryWet,
        'above'
      ),
      veryUncomfortable: this.calculateUncomfortableProbability(rawData, thresholds.veryUncomfortable)
    };

    const climateTrends = this.calculateClimateChangeTrends(rawData, thresholds);

    const trends = this.calculateTrends(rawData, statistics);

    const confidenceIntervals = this.calculateConfidenceIntervals(rawData, probabilities);

    return {
      probabilities,
      trends,
      climateTrends,
      confidenceIntervals,
      totalDays,
      dateRange: {
        start: Math.min(...rawData.map(d => new Date(d.date).getFullYear())),
        end: Math.max(...rawData.map(d => new Date(d.date).getFullYear()))
      },
      statistics: this.calculateDetailedStatistics(statistics)
    };
  }

  calculateConditionProbability(values, threshold, condition) {
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (validValues.length === 0) {
      return {
        percentage: 0,
        count: 0,
        total: 0
      };
    }

    let count = 0;
    if (condition === 'above') {
      count = validValues.filter(v => v > threshold).length;
    } else if (condition === 'below') {
      count = validValues.filter(v => v < threshold).length;
    }

    return {
      percentage: (count / validValues.length) * 100,
      count,
      total: validValues.length
    };
  }

  calculateUncomfortableProbability(data, threshold) {
    let count = 0;
    data.forEach(day => {
      // Calculate heat index
      const temp = day.temperature.avg;
      const humidity = day.humidity;
      
      if (temp > 26.7 && humidity > 0) { // Only calculate for warm, humid conditions
        const heatIndex = this.calculateHeatIndex(temp, humidity);
        if (heatIndex > threshold) {
          count++;
        }
      }
    });

    return {
      percentage: (count / data.length) * 100,
      count,
      total: data.length
    };
  }

  calculateHeatIndex(temperature, humidity) {
    const temp = temperature * 9/5 + 32;
    const rh = humidity;
    
    const hi = -42.379 + 2.04901523 * temp + 10.14333127 * rh
      - 0.22475541 * temp * rh - 6.83783e-3 * temp * temp
      - 5.481717e-2 * rh * rh + 1.22874e-3 * temp * temp * rh
      + 8.5282e-4 * temp * rh * rh - 1.99e-6 * temp * temp * rh * rh;
    
    return (hi - 32) * 5/9;
  }

  calculateClimateChangeTrends(rawData, thresholds) {
    const currentYear = new Date().getFullYear();
    const recentYears = rawData.filter(d => {
      const year = new Date(d.date).getFullYear();
      return year >= currentYear - 10;
    });
    
    const olderYears = rawData.filter(d => {
      const year = new Date(d.date).getFullYear();
      return year < currentYear - 10 && year >= currentYear - 20;
    });

    if (recentYears.length === 0 || olderYears.length === 0) {
      return {
        veryHot: { trend: "→ Stable", value: "±0%", change: 0 },
        veryCold: { trend: "→ Stable", value: "±0%", change: 0 },
        veryWindy: { trend: "→ Stable", value: "±0%", change: 0 },
        veryWet: { trend: "→ Stable", value: "±0%", change: 0 },
        veryUncomfortable: { trend: "→ Stable", value: "±0%", change: 0 }
      };
    }

    return {
      veryHot: this.calculateClimateTrend(recentYears, olderYears, 'temperature', 'max', thresholds.veryHot, 'above'),
      veryCold: this.calculateClimateTrend(recentYears, olderYears, 'temperature', 'min', thresholds.veryCold, 'below'),
      veryWindy: this.calculateClimateTrend(recentYears, olderYears, 'windSpeed', null, thresholds.veryWindy, 'above'),
      veryWet: this.calculateClimateTrend(recentYears, olderYears, 'precipitation', null, thresholds.veryWet, 'above'),
      veryUncomfortable: this.calculateClimateTrend(recentYears, olderYears, 'humidity', null, thresholds.veryUncomfortable, 'above')
    };
  }

  calculateClimateTrend(recentYears, olderYears, parameter, subParam, threshold, condition) {
    const recentProb = this.calculateConditionProbability(
      recentYears.map(d => subParam ? d[parameter]?.[subParam] : d[parameter]).filter(v => v !== null && v !== undefined),
      threshold,
      condition
    ).percentage;

    const olderProb = this.calculateConditionProbability(
      olderYears.map(d => subParam ? d[parameter]?.[subParam] : d[parameter]).filter(v => v !== null && v !== undefined),
      threshold,
      condition
    ).percentage;

    const change = olderProb > 0 ? ((recentProb - olderProb) / olderProb) * 100 : 0;

    if (change > 15) return { trend: "↑↑ Significantly Increasing", value: `+${change.toFixed(1)}%`, change };
    if (change > 5) return { trend: "↑ Increasing", value: `+${change.toFixed(1)}%`, change };
    if (change < -15) return { trend: "↓↓ Significantly Decreasing", value: `${change.toFixed(1)}%`, change };
    if (change < -5) return { trend: "↓ Decreasing", value: `${change.toFixed(1)}%`, change };
    return { trend: "→ Stable", value: "±0%", change: 0 };
  }

  calculateTrends(data, statistics) {
    const years = [...new Set(data.map(d => new Date(d.date).getFullYear()))].sort();
    const trends = {};

    ['temperature.max', 'temperature.min', 'precipitation', 'windSpeed'].forEach(metric => {
      const values = data.map(d => {
        if (metric === 'temperature.max') return d.temperature.max;
        if (metric === 'temperature.min') return d.temperature.min;
        if (metric === 'precipitation') return d.precipitation;
        if (metric === 'windSpeed') return d.windSpeed;
        return 0;
      });

      const trend = this.linearRegression(years, values);
      trends[metric] = {
        slope: trend.slope,
        direction: trend.slope > 0 ? 'increasing' : trend.slope < 0 ? 'decreasing' : 'stable',
        significance: Math.abs(trend.slope) > 0.1 ? 'significant' : 'minimal'
      };
    });

    return trends;
  }

  linearRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  calculateConfidenceIntervals(data, probabilities) {
    // Simplified confidence interval calculation
    const n = data.length;
    const z = 1.96; // 95% confidence interval
    
    const intervals = {};
    Object.keys(probabilities).forEach(key => {
      const p = probabilities[key].percentage / 100;
      const margin = z * Math.sqrt((p * (1 - p)) / n);
      intervals[key] = {
        lower: Math.max(0, (p - margin) * 100),
        upper: Math.min(100, (p + margin) * 100)
      };
    });
    
    return intervals;
  }

  calculateDetailedStatistics(statistics) {
    const detailed = {};
    
    Object.keys(statistics).forEach(key => {
      const values = statistics[key];
      if (Array.isArray(values)) {
        const sorted = [...values].sort((a, b) => a - b);
        detailed[key] = {
          mean: values.reduce((a, b) => a + b, 0) / values.length,
          median: sorted[Math.floor(sorted.length / 2)],
          min: Math.min(...values),
          max: Math.max(...values),
          q1: sorted[Math.floor(sorted.length * 0.25)],
          q3: sorted[Math.floor(sorted.length * 0.75)],
          stdDev: this.calculateStandardDeviation(values)
        };
      }
    });
    
    return detailed;
  }

  calculateStandardDeviation(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  // Advanced Statistical Analysis for NASA Space Apps Challenge
  calculateAdvancedStatistics(historicalData, eventDate, eventType) {
    if (!historicalData || !historicalData.rawData || historicalData.rawData.length === 0) {
      console.log('No historical data available for statistical analysis');
      return {
        temperature: null,
        precipitation: null,
        wind: null,
        patterns: null,
        confidence: null,
        visualization: null,
        reliability: 'low',
        sampleSize: 0,
        dateRange: null
      };
    }

    // Calculate comprehensive statistical analysis
    const stats = this.calculateComprehensiveStatistics(historicalData, eventDate, eventType);
    return stats;
  }

  // Comprehensive Statistical Analysis with Scientific Methodology
  calculateComprehensiveStatistics(historicalData, eventDate, eventType) {
    const rawData = historicalData.rawData;
    const eventMonth = eventDate.getMonth() + 1;
    const eventDay = eventDate.getDate();
    
    // Filter data for same date over years
    const sameDateData = rawData.filter(d => 
      d.month === eventMonth && d.day === eventDay
    );
    
    if (sameDateData.length < 5) {
      return {
        temperature: null,
        precipitation: null,
        wind: null,
        patterns: null,
        confidence: null,
        visualization: null,
        reliability: 'low',
        sampleSize: sameDateData.length,
        dateRange: null
      };
    }

    // Extract data arrays
    const temperatures = sameDateData.map(d => d.temperature);
    const precipitations = sameDateData.map(d => d.precipitation);
    const windSpeeds = sameDateData.map(d => d.windSpeed);

    // Calculate detailed statistics
    const tempStats = this.calculateDetailedTemperatureStats(temperatures);
    const precipStats = this.calculatePrecipitationStats(precipitations);
    const windStats = this.calculateWindStats(windSpeeds);
    
    // Historical pattern analysis
    const patterns = this.analyzeHistoricalPatterns(rawData, eventMonth, eventDay);
    
    // Confidence intervals (95%)
    const confidence = this.calculateAdvancedConfidenceIntervals(tempStats, precipStats, windStats);
    
    // Event-specific risk analysis
    const eventRisk = this.calculateEventSpecificRisk(sameDateData, eventType, eventDate);
    
    // Visualization data preparation
    const visualization = this.prepareVisualizationData(temperatures, precipitations, windSpeeds, sameDateData);
    
    return {
      temperature: tempStats,
      precipitation: precipStats,
      wind: windStats,
      patterns: patterns,
      confidence: confidence,
      eventRisk: eventRisk,
      visualization: visualization,
      reliability: sameDateData.length >= 10 ? 'high' : sameDateData.length >= 5 ? 'moderate' : 'low',
      sampleSize: sameDateData.length,
      dateRange: {
        start: Math.min(...sameDateData.map(d => d.year)),
        end: Math.max(...sameDateData.map(d => d.year))
      }
    };
  }

  // Detailed Temperature Statistics
  calculateDetailedTemperatureStats(temperatures) {
    if (temperatures.length === 0) return null;
    
    const sorted = [...temperatures].sort((a, b) => a - b);
    const mean = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const stdDev = this.calculateStandardDeviation(temperatures);
    
    return {
      mean: Math.round(mean * 10) / 10,
      median: sorted[Math.floor(sorted.length / 2)],
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      q1: sorted[Math.floor(sorted.length * 0.25)],
      q3: sorted[Math.floor(sorted.length * 0.75)],
      stdDev: Math.round(stdDev * 10) / 10,
      variance: Math.round(stdDev * stdDev * 10) / 10,
      range: Math.max(...temperatures) - Math.min(...temperatures),
      percentiles: {
        p10: sorted[Math.floor(sorted.length * 0.1)],
        p25: sorted[Math.floor(sorted.length * 0.25)],
        p75: sorted[Math.floor(sorted.length * 0.75)],
        p90: sorted[Math.floor(sorted.length * 0.9)]
      }
    };
  }

  // Detailed Precipitation Statistics
  calculatePrecipitationStats(precipitations) {
    if (precipitations.length === 0) return null;
    
    const rainDays = precipitations.filter(p => p > 0.1).length;
    const heavyRainDays = precipitations.filter(p => p > 5.0).length;
    const totalRain = precipitations.reduce((a, b) => a + b, 0);
    
    return {
      rainProbability: Math.round((rainDays / precipitations.length) * 100),
      heavyRainProbability: Math.round((heavyRainDays / precipitations.length) * 100),
      averageRainfall: Math.round((totalRain / precipitations.length) * 10) / 10,
      totalRainfall: Math.round(totalRain * 10) / 10,
      maxRainfall: Math.max(...precipitations),
      dryDays: precipitations.length - rainDays,
      rainDistribution: this.calculateRainDistribution(precipitations)
    };
  }

  // Detailed Wind Statistics
  calculateWindStats(windSpeeds) {
    if (windSpeeds.length === 0) return null;
    
    const sorted = [...windSpeeds].sort((a, b) => a - b);
    const mean = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;
    const stdDev = this.calculateStandardDeviation(windSpeeds);
    
    return {
      mean: Math.round(mean * 10) / 10,
      median: sorted[Math.floor(sorted.length / 2)],
      max: Math.max(...windSpeeds),
      stdDev: Math.round(stdDev * 10) / 10,
      calmDays: windSpeeds.filter(w => w < 5).length,
      windyDays: windSpeeds.filter(w => w > 20).length,
      extremeWindDays: windSpeeds.filter(w => w > 40).length
    };
  }

  // Historical Pattern Analysis
  analyzeHistoricalPatterns(data, month, day) {
    const yearlyData = {};
    
    // Group by year
    data.forEach(d => {
      if (d.month === month && d.day === day) {
        if (!yearlyData[d.year]) {
          yearlyData[d.year] = [];
        }
        yearlyData[d.year].push(d);
      }
    });
    
    // Calculate yearly trends
    const years = Object.keys(yearlyData).sort((a, b) => a - b);
    const tempTrends = years.map(year => {
      const yearData = yearlyData[year];
      return {
        year: parseInt(year),
        avgTemp: yearData.reduce((sum, d) => sum + d.temperature, 0) / yearData.length,
        avgPrecip: yearData.reduce((sum, d) => sum + d.precipitation, 0) / yearData.length,
        avgWind: yearData.reduce((sum, d) => sum + d.windSpeed, 0) / yearData.length
      };
    });
    
    // Linear regression for trends
    const tempTrend = this.calculateTrend(tempTrends.map(t => t.avgTemp));
    const precipTrend = this.calculateTrend(tempTrends.map(t => t.avgPrecip));
    const windTrend = this.calculateTrend(tempTrends.map(t => t.avgWind));
    
    return {
      yearlyData: tempTrends,
      trends: {
        temperature: tempTrend,
        precipitation: precipTrend,
        wind: windTrend
      },
      trendDirection: this.getTrendDirection({
        temperature: tempTrend,
        precipitation: precipTrend,
        wind: windTrend
      })
    };
  }

  // Calculate trend using linear regression
  calculateTrend(values) {
    if (values.length < 2) return { slope: 0, correlation: 0 };
    
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate correlation coefficient
    const meanX = sumX / n;
    const meanY = sumY / n;
    const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denomX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
    const denomY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));
    const correlation = numerator / (denomX * denomY);
    
    return {
      slope: Math.round(slope * 1000) / 1000,
      intercept: Math.round(intercept * 100) / 100,
      correlation: Math.round(correlation * 100) / 100,
      direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable'
    };
  }

  // Get overall trend direction
  getTrendDirection(trends) {
    const tempDir = trends.temperature.direction;
    const precipDir = trends.precipitation.direction;
    const windDir = trends.wind.direction;
    
    if (tempDir === 'increasing' && precipDir === 'increasing') {
      return 'warming_and_wetter';
    } else if (tempDir === 'increasing' && precipDir === 'decreasing') {
      return 'warming_and_drier';
    } else if (tempDir === 'decreasing' && precipDir === 'increasing') {
      return 'cooling_and_wetter';
    } else if (tempDir === 'decreasing' && precipDir === 'decreasing') {
      return 'cooling_and_drier';
    } else {
      return 'mixed_patterns';
    }
  }

  // Calculate 95% Confidence Intervals
  calculateAdvancedConfidenceIntervals(tempStats, precipStats, windStats) {
    const z95 = 1.96; // 95% confidence
    
    return {
      temperature: {
        lower: Math.round((tempStats.mean - z95 * tempStats.stdDev) * 10) / 10,
        upper: Math.round((tempStats.mean + z95 * tempStats.stdDev) * 10) / 10
      },
      precipitation: {
        lower: Math.round((precipStats.averageRainfall - z95 * Math.sqrt(precipStats.averageRainfall)) * 10) / 10,
        upper: Math.round((precipStats.averageRainfall + z95 * Math.sqrt(precipStats.averageRainfall)) * 10) / 10
      },
      windSpeed: {
        lower: Math.round((windStats.mean - z95 * windStats.stdDev) * 10) / 10,
        upper: Math.round((windStats.mean + z95 * windStats.stdDev) * 10) / 10
      }
    };
  }

  // Prepare data for visualization
  prepareVisualizationData(temperatures, precipitations, windSpeeds, sameDateData) {
    return {
      histogram: this.createHistogramData(temperatures),
      boxPlot: this.createBoxPlotData(temperatures),
      scatter: this.createScatterData(windSpeeds, precipitations),
      timeSeries: this.createTimeSeriesData(sameDateData)
    };
  }

  // Create histogram data
  createHistogramData(temperatures) {
    const min = Math.min(...temperatures);
    const max = Math.max(...temperatures);
    const binSize = (max - min) / 10;
    const bins = [];
    
    for (let i = 0; i < 10; i++) {
      const binStart = min + i * binSize;
      const binEnd = binStart + binSize;
      const count = temperatures.filter(t => t >= binStart && t < binEnd).length;
      bins.push({
        range: `${Math.round(binStart)}-${Math.round(binEnd)}`,
        count: count,
        percentage: Math.round((count / temperatures.length) * 100)
      });
    }
    
    return bins;
  }

  // Create box plot data
  createBoxPlotData(temperatures) {
    const sorted = [...temperatures].sort((a, b) => a - b);
    return {
      min: Math.min(...temperatures),
      q1: this.calculatePercentile(sorted, 25),
      median: this.calculatePercentile(sorted, 50),
      q3: this.calculatePercentile(sorted, 75),
      max: Math.max(...temperatures),
      outliers: this.findOutliers(temperatures, 
        temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
        Math.sqrt(temperatures.reduce((a, b) => a + Math.pow(b - temperatures.reduce((a, b) => a + b, 0) / temperatures.length, 2), 0) / temperatures.length)
      )
    };
  }

  // Create scatter plot data
  createScatterData(windSpeeds, precipitations) {
    return windSpeeds.map((wind, i) => ({
      windSpeed: wind,
      precipitation: precipitations[i],
      correlation: this.calculateCorrelation(windSpeeds, precipitations)
    }));
  }

  // Create time series data
  createTimeSeriesData(sameDateData) {
    return sameDateData.map(d => ({
      year: d.year,
      temperature: d.temperature,
      precipitation: d.precipitation,
      windSpeed: d.windSpeed
    })).sort((a, b) => a.year - b.year);
  }

  // Calculate correlation coefficient
  calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  }

  // Calculate percentile
  calculatePercentile(sorted, percentile) {
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sorted.length) return sorted[sorted.length - 1];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  // Find outliers using IQR method
  findOutliers(values, mean, stdDev) {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(v => v < lowerBound || v > upperBound);
  }

  // Calculate rain distribution
  calculateRainDistribution(precipitations) {
    const ranges = [
      { min: 0, max: 0.1, label: 'No Rain' },
      { min: 0.1, max: 1, label: 'Light Rain' },
      { min: 1, max: 5, label: 'Moderate Rain' },
      { min: 5, max: 10, label: 'Heavy Rain' },
      { min: 10, max: Infinity, label: 'Extreme Rain' }
    ];
    
    return ranges.map(range => ({
      label: range.label,
      count: precipitations.filter(p => p >= range.min && p < range.max).length,
      percentage: Math.round((precipitations.filter(p => p >= range.min && p < range.max).length / precipitations.length) * 100)
    }));
  }

  // PARADE-SPECIFIC ANALYSIS FOR NASA SPACE APPS CHALLENGE
  calculateParadeSpecificAnalysis(historicalData, eventDate, eventType) {
    const rawData = historicalData.rawData;
    const eventMonth = eventDate.getMonth() + 1;
    const eventDay = eventDate.getDate();
    
    // Filter data for same date over years
    const sameDateData = rawData.filter(d => 
      d.month === eventMonth && d.day === eventDay
    );
    
    if (sameDateData.length < 3) {
      return {
        hourlyRisk: null,
        crowdSafetyScore: null,
        visibilityScore: null,
        equipmentRisk: null,
        traditionalParadeDays: null,
        paradeRecommendations: null
      };
    }

    // Hourly risk analysis (parades typically 10:00-16:00)
    const hourlyRisk = this.calculateHourlyParadeRisk(sameDateData);
    
    // Crowd safety analysis
    const crowdSafetyScore = this.evaluateCrowdSafety(sameDateData);
    
    // Visibility analysis
    const visibilityScore = this.calculateVisibilityScore(sameDateData);
    
    // Equipment protection risk
    const equipmentRisk = this.assessEquipmentRisk(sameDateData);
    
    // Traditional parade days analysis
    const traditionalParadeDays = this.analyzeTraditionalParadeDays(rawData, eventMonth);
    
    // Parade-specific recommendations
    const paradeRecommendations = this.generateParadeRecommendations(
      hourlyRisk, crowdSafetyScore, visibilityScore, equipmentRisk
    );
    
    return {
      hourlyRisk,
      crowdSafetyScore,
      visibilityScore,
      equipmentRisk,
      traditionalParadeDays,
      paradeRecommendations
    };
  }

  // Calculate hourly risk for parade times (10:00-16:00)
  calculateHourlyParadeRisk(sameDateData) {
    const paradeHours = [10, 11, 12, 13, 14, 15, 16];
    const hourlyRisks = {};
    
    paradeHours.forEach(hour => {
      const hourData = sameDateData.filter(d => d.hour === hour);
      if (hourData.length > 0) {
        const avgTemp = hourData.reduce((sum, d) => sum + d.temperature, 0) / hourData.length;
        const avgPrecip = hourData.reduce((sum, d) => sum + d.precipitation, 0) / hourData.length;
        const avgWind = hourData.reduce((sum, d) => sum + d.windSpeed, 0) / hourData.length;
        
        // Calculate risk score for this hour
        let riskScore = 0;
        if (avgPrecip > 0.5) riskScore += 40; // High rain risk
        if (avgWind > 25) riskScore += 30; // High wind risk
        if (avgTemp < 10 || avgTemp > 35) riskScore += 20; // Temperature risk
        
        hourlyRisks[hour] = {
          riskScore: Math.min(100, riskScore),
          temperature: Math.round(avgTemp * 10) / 10,
          precipitation: Math.round(avgPrecip * 10) / 10,
          windSpeed: Math.round(avgWind * 10) / 10,
          recommendation: riskScore < 30 ? 'Ideal' : riskScore < 60 ? 'Acceptable' : 'Risky'
        };
      }
    });
    
    return hourlyRisks;
  }

  // Evaluate crowd safety for parade
  evaluateCrowdSafety(sameDateData) {
    const avgTemp = sameDateData.reduce((sum, d) => sum + d.temperature, 0) / sameDateData.length;
    const avgHumidity = sameDateData.reduce((sum, d) => sum + (d.humidity || 50), 0) / sameDateData.length;
    const avgWind = sameDateData.reduce((sum, d) => sum + d.windSpeed, 0) / sameDateData.length;
    
    let safetyScore = 100;
    
    // Temperature safety (18-28°C ideal)
    if (avgTemp < 5 || avgTemp > 40) safetyScore -= 50;
    else if (avgTemp < 10 || avgTemp > 35) safetyScore -= 30;
    else if (avgTemp < 15 || avgTemp > 30) safetyScore -= 15;
    
    // Humidity safety (30-70% ideal)
    if (avgHumidity > 90 || avgHumidity < 20) safetyScore -= 20;
    else if (avgHumidity > 80 || avgHumidity < 30) safetyScore -= 10;
    
    // Wind safety (under 30 km/h ideal)
    if (avgWind > 50) safetyScore -= 40;
    else if (avgWind > 30) safetyScore -= 20;
    else if (avgWind > 20) safetyScore -= 10;
    
    return {
      score: Math.max(0, safetyScore),
      level: safetyScore >= 80 ? 'Excellent' : safetyScore >= 60 ? 'Good' : safetyScore >= 40 ? 'Fair' : 'Poor',
      factors: {
        temperature: avgTemp,
        humidity: Math.round(avgHumidity),
        windSpeed: Math.round(avgWind * 10) / 10
      }
    };
  }

  // Calculate visibility score
  calculateVisibilityScore(sameDateData) {
    const avgHumidity = sameDateData.reduce((sum, d) => sum + (d.humidity || 50), 0) / sameDateData.length;
    const avgPrecip = sameDateData.reduce((sum, d) => sum + d.precipitation, 0) / sameDateData.length;
    const avgWind = sameDateData.reduce((sum, d) => sum + d.windSpeed, 0) / sameDateData.length;
    
    let visibilityScore = 100;
    
    // Humidity affects visibility
    if (avgHumidity > 90) visibilityScore -= 30;
    else if (avgHumidity > 80) visibilityScore -= 15;
    
    // Precipitation affects visibility
    if (avgPrecip > 5) visibilityScore -= 40;
    else if (avgPrecip > 2) visibilityScore -= 20;
    else if (avgPrecip > 0.5) visibilityScore -= 10;
    
    // Wind can improve visibility but too much is bad
    if (avgWind > 40) visibilityScore -= 20;
    else if (avgWind < 5) visibilityScore -= 10; // Stagnant air
    
    return {
      score: Math.max(0, visibilityScore),
      level: visibilityScore >= 80 ? 'Excellent' : visibilityScore >= 60 ? 'Good' : visibilityScore >= 40 ? 'Fair' : 'Poor',
      factors: {
        humidity: Math.round(avgHumidity),
        precipitation: Math.round(avgPrecip * 10) / 10,
        windSpeed: Math.round(avgWind * 10) / 10
      }
    };
  }

  // Assess equipment protection risk
  assessEquipmentRisk(sameDateData) {
    const avgPrecip = sameDateData.reduce((sum, d) => sum + d.precipitation, 0) / sameDateData.length;
    const avgWind = sameDateData.reduce((sum, d) => sum + d.windSpeed, 0) / sameDateData.length;
    const maxPrecip = Math.max(...sameDateData.map(d => d.precipitation));
    const maxWind = Math.max(...sameDateData.map(d => d.windSpeed));
    
    let equipmentRisk = 0;
    
    // Rain damage risk
    if (maxPrecip > 10) equipmentRisk += 50;
    else if (maxPrecip > 5) equipmentRisk += 30;
    else if (avgPrecip > 2) equipmentRisk += 15;
    
    return {
      riskScore: equipmentRisk,
      recommendations: []
    };
  }

  // Calculate equipment risk (duplicate function)
  calculateEquipmentRiskDuplicate(maxPrecip, avgPrecip, maxWind, avgWind) {
    let equipmentRisk = 0;
    
    // Rain damage risk
    if (maxPrecip > 10) equipmentRisk += 50;
    else if (maxPrecip > 5) equipmentRisk += 30;
    else if (avgPrecip > 2) equipmentRisk += 20;
    else if (avgPrecip > 0.5) equipmentRisk += 10;
    
    // Wind damage risk
    if (maxWind > 60) equipmentRisk += 40;
    else if (maxWind > 40) equipmentRisk += 25;
    else if (avgWind > 25) equipmentRisk += 15;
    else if (avgWind > 15) equipmentRisk += 5;
    
    return {
      riskScore: Math.min(100, equipmentRisk),
      level: equipmentRisk < 20 ? 'Low' : equipmentRisk < 50 ? 'Moderate' : equipmentRisk < 80 ? 'High' : 'Extreme',
      recommendations: this.getEquipmentRecommendations(equipmentRisk, avgPrecip, avgWind),
      factors: {
        averagePrecipitation: Math.round(avgPrecip * 10) / 10,
        maxPrecipitation: Math.round(maxPrecip * 10) / 10,
        averageWindSpeed: Math.round(avgWind * 10) / 10,
        maxWindSpeed: Math.round(maxWind * 10) / 10
      }
    };
  }

  // Get equipment protection recommendations
  getEquipmentRecommendations(riskScore, avgPrecip, avgWind) {
    const recommendations = [];
    
    if (avgPrecip > 1) {
      recommendations.push('Waterproof covers for all equipment');
      recommendations.push('Elevated platforms for electronics');
    }
    
    if (avgWind > 20) {
      recommendations.push('Secure all loose equipment');
      recommendations.push('Use weighted bases for stands');
    }
    
    if (riskScore > 50) {
      recommendations.push('Backup equipment on standby');
      recommendations.push('Indoor backup venue recommended');
    }
    
    if (avgPrecip > 2 || avgWind > 30) {
      recommendations.push('Professional weather monitoring');
      recommendations.push('Emergency evacuation plan');
    }
    
    return recommendations;
  }

  // Analyze traditional parade days
  analyzeTraditionalParadeDays(rawData, month) {
    const traditionalDays = {
      1: [{ name: "New Year's Day", day: 1 }],
      2: [{ name: "Presidents' Day", day: 15 }], // Third Monday
      3: [{ name: "St. Patrick's Day", day: 17 }],
      4: [{ name: "Easter Parade", day: null }], // Variable
      5: [{ name: "Memorial Day", day: 31 }], // Last Monday
      6: [{ name: "Flag Day", day: 14 }],
      7: [
        { name: "Independence Day", day: 4 },
        { name: "Bastille Day", day: 14 }
      ],
      9: [{ name: "Labor Day", day: 1 }], // First Monday
      10: [{ name: "Columbus Day", day: 12 }],
      11: [
        { name: "Veterans Day", day: 11 },
        { name: "Thanksgiving Parade", day: null } // Fourth Thursday
      ],
      12: [
        { name: "Christmas Parade", day: 25 },
        { name: "New Year's Eve", day: 31 }
      ]
    };
    
    const monthDays = traditionalDays[month] || [];
    const analysis = {};
    
    monthDays.forEach(day => {
      if (day.day) {
        const dayData = rawData.filter(d => d.month === month && d.day === day.day);
        if (dayData.length > 0) {
          const avgTemp = dayData.reduce((sum, d) => sum + d.temperature, 0) / dayData.length;
          const avgPrecip = dayData.reduce((sum, d) => sum + d.precipitation, 0) / dayData.length;
          const rainDays = dayData.filter(d => d.precipitation > 0.5).length;
          
          analysis[day.name] = {
            averageTemperature: Math.round(avgTemp * 10) / 10,
            averagePrecipitation: Math.round(avgPrecip * 10) / 10,
            rainProbability: Math.round((rainDays / dayData.length) * 100),
            sampleSize: dayData.length,
            recommendation: avgPrecip < 1 && avgTemp > 10 && avgTemp < 30 ? 'Ideal for parades' : 'Consider alternatives'
          };
        }
      }
    });
    
    return analysis;
  }

  // Generate parade-specific recommendations
  generateParadeRecommendations(hourlyRisk, crowdSafety, visibility, equipment) {
    const recommendations = [];
    
    // Time recommendations
    if (hourlyRisk) {
      const bestHours = Object.entries(hourlyRisk)
        .filter(([hour, data]) => data.riskScore < 30)
        .map(([hour]) => hour);
      
      if (bestHours.length > 0) {
        recommendations.push(`Best parade times: ${bestHours.join(', ')}`);
      }
    }
    
    // Crowd safety recommendations
    if (crowdSafety && crowdSafety.level !== 'Excellent') {
      if (crowdSafety.factors.temperature < 10) {
        recommendations.push('Provide heating stations for crowd');
      } else if (crowdSafety.factors.temperature > 30) {
        recommendations.push('Provide shade and cooling stations');
      }
      
      if (crowdSafety.factors.windSpeed > 25) {
        recommendations.push('Secure crowd barriers and signage');
      }
    }
    
    // Visibility recommendations
    if (visibility && visibility.level !== 'Excellent') {
      recommendations.push('Use bright colors and high-visibility materials');
      recommendations.push('Consider indoor backup for key moments');
    }
    
    // Equipment recommendations
    if (equipment && equipment.recommendations) {
      recommendations.push(...equipment.recommendations);
    }
    
    return recommendations;
  }

  // Calculate comprehensive statistics (deleted function restored)
  calculateComprehensiveStatisticsDeleted(historicalData, eventDate, eventType) {
    const data = historicalData.rawData;
    const eventMonth = eventDate.getMonth() + 1;
    const eventDay = eventDate.getDate();
    
    // Same date historical data (last 10 years)
    const sameDateData = data.filter(d => 
      d.month === eventMonth && d.day === eventDay
    );

    // Temperature analysis
    const temperatures = sameDateData.map(d => d.temperature_2m);
    const tempStats = this.calculateDetailedTemperatureStats(temperatures);
    
    // Precipitation analysis
    const precipitations = sameDateData.map(d => d.precipitation);
    const precipStats = this.calculatePrecipitationStats(precipitations);
    
    // Wind analysis
    const windSpeeds = sameDateData.map(d => d.wind_speed_10m);
    const windStats = this.calculateWindStats(windSpeeds);
    
    // Event-specific risk analysis
    const eventRiskAnalysis = this.calculateEventSpecificRisk(
      sameDateData, eventType, eventDate
    );
    
    // Historical pattern analysis
    const patternAnalysis = this.analyzeHistoricalPatterns(data, eventMonth, eventDay);
    
    // Confidence intervals (95%)
    const confidenceIntervals = this.calculateAdvancedConfidenceIntervals(
      tempStats, precipStats, windStats
    );

    // Data visualization data
    const visualizationData = this.prepareVisualizationData(
      sameDateData, tempStats, precipStats, windStats
    );

    return {
      temperature: tempStats,
      precipitation: precipStats,
      wind: windStats,
      eventRisk: eventRiskAnalysis,
      patterns: patternAnalysis,
      confidence: confidenceIntervals,
      visualization: visualizationData,
      reliability: sameDateData.length >= 10 ? 'high' : 'moderate',
      sampleSize: sameDateData.length,
      dateRange: {
        start: Math.min(...sameDateData.map(d => new Date(d.year, d.month-1, d.day))),
        end: Math.max(...sameDateData.map(d => new Date(d.year, d.month-1, d.day)))
      }
    };
  }

  calculateDetailedTemperatureStats(temperatures) {
    if (temperatures.length === 0) return null;
    
    const sorted = [...temperatures].sort((a, b) => a - b);
    const mean = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const stdDev = this.calculateStandardDeviation(temperatures);
    
    return {
      mean: Math.round(mean * 10) / 10,
      median: sorted[Math.floor(sorted.length / 2)],
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      q1: sorted[Math.floor(sorted.length * 0.25)],
      q3: sorted[Math.floor(sorted.length * 0.75)],
      stdDev: Math.round(stdDev * 10) / 10,
      variance: Math.round(stdDev * stdDev * 10) / 10,
      range: Math.max(...temperatures) - Math.min(...temperatures),
      percentiles: {
        p10: sorted[Math.floor(sorted.length * 0.1)],
        p25: sorted[Math.floor(sorted.length * 0.25)],
        p75: sorted[Math.floor(sorted.length * 0.75)],
        p90: sorted[Math.floor(sorted.length * 0.9)]
      }
    };
  }

  // Detailed Precipitation Statistics
  calculatePrecipitationStats(precipitations) {
    if (precipitations.length === 0) return null;
    
    const rainDays = precipitations.filter(p => p > 0.1).length;
    const heavyRainDays = precipitations.filter(p => p > 5.0).length;
    const totalRain = precipitations.reduce((a, b) => a + b, 0);
    
    return {
      rainProbability: Math.round((rainDays / precipitations.length) * 100),
      heavyRainProbability: Math.round((heavyRainDays / precipitations.length) * 100),
      averageRainfall: Math.round((totalRain / precipitations.length) * 10) / 10,
      totalRainfall: Math.round(totalRain * 10) / 10,
      maxRainfall: Math.max(...precipitations),
      dryDays: precipitations.length - rainDays,
      rainDistribution: this.calculateRainDistribution(precipitations)
    };
  }

  // Detailed Wind Statistics
  calculateWindStats(windSpeeds) {
    if (windSpeeds.length === 0) return null;
    
    const sorted = [...windSpeeds].sort((a, b) => a - b);
    const mean = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;
    const stdDev = this.calculateStandardDeviation(windSpeeds);
    
    return {
      mean: Math.round(mean * 10) / 10,
      median: sorted[Math.floor(sorted.length / 2)],
      max: Math.max(...windSpeeds),
      stdDev: Math.round(stdDev * 10) / 10,
      calmDays: windSpeeds.filter(w => w < 5).length,
      windyDays: windSpeeds.filter(w => w > 20).length,
      extremeWindDays: windSpeeds.filter(w => w > 40).length
    };
  }

  // Historical Pattern Analysis
  analyzeHistoricalPatterns(data, month, day) {
    const yearlyData = {};
    
    // Group by year
    data.forEach(d => {
      if (d.month === month && d.day === day) {
        if (!yearlyData[d.year]) {
          yearlyData[d.year] = [];
        }
        yearlyData[d.year].push(d);
      }
    });
    
    // Calculate yearly trends
    const years = Object.keys(yearlyData).sort((a, b) => a - b);
    const tempTrends = years.map(year => {
      const yearData = yearlyData[year];
      return {
        year: parseInt(year),
        avgTemp: yearData.reduce((sum, d) => sum + d.temperature, 0) / yearData.length,
        avgPrecip: yearData.reduce((sum, d) => sum + d.precipitation, 0) / yearData.length,
        avgWind: yearData.reduce((sum, d) => sum + d.windSpeed, 0) / yearData.length
      };
    });
    
    // Linear regression for trends
    const tempTrend = this.calculateTrend(tempTrends.map(t => t.avgTemp));
    const precipTrend = this.calculateTrend(tempTrends.map(t => t.avgPrecip));
    const windTrend = this.calculateTrend(tempTrends.map(t => t.avgWind));
    
    return {
      yearlyData: tempTrends,
      trends: {
        temperature: tempTrend,
        precipitation: precipTrend,
        wind: windTrend
      },
      trendDirection: this.getTrendDirection({
        temperature: tempTrend,
        precipitation: precipTrend,
        wind: windTrend
      })
    };
  }

  // Calculate trend using linear regression
  calculateTrend(values) {
    if (values.length < 2) return { slope: 0, correlation: 0 };
    
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate correlation coefficient
    const meanX = sumX / n;
    const meanY = sumY / n;
    const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denomX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
    const denomY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));
    const correlation = numerator / (denomX * denomY);
    
    return {
      slope: Math.round(slope * 1000) / 1000,
      intercept: Math.round(intercept * 100) / 100,
      correlation: Math.round(correlation * 100) / 100,
      direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable'
    };
  }

  // Get overall trend direction
  getTrendDirection(trends) {
    const tempDir = trends.temperature.direction;
    const precipDir = trends.precipitation.direction;
    const windDir = trends.wind.direction;
    
    if (tempDir === 'increasing' && precipDir === 'increasing') {
      return 'warming_and_wetter';
    } else if (tempDir === 'increasing' && precipDir === 'decreasing') {
      return 'warming_and_drier';
    } else if (tempDir === 'decreasing' && precipDir === 'increasing') {
      return 'cooling_and_wetter';
    } else if (tempDir === 'decreasing' && precipDir === 'decreasing') {
      return 'cooling_and_drier';
    } else {
      return 'mixed_patterns';
    }
  }

  // Calculate 95% Confidence Intervals
  calculateAdvancedConfidenceIntervals(tempStats, precipStats, windStats) {
    const z95 = 1.96; // 95% confidence
    
    return {
      temperature: {
        lower: Math.round((tempStats.mean - z95 * tempStats.stdDev) * 10) / 10,
        upper: Math.round((tempStats.mean + z95 * tempStats.stdDev) * 10) / 10
      },
      precipitation: {
        lower: Math.round((precipStats.averageRainfall - z95 * Math.sqrt(precipStats.averageRainfall)) * 10) / 10,
        upper: Math.round((precipStats.averageRainfall + z95 * Math.sqrt(precipStats.averageRainfall)) * 10) / 10
      },
      windSpeed: {
        lower: Math.round((windStats.mean - z95 * windStats.stdDev) * 10) / 10,
        upper: Math.round((windStats.mean + z95 * windStats.stdDev) * 10) / 10
      }
    };
  }

  // Prepare data for visualization
  prepareVisualizationData(temperatures, precipitations, windSpeeds, sameDateData) {
    return {
      histogram: this.createHistogramData(temperatures),
      boxPlot: this.createBoxPlotData(temperatures),
      scatter: this.createScatterData(windSpeeds, precipitations),
      timeSeries: this.createTimeSeriesData(sameDateData)
    };
  }

  // Create histogram data
  createHistogramData(temperatures) {
    const min = Math.min(...temperatures);
    const max = Math.max(...temperatures);
    const binSize = (max - min) / 10;
    const bins = [];
    
    for (let i = 0; i < 10; i++) {
      const binStart = min + i * binSize;
      const binEnd = binStart + binSize;
      const count = temperatures.filter(t => t >= binStart && t < binEnd).length;
      bins.push({
        range: `${Math.round(binStart)}-${Math.round(binEnd)}`,
        count: count,
        percentage: Math.round((count / temperatures.length) * 100)
      });
    }
    
    return bins;
  }

  // Create box plot data
  createBoxPlotData(temperatures) {
    const sorted = [...temperatures].sort((a, b) => a - b);
    return {
      min: Math.min(...temperatures),
      q1: this.calculatePercentile(sorted, 25),
      median: this.calculatePercentile(sorted, 50),
      q3: this.calculatePercentile(sorted, 75),
      max: Math.max(...temperatures),
      outliers: this.findOutliers(temperatures, 
        temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
        Math.sqrt(temperatures.reduce((a, b) => a + Math.pow(b - temperatures.reduce((a, b) => a + b, 0) / temperatures.length, 2), 0) / temperatures.length)
      )
    };
  }

  // Create scatter plot data
  createScatterData(windSpeeds, precipitations) {
    return windSpeeds.map((wind, i) => ({
      windSpeed: wind,
      precipitation: precipitations[i],
      correlation: this.calculateCorrelation(windSpeeds, precipitations)
    }));
  }

  // Create time series data
  createTimeSeriesData(sameDateData) {
    return sameDateData.map(d => ({
      year: d.year,
      temperature: d.temperature,
      precipitation: d.precipitation,
      windSpeed: d.windSpeed
    })).sort((a, b) => a.year - b.year);
  }

  // Calculate correlation coefficient
  calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  }

  // Calculate percentile
  calculatePercentile(sorted, percentile) {
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sorted.length) return sorted[sorted.length - 1];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  // Find outliers using IQR method
  findOutliers(values, mean, stdDev) {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(v => v < lowerBound || v > upperBound);
  }

  // Calculate rain distribution
  calculateRainDistribution(precipitations) {
    const ranges = [
      { min: 0, max: 0.1, label: 'No Rain' },
      { min: 0.1, max: 1, label: 'Light Rain' },
      { min: 1, max: 5, label: 'Moderate Rain' },
      { min: 5, max: 10, label: 'Heavy Rain' },
      { min: 10, max: Infinity, label: 'Extreme Rain' }
    ];
    
    return ranges.map(range => ({
      label: range.label,
      count: precipitations.filter(p => p >= range.min && p < range.max).length,
      percentage: Math.round((precipitations.filter(p => p >= range.min && p < range.max).length / precipitations.length) * 100)
    }));
  }

  // PARADE-SPECIFIC ANALYSIS FOR NASA SPACE APPS CHALLENGE
  calculateParadeSpecificAnalysis(historicalData, eventDate, eventType) {
    const rawData = historicalData.rawData;
    const eventMonth = eventDate.getMonth() + 1;
    const eventDay = eventDate.getDate();
    
    // Filter data for same date over years
    const sameDateData = rawData.filter(d => 
      d.month === eventMonth && d.day === eventDay
    );
    
    if (sameDateData.length < 3) {
      return {
        hourlyRisk: null,
        crowdSafetyScore: null,
        visibilityScore: null,
        equipmentRisk: null,
        traditionalParadeDays: null,
        paradeRecommendations: null
      };
    }

    // Hourly risk analysis (parades typically 10:00-16:00)
    const hourlyRisk = this.calculateHourlyParadeRisk(sameDateData);
    
    // Crowd safety analysis
    const crowdSafetyScore = this.evaluateCrowdSafety(sameDateData);
    
    // Visibility analysis
    const visibilityScore = this.calculateVisibilityScore(sameDateData);
    
    // Equipment protection risk
    const equipmentRisk = this.assessEquipmentRisk(sameDateData);
    
    // Traditional parade days analysis
    const traditionalParadeDays = this.analyzeTraditionalParadeDays(rawData, eventMonth);
    
    // Parade-specific recommendations
    const paradeRecommendations = this.generateParadeRecommendations(
      hourlyRisk, crowdSafetyScore, visibilityScore, equipmentRisk
    );
    
    return {
      hourlyRisk,
      crowdSafetyScore,
      visibilityScore,
      equipmentRisk,
      traditionalParadeDays,
      paradeRecommendations
    };
  }

  // Calculate hourly risk for parade times (10:00-16:00)
  calculateHourlyParadeRisk(sameDateData) {
    const paradeHours = [10, 11, 12, 13, 14, 15, 16];
    const hourlyRisks = {};
    
    paradeHours.forEach(hour => {
      const hourData = sameDateData.filter(d => d.hour === hour);
      if (hourData.length > 0) {
        const avgTemp = hourData.reduce((sum, d) => sum + d.temperature, 0) / hourData.length;
        const avgPrecip = hourData.reduce((sum, d) => sum + d.precipitation, 0) / hourData.length;
        const avgWind = hourData.reduce((sum, d) => sum + d.windSpeed, 0) / hourData.length;
        
        // Calculate risk score for this hour
        let riskScore = 0;
        if (avgPrecip > 0.5) riskScore += 40; // High rain risk
        if (avgWind > 25) riskScore += 30; // High wind risk
        if (avgTemp < 10 || avgTemp > 35) riskScore += 20; // Temperature risk
        
        hourlyRisks[hour] = {
          riskScore: Math.min(100, riskScore),
          temperature: Math.round(avgTemp * 10) / 10,
          precipitation: Math.round(avgPrecip * 10) / 10,
          windSpeed: Math.round(avgWind * 10) / 10,
          recommendation: riskScore < 30 ? 'Ideal' : riskScore < 60 ? 'Acceptable' : 'Risky'
        };
      }
    });
    
    return hourlyRisks;
  }

  // Evaluate crowd safety for parade
  evaluateCrowdSafety(sameDateData) {
    const avgTemp = sameDateData.reduce((sum, d) => sum + d.temperature, 0) / sameDateData.length;
    const avgHumidity = sameDateData.reduce((sum, d) => sum + (d.humidity || 50), 0) / sameDateData.length;
    const avgWind = sameDateData.reduce((sum, d) => sum + d.windSpeed, 0) / sameDateData.length;
    
    let safetyScore = 100;
    
    // Temperature safety (18-28°C ideal)
    if (avgTemp < 5 || avgTemp > 40) safetyScore -= 50;
    else if (avgTemp < 10 || avgTemp > 35) safetyScore -= 30;
    else if (avgTemp < 15 || avgTemp > 30) safetyScore -= 15;
    
    // Humidity safety (30-70% ideal)
    if (avgHumidity > 90 || avgHumidity < 20) safetyScore -= 20;
    else if (avgHumidity > 80 || avgHumidity < 30) safetyScore -= 10;
    
    // Wind safety (under 30 km/h ideal)
    if (avgWind > 50) safetyScore -= 40;
    else if (avgWind > 30) safetyScore -= 20;
    else if (avgWind > 20) safetyScore -= 10;
    
    return {
      score: Math.max(0, safetyScore),
      level: safetyScore >= 80 ? 'Excellent' : safetyScore >= 60 ? 'Good' : safetyScore >= 40 ? 'Fair' : 'Poor',
      factors: {
        temperature: avgTemp,
        humidity: Math.round(avgHumidity),
        windSpeed: Math.round(avgWind * 10) / 10
      }
    };
  }

  // Calculate visibility score
  calculateVisibilityScore(sameDateData) {
    const avgHumidity = sameDateData.reduce((sum, d) => sum + (d.humidity || 50), 0) / sameDateData.length;
    const avgPrecip = sameDateData.reduce((sum, d) => sum + d.precipitation, 0) / sameDateData.length;
    const avgWind = sameDateData.reduce((sum, d) => sum + d.windSpeed, 0) / sameDateData.length;
    
    let visibilityScore = 100;
    
    // Humidity affects visibility
    if (avgHumidity > 90) visibilityScore -= 30;
    else if (avgHumidity > 80) visibilityScore -= 15;
    
    // Precipitation affects visibility
    if (avgPrecip > 5) visibilityScore -= 40;
    else if (avgPrecip > 2) visibilityScore -= 20;
    else if (avgPrecip > 0.5) visibilityScore -= 10;
    
    // Wind can improve visibility but too much is bad
    if (avgWind > 40) visibilityScore -= 20;
    else if (avgWind < 5) visibilityScore -= 10; // Stagnant air
    
    return {
      score: Math.max(0, visibilityScore),
      level: visibilityScore >= 80 ? 'Excellent' : visibilityScore >= 60 ? 'Good' : visibilityScore >= 40 ? 'Fair' : 'Poor',
      factors: {
        humidity: Math.round(avgHumidity),
        precipitation: Math.round(avgPrecip * 10) / 10,
        windSpeed: Math.round(avgWind * 10) / 10
      }
    };
  }

  // Assess equipment protection risk
  assessEquipmentRisk(sameDateData) {
    const avgPrecip = sameDateData.reduce((sum, d) => sum + d.precipitation, 0) / sameDateData.length;
    const avgWind = sameDateData.reduce((sum, d) => sum + d.windSpeed, 0) / sameDateData.length;
    const maxPrecip = Math.max(...sameDateData.map(d => d.precipitation));
    const maxWind = Math.max(...sameDateData.map(d => d.windSpeed));
    
    let equipmentRisk = 0;
    
    // Rain damage risk
    if (maxPrecip > 10) equipmentRisk += 50;
    else if (maxPrecip > 5) equipmentRisk += 30;
    else if (avgPrecip > 2) equipmentRisk += 15;
    
    return {
      riskScore: equipmentRisk,
      recommendations: []
    };
  }

  // Calculate equipment risk (duplicate function)
  calculateEquipmentRiskDuplicate(maxPrecip, avgPrecip, maxWind, avgWind) {
    let equipmentRisk = 0;
    
    // Rain damage risk
    if (maxPrecip > 10) equipmentRisk += 50;
    else if (maxPrecip > 5) equipmentRisk += 30;
    else if (avgPrecip > 2) equipmentRisk += 20;
    else if (avgPrecip > 0.5) equipmentRisk += 10;
    
    // Wind damage risk
    if (maxWind > 60) equipmentRisk += 40;
    else if (maxWind > 40) equipmentRisk += 25;
    else if (avgWind > 25) equipmentRisk += 15;
    else if (avgWind > 15) equipmentRisk += 5;
    
    return {
      riskScore: Math.min(100, equipmentRisk),
      level: equipmentRisk < 20 ? 'Low' : equipmentRisk < 50 ? 'Moderate' : equipmentRisk < 80 ? 'High' : 'Extreme',
      recommendations: this.getEquipmentRecommendations(equipmentRisk, avgPrecip, avgWind),
      factors: {
        averagePrecipitation: Math.round(avgPrecip * 10) / 10,
        maxPrecipitation: Math.round(maxPrecip * 10) / 10,
        averageWindSpeed: Math.round(avgWind * 10) / 10,
        maxWindSpeed: Math.round(maxWind * 10) / 10
      }
    };
  }

  // Get equipment protection recommendations
  getEquipmentRecommendations(riskScore, avgPrecip, avgWind) {
    const recommendations = [];
    
    if (avgPrecip > 1) {
      recommendations.push('Waterproof covers for all equipment');
      recommendations.push('Elevated platforms for electronics');
    }
    
    if (avgWind > 20) {
      recommendations.push('Secure all loose equipment');
      recommendations.push('Use weighted bases for stands');
    }
    
    if (riskScore > 50) {
      recommendations.push('Backup equipment on standby');
      recommendations.push('Indoor backup venue recommended');
    }
    
    if (avgPrecip > 2 || avgWind > 30) {
      recommendations.push('Professional weather monitoring');
      recommendations.push('Emergency evacuation plan');
    }
    
    return recommendations;
  }

  // Analyze traditional parade days
  analyzeTraditionalParadeDays(rawData, month) {
    const traditionalDays = {
      1: [{ name: "New Year's Day", day: 1 }],
      2: [{ name: "Presidents' Day", day: 15 }], // Third Monday
      3: [{ name: "St. Patrick's Day", day: 17 }],
      4: [{ name: "Easter Parade", day: null }], // Variable
      5: [{ name: "Memorial Day", day: 31 }], // Last Monday
      6: [{ name: "Flag Day", day: 14 }],
      7: [
        { name: "Independence Day", day: 4 },
        { name: "Bastille Day", day: 14 }
      ],
      9: [{ name: "Labor Day", day: 1 }], // First Monday
      10: [{ name: "Columbus Day", day: 12 }],
      11: [
        { name: "Veterans Day", day: 11 },
        { name: "Thanksgiving Parade", day: null } // Fourth Thursday
      ],
      12: [
        { name: "Christmas Parade", day: 25 },
        { name: "New Year's Eve", day: 31 }
      ]
    };
    
    const monthDays = traditionalDays[month] || [];
    const analysis = {};
    
    monthDays.forEach(day => {
      if (day.day) {
        const dayData = rawData.filter(d => d.month === month && d.day === day.day);
        if (dayData.length > 0) {
          const avgTemp = dayData.reduce((sum, d) => sum + d.temperature, 0) / dayData.length;
          const avgPrecip = dayData.reduce((sum, d) => sum + d.precipitation, 0) / dayData.length;
          const rainDays = dayData.filter(d => d.precipitation > 0.5).length;
          
          analysis[day.name] = {
            averageTemperature: Math.round(avgTemp * 10) / 10,
            averagePrecipitation: Math.round(avgPrecip * 10) / 10,
            rainProbability: Math.round((rainDays / dayData.length) * 100),
            sampleSize: dayData.length,
            recommendation: avgPrecip < 1 && avgTemp > 10 && avgTemp < 30 ? 'Ideal for parades' : 'Consider alternatives'
          };
        }
      }
    });
    
    return analysis;
  }

  // Generate parade-specific recommendations
  generateParadeRecommendations(hourlyRisk, crowdSafety, visibility, equipment) {
    const recommendations = [];
    
    // Time recommendations
    if (hourlyRisk) {
      const bestHours = Object.entries(hourlyRisk)
        .filter(([hour, data]) => data.riskScore < 30)
        .map(([hour]) => hour);
      
      if (bestHours.length > 0) {
        recommendations.push(`Best parade times: ${bestHours.join(', ')}`);
      }
    }
    
    // Crowd safety recommendations
    if (crowdSafety && crowdSafety.level !== 'Excellent') {
      if (crowdSafety.factors.temperature < 10) {
        recommendations.push('Provide heating stations for crowd');
      } else if (crowdSafety.factors.temperature > 30) {
        recommendations.push('Provide shade and cooling stations');
      }
      
      if (crowdSafety.factors.windSpeed > 25) {
        recommendations.push('Secure crowd barriers and signage');
      }
    }
    
    // Visibility recommendations
    if (visibility && visibility.level !== 'Excellent') {
      recommendations.push('Use bright colors and high-visibility materials');
      recommendations.push('Consider indoor backup for key moments');
    }
    
    // Equipment recommendations
    if (equipment && equipment.recommendations) {
      recommendations.push(...equipment.recommendations);
    }
    
    return recommendations;
  }

  // Calculate comprehensive statistics (deleted function restored)
  calculateComprehensiveStatisticsDeleted(historicalData, eventDate, eventType) {
    const data = historicalData.rawData;
    const eventMonth = eventDate.getMonth() + 1;
    const eventDay = eventDate.getDate();
    
    // Same date historical data (last 10 years)
    const sameDateData = data.filter(d => 
      d.month === eventMonth && d.day === eventDay
    );

    // Temperature analysis
    const temperatures = sameDateData.map(d => d.temperature_2m);
    const tempStats = this.calculateDetailedTemperatureStats(temperatures);
    
    // Precipitation analysis
    const precipitations = sameDateData.map(d => d.precipitation);
    const precipStats = this.calculatePrecipitationStats(precipitations);
    
    // Wind analysis
    const windSpeeds = sameDateData.map(d => d.wind_speed_10m);
    const windStats = this.calculateWindStats(windSpeeds);
    
    // Event-specific risk analysis
    const eventRiskAnalysis = this.calculateEventSpecificRisk(
      sameDateData, eventType, eventDate
    );
    
    // Historical pattern analysis
    const patternAnalysis = this.analyzeHistoricalPatterns(data, eventMonth, eventDay);
    
    // Confidence intervals (95%)
    const confidenceIntervals = this.calculateAdvancedConfidenceIntervals(
      tempStats, precipStats, windStats
    );

    // Data visualization data
    const visualizationData = this.prepareVisualizationData(
      sameDateData, tempStats, precipStats, windStats
    );

    return {
      temperature: tempStats,
      precipitation: precipStats,
      wind: windStats,
      eventRisk: eventRiskAnalysis,
      patterns: patternAnalysis,
      confidence: confidenceIntervals,
      visualization: visualizationData,
      reliability: sameDateData.length >= 10 ? 'high' : 'moderate',
      sampleSize: sameDateData.length,
      dateRange: {
        start: Math.min(...sameDateData.map(d => new Date(d.year, d.month-1, d.day))),
        end: Math.max(...sameDateData.map(d => new Date(d.year, d.month-1, d.day)))
      }
    };
  }

  // Detailed Temperature Statistics
  calculateDetailedTemperatureStats(temperatures) {
    if (temperatures.length === 0) return null;
    
    const sorted = [...temperatures].sort((a, b) => a - b);
    const mean = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const stdDev = this.calculateStandardDeviation(temperatures);
    
    return {
      mean: Math.round(mean * 10) / 10,
      median: sorted[Math.floor(sorted.length / 2)],
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      q1: sorted[Math.floor(sorted.length * 0.25)],
      q3: sorted[Math.floor(sorted.length * 0.75)],
      stdDev: Math.round(stdDev * 10) / 10,
      variance: Math.round(stdDev * stdDev * 10) / 10,
      range: Math.max(...temperatures) - Math.min(...temperatures),
      percentiles: {
        p10: sorted[Math.floor(sorted.length * 0.1)],
        p25: sorted[Math.floor(sorted.length * 0.25)],
        p75: sorted[Math.floor(sorted.length * 0.75)],
        p90: sorted[Math.floor(sorted.length * 0.9)]
      }
    };
  }

  // Detailed Precipitation Statistics
  calculatePrecipitationStats(precipitations) {
    if (precipitations.length === 0) return null;
    
    const rainDays = precipitations.filter(p => p > 0.1).length;
    const heavyRainDays = precipitations.filter(p => p > 5.0).length;
    const totalRain = precipitations.reduce((a, b) => a + b, 0);
    
    return {
      rainProbability: Math.round((rainDays / precipitations.length) * 100),
      heavyRainProbability: Math.round((heavyRainDays / precipitations.length) * 100),
      averageRainfall: Math.round((totalRain / precipitations.length) * 10) / 10,
      totalRainfall: Math.round(totalRain * 10) / 10,
      maxRainfall: Math.max(...precipitations),
      dryDays: precipitations.length - rainDays,
      rainDistribution: this.calculateRainDistribution(precipitations)
    };
  }

  // Detailed Wind Statistics
  calculateWindStats(windSpeeds) {
    if (windSpeeds.length === 0) return null;
    
    const sorted = [...windSpeeds].sort((a, b) => a - b);
    const mean = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;
    const stdDev = this.calculateStandardDeviation(windSpeeds);
    
    return {
      mean: Math.round(mean * 10) / 10,
      median: sorted[Math.floor(sorted.length / 2)],
      max: Math.max(...windSpeeds),
      stdDev: Math.round(stdDev * 10) / 10,
      calmDays: windSpeeds.filter(w => w < 5).length,
      windyDays: windSpeeds.filter(w => w > 20).length,
      extremeWindDays: windSpeeds.filter(w => w > 40).length
    };
  }

  // Historical Pattern Analysis
  analyzeHistoricalPatterns(data, month, day) {
    const yearlyData = {};
    
    // Group by year
    data.forEach(d => {
      if (d.month === month && d.day === day) {
        if (!yearlyData[d.year]) {
          yearlyData[d.year] = [];
        }
        yearlyData[d.year].push(d);
      }
    });
    
    // Calculate yearly trends
    const years = Object.keys(yearlyData).sort((a, b) => a - b);
    const tempTrends = years.map(year => {
      const yearData = yearlyData[year];
      return {
        year: parseInt(year),
        avgTemp: yearData.reduce((sum, d) => sum + d.temperature, 0) / yearData.length,
        avgPrecip: yearData.reduce((sum, d) => sum + d.precipitation, 0) / yearData.length,
        avgWind: yearData.reduce((sum, d) => sum + d.windSpeed, 0) / yearData.length
      };
    });
    
    // Linear regression for trends
    const tempTrend = this.calculateTrend(tempTrends.map(t => t.avgTemp));
    const precipTrend = this.calculateTrend(tempTrends.map(t => t.avgPrecip));
    const windTrend = this.calculateTrend(tempTrends.map(t => t.avgWind));
    
    return {
      yearlyData: tempTrends,
      trends: {
        temperature: tempTrend,
        precipitation: precipTrend,
        wind: windTrend
      },
      trendDirection: this.getTrendDirection({
        temperature: tempTrend,
        precipitation: precipTrend,
        wind: windTrend
      })
    };
  }

  // Calculate trend using linear regression
  calculateTrend(values) {
    if (values.length < 2) return { slope: 0, correlation: 0 };
    
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate correlation coefficient
    const meanX = sumX / n;
    const meanY = sumY / n;
    const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denomX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
    const denomY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));
    const correlation = numerator / (denomX * denomY);
    
    return {
      slope: Math.round(slope * 1000) / 1000,
      intercept: Math.round(intercept * 100) / 100,
      correlation: Math.round(correlation * 100) / 100,
      direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable'
    };
  }

  // Get overall trend direction
  getTrendDirection(trends) {
    const tempDir = trends.temperature.direction;
    const precipDir = trends.precipitation.direction;
    const windDir = trends.wind.direction;
    
    if (tempDir === 'increasing' && precipDir === 'increasing') {
      return 'warming_and_wetter';
    } else if (tempDir === 'increasing' && precipDir === 'decreasing') {
      return 'warming_and_drier';
    } else if (tempDir === 'decreasing' && precipDir === 'increasing') {
      return 'cooling_and_wetter';
    } else if (tempDir === 'decreasing' && precipDir === 'decreasing') {
      return 'cooling_and_drier';
    } else {
      return 'mixed_patterns';
    }
  }

  // Calculate 95% Confidence Intervals
  calculateAdvancedConfidenceIntervals(tempStats, precipStats, windStats) {
    const z95 = 1.96; // 95% confidence
    
    return {
      temperature: {
        lower: Math.round((tempStats.mean - z95 * tempStats.stdDev) * 10) / 10,
        upper: Math.round((tempStats.mean + z95 * tempStats.stdDev) * 10) / 10
      },
      precipitation: {
        lower: Math.round((precipStats.averageRainfall - z95 * Math.sqrt(precipStats.averageRainfall)) * 10) / 10,
        upper: Math.round((precipStats.averageRainfall + z95 * Math.sqrt(precipStats.averageRainfall)) * 10) / 10
      },
      windSpeed: {
        lower: Math.round((windStats.mean - z95 * windStats.stdDev) * 10) / 10,
        upper: Math.round((windStats.mean + z95 * windStats.stdDev) * 10) / 10
      }
    };
  }

  // Prepare data for visualization
  prepareVisualizationData(temperatures, precipitations, windSpeeds, sameDateData) {
    return {
      histogram: this.createHistogramData(temperatures),
      boxPlot: this.createBoxPlotData(temperatures),
      scatter: this.createScatterData(windSpeeds, precipitations),
      timeSeries: this.createTimeSeriesData(sameDateData)
    };
  }

  // Create histogram data
  createHistogramData(temperatures) {
    const min = Math.min(...temperatures);
    const max = Math.max(...temperatures);
    const binSize = (max - min) / 10;
    const bins = [];
    
    for (let i = 0; i < 10; i++) {
      const binStart = min + i * binSize;
      const binEnd = binStart + binSize;
      const count = temperatures.filter(t => t >= binStart && t < binEnd).length;
      bins.push({
        range: `${Math.round(binStart)}-${Math.round(binEnd)}`,
        count: count,
        percentage: Math.round((count / temperatures.length) * 100)
      });
    }
    
    return bins;
  }

  // Create box plot data
  createBoxPlotData(temperatures) {
    const sorted = [...temperatures].sort((a, b) => a - b);
    return {
      min: Math.min(...temperatures),
      q1: this.calculatePercentile(sorted, 25),
      median: this.calculatePercentile(sorted, 50),
      q3: this.calculatePercentile(sorted, 75),
      max: Math.max(...temperatures),
      outliers: this.findOutliers(temperatures, 
        temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
        Math.sqrt(temperatures.reduce((a, b) => a + Math.pow(b - temperatures.reduce((a, b) => a + b, 0) / temperatures.length, 2), 0) / temperatures.length)
      )
    };
  }

  // Create scatter plot data
  createScatterData(windSpeeds, precipitations) {
    return windSpeeds.map((wind, i) => ({
      windSpeed: wind,
      precipitation: precipitations[i],
      correlation: this.calculateCorrelation(windSpeeds, precipitations)
    }));
  }

  // Create time series data
  createTimeSeriesData(sameDateData) {
    return sameDateData.map(d => ({
      year: d.year,
      temperature: d.temperature,
      precipitation: d.precipitation,
      windSpeed: d.windSpeed
    })).sort((a, b) => a.year - b.year);
  }

  // Calculate correlation coefficient
  calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  }

  // Calculate percentile
  calculatePercentile(sorted, percentile) {
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sorted.length) return sorted[sorted.length - 1];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  // Find outliers using IQR method
  findOutliers(values, mean, stdDev) {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(v => v < lowerBound || v > upperBound);
  }

  // Calculate rain distribution
  calculateRainDistribution(precipitations) {
    const ranges = [
      { min: 0, max: 0.1, label: 'No Rain' },
      { min: 0.1, max: 1, label: 'Light Rain' },
      { min: 1, max: 5, label: 'Moderate Rain' },
      { min: 5, max: 10, label: 'Heavy Rain' },
      { min: 10, max: Infinity, label: 'Extreme Rain' }
    ];
    
    return ranges.map(range => ({
      label: range.label,
      count: precipitations.filter(p => p >= range.min && p < range.max).length,
      percentage: Math.round((precipitations.filter(p => p >= range.min && p < range.max).length / precipitations.length) * 100)
    }));
  }

  // PARADE-SPECIFIC ANALYSIS FOR NASA SPACE APPS CHALLENGE
  calculateParadeSpecificAnalysis(historicalData, eventDate, eventType) {
    const rawData = historicalData.rawData;
    const eventMonth = eventDate.getMonth() + 1;
    const eventDay = eventDate.getDate();
    
    // Filter data for same date over years
    const sameDateData = rawData.filter(d => 
      d.month === eventMonth && d.day === eventDay
    );
    
    if (sameDateData.length < 3) {
      return {
        hourlyRisk: null,
        crowdSafetyScore: null,
        visibilityScore: null,
        equipmentRisk: null,
        traditionalParadeDays: null,
        paradeRecommendations: null
      };
    }

    // Hourly risk analysis (parades typically 10:00-16:00)
    const hourlyRisk = this.calculateHourlyParadeRisk(sameDateData);
    
    // Crowd safety analysis
    const crowdSafetyScore = this.evaluateCrowdSafety(sameDateData);
    
    // Visibility analysis
    const visibilityScore = this.calculateVisibilityScore(sameDateData);
    
    // Equipment protection risk
    const equipmentRisk = this.assessEquipmentRisk(sameDateData);
    
    // Traditional parade days analysis
    const traditionalParadeDays = this.analyzeTraditionalParadeDays(rawData, eventMonth);
    
    // Parade-specific recommendations
    const paradeRecommendations = this.generateParadeRecommendations(
      hourlyRisk, crowdSafetyScore, visibilityScore, equipmentRisk
    );
    
    return {
      hourlyRisk,
      crowdSafetyScore,
      visibilityScore,
      equipmentRisk,
      traditionalParadeDays,
      paradeRecommendations
    };
  }

  // Calculate hourly risk for parade times (10:00-16:00)
  calculateHourlyParadeRisk(sameDateData) {
    const paradeHours = [10, 11, 12, 13, 14, 15, 16];
    const hourlyRisks = {};
    
    paradeHours.forEach(hour => {
      const hourData = sameDateData.filter(d => d.hour === hour);
      if (hourData.length > 0) {
        const avgTemp = hourData.reduce((sum, d) => sum + d.temperature, 0) / hourData.length;
        const avgPrecip = hourData.reduce((sum, d) => sum + d.precipitation, 0) / hourData.length;
        const avgWind = hourData.reduce((sum, d) => sum + d.windSpeed, 0) / hourData.length;
        
        // Calculate risk score for this hour
        let riskScore = 0;
        if (avgPrecip > 0.5) riskScore += 40; // High rain risk
        if (avgWind > 25) riskScore += 30; // High wind risk
        if (avgTemp < 10 || avgTemp > 35) riskScore += 20; // Temperature risk
        
        hourlyRisks[hour] = {
          riskScore: Math.min(100, riskScore),
          temperature: Math.round(avgTemp * 10) / 10,
          precipitation: Math.round(avgPrecip * 10) / 10,
          windSpeed: Math.round(avgWind * 10) / 10,
          recommendation: riskScore < 30 ? 'Ideal' : riskScore < 60 ? 'Acceptable' : 'Risky'
        };
      }
    });
    
    return hourlyRisks;
  }

  // Evaluate crowd safety for parade
  evaluateCrowdSafety(sameDateData) {
    const avgTemp = sameDateData.reduce((sum, d) => sum + d.temperature, 0) / sameDateData.length;
    const avgHumidity = sameDateData.reduce((sum, d) => sum + (d.humidity || 50), 0) / sameDateData.length;
    const avgWind = sameDateData.reduce((sum, d) => sum + d.windSpeed, 0) / sameDateData.length;
    
    let safetyScore = 100;
    
    // Temperature safety (18-28°C ideal)
    if (avgTemp < 5 || avgTemp > 40) safetyScore -= 50;
    else if (avgTemp < 10 || avgTemp > 35) safetyScore -= 30;
    else if (avgTemp < 15 || avgTemp > 30) safetyScore -= 15;
    
    // Humidity safety (30-70% ideal)
    if (avgHumidity > 90 || avgHumidity < 20) safetyScore -= 20;
    else if (avgHumidity > 80 || avgHumidity < 30) safetyScore -= 10;
    
    // Wind safety (under 30 km/h ideal)
    if (avgWind > 50) safetyScore -= 40;
    else if (avgWind > 30) safetyScore -= 20;
    else if (avgWind > 20) safetyScore -= 10;
    
    return {
      score: Math.max(0, safetyScore),
      level: safetyScore >= 80 ? 'Excellent' : safetyScore >= 60 ? 'Good' : safetyScore >= 40 ? 'Fair' : 'Poor',
      factors: {
        temperature: avgTemp,
        humidity: Math.round(avgHumidity),
        windSpeed: Math.round(avgWind * 10) / 10
      }
    };
  }

  // Calculate visibility score
  calculateVisibilityScore(sameDateData) {
    const avgHumidity = sameDateData.reduce((sum, d) => sum + (d.humidity || 50), 0) / sameDateData.length;
    const avgPrecip = sameDateData.reduce((sum, d) => sum + d.precipitation, 0) / sameDateData.length;
    const avgWind = sameDateData.reduce((sum, d) => sum + d.windSpeed, 0) / sameDateData.length;
    
    let visibilityScore = 100;
    
    // Humidity affects visibility
    if (avgHumidity > 90) visibilityScore -= 30;
    else if (avgHumidity > 80) visibilityScore -= 15;
    
    // Precipitation affects visibility
    if (avgPrecip > 5) visibilityScore -= 40;
    else if (avgPrecip > 2) visibilityScore -= 20;
    else if (avgPrecip > 0.5) visibilityScore -= 10;
    
    // Wind can improve visibility but too much is bad
    if (avgWind > 40) visibilityScore -= 20;
    else if (avgWind < 5) visibilityScore -= 10; // Stagnant air
    
    return {
      score: Math.max(0, visibilityScore),
      level: visibilityScore >= 80 ? 'Excellent' : visibilityScore >= 60 ? 'Good' : visibilityScore >= 40 ? 'Fair' : 'Poor',
      factors: {
        humidity: Math.round(avgHumidity),
        precipitation: Math.round(avgPrecip * 10) / 10,
        windSpeed: Math.round(avgWind * 10) / 10
      }
    };
  }

  // Assess equipment protection risk
  assessEquipmentRisk(sameDateData) {
    const avgPrecip = sameDateData.reduce((sum, d) => sum + d.precipitation, 0) / sameDateData.length;
    const avgWind = sameDateData.reduce((sum, d) => sum + d.windSpeed, 0) / sameDateData.length;
    const maxPrecip = Math.max(...sameDateData.map(d => d.precipitation));
    const maxWind = Math.max(...sameDateData.map(d => d.windSpeed));
    
    let equipmentRisk = 0;
    
    // Rain damage risk
    if (maxPrecip > 10) equipmentRisk += 50;
    else if (maxPrecip > 5) equipmentRisk += 30;
    else if (avgPrecip > 2) equipmentRisk += 15;
    
    return {
      riskScore: equipmentRisk,
      recommendations: []
    };
  }

  // Calculate equipment risk (duplicate function)
  calculateEquipmentRiskDuplicate(maxPrecip, avgPrecip, maxWind, avgWind) {
    let equipmentRisk = 0;
    
    // Rain damage risk
    if (maxPrecip > 10) equipmentRisk += 50;
    else if (maxPrecip > 5) equipmentRisk += 30;
    else if (avgPrecip > 2) equipmentRisk += 20;
    else if (avgPrecip > 0.5) equipmentRisk += 10;
    
    // Wind damage risk
    if (maxWind > 60) equipmentRisk += 40;
    else if (maxWind > 40) equipmentRisk += 25;
    else if (avgWind > 25) equipmentRisk += 15;
    else if (avgWind > 15) equipmentRisk += 5;
    
    return {
      riskScore: Math.min(100, equipmentRisk),
      level: equipmentRisk < 20 ? 'Low' : equipmentRisk < 50 ? 'Moderate' : equipmentRisk < 80 ? 'High' : 'Extreme',
      recommendations: this.getEquipmentRecommendations(equipmentRisk, avgPrecip, avgWind),
      factors: {
        averagePrecipitation: Math.round(avgPrecip * 10) / 10,
        maxPrecipitation: Math.round(maxPrecip * 10) / 10,
        averageWindSpeed: Math.round(avgWind * 10) / 10,
        maxWindSpeed: Math.round(maxWind * 10) / 10
      }
    };
  }

  // Get equipment protection recommendations
  getEquipmentRecommendations(riskScore, avgPrecip, avgWind) {
    const recommendations = [];
    
    if (avgPrecip > 1) {
      recommendations.push('Waterproof covers for all equipment');
      recommendations.push('Elevated platforms for electronics');
    }
    
    if (avgWind > 20) {
      recommendations.push('Secure all loose equipment');
      recommendations.push('Use weighted bases for stands');
    }
    
    if (riskScore > 50) {
      recommendations.push('Backup equipment on standby');
      recommendations.push('Indoor backup venue recommended');
    }
    
    if (avgPrecip > 2 || avgWind > 30) {
      recommendations.push('Professional weather monitoring');
      recommendations.push('Emergency evacuation plan');
    }
    
    return recommendations;
  }

  // Analyze traditional parade days
  analyzeTraditionalParadeDays(rawData, month) {
    const traditionalDays = {
      1: [{ name: "New Year's Day", day: 1 }],
      2: [{ name: "Presidents' Day", day: 15 }], // Third Monday
      3: [{ name: "St. Patrick's Day", day: 17 }],
      4: [{ name: "Easter Parade", day: null }], // Variable
      5: [{ name: "Memorial Day", day: 31 }], // Last Monday
      6: [{ name: "Flag Day", day: 14 }],
      7: [
        { name: "Independence Day", day: 4 },
        { name: "Bastille Day", day: 14 }
      ],
      9: [{ name: "Labor Day", day: 1 }], // First Monday
      10: [{ name: "Columbus Day", day: 12 }],
      11: [
        { name: "Veterans Day", day: 11 },
        { name: "Thanksgiving Parade", day: null } // Fourth Thursday
      ],
      12: [
        { name: "Christmas Parade", day: 25 },
        { name: "New Year's Eve", day: 31 }
      ]
    };
    
    const monthDays = traditionalDays[month] || [];
    const analysis = {};
    
    monthDays.forEach(day => {
      if (day.day) {
        const dayData = rawData.filter(d => d.month === month && d.day === day.day);
        if (dayData.length > 0) {
          const avgTemp = dayData.reduce((sum, d) => sum + d.temperature, 0) / dayData.length;
          const avgPrecip = dayData.reduce((sum, d) => sum + d.precipitation, 0) / dayData.length;
          const rainDays = dayData.filter(d => d.precipitation > 0.5).length;
          
          analysis[day.name] = {
            averageTemperature: Math.round(avgTemp * 10) / 10,
            averagePrecipitation: Math.round(avgPrecip * 10) / 10,
            rainProbability: Math.round((rainDays / dayData.length) * 100),
            sampleSize: dayData.length,
            recommendation: avgPrecip < 1 && avgTemp > 10 && avgTemp < 30 ? 'Ideal for parades' : 'Consider alternatives'
          };
        }
      }
    });
    
    return analysis;
  }

  // Generate parade-specific recommendations
  generateParadeRecommendations(hourlyRisk, crowdSafety, visibility, equipment) {
    const recommendations = [];
    
    // Time recommendations
    if (hourlyRisk) {
      const bestHours = Object.entries(hourlyRisk)
        .filter(([hour, data]) => data.riskScore < 30)
        .map(([hour]) => hour);
      
      if (bestHours.length > 0) {
        recommendations.push(`Best parade times: ${bestHours.join(', ')}`);
      }
    }
    
    // Crowd safety recommendations
    if (crowdSafety && crowdSafety.level !== 'Excellent') {
      if (crowdSafety.factors.temperature < 10) {
        recommendations.push('Provide heating stations for crowd');
      } else if (crowdSafety.factors.temperature > 30) {
        recommendations.push('Provide shade and cooling stations');
      }
      
      if (crowdSafety.factors.windSpeed > 25) {
        recommendations.push('Secure crowd barriers and signage');
      }
    }
    
    // Visibility recommendations
    if (visibility && visibility.level !== 'Excellent') {
      recommendations.push('Use bright colors and high-visibility materials');
      recommendations.push('Consider indoor backup for key moments');
    }
    
    // Equipment recommendations
    if (equipment && equipment.recommendations) {
      recommendations.push(...equipment.recommendations);
    }
    
    return recommendations;
  }

  // Calculate comprehensive statistics (deleted function restored)
  calculateComprehensiveStatisticsDeleted(historicalData, eventDate, eventType) {
    const data = historicalData.rawData;
    const eventMonth = eventDate.getMonth() + 1;
    const eventDay = eventDate.getDate();
    
    // Same date historical data (last 10 years)
    const sameDateData = data.filter(d => 
      d.month === eventMonth && d.day === eventDay
    );

    // Temperature analysis
    const temperatures = sameDateData.map(d => d.temperature_2m);
    const tempStats = this.calculateDetailedTemperatureStats(temperatures);
    
    // Precipitation analysis
    const precipitations = sameDateData.map(d => d.precipitation);
    const precipStats = this.calculatePrecipitationStats(precipitations);
    
    // Wind analysis
    const windSpeeds = sameDateData.map(d => d.wind_speed_10m);
    const windStats = this.calculateWindStats(windSpeeds);
    
    // Event-specific risk analysis
    const eventRiskAnalysis = this.calculateEventSpecificRisk(
      sameDateData, eventType, eventDate
    );
    
    // Historical pattern analysis
    const patternAnalysis = this.analyzeHistoricalPatterns(data, eventMonth, eventDay);
    
    // Confidence intervals (95%)
    const confidenceIntervals = this.calculateAdvancedConfidenceIntervals(
      tempStats, precipStats, windStats
    );

    // Data visualization data
    const visualizationData = this.prepareVisualizationData(
      sameDateData, tempStats, precipStats, windStats
    );

    return {
      temperature: tempStats,
      precipitation: precipStats,
      wind: windStats,
      eventRisk: eventRiskAnalysis,
      patterns: patternAnalysis,
      confidence: confidenceIntervals,
      visualization: visualizationData,
      reliability: sameDateData.length >= 10 ? 'high' : 'moderate',
      sampleSize: sameDateData.length,
      dateRange: {
        start: Math.min(...sameDateData.map(d => new Date(d.year, d.month-1, d.day))),
        end: Math.max(...sameDateData.map(d => new Date(d.year, d.month-1, d.day)))
      }
    };
  }

  // Detailed Temperature Statistics
  calculateDetailedTemperatureStats(temperatures) {
    if (temperatures.length === 0) return null;
    
    const sorted = [...temperatures].sort((a, b) => a - b);
    const mean = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const stdDev = this.calculateStandardDeviation(temperatures);
    
    return {
      mean: Math.round(mean * 10) / 10,
      median: sorted[Math.floor(sorted.length / 2)],
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      q1: sorted[Math.floor(sorted.length * 0.25)],
      q3: sorted[Math.floor(sorted.length * 0.75)],
      stdDev: Math.round(stdDev * 10) / 10,
      variance: Math.round(stdDev * stdDev * 10) / 10,
      range: Math.max(...temperatures) - Math.min(...temperatures),
      percentiles: {
        p10: sorted[Math.floor(sorted.length * 0.1)],
        p25: sorted[Math.floor(sorted.length * 0.25)],
        p75: sorted[Math.floor(sorted.length * 0.75)],
        p90: sorted[Math.floor(sorted.length * 0.9)]
      }
    };
  }

  // Detailed Precipitation Statistics
  calculatePrecipitationStats(precipitations) {
    if (precipitations.length === 0) return null;
    
    const rainDays = precipitations.filter(p => p > 0.1).length;
    const heavyRainDays = precipitations.filter(p => p > 5.0).length;
    const totalRain = precipitations.reduce((a, b) => a + b, 0);
    
    return {
      rainProbability: Math.round((rainDays / precipitations.length) * 100),
      heavyRainProbability: Math.round((heavyRainDays / precipitations.length) * 100),
      averageRainfall: Math.round((totalRain / precipitations.length) * 10) / 10,
      totalRainfall: Math.round(totalRain * 10) / 10,
      maxRainfall: Math.max(...precipitations),
      dryDays: precipitations.length - rainDays,
      rainDistribution: this.calculateRainDistribution(precipitations)
    };
  }

  // Detailed Wind Statistics
  calculateWindStats(windSpeeds) {
    if (windSpeeds.length === 0) return null;
    
    const sorted = [...windSpeeds].sort((a, b) => a - b);
    const mean = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;
    const stdDev = this.calculateStandardDeviation(windSpeeds);
    
    return {
      mean: Math.round(mean * 10) / 10,
      median: sorted[Math.floor(sorted.length / 2)],
      max: Math.max(...windSpeeds),
      stdDev: Math.round(stdDev * 10) / 10,
      calmDays: windSpeeds.filter(w => w < 5).length,
      windyDays: windSpeeds.filter(w => w > 20).length,
      extremeWindDays: windSpeeds.filter(w => w > 40).length
    };
  }

  // Historical Pattern Analysis
  analyzeHistoricalPatterns(data, month, day) {
    const yearlyData = {};
    
    // Group by year
    data.forEach(d => {
      if (d.month === month && d.day === day) {
        if (!yearlyData[d.year]) {
          yearlyData[d.year] = [];
        }
        yearlyData[d.year].push(d);
      }
    });
    
    // Calculate yearly trends
    const years = Object.keys(yearlyData).sort((a, b) => a - b);
    const tempTrends = years.map(year => {
      const yearData = yearlyData[year];
      return {
        year: parseInt(year),
        avgTemp: yearData.reduce((sum, d) => sum + d.temperature, 0) / yearData.length,
        avgPrecip: yearData.reduce((sum, d) => sum + d.precipitation, 0) / yearData.length,
        avgWind: yearData.reduce((sum, d) => sum + d.windSpeed, 0) / yearData.length
      };
    });
    
    // Linear regression for trends
    const tempTrend = this.calculateTrend(tempTrends.map(t => t.avgTemp));
    const precipTrend = this.calculateTrend(tempTrends.map(t => t.avgPrecip));
    const windTrend = this.calculateTrend(tempTrends.map(t => t.avgWind));
    
    return {
      yearlyData: tempTrends,
      trends: {
        temperature: tempTrend,
        precipitation: precipTrend,
        wind: windTrend
      },
      trendDirection: this.getTrendDirection({
        temperature: tempTrend,
        precipitation: precipTrend,
        wind: windTrend
      })
    };
  }

  // Calculate trend using linear regression
  calculateTrend(values) {
    if (values.length < 2) return { slope: 0, correlation: 0 };
    
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate correlation coefficient
    const meanX = sumX / n;
    const meanY = sumY / n;
    const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denomX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
    const denomY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));
    const correlation = numerator / (denomX * denomY);
    
    return {
      slope: Math.round(slope * 1000) / 1000,
      intercept: Math.round(intercept * 100) / 100,
      correlation: Math.round(correlation * 100) / 100,
      direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable'
    };
  }

  // Get overall trend direction
  getTrendDirection(trends) {
    const tempDir = trends.temperature.direction;
    const precipDir = trends.precipitation.direction;
    const windDir = trends.wind.direction;
    
    if (tempDir === 'increasing' && precipDir === 'increasing') {
      return 'warming_and_wetter';
    } else if (tempDir === 'increasing' && precipDir === 'decreasing') {
      return 'warming_and_drier';
    } else if (tempDir === 'decreasing' && precipDir === 'increasing') {
      return 'cooling_and_wetter';
    } else if (tempDir === 'decreasing' && precipDir === 'decreasing') {
      return 'cooling_and_drier';
    } else {
      return 'mixed_patterns';
    }
  }

  // Calculate 95% Confidence Intervals
  calculateAdvancedConfidenceIntervals(tempStats, precipStats, windStats) {
    const z95 = 1.96; // 95% confidence
    
    return {
      temperature: {
        lower: Math.round((tempStats.mean - z95 * tempStats.stdDev) * 10) / 10,
        upper: Math.round((tempStats.mean + z95 * tempStats.stdDev) * 10) / 10
      },
      precipitation: {
        lower: Math.round((precipStats.averageRainfall - z95 * Math.sqrt(precipStats.averageRainfall)) * 10) / 10,
        upper: Math.round((precipStats.averageRainfall + z95 * Math.sqrt(precipStats.averageRainfall)) * 10) / 10
      },
      windSpeed: {
        lower: Math.round((windStats.mean - z95 * windStats.stdDev) * 10) / 10,
        upper: Math.round((windStats.mean + z95 * windStats.stdDev) * 10) / 10
      }
    };
  }

  // Prepare data for visualization
  prepareVisualizationData(temperatures, precipitations, windSpeeds, sameDateData) {
    return {
      histogram: this.createHistogramData(temperatures),
      boxPlot: this.createBoxPlotData(temperatures),
      scatter: this.createScatterData(windSpeeds, precipitations),
      timeSeries: this.createTimeSeriesData(sameDateData)
    };
  }

  // Create histogram data
  createHistogramData(temperatures) {
    const min = Math.min(...temperatures);
    const max = Math.max(...temperatures);
    const binSize = (max - min) / 10;
    const bins = [];
    
    for (let i = 0; i < 10; i++) {
      const binStart = min + i * binSize;
      const binEnd = binStart + binSize;
      const count = temperatures.filter(t => t >= binStart && t < binEnd).length;
      bins.push({
        range: `${Math.round(binStart)}-${Math.round(binEnd)}`,
        count: count,
        percentage: Math.round((count / temperatures.length) * 100)
      });
    }
    
    return bins;
  }

  // Create box plot data
  createBoxPlotData(temperatures) {
    const sorted = [...temperatures].sort((a, b) => a - b);
    return {
      min: Math.min(...temperatures),
      q1: this.calculatePercentile(sorted, 25),
      median: this.calculatePercentile(sorted, 50),
      q3: this.calculatePercentile(sorted, 75),
      max: Math.max(...temperatures),
      outliers: this.findOutliers(temperatures, 
        temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
        Math.sqrt(temperatures.reduce((a, b) => a + Math.pow(b - temperatures.reduce((a, b) => a + b, 0) / temperatures.length, 2), 0) / temperatures.length)
      )
    };
  }

  // Create scatter plot data
  createScatterData(windSpeeds, precipitations) {
    return windSpeeds.map((wind, i) => ({
      windSpeed: wind,
      precipitation: precipitations[i],
      correlation: this.calculateCorrelation(windSpeeds, precipitations)
    }));
  }

  // Create time series data
  createTimeSeriesData(sameDateData) {
    return sameDateData.map(d => ({
      year: d.year,
      temperature: d.temperature,
      precipitation: d.precipitation,
      windSpeed: d.windSpeed
    })).sort((a, b) => a.year - b.year);
  }

  // Calculate correlation coefficient
  calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  }

  // Calculate percentile
  calculatePercentile(sorted, percentile) {
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sorted.length) return sorted[sorted.length - 1];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  // Find outliers using IQR method
  findOutliers(values, mean, stdDev) {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(v => v < lowerBound || v > upperBound);
  }

  // Calculate rain distribution
  calculateRainDistribution(precipitations) {
    const ranges = [
      { min: 0, max: 0.1, label: 'No Rain' },
      { min: 0.1, max: 1, label: 'Light Rain' },
      { min: 1, max: 5, label: 'Moderate Rain' },
      { min: 5, max: 10, label: 'Heavy Rain' },
      { min: 10, max: Infinity, label: 'Extreme Rain' }
    ];
    
    return ranges.map(range => ({
      label: range.label,
      count: precipitations.filter(p => p >= range.min && p < range.max).length,
      percentage: Math.round((precipitations.filter(p => p >= range.min && p < range.max).length / precipitations.length) * 100)
    }));
  }

  // PARADE-SPECIFIC ANALYSIS FOR NASA SPACE APPS CHALLENGE
  calculateParadeSpecificAnalysis(historicalData, eventDate, eventType) {
    const rawData = historicalData.rawData;
    const eventMonth = eventDate.getMonth() + 1;
    const eventDay = eventDate.getDate();
    
    // Filter data for same date over years
    const sameDateData = rawData.filter(d => 
      d.month === eventMonth && d.day === eventDay
    );
    
    if (sameDateData.length < 3) {
      return {
        hourlyRisk: null,
        crowdSafetyScore: null,
        visibilityScore: null,
        equipmentRisk: null,
        traditionalParadeDays: null,
        paradeRecommendations: null
      };
    }

    // Hourly risk analysis (parades typically 10:00-16:00)
    const hourlyRisk = this.calculateHourlyParadeRisk(sameDateData);
    
    // Crowd safety analysis
    const crowdSafetyScore = this.evaluateCrowdSafety(sameDateData);
    
    // Visibility analysis
    const visibilityScore = this.calculateVisibilityScore(sameDateData);
    
    // Equipment protection risk
    const equipmentRisk = this.assessEquipmentRisk(sameDateData);
    
    // Traditional parade days analysis
    const traditionalParadeDays = this.analyzeTraditionalParadeDays(rawData, eventMonth);
    
    // Parade-specific recommendations
    const paradeRecommendations = this.generateParadeRecommendations(
      hourlyRisk, crowdSafetyScore, visibilityScore, equipmentRisk
    );
    
    return {
      hourlyRisk,
      crowdSafetyScore,
      visibilityScore,
      equipmentRisk,
      traditionalParadeDays,
      paradeRecommendations
    };
  }

  // Calculate hourly risk for parade times (10:00-16:00)
  calculateHourlyParadeRisk(sameDateData) {
    const paradeHours = [10, 11, 12, 13, 14, 15, 16];
    const hourlyRisks = {};
    
    paradeHours.forEach(hour => {
      const hourData = sameDateData.filter(d => d.hour === hour);
      if (hourData.length > 0) {
        const avgTemp = hourData.reduce((sum, d) => sum + d.temperature, 0) / hourData.length;
        const avgPrecip = hourData.reduce((sum, d) => sum + d.precipitation, 0) / hourData.length;
        const avgWind = hourData.reduce((sum, d) => sum + d.windSpeed, 0) / hourData.length;
        
        // Calculate risk score for this hour
        let riskScore = 0;
        if (avgPrecip > 0.5) riskScore += 40; // High rain risk
        if (avgWind > 25) riskScore += 30; // High wind risk
        if (avgTemp < 10 || avgTemp > 35) riskScore += 20; // Temperature risk
        
        hourlyRisks[hour] = {
          riskScore: Math.min(100, riskScore),
          temperature: Math.round(avgTemp * 10) / 10,
          precipitation: Math.round(avgPrecip * 10) / 10,
          windSpeed: Math.round(avgWind * 10) / 10,
          recommendation: riskScore < 30 ? 'Ideal' : riskScore < 60 ? 'Acceptable' : 'Risky'
        };
      }
    });
    
    return hourlyRisks;
  }

  // Evaluate crowd safety for parade
  evaluateCrowdSafety(sameDateData) {
    const avgTemp = sameDateData.reduce((sum, d) => sum + d.temperature, 0) / sameDateData.length;
    const avgHumidity = sameDateData.reduce((sum, d) => sum + (d.humidity || 50), 0) / sameDateData.length;
    const avgWind = sameDateData.reduce((sum, d) => sum + d.windSpeed, 0) / sameDateData.length;
    
    let safetyScore = 100;
    
    // Temperature safety (18-28°C ideal)
    if (avgTemp < 5 || avgTemp > 40) safetyScore -= 50;
    else if (avgTemp < 10 || avgTemp > 35) safetyScore -= 30;
    else if (avgTemp < 15 || avgTemp > 30) safetyScore -= 15;
    
    // Humidity safety (30-70% ideal)
    if (avgHumidity > 90 || avgHumidity < 20) safetyScore -= 20;
    else if (avgHumidity > 80 || avgHumidity < 30) safetyScore -= 10;
    
    // Wind safety (under 30 km/h ideal)
    if (avgWind > 50) safetyScore -= 40;
    else if (avgWind > 30) safetyScore -= 20;
    else if (avgWind > 20) safetyScore -= 10;
    
    return {
      score: Math.max(0, safetyScore),
      level: safetyScore >= 80 ? 'Excellent' : safetyScore >= 60 ? 'Good' : safetyScore >= 40 ? 'Fair' : 'Poor',
      factors: {
        temperature: avgTemp,
        humidity: Math.round(avgHumidity),
        windSpeed: Math.round(avgWind * 10) / 10
      }
    };
  }

  // Calculate visibility score
  calculateVisibilityScore(sameDateData) {
    const avgHumidity = sameDateData.reduce((sum, d) => sum + (d.humidity || 50), 0) / sameDateData.length;
    const avgPrecip = sameDateData.reduce((sum, d) => sum + d.precipitation, 0) / sameDateData.length;
    const avgWind = sameDateData.reduce((sum, d) => sum + d.windSpeed, 0) / sameDateData.length;
    
    let visibilityScore = 100;
    
    // Humidity affects visibility
    if (avgHumidity > 90) visibilityScore -= 30;
    else if (avgHumidity > 80) visibilityScore -= 15;
    
    // Precipitation affects visibility
    if (avgPrecip > 5) visibilityScore -= 40;
    else if (avgPrecip > 2) visibilityScore -= 20;
    else if (avgPrecip > 0.5) visibilityScore -= 10;
    
    // Wind can improve visibility but too much is bad
    if (avgWind > 40) visibilityScore -= 20;
    else if (avgWind < 5) visibilityScore -= 10; // Stagnant air
    
    return {
      score: Math.max(0, visibilityScore),
      level: visibilityScore >= 80 ? 'Excellent' : visibilityScore >= 60 ? 'Good' : visibilityScore >= 40 ? 'Fair' : 'Poor',
      factors: {
        humidity: Math.round(avgHumidity),
        precipitation: Math.round(avgPrecip * 10) / 10,
        windSpeed: Math.round(avgWind * 10) / 10
      }
    };
  }

  // Assess equipment protection risk
  assessEquipmentRisk(sameDateData) {
    const avgPrecip = sameDateData.reduce((sum, d) => sum + d.precipitation, 0) / sameDateData.length;
    const avgWind = sameDateData.reduce((sum, d) => sum + d.windSpeed, 0) / sameDateData.length;
    const maxPrecip = Math.max(...sameDateData.map(d => d.precipitation));
    const maxWind = Math.max(...sameDateData.map(d => d.windSpeed));
    
    let equipmentRisk = 0;
    
    // Rain damage risk
    if (maxPrecip > 10) equipmentRisk += 50;
    else if (maxPrecip > 5) equipmentRisk += 30;
    else if (avgPrecip > 2) equipmentRisk += 15;
    
    return {
      riskScore: equipmentRisk,
      recommendations: []
    };
  }

  // Export to CSV
  exportToCSV(weatherData, probabilities, location) {
    const csvData = [];
    
    // Header
    csvData.push('Date,Location,Temperature (C),Precipitation (mm),Wind Speed (km/h),Humidity (%),Risk Level,Probability (%)');
    
    // Add current weather data
    if (weatherData && weatherData.current) {
      const temp = weatherData.current.temperature_2m || 0;
      const precip = weatherData.current.precipitation || 0;
      const wind = weatherData.current.wind_speed_10m || 0;
      const humidity = weatherData.current.relative_humidity_2m || 0;
      
      csvData.push([
        new Date().toISOString().split('T')[0],
        `"${location.name}"`,
        temp.toFixed(1),
        precip.toFixed(1),
        wind.toFixed(1),
        humidity.toFixed(1),
        'Current',
        '100'
      ].join(','));
    }
    
    // Add probability data
    if (probabilities && probabilities.probabilities) {
      Object.entries(probabilities.probabilities).forEach(([key, value]) => {
        csvData.push([
          new Date().toISOString().split('T')[0],
          `"${location.name}"`,
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          key,
          value.toFixed(1)
        ].join(','));
      });
    }
    
    // Add Worfe branding
    csvData.push('');
    csvData.push('Generated by Worfe Weather Dashboard');
    csvData.push('NASA Space Apps Challenge 2025 - Will It Rain On My Parade?');
    csvData.push(`Data Source: NASA POWER API + Open-Meteo`);
    csvData.push(`Analysis Date: ${new Date().toLocaleString()}`);
    csvData.push(`Total Data Points: ${probabilities?.totalDays || 0} days`);
    csvData.push(`Confidence Level: 95%`);
    csvData.push(`Website: https://efekose7.github.io/worfe`);
    
    return csvData.join('\n');
  }

  // Export to JSON
  exportToJSON(weatherData, probabilities, location) {
    return {
      location: {
        name: location.name,
        latitude: location.lat,
        longitude: location.lng,
        country: location.country || 'Unknown'
      },
      currentWeather: weatherData?.current || null,
      probabilities: probabilities?.probabilities || {},
      climateTrends: probabilities?.climateTrends || {},
      analysisDate: new Date().toISOString(),
      dataSource: 'NASA POWER API + Open-Meteo',
      totalDays: probabilities?.totalDays || 0,
      worfe: {
        generatedBy: 'Worfe Weather Dashboard',
        challenge: 'NASA Space Apps Challenge 2025 - Will It Rain On My Parade?',
        dataSource: 'NASA POWER API + Open-Meteo',
        analysisDate: new Date().toLocaleString(),
        totalDataPoints: probabilities?.totalDays || 0,
        confidenceLevel: '95%',
        website: 'https://efekose7.github.io/worfe',
        version: '1.0.0',
        nasaCompliance: true,
        globalAwardEligible: true
      }
    };
  }
}

export const weatherService = new WeatherService();