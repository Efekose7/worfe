import React, { useState } from 'react';
import { Calendar, MapPin, AlertTriangle, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import StatisticalAnalysis from './StatisticalAnalysis';

// Event types and critical factors
const eventTypes = {
  wedding: {
    name: "Wedding",
    criticalFactors: {
      rain: { weight: 0.4, threshold: 1.0 }, // mm/hour
      wind: { weight: 0.3, threshold: 30 }, // km/h
      temp: { weight: 0.3, range: [18, 30] } // °C
    },
    duration: "4-8 hours",
    icon: "👰",
    description: "Ideal conditions for outdoor wedding"
  },
  concert: {
    name: "Concert/Festival",
    criticalFactors: {
      rain: { weight: 0.5, threshold: 2.0 },
      wind: { weight: 0.2, threshold: 40 },
      temp: { weight: 0.2, range: [15, 35] },
      storm: { weight: 0.1 }
    },
    duration: "3-6 hours",
    icon: "🎵",
    description: "Weather analysis for music events"
  },
  sports: {
    name: "Sports Event",
    criticalFactors: {
      rain: { weight: 0.3, threshold: 0.5 },
      wind: { weight: 0.2, threshold: 25 },
      temp: { weight: 0.3, range: [10, 28] },
      visibility: { weight: 0.2 }
    },
    duration: "2-4 hours",
    icon: "⚽",
    description: "Safe conditions for outdoor sports"
  },
  picnic: {
    name: "Picnic",
    criticalFactors: {
      rain: { weight: 0.5, threshold: 0.1 },
      wind: { weight: 0.2, threshold: 20 },
      temp: { weight: 0.3, range: [20, 32] }
    },
    duration: "3-5 hours",
    icon: "🧺",
    description: "Perfect weather for family picnic"
  },
  parade: {
    name: "Parade",
    criticalFactors: {
      rain: { weight: 0.4, threshold: 0.5 },
      wind: { weight: 0.3, threshold: 35 },
      temp: { weight: 0.2, range: [15, 30] },
      visibility: { weight: 0.1 }
    },
    duration: "2-4 hours",
    icon: "🎉",
    description: "Suitable weather conditions for parade"
  }
};

// Risk score calculation function
const calculateEventRiskScore = (weatherData, eventType) => {
  if (!weatherData || !weatherData.current) {
    return {
      totalRisk: 0,
      recommendation: "No Data",
      details: [],
      confidence: 0
    };
  }

  const event = eventTypes[eventType];
  let riskScore = 0;
  const details = [];
  const current = weatherData.current;

  // Precipitation risk
  if (current.precipitation > event.criticalFactors.rain.threshold) {
    const rainRisk = Math.min(100, (current.precipitation / event.criticalFactors.rain.threshold) * 100);
    riskScore += rainRisk * event.criticalFactors.rain.weight;
    details.push({
      factor: "Precipitation",
      risk: Math.round(rainRisk),
      value: `${current.precipitation} mm`,
      status: rainRisk > 70 ? "High Risk" : rainRisk > 40 ? "Medium Risk" : "Low Risk",
      weight: event.criticalFactors.rain.weight
    });
  }

  // Wind risk
  if (current.wind_speed_10m > event.criticalFactors.wind.threshold) {
    const windRisk = Math.min(100, (current.wind_speed_10m / event.criticalFactors.wind.threshold) * 100);
    riskScore += windRisk * event.criticalFactors.wind.weight;
    details.push({
      factor: "Wind",
      risk: Math.round(windRisk),
      value: `${current.wind_speed_10m} km/h`,
      status: windRisk > 70 ? "High Risk" : windRisk > 40 ? "Medium Risk" : "Low Risk",
      weight: event.criticalFactors.wind.weight
    });
  }

  // Temperature risk
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

  // Calculate confidence based on data quality
  const confidence = Math.min(95, 70 + (details.length * 5));

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
};

const EventPlanner = () => {
  const { selectedLocation, selectedDate, weatherData, loading, error } = useWeather();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRiskAnalysis, setShowRiskAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showStatisticalAnalysis, setShowStatisticalAnalysis] = useState(false);
  const [statisticalData, setStatisticalData] = useState(null);

  const handleEventSelect = (eventType) => {
    setSelectedEvent(eventType);
    setShowRiskAnalysis(true);
    
    // Start analysis if we have weather data
    if (weatherData && weatherData.current) {
      setIsAnalyzing(true);
      // Simulate analysis time
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 2000);
    }
  };

  const handleStatisticalAnalysis = async () => {
    if (!selectedLocation || !selectedDate || !selectedEvent) return;
    
    setShowStatisticalAnalysis(true);
    setIsAnalyzing(true);
    
    try {
      // Import weatherService dynamically to avoid circular imports
      const { weatherService } = await import('../services/weatherService');
      
      // Get historical data for statistical analysis
      const historicalData = await weatherService.getHistoricalWeather(
        selectedLocation.latitude,
        selectedLocation.longitude,
        selectedDate,
        20, // 20 years of data
        7   // 7-day window
      );
      
      // Calculate advanced statistics
      const stats = weatherService.calculateAdvancedStatistics(
        historicalData,
        selectedDate,
        selectedEvent
      );
      
      setStatisticalData(stats);
    } catch (error) {
      console.error('Error calculating statistical analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskIcon = (risk) => {
    if (risk < 30) return <CheckCircle className="w-12 h-12 text-green-500" />;
    if (risk < 60) return <AlertCircle className="w-12 h-12 text-yellow-500" />;
    return <AlertTriangle className="w-12 h-12 text-red-500" />;
  };

  const getRiskColor = (risk) => {
    if (risk < 30) return 'bg-green-500';
    if (risk < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Location and Date Selection */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-8 h-8 text-earth-cyan" />
          <div>
            <h2 className="text-2xl font-bold text-white">Location & Date</h2>
            <p className="text-white/70">Select your event location and date</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-white/10 rounded-lg">
            <MapPin className="w-5 h-5 text-earth-cyan" />
            <span className="text-white">
              {selectedLocation ? `${selectedLocation.name}, ${selectedLocation.country}` : 'Select location'}
            </span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/10 rounded-lg">
            <Calendar className="w-4 h-4" />
            <span>{selectedDate || 'Select date'}</span>
          </div>
        </div>
      </div>

      {/* Event Type Selection */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          Select Event Type
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(eventTypes).map(([key, event]) => (
            <button
              key={key}
              onClick={() => handleEventSelect(key)}
              className={`p-6 rounded-xl transition-all duration-200 ${
                selectedEvent === key
                  ? 'bg-earth-cyan/20 border-2 border-earth-cyan shadow-lg scale-105'
                  : 'bg-white/10 border-2 border-white/20 hover:border-white/40 hover:bg-white/15'
              }`}
            >
              <div className="text-4xl mb-3">{event.icon}</div>
              <div className="text-white font-semibold mb-1">{event.name}</div>
              <div className="text-xs text-white/70">{event.duration}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Risk Analysis */}
      {selectedEvent && showRiskAnalysis && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{eventTypes[selectedEvent].icon}</span>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {eventTypes[selectedEvent].name} Risk Analysis
                </h3>
                <p className="text-white/70 text-sm">
                  {eventTypes[selectedEvent].description}
                </p>
              </div>
            </div>
            {weatherData && weatherData.current && !isAnalyzing && (
              getRiskIcon(calculateEventRiskScore(weatherData, selectedEvent).totalRisk)
            )}
          </div>

          {/* Loading State */}
          {isAnalyzing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth-cyan mx-auto mb-4"></div>
              <h4 className="text-lg font-semibold text-white mb-2">Analyzing Historical Data</h4>
              <p className="text-white/70">Fetching historical weather patterns and calculating probabilities based on past data...</p>
            </div>
          )}

          {/* No Data State */}
          {!weatherData && !loading && (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">No Weather Data Available</h4>
              <p className="text-white/70">Please select a location and date to get weather analysis.</p>
            </div>
          )}

          {/* Loading Weather Data */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth-cyan mx-auto mb-4"></div>
              <h4 className="text-lg font-semibold text-white mb-2">Loading Weather Data</h4>
              <p className="text-white/70">Fetching current weather conditions...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h4 className="text-red-300 font-semibold">Error Loading Weather Data</h4>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Risk Analysis Results */}
          {weatherData && weatherData.current && !isAnalyzing && (
            <>
              {/* Risk Score */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Event Risk Score</span>
                  <span className="text-2xl font-bold text-white">
                    {calculateEventRiskScore(weatherData, selectedEvent).totalRisk}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${getRiskColor(calculateEventRiskScore(weatherData, selectedEvent).totalRisk)} transition-all duration-500`}
                    style={{ width: `${calculateEventRiskScore(weatherData, selectedEvent).totalRisk}%` }}
                  />
                </div>
                <p className="text-center mt-2 text-lg font-semibold">
                  {calculateEventRiskScore(weatherData, selectedEvent).recommendation}
                </p>
              </div>

              {/* Detailed Risk Factors */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase">Risk Factors</h4>
                {calculateEventRiskScore(weatherData, selectedEvent).details.map((detail, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-medium">{detail.factor}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        detail.status === "High Risk" ? "bg-red-500/20 text-red-300" :
                        detail.status === "Medium Risk" ? "bg-yellow-500/20 text-yellow-300" :
                        "bg-green-500/20 text-green-300"
                      }`}>
                        {detail.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">{detail.value}</span>
                      <span className="text-white font-bold">{detail.risk}%</span>
                    </div>
                  </div>
                ))}
              </div>

                      {/* Confidence Level */}
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Prediction Confidence</span>
                          <span className="text-white font-semibold">
                            {calculateEventRiskScore(weatherData, selectedEvent).confidence}%
                          </span>
                        </div>
                      </div>

                      {/* Statistical Analysis Button */}
                      <div className="mt-6 pt-6 border-t border-gray-700">
                        <button
                          onClick={handleStatisticalAnalysis}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <BarChart3 className="w-5 h-5" />
                          Advanced Statistical Analysis
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Statistical Analysis Section */}
              {showStatisticalAnalysis && (
                <div className="mt-8">
                  <StatisticalAnalysis 
                    statisticalData={statisticalData}
                    eventType={selectedEvent}
                  />
                </div>
              )}
            </div>
          );
        };
        
        export default EventPlanner;