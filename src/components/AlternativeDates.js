import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Clock, Thermometer, Droplets, Wind, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { weatherService } from '../services/weatherService';

const AlternativeDates = ({ selectedEvent, onSelectDate }) => {
  const { selectedLocation, selectedDate } = useWeather();
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Etkinlik türleri
  const eventTypes = {
    wedding: {
      name: "Düğün",
      criticalFactors: {
        rain: { weight: 0.4, threshold: 1.0 },
        wind: { weight: 0.3, threshold: 30 },
        temp: { weight: 0.3, range: [18, 30] }
      },
      icon: "👰"
    },
    concert: {
      name: "Konser/Festival",
      criticalFactors: {
        rain: { weight: 0.5, threshold: 2.0 },
        wind: { weight: 0.2, threshold: 40 },
        temp: { weight: 0.2, range: [15, 35] },
        storm: { weight: 0.1 }
      },
      icon: "🎵"
    },
    sports: {
      name: "Spor Etkinliği",
      criticalFactors: {
        rain: { weight: 0.3, threshold: 0.5 },
        wind: { weight: 0.2, threshold: 25 },
        temp: { weight: 0.3, range: [10, 28] },
        visibility: { weight: 0.2 }
      },
      icon: "⚽"
    },
    picnic: {
      name: "Piknik",
      criticalFactors: {
        rain: { weight: 0.5, threshold: 0.1 },
        wind: { weight: 0.2, threshold: 20 },
        temp: { weight: 0.3, range: [20, 32] }
      },
      icon: "🧺"
    },
    parade: {
      name: "Geçit Töreni",
      criticalFactors: {
        rain: { weight: 0.4, threshold: 0.5 },
        wind: { weight: 0.3, threshold: 35 },
        temp: { weight: 0.2, range: [15, 30] },
        visibility: { weight: 0.1 }
      },
      icon: "🎉"
    }
  };

  // Risk skoru hesaplama
  const calculateEventRiskScore = (weatherData, eventType) => {
    if (!weatherData || !weatherData.current) return { totalRisk: 100, recommendation: "Veri yok" };

    const event = eventTypes[eventType];
    let riskScore = 0;
    const current = weatherData.current;

    // Yağış riski
    if (current.precipitation > event.criticalFactors.rain.threshold) {
      const rainRisk = Math.min(100, 
        (current.precipitation / event.criticalFactors.rain.threshold) * 100
      );
      riskScore += rainRisk * event.criticalFactors.rain.weight;
    }

    // Rüzgar riski
    if (current.wind_speed_10m > event.criticalFactors.wind.threshold) {
      const windRisk = Math.min(100,
        (current.wind_speed_10m / event.criticalFactors.wind.threshold) * 100
      );
      riskScore += windRisk * event.criticalFactors.wind.weight;
    }

    // Sıcaklık riski
    const [minTemp, maxTemp] = event.criticalFactors.temp.range;
    if (current.temperature_2m < minTemp || current.temperature_2m > maxTemp) {
      const tempRisk = current.temperature_2m < minTemp
        ? Math.min(100, ((minTemp - current.temperature_2m) / 10) * 100)
        : Math.min(100, ((current.temperature_2m - maxTemp) / 10) * 100);
      riskScore += tempRisk * event.criticalFactors.temp.weight;
    }

    return {
      totalRisk: Math.round(riskScore),
      recommendation: riskScore < 30 ? "İdeal ✅" :
                     riskScore < 60 ? "Kabul Edilebilir ⚠️" :
                     "Önerilmez ❌"
    };
  };

  // Alternatif tarihleri hesapla
  const calculateAlternatives = async () => {
    if (!selectedLocation || !selectedEvent) return;

    setLoading(true);
    setError(null);

    try {
      const alternatives = [];
      const startDate = new Date(selectedDate);
      const daysRange = 14; // ±14 gün

      for (let i = -daysRange; i <= daysRange; i++) {
        if (i === 0) continue; // Orijinal tarihi atla

        const testDate = new Date(startDate);
        testDate.setDate(startDate.getDate() + i);
        const dateStr = testDate.toISOString().split('T')[0];

        try {
          // Tarihsel veri çek
          const historicalData = await weatherService.getHistoricalWeather(
            selectedLocation.lat,
            selectedLocation.lng,
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

            const risk = calculateEventRiskScore({ current: avgWeather }, selectedEvent);

            alternatives.push({
              date: testDate,
              dateStr: dateStr,
              riskScore: risk.totalRisk,
              recommendation: risk.recommendation,
              weather: avgWeather,
              dataPoints: historicalData.rawData.length
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
            dataPoints: 0
          });
        }

        // API rate limiting için kısa bekleme
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // En iyi 5 tarihi seç
      const sortedAlternatives = alternatives
        .sort((a, b) => a.riskScore - b.riskScore)
        .slice(0, 5);

      setAlternatives(sortedAlternatives);
    } catch (error) {
      console.error('Error calculating alternatives:', error);
      setError('Alternatif tarihler hesaplanırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLocation && selectedEvent) {
      calculateAlternatives();
    }
  }, [selectedLocation, selectedEvent, selectedDate]);

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

  if (!selectedEvent) {
    return (
      <div className="card p-6 text-center">
        <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Alternatif Tarihler</h3>
        <p className="text-white/60">Önce bir etkinlik türü seçin</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="w-6 h-6 text-earth-cyan" />
        <div>
          <h3 className="text-xl font-bold text-white">
            Alternatif Tarihler
          </h3>
          <p className="text-white/70 text-sm">
            {eventTypes[selectedEvent]?.name} için en iyi tarihler
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-cyan mx-auto mb-4"></div>
          <p className="text-white/80">Alternatif tarihler hesaplanıyor...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && alternatives.length > 0 && (
        <div className="space-y-4">
          {alternatives.map((alt, index) => (
            <button
              key={index}
              onClick={() => onSelectDate && onSelectDate(alt.dateStr)}
              className="w-full bg-white/5 hover:bg-white/10 rounded-lg p-4 text-left transition-all border border-white/10 hover:border-earth-cyan/50 group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{eventTypes[selectedEvent]?.icon}</span>
                    <div>
                      <p className="text-white font-semibold text-lg">
                        {alt.date.toLocaleDateString('tr-TR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-white/70 text-sm">
                        {alt.dataPoints} günlük veri • {alt.dateStr}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    {getRiskIcon(alt.riskScore)}
                    <span className={`text-2xl font-bold ${getRiskColor(alt.riskScore)}`}>
                      {alt.riskScore}%
                    </span>
                  </div>
                  <p className="text-sm text-white/70">{alt.recommendation}</p>
                </div>
              </div>
              
              {alt.weather && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/5 rounded p-3 group-hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-2 mb-1">
                      <Thermometer className="w-4 h-4 text-red-400" />
                      <span className="text-white/70 text-xs">Sıcaklık</span>
                    </div>
                    <div className="text-white font-semibold">
                      {alt.weather.temperature_2m.toFixed(1)}°C
                    </div>
                  </div>
                  <div className="bg-white/5 rounded p-3 group-hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-2 mb-1">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <span className="text-white/70 text-xs">Yağış</span>
                    </div>
                    <div className="text-white font-semibold">
                      {alt.weather.precipitation.toFixed(1)} mm
                    </div>
                  </div>
                  <div className="bg-white/5 rounded p-3 group-hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-2 mb-1">
                      <Wind className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/70 text-xs">Rüzgar</span>
                    </div>
                    <div className="text-white font-semibold">
                      {alt.weather.wind_speed_10m.toFixed(1)} km/h
                    </div>
                  </div>
                  <div className="bg-white/5 rounded p-3 group-hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-white/70 text-xs">Nem</span>
                    </div>
                    <div className="text-white font-semibold">
                      {alt.weather.relative_humidity_2m.toFixed(0)}%
                    </div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && !error && alternatives.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">Alternatif tarih bulunamadı</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-earth-cyan/10 rounded-lg border border-earth-cyan/20">
        <p className="text-sm text-earth-cyan">
          💡 Alternatif tarihler, seçilen etkinlik türü için en uygun hava koşullarını gösterir. 
          Risk skoru ne kadar düşükse, etkinliğiniz o kadar güvenli olur.
        </p>
      </div>
    </div>
  );
};

export default AlternativeDates;
