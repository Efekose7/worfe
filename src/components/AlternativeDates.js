import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Thermometer, Droplets, Wind, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { weatherService } from '../services/weatherService';

const AlternativeDates = ({ selectedEvent, onSelectDate }) => {
  const { selectedLocation, selectedDate } = useWeather();
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eventTypes = useMemo(() => ({
    wedding: {
      name: "Wedding",
      criticalFactors: {
        rain: { weight: 0.4, threshold: 1.0 },
        wind: { weight: 0.3, threshold: 30 },
        temp: { weight: 0.3, range: [18, 30] }
      },
      icon: "👰"
    },
    concert: {
      name: "Concert/Festival",
      criticalFactors: {
        rain: { weight: 0.5, threshold: 2.0 },
        wind: { weight: 0.2, threshold: 40 },
        temp: { weight: 0.2, range: [15, 35] },
        storm: { weight: 0.1 }
      },
      icon: "🎵"
    },
    sports: {
      name: "Sports Event",
      criticalFactors: {
        rain: { weight: 0.3, threshold: 0.5 },
        wind: { weight: 0.2, threshold: 25 },
        temp: { weight: 0.3, range: [10, 28] },
        visibility: { weight: 0.2 }
      },
      icon: "⚽"
    },
    picnic: {
      name: "Picnic",
      criticalFactors: {
        rain: { weight: 0.5, threshold: 0.1 },
        wind: { weight: 0.2, threshold: 20 },
        temp: { weight: 0.3, range: [20, 32] }
      },
      icon: "🧺"
    },
    parade: {
      name: "Parade",
      criticalFactors: {
        rain: { weight: 0.4, threshold: 0.5 },
        wind: { weight: 0.3, threshold: 35 },
        temp: { weight: 0.2, range: [15, 30] },
        visibility: { weight: 0.1 }
      },
      icon: "🎉"
    }
  }), []);

  const calculateEventRiskScore = useCallback((weatherData, eventType) => {
    if (!weatherData || !weatherData.current) return { totalRisk: 100, recommendation: "No Data" };

    const event = eventTypes[eventType];
    let riskScore = 0;
    const current = weatherData.current;

    if (current.precipitation > event.criticalFactors.rain.threshold) {
      const rainRisk = Math.min(100, (current.precipitation / event.criticalFactors.rain.threshold) * 100);
      riskScore += rainRisk * event.criticalFactors.rain.weight;
    }

    if (current.wind_speed_10m > event.criticalFactors.wind.threshold) {
      const windRisk = Math.min(100, (current.wind_speed_10m / event.criticalFactors.wind.threshold) * 100);
      riskScore += windRisk * event.criticalFactors.wind.weight;
    }

    const [minTemp, maxTemp] = event.criticalFactors.temp.range;
    if (current.temperature_2m < minTemp || current.temperature_2m > maxTemp) {
      const tempRisk = current.temperature_2m < minTemp
        ? Math.min(100, ((minTemp - current.temperature_2m) / 10) * 100)
        : Math.min(100, ((current.temperature_2m - maxTemp) / 10) * 100);
      riskScore += tempRisk * event.criticalFactors.temp.weight;
    }

    return {
      totalRisk: Math.round(riskScore),
      recommendation: riskScore < 30 ? "Ideal ✅" :
                     riskScore < 60 ? "Acceptable ⚠️" :
                     "Not Recommended ❌"
    };
  }, [eventTypes]);

  const calculateAlternatives = useCallback(async () => {
    if (!selectedLocation || !selectedEvent) return;

    setLoading(true);
    setError(null);

    try {
      const alternatives = [];
      const startDate = new Date(selectedDate);
      
      for (let i = -14; i <= 14; i++) {
        if (i === 0) continue; // Skip original date
        
        const testDate = new Date(startDate);
        testDate.setDate(startDate.getDate() + i);
        
        try {
          const weatherData = await weatherService.getHistoricalWeather(
            selectedLocation.latitude,
            selectedLocation.longitude,
            testDate
          );
          
          const riskScore = calculateEventRiskScore(weatherData, selectedEvent);
          
          alternatives.push({
            date: testDate,
            riskScore: riskScore.totalRisk,
            recommendation: riskScore.recommendation,
            weather: weatherData.current,
            daysFromOriginal: i
          });
        } catch (error) {
          console.warn(`Failed to get weather for ${testDate.toISOString()}:`, error);
        }
      }

      const sortedAlternatives = alternatives
        .sort((a, b) => a.riskScore - b.riskScore)
        .slice(0, 5); // Top 5 alternatives

      setAlternatives(sortedAlternatives);
    } catch (error) {
      console.error('Error calculating alternatives:', error);
      setError('Failed to calculate alternative dates');
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedEvent, selectedDate, calculateEventRiskScore]);

  useEffect(() => {
    if (selectedLocation && selectedEvent) {
      calculateAlternatives();
    }
  }, [selectedLocation, selectedEvent, selectedDate, calculateAlternatives]);

  const getRiskColor = (risk) => {
    if (risk < 30) return 'text-green-400';
    if (risk < 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskIcon = (risk) => {
    if (risk < 30) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (risk < 60) return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    return <AlertTriangle className="w-5 h-5 text-red-400" />;
  };

  if (!selectedEvent) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-8 h-8 text-earth-cyan" />
        <div>
          <h2 className="text-2xl font-bold text-white">Alternative Dates</h2>
          <p className="text-white/70">Find better dates for your {eventTypes[selectedEvent].name.toLowerCase()}</p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-cyan mx-auto mb-4"></div>
          <p className="text-white/70">Calculating alternatives...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {alternatives.length > 0 && (
        <div className="space-y-4">
          {alternatives.map((alt, index) => (
            <button
              key={index}
              onClick={() => onSelectDate(alt.date)}
              className="w-full bg-white/10 hover:bg-white/15 rounded-lg p-4 text-left transition-all border border-white/20 hover:border-earth-cyan/50"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{eventTypes[selectedEvent].icon}</span>
                  <div>
                    <p className="text-white font-semibold">
                      {alt.date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-white/70 text-sm">
                      {alt.daysFromOriginal > 0 ? `+${alt.daysFromOriginal} days` : `${alt.daysFromOriginal} days`} from original
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {getRiskIcon(alt.riskScore)}
                    <span className={`text-2xl font-bold ${getRiskColor(alt.riskScore)}`}>
                      {alt.riskScore}%
                    </span>
                  </div>
                  <p className="text-white/70 text-sm">{alt.recommendation}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-white/5 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <span className="text-white/70">Temperature</span>
                  </div>
                  <p className="text-white font-semibold">{alt.weather.temperature_2m}°C</p>
                </div>
                <div className="bg-white/5 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-white/70">Precipitation</span>
                  </div>
                  <p className="text-white font-semibold">{alt.weather.precipitation} mm</p>
                </div>
                <div className="bg-white/5 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span className="text-white/70">Wind</span>
                  </div>
                  <p className="text-white font-semibold">{alt.weather.wind_speed_10m} km/h</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {alternatives.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/70">No alternative dates found</p>
        </div>
      )}
    </div>
  );
};

export default AlternativeDates;
