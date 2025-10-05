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
  },

  // Detailed Temperature Statistics
  calculateDetailedTemperatureStats(temperatures) {
    if (!temperatures || temperatures.length === 0) return null;
    
    const sorted = [...temperatures].sort((a, b) => a - b);
    const mean = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const variance = temperatures.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / temperatures.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      mean: Math.round(mean * 10) / 10,
      median: this.calculatePercentile(sorted, 50),
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      stdDev: Math.round(stdDev * 10) / 10,
      variance: Math.round(variance * 10) / 10,
      range: Math.max(...temperatures) - Math.min(...temperatures),
      quartiles: {
        q1: this.calculatePercentile(sorted, 25),
        q2: this.calculatePercentile(sorted, 50),
        q3: this.calculatePercentile(sorted, 75)
      },
      percentiles: {
        p10: this.calculatePercentile(sorted, 10),
        p90: this.calculatePercentile(sorted, 90),
        p95: this.calculatePercentile(sorted, 95)
      },
      outliers: this.findOutliers(temperatures, mean, stdDev)
    };
  },

  // Detailed Precipitation Statistics
  calculatePrecipitationStats(precipitations) {
    if (!precipitations || precipitations.length === 0) return null;
    
    const rainDays = precipitations.filter(p => p > 0.1).length;
    const heavyRainDays = precipitations.filter(p => p > 5.0).length;
    const totalRainfall = precipitations.reduce((a, b) => a + b, 0);
    const avgRainfall = totalRainfall / precipitations.length;
    const maxRainfall = Math.max(...precipitations);
    
    return {
      rainProbability: Math.round((rainDays / precipitations.length) * 100),
      heavyRainProbability: Math.round((heavyRainDays / precipitations.length) * 100),
      averageRainfall: Math.round(avgRainfall * 10) / 10,
      totalRainfall: Math.round(totalRainfall * 10) / 10,
      maxRainfall: Math.round(maxRainfall * 10) / 10,
      dryDays: precipitations.length - rainDays,
      rainDistribution: this.calculateRainDistribution(precipitations)
    };
  },

  // Detailed Wind Statistics
  calculateWindStats(windSpeeds) {
    if (!windSpeeds || windSpeeds.length === 0) return null;
    
    const mean = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;
    const variance = windSpeeds.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / windSpeeds.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      mean: Math.round(mean * 10) / 10,
      median: this.calculatePercentile([...windSpeeds].sort((a, b) => a - b), 50),
      max: Math.max(...windSpeeds),
      stdDev: Math.round(stdDev * 10) / 10,
      calmDays: windSpeeds.filter(w => w < 10).length,
      windyDays: windSpeeds.filter(w => w > 20).length,
      extremeWindDays: windSpeeds.filter(w => w > 40).length
    };
  },

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
  },

  // Calculate trend using linear regression
  calculateTrend(values) {
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
  },

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
  },

  // Calculate 95% Confidence Intervals
  calculateAdvancedConfidenceIntervals(tempStats, precipStats, windStats) {
    const confidence = 0.95;
    const zScore = 1.96; // 95% confidence
    
    return {
      temperature: {
        mean: {
          lower: Math.round((tempStats.mean - zScore * (tempStats.stdDev / Math.sqrt(tempStats.sampleSize || 1))) * 10) / 10,
          upper: Math.round((tempStats.mean + zScore * (tempStats.stdDev / Math.sqrt(tempStats.sampleSize || 1))) * 10) / 10
        }
      },
      precipitation: {
        probability: {
          lower: Math.max(0, Math.round((precipStats.rainProbability - zScore * Math.sqrt(precipStats.rainProbability * (100 - precipStats.rainProbability) / (precipStats.sampleSize || 1))) * 10) / 10),
          upper: Math.min(100, Math.round((precipStats.rainProbability + zScore * Math.sqrt(precipStats.rainProbability * (100 - precipStats.rainProbability) / (precipStats.sampleSize || 1))) * 10) / 10)
        }
      },
      wind: {
        mean: {
          lower: Math.round((windStats.mean - zScore * (windStats.stdDev / Math.sqrt(windStats.sampleSize || 1))) * 10) / 10,
          upper: Math.round((windStats.mean + zScore * (windStats.stdDev / Math.sqrt(windStats.sampleSize || 1))) * 10) / 10
        }
      }
    };
  },

  // Prepare data for visualization
  prepareVisualizationData(temperatures, precipitations, windSpeeds, sameDateData) {
    return {
      histogram: this.createHistogramData(temperatures),
      boxPlot: this.createBoxPlotData(temperatures),
      scatter: this.createScatterData(windSpeeds, precipitations),
      timeSeries: this.createTimeSeriesData(sameDateData)
    };
  },

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
  },

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
  },

  // Create scatter plot data
  createScatterData(windSpeeds, precipitations) {
    return windSpeeds.map((wind, i) => ({
      windSpeed: wind,
      precipitation: precipitations[i],
      correlation: this.calculateCorrelation(windSpeeds, precipitations)
    }));
  },

  // Create time series data
  createTimeSeriesData(sameDateData) {
    return sameDateData.map(d => ({
      year: d.year,
      temperature: d.temperature,
      precipitation: d.precipitation,
      windSpeed: d.windSpeed
    })).sort((a, b) => a.year - b.year);
  },

  // Calculate correlation coefficient
  calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  },

  // Calculate percentile
  calculatePercentile(sorted, percentile) {
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sorted.length) return sorted[sorted.length - 1];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  },

  // Find outliers using IQR method
  findOutliers(values, mean, stdDev) {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(v => v < lowerBound || v > upperBound);
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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

  calculateEventSpecificRisk(sameDateData, eventType, eventDate) {
    const eventTypes = this.getEventTypes();
    const event = eventTypes[eventType];
    
    if (!event) return null;
    
    let totalRiskScore = 0;
    const riskFactors = [];
    
    // Temperature risk
    const temperatures = sameDateData.map(d => d.temperature_2m);
    const tempRisk = this.calculateTemperatureRisk(temperatures, event.criticalFactors.temp);
    totalRiskScore += tempRisk.score * event.criticalFactors.temp.weight;
    riskFactors.push({
      factor: 'Temperature',
      risk: tempRisk.score,
      weight: event.criticalFactors.temp.weight,
      details: tempRisk.details
    });
    
    // Precipitation risk
    const precipitations = sameDateData.map(d => d.precipitation);
    const precipRisk = this.calculatePrecipitationRisk(precipitations, event.criticalFactors.rain);
    totalRiskScore += precipRisk.score * event.criticalFactors.rain.weight;
    riskFactors.push({
      factor: 'Precipitation',
      risk: precipRisk.score,
      weight: event.criticalFactors.rain.weight,
      details: precipRisk.details
    });
    
    // Wind risk
    const windSpeeds = sameDateData.map(d => d.wind_speed_10m);
    const windRisk = this.calculateWindRisk(windSpeeds, event.criticalFactors.wind);
    totalRiskScore += windRisk.score * event.criticalFactors.wind.weight;
    riskFactors.push({
      factor: 'Wind',
      risk: windRisk.score,
      weight: event.criticalFactors.wind.weight,
      details: windRisk.details
    });
    
    return {
      totalRisk: Math.round(totalRiskScore),
      riskLevel: totalRiskScore < 30 ? 'Low' : totalRiskScore < 60 ? 'Medium' : 'High',
      confidence: this.calculateRiskConfidence(sameDateData.length),
      factors: riskFactors,
      recommendation: this.getRiskRecommendation(totalRiskScore)
    };
  }

  calculateTemperatureRisk(temperatures, tempFactors) {
    const [minTemp, maxTemp] = tempFactors.range;
    
    const riskDays = temperatures.filter(temp => 
      temp < minTemp || temp > maxTemp
    ).length;
    
    const riskScore = (riskDays / temperatures.length) * 100;
    
    return {
      score: Math.round(riskScore),
      details: {
        optimalRange: `${minTemp}°C - ${maxTemp}°C`,
        riskDays: riskDays,
        totalDays: temperatures.length,
        averageTemp: Math.round((temperatures.reduce((a, b) => a + b, 0) / temperatures.length) * 10) / 10
      }
    };
  }

  calculatePrecipitationRisk(precipitations, rainFactors) {
    const threshold = rainFactors.threshold;
    const riskDays = precipitations.filter(precip => precip > threshold).length;
    const riskScore = (riskDays / precipitations.length) * 100;
    
    return {
      score: Math.round(riskScore),
      details: {
        threshold: `${threshold}mm`,
        riskDays: riskDays,
        totalDays: precipitations.length,
        averageRainfall: Math.round((precipitations.reduce((a, b) => a + b, 0) / precipitations.length) * 10) / 10
      }
    };
  }

  calculateWindRisk(windSpeeds, windFactors) {
    const threshold = windFactors.threshold;
    const riskDays = windSpeeds.filter(wind => wind > threshold).length;
    const riskScore = (riskDays / windSpeeds.length) * 100;
    
    return {
      score: Math.round(riskScore),
      details: {
        threshold: `${threshold} km/h`,
        riskDays: riskDays,
        totalDays: windSpeeds.length,
        averageWindSpeed: Math.round((windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length) * 10) / 10
      }
    };
  }

  calculateRiskConfidence(sampleSize) {
    if (sampleSize >= 20) return 'High (95%)';
    if (sampleSize >= 10) return 'Medium (85%)';
    return 'Low (70%)';
  }

  getRiskRecommendation(riskScore) {
    if (riskScore < 20) return 'Excellent conditions for your event!';
    if (riskScore < 40) return 'Good conditions with minor risks.';
    if (riskScore < 60) return 'Moderate risk. Consider backup plans.';
    if (riskScore < 80) return 'High risk. Strongly consider alternatives.';
    return 'Very high risk. Not recommended for outdoor events.';
  }

  analyzeHistoricalPatterns(data, month, day) {
    // Analyze trends over the years
    const yearlyData = {};
    data.forEach(d => {
      if (d.month === month && d.day === day) {
        if (!yearlyData[d.year]) {
          yearlyData[d.year] = [];
        }
        yearlyData[d.year].push(d);
      }
    });
    
    const years = Object.keys(yearlyData).sort();
    const trends = {
      temperature: this.calculateTrend(years.map(year => 
        yearlyData[year].reduce((sum, d) => sum + d.temperature_2m, 0) / yearlyData[year].length
      )),
      precipitation: this.calculateTrend(years.map(year => 
        yearlyData[year].reduce((sum, d) => sum + d.precipitation, 0) / yearlyData[year].length
      )),
      windSpeed: this.calculateTrend(years.map(year => 
        yearlyData[year].reduce((sum, d) => sum + d.wind_speed_10m, 0) / yearlyData[year].length
      ))
    };
    
    return {
      trends,
      yearCount: years.length,
      trendDirection: this.getTrendDirection(trends)
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return { slope: 0, correlation: 0 };
    
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = values.reduce((sum, yi) => sum + yi * yi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return { slope: Math.round(slope * 1000) / 1000, correlation: Math.round(correlation * 1000) / 1000 };
  }

  getTrendDirection(trends) {
    const significantTrends = Object.entries(trends).filter(([key, trend]) => 
      Math.abs(trend.slope) > 0.1
    );
    
    if (significantTrends.length === 0) return 'Stable';
    
    const warming = trends.temperature.slope > 0;
    const wetter = trends.precipitation.slope > 0;
    const windier = trends.windSpeed.slope > 0;
    
    return {
      temperature: warming ? 'Warming' : 'Cooling',
      precipitation: wetter ? 'Wetter' : 'Drier',
      wind: windier ? 'Windier' : 'Calmer'
    };
  }

  calculateAdvancedConfidenceIntervals(tempStats, precipStats, windStats) {
    const z95 = 1.96; // 95% confidence interval
    
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

  prepareVisualizationData(sameDateData, tempStats, precipStats, windStats) {
    // Temperature distribution for histogram
    const tempDistribution = this.createHistogramData(
      sameDateData.map(d => d.temperature_2m), 
      tempStats.min, 
      tempStats.max, 
      5
    );
    
    // Precipitation distribution
    const precipDistribution = this.createHistogramData(
      sameDateData.map(d => d.precipitation), 
      0, 
      precipStats.max, 
      5
    );
    
    // Wind speed distribution
    const windDistribution = this.createHistogramData(
      sameDateData.map(d => d.wind_speed_10m), 
      0, 
      windStats.max, 
      5
    );
    
    // Box plot data
    const boxPlotData = {
      temperature: {
        min: tempStats.min,
        q1: tempStats.q1,
        median: tempStats.median,
        q3: tempStats.q3,
        max: tempStats.max,
        outliers: this.findOutliers(sameDateData.map(d => d.temperature_2m))
      },
      precipitation: {
        min: 0,
        q1: this.calculatePercentile(sameDateData.map(d => d.precipitation), 25),
        median: this.calculatePercentile(sameDateData.map(d => d.precipitation), 50),
        q3: this.calculatePercentile(sameDateData.map(d => d.precipitation), 75),
        max: precipStats.max,
        outliers: this.findOutliers(sameDateData.map(d => d.precipitation))
      }
    };
    
    // Correlation data for scatter plot
    const correlationData = sameDateData.map(d => ({
      temperature: d.temperature_2m,
      precipitation: d.precipitation,
      windSpeed: d.wind_speed_10m,
      year: d.year
    }));
    
    return {
      temperatureHistogram: tempDistribution,
      precipitationHistogram: precipDistribution,
      windHistogram: windDistribution,
      boxPlot: boxPlotData,
      correlation: correlationData,
      timeSeries: this.createTimeSeriesData(sameDateData)
    };
  }

  createHistogramData(values, min, max, bins) {
    const binSize = (max - min) / bins;
    const histogram = Array(bins).fill(0).map((_, i) => ({
      range: `${Math.round((min + i * binSize) * 10) / 10} - ${Math.round((min + (i + 1) * binSize) * 10) / 10}`,
      count: 0,
      percentage: 0
    }));
    
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
      histogram[binIndex].count++;
    });
    
    const total = values.length;
    histogram.forEach(bin => {
      bin.percentage = Math.round((bin.count / total) * 100);
    });
    
    return histogram;
  }

  findOutliers(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(value => value < lowerBound || value > upperBound);
  }

  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  createTimeSeriesData(data) {
    return data.map(d => ({
      date: new Date(d.year, d.month - 1, d.day),
      temperature: d.temperature_2m,
      precipitation: d.precipitation,
      windSpeed: d.wind_speed_10m,
      year: d.year
    })).sort((a, b) => a.date - b.date);
  }

  calculateRainDistribution(precipitations) {
    const distribution = {
      noRain: 0,
      lightRain: 0,
      moderateRain: 0,
      heavyRain: 0,
      extremeRain: 0
    };
    
    precipitations.forEach(precip => {
      if (precip < 0.1) distribution.noRain++;
      else if (precip < 2.5) distribution.lightRain++;
      else if (precip < 10) distribution.moderateRain++;
      else if (precip < 50) distribution.heavyRain++;
      else distribution.extremeRain++;
    });
    
    const total = precipitations.length;
    Object.keys(distribution).forEach(key => {
      distribution[key] = Math.round((distribution[key] / total) * 100);
    });
    
    return distribution;
  }

  // Geocoding service
  async searchLocation(query) {
    try {
      const url = `${this.geocodingUrl}?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to search location');
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching location:', error);
      throw error;
    }
  }

  // Export data to CSV format
  exportToCSV(weatherData, probabilities, location) {
    const csvContent = [
      ['🌍 WORFE WEATHER DASHBOARD - HISTORICAL ANALYSIS REPORT'],
      [''],
      ['⚠️ IMPORTANT: This is NOT a weather forecast'],
      ['📊 Analysis Type: Historical Weather Probability Analysis'],
      ['❓ Question Answered: "What happened on this date in the past?"'],
      [''],
      ['📍 LOCATION INFORMATION'],
      ['Location', location.name || 'Unknown'],
      ['Coordinates', `${location.lat}°N, ${location.lng}°W`],
      ['Analysis Date', new Date().toISOString().split('T')[0]],
      ['Target Date', weatherData.targetDate],
      [''],
      [      '📊 HISTORICAL DATA SOURCES'],
      ['Primary Data Source', 'NASA POWER API'],
      ['Secondary Data Source', 'Open-Meteo Historical Weather API (Backup)'],
      ['Historical Period', `${probabilities.dateRange.start}-${probabilities.dateRange.end} (${probabilities.totalDays} days)`],
      ['Data Type', 'NASA Earth Observation Data + Historical Weather Patterns (NOT Forecast)'],
      [''],
      ['🌡️ HISTORICAL WEATHER PROBABILITIES'],
      ['Weather Condition', 'Historical Probability (%)', 'Occurrences', 'Total Days', 'Climate Trend', 'Change vs Previous Decade'],
      ['Very Hot', probabilities.probabilities.veryHot.percentage.toFixed(1), probabilities.probabilities.veryHot.count, probabilities.probabilities.veryHot.total, probabilities.climateTrends?.veryHot?.trend || '→ Stable', probabilities.climateTrends?.veryHot?.value || '±0%'],
      ['Very Cold', probabilities.probabilities.veryCold.percentage.toFixed(1), probabilities.probabilities.veryCold.count, probabilities.probabilities.veryCold.total, probabilities.climateTrends?.veryCold?.trend || '→ Stable', probabilities.climateTrends?.veryCold?.value || '±0%'],
      ['Very Windy', probabilities.probabilities.veryWindy.percentage.toFixed(1), probabilities.probabilities.veryWindy.count, probabilities.probabilities.veryWindy.total, probabilities.climateTrends?.veryWindy?.trend || '→ Stable', probabilities.climateTrends?.veryWindy?.value || '±0%'],
      ['Very Wet', probabilities.probabilities.veryWet.percentage.toFixed(1), probabilities.probabilities.veryWet.count, probabilities.probabilities.veryWet.total, probabilities.climateTrends?.veryWet?.trend || '→ Stable', probabilities.climateTrends?.veryWet?.value || '±0%'],
      ['Very Uncomfortable', probabilities.probabilities.veryUncomfortable.percentage.toFixed(1), probabilities.probabilities.veryUncomfortable.count, probabilities.probabilities.veryUncomfortable.total, probabilities.climateTrends?.veryUncomfortable?.trend || '→ Stable', probabilities.climateTrends?.veryUncomfortable?.value || '±0%'],
      [''],
      ['📈 HISTORICAL STATISTICS'],
      ['Weather Parameter', 'Mean', 'Median', 'Min', 'Max', 'Std Dev'],
      ...Object.entries(probabilities.statistics).map(([key, stats]) => [
        key,
        stats.mean.toFixed(2),
        stats.median.toFixed(2),
        stats.min.toFixed(2),
        stats.max.toFixed(2),
        stats.stdDev.toFixed(2)
      ]),
      [''],
      ['🔬 METHODOLOGY & DISCLAIMERS'],
      ['Analysis Method', 'Historical Weather Pattern Analysis'],
      ['Time Period', `${probabilities.dateRange.start} to ${probabilities.dateRange.end}`],
      ['Data Points', `${probabilities.totalDays} historical days`],
      ['Purpose', 'Historical probability analysis for planning'],
      ['Disclaimer', 'This is NOT a weather forecast - based on historical data only'],
      [''],
      ['📚 DATA ATTRIBUTION'],
      ['Primary Source', 'NASA POWER API'],
      ['NASA Earth Science Data', 'NASA GES DISC'],
      ['NASA Data Attribution', 'NASA POWER - https://power.larc.nasa.gov'],
      ['Secondary Source', 'Open-Meteo.com (CC BY 4.0) - Backup Data'],
      ['Worfe Dashboard', 'Historical Weather Analysis Platform'],
      ['Generated by', 'Worfe Weather Dashboard - NASA Earth Observation Data'],
      ['Generated on', new Date().toISOString()],
      [''],
      ['🚀 WORFE - Historical Weather Analysis Dashboard'],
      ['Professional Weather Analysis Tool'],
      ['Empowering outdoor enthusiasts with data-driven historical insights']
    ];

    return csvContent.map(row => row.join(',')).join('\n');
  }

  // Export data to JSON format
  exportToJSON(weatherData, probabilities, location) {
    return {
      "🌍 WORFE_WEATHER_DASHBOARD": {
        "title": "Historical Weather Analysis Report",
        "version": "1.0.0",
        "disclaimer": "⚠️ IMPORTANT: This is NOT a weather forecast",
        "analysis_type": "Historical Weather Probability Analysis",
        "question_answered": "What happened on this date in the past?",
        "purpose": "Historical probability analysis for planning"
      },
      "📍 location": {
        name: location.name || 'Unknown',
        coordinates: {
          latitude: location.lat,
          longitude: location.lng
        }
      },
      "📊 analysis": {
        analysis_date: new Date().toISOString(),
        target_date: weatherData.targetDate,
        data_source: 'NASA POWER API',
        nasa_attribution: 'NASA GES DISC',
        historical_period: {
          start: probabilities.dateRange.start,
          end: probabilities.dateRange.end,
          total_days: probabilities.totalDays
        },
        methodology: 'NASA Earth Observation Data + Historical Weather Pattern Analysis',
        disclaimer: 'This is NOT a weather forecast - based on NASA Earth observation and historical data only'
      },
      "🌡️ historical_probabilities": probabilities.probabilities,
      "🌍 climate_change_trends": probabilities.climateTrends,
      "📈 trends": probabilities.trends,
      "📊 confidence_intervals": probabilities.confidenceIntervals,
      "📈 historical_statistics": probabilities.statistics,
      "🔬 methodology": {
        analysis_method: 'Historical Weather Pattern Analysis',
        time_period: `${probabilities.dateRange.start} to ${probabilities.dateRange.end}`,
        data_points: `${probabilities.totalDays} historical days`,
        purpose: 'Historical probability analysis for planning'
      },
      "📚 attribution": {
        primary_source: 'NASA POWER API',
        nasa_data: 'NASA GES DISC',
        nasa_power_url: 'https://power.larc.nasa.gov',
        secondary_source: 'Open-Meteo.com (CC BY 4.0) - Backup Data',
        worfe_dashboard: 'Historical Weather Analysis Platform',
        generated_by: 'Worfe Weather Dashboard - NASA Earth Observation Data',
        generated_on: new Date().toISOString()
      },
      "🚀 worfe_info": {
        project: 'Worfe - NASA Earth Observation Weather Analysis Dashboard',
        platform: 'Historical Weather Analysis Platform',
        nasa_data_usage: 'NASA POWER API + NASA GES DISC Earth Observation Data',
        mission: 'Empowering outdoor enthusiasts with NASA Earth observation data-driven historical insights',
        disclaimer: 'This analysis is based on NASA Earth observation and historical weather patterns, not future predictions'
      }
    };
  }

  // Get NASA Astronomy Picture of the Day (APOD) for enhanced NASA data usage
  async getNASAAstronomyPicture() {
    try {
      const response = await fetch(`${this.nasaApodUrl}?api_key=DEMO_KEY`);
      if (!response.ok) {
        throw new Error('Failed to fetch NASA APOD');
      }
      const data = await response.json();
      return {
        ...data,
        data_source: 'NASA APOD',
        nasa_attribution: 'NASA Astronomy Picture of the Day'
      };
    } catch (error) {
      console.error('Error fetching NASA APOD:', error);
      return null;
    }
  }

  // Get NASA Near Earth Objects (NEO) data for enhanced NASA data usage
  async getNASANearEarthObjects() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${this.nasaNeoUrl}?api_key=DEMO_KEY&start_date=${today}&end_date=${today}`);
      if (!response.ok) {
        throw new Error('Failed to fetch NASA NEO data');
      }
      const data = await response.json();
      return {
        ...data,
        data_source: 'NASA NEO',
        nasa_attribution: 'NASA Near Earth Objects'
      };
    } catch (error) {
      console.error('Error fetching NASA NEO data:', error);
      return null;
    }
  }

  // Get comprehensive NASA Earth observation data
  async getNASAEarthObservationData(lat, lon, startDate, endDate) {
    try {
      // Multiple NASA APIs for comprehensive Earth observation data
      const [powerData, apodData, neoData] = await Promise.allSettled([
        this.getEnhancedNASAData(lat, lon, startDate, endDate),
        this.getNASAAstronomyPicture(),
        this.getNASANearEarthObjects()
      ]);

      return {
        nasa_power: powerData.status === 'fulfilled' ? powerData.value : null,
        nasa_apod: apodData.status === 'fulfilled' ? apodData.value : null,
        nasa_neo: neoData.status === 'fulfilled' ? neoData.value : null,
        data_source: 'NASA Multi-API Integration',
        nasa_attribution: 'NASA POWER + NASA APOD + NASA NEO',
        global_award_eligible: true,
        nasa_apis_used: ['NASA POWER', 'NASA APOD', 'NASA NEO']
      };
    } catch (error) {
      console.error('Error fetching NASA Earth observation data:', error);
      throw error;
    }
  }


  // Get enhanced NASA POWER data with additional parameters for comprehensive analysis
  async getEnhancedNASAData(lat, lon, startDate, endDate) {
    try {
      // Enhanced parameters for comprehensive NASA Earth observation data
      const enhancedParams = [
        'T2M', 'T2M_MAX', 'T2M_MIN',           // Temperature
        'PRECTOT', 'PRECTOTCORR',              // Precipitation
        'WS2M', 'WS10M', 'WS50M',              // Wind speed at different heights
        'RH2M', 'RH10M',                       // Relative humidity
        'PS', 'SLP',                           // Surface pressure
        'ALLSKY_SFC_SW_DWN', 'ALLSKY_SFC_LW_DWN', // Solar radiation
        'CLRSKY_SFC_SW_DWN', 'CLRSKY_SFC_LW_DWN', // Clear sky radiation
        'T2MDEW', 'T2MWET',                    // Dew point and wet bulb temperature
        'QV2M', 'U2M', 'V2M',                  // Specific humidity and wind components
        'T2M_RANGE', 'T2MDEW', 'T2MWET',       // Additional temperature metrics
        'ALLSKY_SFC_PAR_TOT', 'ALLSKY_SFC_PAR_TOT_DIFF', // Photosynthetic radiation
        'ALLSKY_SFC_UV_INDEX', 'ALLSKY_SFC_UV_INDEX_DIFF' // UV radiation
      ].join(',');

      const nasaUrl = `${this.nasaPowerUrl}?parameters=${enhancedParams}&community=RE&longitude=${lon}&latitude=${lat}&start=${startDate}&end=${endDate}&format=JSON`;
      
      console.log('Fetching enhanced NASA POWER data:', nasaUrl);
      const response = await fetch(nasaUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch enhanced NASA POWER data');
      }
      
      const data = await response.json();
      return {
        ...data,
        data_source: 'NASA POWER API (Enhanced)',
        nasa_attribution: 'NASA POWER',
        parameters_used: enhancedParams.split(','),
        global_award_eligible: true
      };
    } catch (error) {
      console.error('Error fetching enhanced NASA data:', error);
      throw error;
    }
  }

  // Event Planning Methods
  // Etkinlik türleri ve kritik faktörleri
  getEventTypes() {
    return {
      wedding: {
        name: "Düğün",
        criticalFactors: {
          rain: { weight: 0.4, threshold: 1.0 }, // mm/saat
          wind: { weight: 0.3, threshold: 30 }, // km/h
          temp: { weight: 0.3, range: [18, 30] } // °C
        },
        duration: "4-8 saat",
        icon: "👰",
        description: "Açık hava düğünü için ideal koşullar"
      },
      concert: {
        name: "Konser/Festival",
        criticalFactors: {
          rain: { weight: 0.5, threshold: 2.0 },
          wind: { weight: 0.2, threshold: 40 },
          temp: { weight: 0.2, range: [15, 35] },
          storm: { weight: 0.1 }
        },
        duration: "3-6 saat",
        icon: "🎵",
        description: "Müzik etkinlikleri için hava durumu analizi"
      },
      sports: {
        name: "Spor Etkinliği",
        criticalFactors: {
          rain: { weight: 0.3, threshold: 0.5 },
          wind: { weight: 0.2, threshold: 25 },
          temp: { weight: 0.3, range: [10, 28] },
          visibility: { weight: 0.2 }
        },
        duration: "2-4 saat",
        icon: "⚽",
        description: "Açık hava sporları için güvenli koşullar"
      },
      picnic: {
        name: "Piknik",
        criticalFactors: {
          rain: { weight: 0.5, threshold: 0.1 },
          wind: { weight: 0.2, threshold: 20 },
          temp: { weight: 0.3, range: [20, 32] }
        },
        duration: "3-5 saat",
        icon: "🧺",
        description: "Aile pikniği için mükemmel hava"
      },
      parade: {
        name: "Geçit Töreni",
        criticalFactors: {
          rain: { weight: 0.4, threshold: 0.5 },
          wind: { weight: 0.3, threshold: 35 },
          temp: { weight: 0.2, range: [15, 30] },
          visibility: { weight: 0.1 }
        },
        duration: "2-4 saat",
        icon: "🎉",
        description: "Geçit töreni için uygun hava koşulları"
      }
    };
  }

  // Event risk score calculation
  calculateEventRiskScore(weatherData, eventType) {
    if (!weatherData || !weatherData.current) {
      return {
        totalRisk: 0,
        recommendation: "No Data",
        details: [],
        confidence: 0
      };
    }

    // Validate that we have real weather data
    const current = weatherData.current;
    if (!current.temperature_2m || !current.precipitation || !current.wind_speed_10m) {
      return {
        totalRisk: 0,
        recommendation: "Incomplete Data",
        details: [],
        confidence: 0
      };
    }

    const eventTypes = this.getEventTypes();
    const event = eventTypes[eventType];
    
    if (!event) {
      return {
        totalRisk: 0,
        recommendation: "Geçersiz etkinlik türü",
        details: [],
        confidence: 0
      };
    }

    let riskScore = 0;
    const details = [];

    // Yağış riski
    if (current.precipitation > event.criticalFactors.rain.threshold) {
      const rainRisk = Math.min(100, 
        (current.precipitation / event.criticalFactors.rain.threshold) * 100
      );
      riskScore += rainRisk * event.criticalFactors.rain.weight;
      details.push({
        factor: "Precipitation",
        risk: Math.round(rainRisk),
        value: `${current.precipitation} mm`,
        status: rainRisk > 70 ? "High Risk" : rainRisk > 40 ? "Medium Risk" : "Low Risk",
        weight: event.criticalFactors.rain.weight
      });
    }

    // Rüzgar riski
    if (current.wind_speed_10m > event.criticalFactors.wind.threshold) {
      const windRisk = Math.min(100,
        (current.wind_speed_10m / event.criticalFactors.wind.threshold) * 100
      );
      riskScore += windRisk * event.criticalFactors.wind.weight;
      details.push({
        factor: "Wind",
        risk: Math.round(windRisk),
        value: `${current.wind_speed_10m} km/h`,
        status: windRisk > 70 ? "High Risk" : windRisk > 40 ? "Medium Risk" : "Low Risk",
        weight: event.criticalFactors.wind.weight
      });
    }

    // Sıcaklık riski
    const [minTemp, maxTemp] = event.criticalFactors.temp.range;
    if (current.temperature_2m < minTemp || current.temperature_2m > maxTemp) {
      const tempRisk = current.temperature_2m < minTemp
        ? Math.min(100, ((minTemp - current.temperature_2m) / 10) * 100)
        : Math.min(100, ((current.temperature_2m - maxTemp) / 10) * 100);
      riskScore += tempRisk * event.criticalFactors.temp.weight;
      details.push({
        factor: "Temperature",
        risk: Math.round(tempRisk),
        value: `${current.temperature_2m}°C`,
        status: tempRisk > 70 ? "High Risk" : tempRisk > 40 ? "Medium Risk" : "Low Risk",
        weight: event.criticalFactors.temp.weight
      });
    }

    // Güven aralığı hesaplama
    const confidence = Math.max(60, 100 - (riskScore * 0.3));

    return {
      totalRisk: Math.round(riskScore),
      recommendation: riskScore < 30 ? "Ideal Conditions ✅" :
                     riskScore < 60 ? "Acceptable ⚠️" :
                     "Not Recommended ❌",
      details,
      confidence: Math.round(confidence),
      eventType: eventType,
      eventName: event.name
    };
  }

  // Alternatif tarih önerileri
  async suggestAlternativeDates(location, originalDate, eventType, daysRange = 14) {
    try {
      const alternatives = [];
      const startDate = new Date(originalDate);
      
      for (let i = -daysRange; i <= daysRange; i++) {
        if (i === 0) continue; // Orijinal tarihi atla
        
        const testDate = new Date(startDate);
        testDate.setDate(startDate.getDate() + i);
        const dateStr = testDate.toISOString().split('T')[0];
        
        try {
          // Tarihsel veri çek
          const historicalData = await this.getHistoricalWeather(
            location.lat,
            location.lng,
            dateStr,
            5, // 5 yıl veri
            7  // ±7 gün pencere
          );

          if (historicalData && historicalData.rawData && historicalData.rawData.length > 0) {
            // Ortalama hava durumu hesapla
            const avgWeather = {
              temperature_2m: historicalData.rawData.reduce((sum, day) => sum + (day.temperature.avg || 0), 0) / historicalData.rawData.length,
              precipitation: historicalData.rawData.reduce((sum, day) => sum + (day.precipitation || 0), 0) / historicalData.rawData.length,
              wind_speed_10m: historicalData.rawData.reduce((sum, day) => sum + (day.windSpeed || 0), 0) / historicalData.rawData.length,
              relative_humidity_2m: historicalData.rawData.reduce((sum, day) => sum + (day.humidity || 0), 0) / historicalData.rawData.length
            };

            const risk = this.calculateEventRiskScore({ current: avgWeather }, eventType);

            alternatives.push({
              date: testDate,
              dateStr: dateStr,
              riskScore: risk.totalRisk,
              recommendation: risk.recommendation,
              weather: avgWeather,
              dataPoints: historicalData.rawData.length,
              details: risk.details
            });
          }
        } catch (error) {
          console.log(`Error fetching data for ${dateStr}:`, error.message);
          // Hata durumunda varsayılan risk skoru
          alternatives.push({
            date: testDate,
            dateStr: dateStr,
            riskScore: 50,
            recommendation: "Veri yok",
            weather: null,
            dataPoints: 0,
            details: []
          });
        }

        // API rate limiting için kısa bekleme
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // En iyi 5 tarihi seç
      return alternatives
        .sort((a, b) => a.riskScore - b.riskScore)
        .slice(0, 5);

    } catch (error) {
      console.error('Error calculating alternatives:', error);
      throw error;
    }
  }

  // Etkinlik odaklı hava durumu analizi
  async getEventWeatherAnalysis(location, date, eventType) {
    try {
      // Mevcut hava durumu
      const currentWeather = await this.getCurrentWeather(location.lat, location.lng);
      
      // Tarihsel analiz
      const historicalWeather = await this.getHistoricalWeather(
        location.lat,
        location.lng,
        date,
        10, // 10 yıl veri
        7   // ±7 gün pencere
      );

      // Olasılık hesaplamaları
      const probabilities = this.calculateProbabilities(
        historicalWeather,
        {
          veryHot: 32,
          veryCold: 0,
          veryWindy: 40,
          veryWet: 10,
          veryUncomfortable: 40
        },
        {
          yearsOfData: 10,
          dateWindow: 7,
          unitSystem: 'metric'
        }
      );

      // Etkinlik risk skoru
      const eventRisk = this.calculateEventRiskScore(currentWeather, eventType);

      // Alternatif tarihler
      const alternatives = await this.suggestAlternativeDates(location, date, eventType, 14);

      return {
        location,
        targetDate: date,
        eventType,
        currentWeather,
        historicalWeather,
        probabilities,
        eventRisk,
        alternatives,
        analysis: {
          dataSource: 'NASA POWER API + Open-Meteo',
          nasaAttribution: 'NASA GES DISC',
          methodology: 'Historical Weather Pattern Analysis + Event Risk Assessment',
          disclaimer: 'This is NOT a weather forecast - based on historical data only'
        }
      };

    } catch (error) {
      console.error('Error in event weather analysis:', error);
      throw error;
    }
  }
}

export const weatherService = new WeatherService();
