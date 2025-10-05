import React, { useState } from 'react';
import { Calendar, MapPin, AlertTriangle, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

// Etkinlik türleri ve kritik faktörleri
const eventTypes = {
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

// Risk skoru hesaplama fonksiyonu
const calculateEventRiskScore = (weatherData, eventType) => {
  if (!weatherData || !weatherData.current) {
    return {
      totalRisk: 0,
      recommendation: "Veri yok",
      details: [],
      confidence: 0
    };
  }

  const event = eventTypes[eventType];
  let riskScore = 0;
  const details = [];
  const current = weatherData.current;

  // Yağış riski
  if (current.precipitation > event.criticalFactors.rain.threshold) {
    const rainRisk = Math.min(100, 
      (current.precipitation / event.criticalFactors.rain.threshold) * 100
    );
    riskScore += rainRisk * event.criticalFactors.rain.weight;
    details.push({
      factor: "Yağış",
      risk: Math.round(rainRisk),
      value: `${current.precipitation} mm`,
      status: rainRisk > 70 ? "Yüksek Risk" : rainRisk > 40 ? "Orta Risk" : "Düşük Risk",
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
      factor: "Rüzgar",
      risk: Math.round(windRisk),
      value: `${current.wind_speed_10m} km/h`,
      status: windRisk > 70 ? "Yüksek Risk" : windRisk > 40 ? "Orta Risk" : "Düşük Risk",
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
      factor: "Sıcaklık",
      risk: Math.round(tempRisk),
      value: `${current.temperature_2m}°C`,
      status: tempRisk > 70 ? "Yüksek Risk" : tempRisk > 40 ? "Orta Risk" : "Düşük Risk",
      weight: event.criticalFactors.temp.weight
    });
  }

  // Güven aralığı hesaplama (basit)
  const confidence = Math.max(60, 100 - (riskScore * 0.3));

  return {
    totalRisk: Math.round(riskScore),
    recommendation: riskScore < 30 ? "İdeal Koşullar ✅" :
                   riskScore < 60 ? "Kabul Edilebilir ⚠️" :
                   "Önerilmez ❌",
    details,
    confidence: Math.round(confidence)
  };
};

const EventPlanner = () => {
  const { weatherData, selectedLocation, selectedDate } = useWeather();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRiskAnalysis, setShowRiskAnalysis] = useState(false);

  const handleEventSelect = (eventType) => {
    setSelectedEvent(eventType);
    setShowRiskAnalysis(true);
  };

  const getRiskColor = (risk) => {
    if (risk < 30) return 'text-green-400';
    if (risk < 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskIcon = (risk) => {
    if (risk < 30) return <CheckCircle className="w-6 h-6 text-green-400" />;
    if (risk < 60) return <AlertCircle className="w-6 h-6 text-yellow-400" />;
    return <AlertTriangle className="w-6 h-6 text-red-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Etkinliğiniz İçin Mükemmel Hava 🎉
        </h1>
        <p className="text-xl text-white/70 mb-6">
          NASA verileriyle etkinliğinizi güvenle planlayın
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-white/60">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{selectedLocation ? selectedLocation.name : 'Konum seçin'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{selectedDate || 'Tarih seçin'}</span>
          </div>
        </div>
      </div>

      {/* Event Type Selection */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          Etkinlik Türünü Seçin
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
      {selectedEvent && showRiskAnalysis && weatherData && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{eventTypes[selectedEvent].icon}</span>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {eventTypes[selectedEvent].name} Risk Analizi
                </h3>
                <p className="text-white/70 text-sm">
                  {eventTypes[selectedEvent].description}
                </p>
              </div>
            </div>
            {getRiskIcon(calculateEventRiskScore(weatherData, selectedEvent).totalRisk)}
          </div>

          {/* Risk Skoru */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white/80">Etkinlik Risk Skoru</span>
              <span className={`text-3xl font-bold ${getRiskColor(calculateEventRiskScore(weatherData, selectedEvent).totalRisk)}`}>
                {calculateEventRiskScore(weatherData, selectedEvent).totalRisk}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 mb-3">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  calculateEventRiskScore(weatherData, selectedEvent).totalRisk < 30 ? 'bg-green-500' :
                  calculateEventRiskScore(weatherData, selectedEvent).totalRisk < 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(calculateEventRiskScore(weatherData, selectedEvent).totalRisk, 100)}%` }}
              />
            </div>
            <p className="text-center text-lg font-semibold text-white">
              {calculateEventRiskScore(weatherData, selectedEvent).recommendation}
            </p>
          </div>

          {/* Detaylı Risk Faktörleri */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
              Risk Faktörleri
            </h4>
            {calculateEventRiskScore(weatherData, selectedEvent).details.map((detail, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{detail.factor}</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    detail.status === "Yüksek Risk" ? 'bg-red-500/20 text-red-300' :
                    detail.status === "Orta Risk" ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {detail.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">{detail.value}</span>
                  <span className="text-white font-bold">{detail.risk}%</span>
                </div>
                <div className="mt-2 text-xs text-white/60">
                  Ağırlık: {(detail.weight * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>

          {/* Güven Aralığı */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-sm">Tahmin Güveni</span>
              <span className="text-white font-semibold">
                %{calculateEventRiskScore(weatherData, selectedEvent).confidence}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Event Info */}
      {selectedEvent && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Etkinlik Bilgileri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-earth-cyan" />
              <div>
                <div className="text-white font-medium">Süre</div>
                <div className="text-white/70 text-sm">{eventTypes[selectedEvent].duration}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-earth-cyan" />
              <div>
                <div className="text-white font-medium">Etkinlik Türü</div>
                <div className="text-white/70 text-sm">{eventTypes[selectedEvent].name}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPlanner;
