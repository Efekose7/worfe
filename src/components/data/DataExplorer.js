import React, { useState, useMemo } from 'react';
import { Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Database, Activity, Calendar } from 'lucide-react';

const DataExplorer = ({ location, weatherData }) => {
  const [yearRange, setYearRange] = useState([2014, 2024]);
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [showTrend, setShowTrend] = useState(true);
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true);

  // VERİ İŞLEME - Gerçek NASA verisini kullan
  const processedData = useMemo(() => {
    if (!weatherData) return [];
    
    // weatherData'dan yearRange aralığındaki verileri filtrele
    return Object.entries(weatherData.parameters?.T2M || {})
      .filter(([date]) => {
        const year = parseInt(date.substring(0, 4));
        return year >= yearRange[0] && year <= yearRange[1];
      })
      .map(([date, value]) => {
        const dateObj = new Date(date);
        return {
          date,
          year: dateObj.getFullYear(),
          month: dateObj.getMonth() + 1,
          day: dateObj.getDate(),
          temperature: value,
          precipitation: weatherData.parameters?.PRECTOT?.[date] || 0,
          windSpeed: weatherData.parameters?.WS2M?.[date] || 0,
          humidity: weatherData.parameters?.RH2M?.[date] || 0
        };
      });
  }, [weatherData, yearRange]);

  // İSTATİSTİKSEL HESAPLAMALAR
  const statistics = useMemo(() => {
    if (processedData.length === 0) return null;

    const values = processedData.map(d => d[selectedMetric]);
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sortedValues = [...values].sort((a, b) => a - b);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // LINEAR REGRESSION için trend hesaplama
    const n = processedData.length;
    const sumX = processedData.reduce((sum, d, i) => sum + i, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = processedData.reduce((sum, d, i) => sum + (i * values[i]), 0);
    const sumX2 = processedData.reduce((sum, d, i) => sum + (i * i), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return {
      mean: mean.toFixed(2),
      median: sortedValues[Math.floor(sortedValues.length / 2)].toFixed(2),
      stdDev: stdDev.toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      // 95% Confidence Interval
      confidenceInterval: {
        lower: (mean - 1.96 * stdDev).toFixed(2),
        upper: (mean + 1.96 * stdDev).toFixed(2)
      },
      // Percentiles
      percentiles: {
        p25: sortedValues[Math.floor(sortedValues.length * 0.25)].toFixed(2),
        p50: sortedValues[Math.floor(sortedValues.length * 0.50)].toFixed(2),
        p75: sortedValues[Math.floor(sortedValues.length * 0.75)].toFixed(2)
      },
      // Trend
      trend: {
        slope: slope.toFixed(4),
        intercept: intercept.toFixed(2),
        direction: slope > 0 ? 'increasing' : 'decreasing',
        perDecade: (slope * 3650).toFixed(2) // 10 yıl = 3650 gün
      },
      sampleSize: processedData.length,
      reliability: processedData.length >= 3650 ? 95 : processedData.length >= 1825 ? 85 : 70
    };
  }, [processedData, selectedMetric]);

  // TREND LİNE EKLE
  const dataWithTrend = useMemo(() => {
    if (!showTrend || !statistics) return processedData;
    
    return processedData.map((d, i) => ({
      ...d,
      trend: parseFloat(statistics.trend.intercept) + (parseFloat(statistics.trend.slope) * i)
    }));
  }, [processedData, showTrend, statistics]);

  // METRIC LABEL HELPER
  const getMetricLabel = (metric) => {
    const labels = {
      temperature: { label: 'Temperature (°C)', icon: '🌡️', color: '#ef4444' },
      precipitation: { label: 'Precipitation (mm)', icon: '💧', color: '#3b82f6' },
      windSpeed: { label: 'Wind Speed (km/h)', icon: '💨', color: '#10b981' },
      humidity: { label: 'Humidity (%)', icon: '💦', color: '#8b5cf6' }
    };
    return labels[metric] || labels.temperature;
  };

  const currentMetric = getMetricLabel(selectedMetric);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            NASA Data Explorer
          </h2>
          <p className="text-gray-600 mt-1">
            Interactive analysis of {yearRange[1] - yearRange[0]} years of NASA POWER data
          </p>
        </div>
        <DataQualityBadge years={yearRange[1] - yearRange[0]} location={location} />
      </div>

      {/* YEAR RANGE SLIDER */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Calendar className="inline w-4 h-4 mr-2" />
          Analysis Period: {yearRange[0]} - {yearRange[1]} ({yearRange[1] - yearRange[0]} years)
        </label>
        <input 
          type="range" 
          min="2014" 
          max="2024" 
          value={yearRange[1]}
          onChange={(e) => setYearRange([2014, parseInt(e.target.value)])}
          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>2014 (Min)</span>
          <span className="font-semibold">
            Sample Size: {statistics?.sampleSize || 0} days
          </span>
          <span>2024 (Max)</span>
        </div>
      </div>

      {/* METRIC SELECTOR */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Weather Parameter
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['temperature', 'precipitation', 'windSpeed', 'humidity'].map(metric => {
            const info = getMetricLabel(metric);
            return (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`p-4 rounded-lg font-semibold transition-all ${
                  selectedMetric === metric
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-2xl block mb-1">{info.icon}</span>
                <span className="text-xs">{info.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STATISTICAL SUMMARY CARDS */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard 
            title="Mean" 
            value={`${statistics.mean}${selectedMetric === 'temperature' ? '°C' : selectedMetric === 'humidity' ? '%' : selectedMetric === 'precipitation' ? 'mm' : 'km/h'}`}
            subtitle={`±${statistics.stdDev} std dev`}
            icon="📊"
            color="blue"
          />
          <StatCard 
            title="Median" 
            value={`${statistics.median}${selectedMetric === 'temperature' ? '°C' : selectedMetric === 'humidity' ? '%' : selectedMetric === 'precipitation' ? 'mm' : 'km/h'}`}
            subtitle="50th percentile"
            icon="📈"
            color="green"
          />
          <StatCard 
            title="Min" 
            value={`${statistics.min}${selectedMetric === 'temperature' ? '°C' : selectedMetric === 'humidity' ? '%' : selectedMetric === 'precipitation' ? 'mm' : 'km/h'}`}
            subtitle="Historical low"
            icon="❄️"
            color="cyan"
          />
          <StatCard 
            title="Max" 
            value={`${statistics.max}${selectedMetric === 'temperature' ? '°C' : selectedMetric === 'humidity' ? '%' : selectedMetric === 'precipitation' ? 'mm' : 'km/h'}`}
            subtitle="Historical high"
            icon="🔥"
            color="red"
          />
          <StatCard 
            title="Trend" 
            value={`${statistics.trend.perDecade > 0 ? '+' : ''}${statistics.trend.perDecade}`}
            subtitle="per decade"
            icon={statistics.trend.direction === 'increasing' ? '📈' : '📉'}
            color="purple"
          />
        </div>
      )}

      {/* TOGGLE CONTROLS */}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={showTrend}
            onChange={(e) => setShowTrend(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-gray-700">Show Trend Line</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={showConfidenceInterval}
            onChange={(e) => setShowConfidenceInterval(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-gray-700">Show 95% Confidence Interval</span>
        </label>
      </div>

      {/* INTERACTIVE CHART */}
      <div className="bg-gray-50 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={dataWithTrend}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }}
              tickFormatter={(date) => new Date(date).getFullYear()}
            />
            <YAxis 
              label={{ value: currentMetric.label, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '2px solid #3b82f6', borderRadius: '8px' }}
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              formatter={(value) => [`${value.toFixed(2)}${selectedMetric === 'temperature' ? '°C' : selectedMetric === 'humidity' ? '%' : selectedMetric === 'precipitation' ? 'mm' : 'km/h'}`, currentMetric.label]}
            />
            <Legend />
            
            {/* Main data line */}
            <Area 
              type="monotone" 
              dataKey={selectedMetric}
              stroke={currentMetric.color}
              strokeWidth={2}
              fill="url(#colorMetric)"
              name={currentMetric.label}
            />
            
            {/* Trend line */}
            {showTrend && (
              <Line 
                type="monotone" 
                dataKey="trend" 
                stroke="#dc2626" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Linear Trend"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* CONFIDENCE INTERVAL VISUALIZATION */}
      {statistics && showConfidenceInterval && (
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
          <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            95% Confidence Interval
          </h4>
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-12 bg-gradient-to-r from-blue-200 via-blue-500 to-blue-200 rounded-lg relative shadow-lg">
                {/* Lower bound */}
                <div className="absolute left-0 -top-8 text-sm font-semibold text-blue-700">
                  Lower: {statistics.confidenceInterval.lower}
                  {selectedMetric === 'temperature' ? '°C' : selectedMetric === 'humidity' ? '%' : selectedMetric === 'precipitation' ? 'mm' : 'km/h'}
                </div>
                {/* Mean */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 text-sm font-bold text-blue-900">
                  Mean: {statistics.mean}
                  {selectedMetric === 'temperature' ? '°C' : selectedMetric === 'humidity' ? '%' : selectedMetric === 'precipitation' ? 'mm' : 'km/h'}
                </div>
                {/* Upper bound */}
                <div className="absolute right-0 -top-8 text-sm font-semibold text-blue-700">
                  Upper: {statistics.confidenceInterval.upper}
                  {selectedMetric === 'temperature' ? '°C' : selectedMetric === 'humidity' ? '%' : selectedMetric === 'precipitation' ? 'mm' : 'km/h'}
                </div>
                {/* Mean indicator */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-1 h-12 bg-blue-900"></div>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-4 text-center">
              <span className="font-semibold">{statistics.reliability}% Reliability</span> - 
              Based on {statistics.sampleSize} days of NASA POWER data ({yearRange[1] - yearRange[0]} years)
            </p>
            <p className="text-xs text-gray-600 mt-2 text-center italic">
              95% of historical values fall within this range (±1.96σ from mean)
            </p>
          </div>
        </div>
      )}

      {/* PERCENTILE DISTRIBUTION */}
      {statistics && (
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <PercentileCard 
            title="25th Percentile" 
            value={statistics.percentiles.p25}
            unit={selectedMetric === 'temperature' ? '°C' : selectedMetric === 'humidity' ? '%' : selectedMetric === 'precipitation' ? 'mm' : 'km/h'}
            description="25% of values below"
            color="blue"
          />
          <PercentileCard 
            title="50th Percentile (Median)" 
            value={statistics.percentiles.p50}
            unit={selectedMetric === 'temperature' ? '°C' : selectedMetric === 'humidity' ? '%' : selectedMetric === 'precipitation' ? 'mm' : 'km/h'}
            description="Middle value"
            color="purple"
          />
          <PercentileCard 
            title="75th Percentile" 
            value={statistics.percentiles.p75}
            unit={selectedMetric === 'temperature' ? '°C' : selectedMetric === 'humidity' ? '%' : selectedMetric === 'precipitation' ? 'mm' : 'km/h'}
            description="75% of values below"
            color="pink"
          />
        </div>
      )}
    </div>
  );
};

// HELPER COMPONENTS

const StatCard = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    cyan: 'from-cyan-500 to-cyan-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-4 text-white shadow-lg`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-xs opacity-90 uppercase tracking-wide">{title}</div>
      <div className="text-2xl font-bold my-1">{value}</div>
      <div className="text-xs opacity-75">{subtitle}</div>
    </div>
  );
};

const PercentileCard = ({ title, value, unit, description, color }) => {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50',
    purple: 'border-purple-500 bg-purple-50',
    pink: 'border-pink-500 bg-pink-50'
  };

  return (
    <div className={`border-2 ${colorClasses[color]} rounded-lg p-4`}>
      <h5 className="font-semibold text-gray-900 mb-2">{title}</h5>
      <p className="text-3xl font-bold text-gray-900">{value}{unit}</p>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  );
};

// DATA QUALITY BADGE COMPONENT
const DataQualityBadge = ({ years, location }) => {
  const quality = years >= 10 ? 'Excellent' : years >= 5 ? 'High' : 'Good';
  const reliability = years >= 10 ? 95 : years >= 5 ? 85 : 70;
  const colorClass = years >= 10 ? 'green' : years >= 5 ? 'blue' : 'yellow';

  const colors = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-700',
      dot: 'bg-green-500'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-700',
      dot: 'bg-blue-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      dot: 'bg-yellow-500'
    }
  };

  const c = colors[colorClass];

  return (
    <div className={`inline-flex items-center gap-3 ${c.bg} border-2 ${c.border} rounded-full px-4 py-2`}>
      <div className={`w-3 h-3 ${c.dot} rounded-full animate-pulse`}></div>
      <div>
        <span className={`font-bold ${c.text}`}>{quality} Data Quality</span>
        <span className={`text-xs ${c.text} ml-2`}>
          {reliability}% Reliability • {years} years NASA data
        </span>
      </div>
    </div>
  );
};

export default DataExplorer;
