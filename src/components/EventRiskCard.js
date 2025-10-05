import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const EventRiskCard = ({ eventType, riskData, weatherData }) => {
  if (!riskData || !eventType) return null;

  const getRiskColor = (risk) => {
    if (risk < 30) return 'bg-green-500';
    if (risk < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskIcon = (risk) => {
    if (risk < 30) return <CheckCircle className="w-12 h-12 text-green-500" />;
    if (risk < 60) return <AlertCircle className="w-12 h-12 text-yellow-500" />;
    return <AlertTriangle className="w-12 h-12 text-red-500" />;
  };

  // const getTrendIcon = (trend) => {
  //   if (trend.includes('↑↑')) return <TrendingUp className="w-4 h-4 text-red-400" />;
  //   if (trend.includes('↑')) return <TrendingUp className="w-4 h-4 text-orange-400" />;
  //   if (trend.includes('↓↓')) return <TrendingDown className="w-4 h-4 text-blue-400" />;
  //   if (trend.includes('↓')) return <TrendingDown className="w-4 h-4 text-cyan-400" />;
  //   return <Minus className="w-4 h-4 text-white/60" />;
  // };

  // const getTrendColor = (trend) => {
  //   if (trend.includes('↑↑')) return 'text-red-400';
  //   if (trend.includes('↑')) return 'text-orange-400';
  //   if (trend.includes('↓↓')) return 'text-blue-400';
  //   if (trend.includes('↓')) return 'text-cyan-400';
  //   return 'text-white/60';
  // };

  // Etkinlik türleri
  const eventTypes = {
    wedding: { name: "Düğün", icon: "👰", duration: "4-8 saat" },
    concert: { name: "Konser/Festival", icon: "🎵", duration: "3-6 saat" },
    sports: { name: "Spor Etkinliği", icon: "⚽", duration: "2-4 saat" },
    picnic: { name: "Piknik", icon: "🧺", duration: "3-5 saat" },
    parade: { name: "Geçit Töreni", icon: "🎉", duration: "2-4 saat" }
  };

  const event = eventTypes[eventType];

  return (
    <div className="card p-6 bg-gradient-to-br from-deep-space/50 to-nasa-blue/20 border border-earth-cyan/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-4xl">{event.icon}</span>
          <div>
            <h3 className="text-2xl font-bold text-white">
              {event.name}
            </h3>
            <p className="text-white/70 text-sm">
              Süre: {event.duration}
            </p>
          </div>
        </div>
        {getRiskIcon(riskData.totalRisk)}
      </div>

      {/* Risk Skoru */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white/80 text-lg">Etkinlik Risk Skoru</span>
          <span className="text-4xl font-bold text-white">
            {riskData.totalRisk}%
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-4 mb-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getRiskColor(riskData.totalRisk)}`}
            style={{ width: `${Math.min(riskData.totalRisk, 100)}%` }}
          />
        </div>
        <p className="text-center text-xl font-semibold text-white">
          {riskData.recommendation}
        </p>
      </div>

      {/* Detaylı Risk Faktörleri */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
          Risk Faktörleri
        </h4>
        {riskData.details.map((detail, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
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
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70 text-sm">{detail.value}</span>
              <span className="text-white font-bold">{detail.risk}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  detail.risk > 70 ? 'bg-red-500' :
                  detail.risk > 40 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(detail.risk, 100)}%` }}
              />
            </div>
            {detail.weight && (
              <div className="mt-2 text-xs text-white/60">
                Ağırlık: {(detail.weight * 100).toFixed(0)}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Güven Aralığı ve Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/20">
        <div className="flex justify-between items-center">
          <span className="text-white/80 text-sm">Tahmin Güveni</span>
          <span className="text-white font-semibold">
            %{riskData.confidence}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/80 text-sm">Veri Kalitesi</span>
          <span className="text-white font-semibold">
            {riskData.confidence > 80 ? 'Yüksek' : riskData.confidence > 60 ? 'Orta' : 'Düşük'}
          </span>
        </div>
      </div>

      {/* Hava Durumu Özeti */}
      {weatherData && weatherData.current && (
        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <h5 className="text-sm font-semibold text-white/80 mb-3">Mevcut Hava Durumu</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-white/70">Sıcaklık</div>
              <div className="text-white font-semibold">
                {weatherData.current.temperature_2m}°C
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/70">Yağış</div>
              <div className="text-white font-semibold">
                {weatherData.current.precipitation} mm
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/70">Rüzgar</div>
              <div className="text-white font-semibold">
                {weatherData.current.wind_speed_10m} km/h
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/70">Nem</div>
              <div className="text-white font-semibold">
                {weatherData.current.relative_humidity_2m}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Öneriler */}
      <div className="mt-6 p-4 bg-earth-cyan/10 rounded-lg border border-earth-cyan/20">
        <h5 className="text-sm font-semibold text-earth-cyan mb-2">💡 Öneriler</h5>
        <div className="text-sm text-white/80 space-y-1">
          {riskData.totalRisk < 30 && (
            <p>✅ Mükemmel koşullar! Etkinliğinizi güvenle planlayabilirsiniz.</p>
          )}
          {riskData.totalRisk >= 30 && riskData.totalRisk < 60 && (
            <p>⚠️ Kabul edilebilir koşullar. Alternatif planlar hazırlayın.</p>
          )}
          {riskData.totalRisk >= 60 && (
            <p>❌ Riskli koşullar. Etkinliği ertelemeyi veya kapalı alan seçeneği düşünün.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRiskCard;
