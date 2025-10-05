import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         ScatterChart, Scatter, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Droplets, Wind } from 'lucide-react';

const StatisticalAnalysis = ({ statisticalData, eventType }) => {
  if (!statisticalData) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Statistical Analysis</h3>
          <p className="text-gray-400">Select a location and date to view detailed statistical analysis</p>
        </div>
      </div>
    );
  }

  const { temperature, precipitation, wind, patterns, confidence, visualization } = statisticalData;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Temperature Stats */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Temperature Analysis</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Mean:</span>
              <span className="text-white font-semibold">{temperature?.mean}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Range:</span>
              <span className="text-white font-semibold">{temperature?.min}°C - {temperature?.max}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Std Dev:</span>
              <span className="text-white font-semibold">{temperature?.stdDev}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">95% CI:</span>
              <span className="text-white font-semibold">
                {confidence?.temperature?.lower}°C - {confidence?.temperature?.upper}°C
              </span>
            </div>
          </div>
        </div>

        {/* Precipitation Stats */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Precipitation Analysis</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Rain Probability:</span>
              <span className="text-white font-semibold">{precipitation?.rainProbability}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Rainfall:</span>
              <span className="text-white font-semibold">{precipitation?.averageRainfall}mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Heavy Rain:</span>
              <span className="text-white font-semibold">{precipitation?.heavyRainProbability}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dry Days:</span>
              <span className="text-white font-semibold">{precipitation?.dryDays}</span>
            </div>
          </div>
        </div>

        {/* Wind Stats */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Wind className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Wind Analysis</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Mean Speed:</span>
              <span className="text-white font-semibold">{wind?.mean} km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Speed:</span>
              <span className="text-white font-semibold">{wind?.max} km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Calm Days:</span>
              <span className="text-white font-semibold">{wind?.calmDays}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Windy Days:</span>
              <span className="text-white font-semibold">{wind?.windyDays}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Trends */}
      {patterns && (
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white mb-6">Historical Trends (10+ Years)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {patterns.trendDirection?.temperature === 'Warming' ? (
                  <TrendingUp className="w-5 h-5 text-red-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-blue-400" />
                )}
                <span className="text-white font-semibold">Temperature</span>
              </div>
              <p className="text-gray-400 text-sm">
                {patterns.trendDirection?.temperature || 'Stable'}
              </p>
              <p className="text-gray-500 text-xs">
                Slope: {patterns.trends?.temperature?.slope}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {patterns.trendDirection?.precipitation === 'Wetter' ? (
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-orange-400" />
                )}
                <span className="text-white font-semibold">Precipitation</span>
              </div>
              <p className="text-gray-400 text-sm">
                {patterns.trendDirection?.precipitation || 'Stable'}
              </p>
              <p className="text-gray-500 text-xs">
                Slope: {patterns.trends?.precipitation?.slope}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {patterns.trendDirection?.wind === 'Windier' ? (
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-green-400" />
                )}
                <span className="text-white font-semibold">Wind Speed</span>
              </div>
              <p className="text-gray-400 text-sm">
                {patterns.trendDirection?.wind || 'Stable'}
              </p>
              <p className="text-gray-500 text-xs">
                Slope: {patterns.trends?.windSpeed?.slope}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Visualizations */}
      {visualization && (
        <div className="space-y-6">
          {/* Temperature Distribution */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-white mb-6">Temperature Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visualization.temperatureHistogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="range" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Precipitation Distribution */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-white mb-6">Precipitation Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visualization.precipitationHistogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="range" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Correlation Analysis */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-white mb-6">Temperature vs Precipitation Correlation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={visualization.correlation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="temperature" 
                  name="Temperature (°C)"
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  dataKey="precipitation" 
                  name="Precipitation (mm)"
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Scatter dataKey="precipitation" fill="#10B981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Time Series Analysis */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-white mb-6">Historical Time Series (Same Date)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visualization.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="year" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Temperature (°C)"
                />
                <Line 
                  type="monotone" 
                  dataKey="precipitation" 
                  stroke="#06B6D4" 
                  strokeWidth={2}
                  name="Precipitation (mm)"
                />
                <Line 
                  type="monotone" 
                  dataKey="windSpeed" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Wind Speed (km/h)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Statistical Summary */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-6">Statistical Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Data Quality</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Sample Size:</span>
                <span className="text-white font-semibold">{statisticalData.sampleSize} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reliability:</span>
                <span className={`font-semibold ${
                  statisticalData.reliability === 'high' ? 'text-green-400' : 
                  statisticalData.reliability === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {statisticalData.reliability === 'high' ? 'High (95%)' : 
                   statisticalData.reliability === 'moderate' ? 'Medium (85%)' : 'Low (70%)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date Range:</span>
                <span className="text-white font-semibold">
                  {statisticalData.dateRange?.start?.getFullYear()} - {statisticalData.dateRange?.end?.getFullYear()}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Confidence Intervals (95%)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Temperature:</span>
                <span className="text-white font-semibold">
                  {confidence?.temperature?.lower}°C - {confidence?.temperature?.upper}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Precipitation:</span>
                <span className="text-white font-semibold">
                  {confidence?.precipitation?.lower}mm - {confidence?.precipitation?.upper}mm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Wind Speed:</span>
                <span className="text-white font-semibold">
                  {confidence?.windSpeed?.lower}km/h - {confidence?.windSpeed?.upper}km/h
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticalAnalysis;
