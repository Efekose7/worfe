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

  // Event types
  const eventTypes = {
    wedding: { name: "Wedding", icon: "👰", duration: "4-8 hours" },
    concert: { name: "Concert/Festival", icon: "🎵", duration: "3-6 hours" },
    sports: { name: "Sports Event", icon: "⚽", duration: "2-4 hours" },
    picnic: { name: "Picnic", icon: "🧺", duration: "3-5 hours" },
    parade: { name: "Parade", icon: "🎉", duration: "2-4 hours" }
  };

  const event = eventTypes[eventType];

  return (
    <div className="card p-6 bg-gradient-to-br from-deep-space/50 to-nasa-blue/20 border border-earth-cyan/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-4xl">{event.icon}</span>
          <div>
            <h3 className="text-2xl font-bold text-white">{event.name}</h3>
            <p className="text-white/70 text-sm">Duration: {event.duration}</p>
          </div>
        </div>
        {getRiskIcon(riskData.totalRisk)}
      </div>

      {/* Risk Score */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Event Risk Score</span>
          <span className="text-3xl font-bold text-white">{riskData.totalRisk}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div 
            className={`h-4 rounded-full ${getRiskColor(riskData.totalRisk)} transition-all duration-500`}
            style={{ width: `${riskData.totalRisk}%` }}
          />
        </div>
        <p className="text-center mt-3 text-xl font-semibold">
          {riskData.recommendation}
        </p>
      </div>

      {/* Detailed Risk Factors */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-400 uppercase">Risk Factors</h4>
        {riskData.details.map((detail, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">{detail.factor}</span>
              <span className={`text-sm px-3 py-1 rounded-full ${
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
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Prediction Confidence</span>
          <span className="text-white font-semibold">{riskData.confidence}%</span>
        </div>
      </div>
    </div>
  );
};

export default EventRiskCard;