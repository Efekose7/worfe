import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useWeather } from '../context/WeatherContext';
import { BarChart3, Thermometer, Wind, Droplets } from 'lucide-react';

const WeatherCharts = () => {
  const { historicalData, probabilities, selectedDate } = useWeather();
  const [activeChart, setActiveChart] = useState('temperature');

  if (!historicalData || !probabilities) return null;

  const prepareTemperatureData = () => {
    const years = [...new Set(historicalData.rawData.map(d => new Date(d.date).getFullYear()))].sort();
    return years.map(year => {
      const yearData = historicalData.rawData.filter(d => new Date(d.date).getFullYear() === year);
      if (yearData.length === 0) return null;
      
      const temps = yearData.map(d => d.temperature);
      return {
        year,
        maxTemp: Math.max(...temps.map(t => t.max)),
        minTemp: Math.min(...temps.map(t => t.min)),
        avgTemp: temps.reduce((sum, t) => sum + t.avg, 0) / temps.length,
        dataPoints: yearData.length
      };
    }).filter(Boolean);
  };

  const preparePrecipitationData = () => {
    const years = [...new Set(historicalData.rawData.map(d => new Date(d.date).getFullYear()))].sort();
    return years.map(year => {
      const yearData = historicalData.rawData.filter(d => new Date(d.date).getFullYear() === year);
      if (yearData.length === 0) return null;
      
      const precip = yearData.map(d => d.precipitation);
      return {
        year,
        maxPrecip: Math.max(...precip),
        avgPrecip: precip.reduce((sum, p) => sum + p, 0) / precip.length,
        wetDays: precip.filter(p => p > 0).length,
        dataPoints: yearData.length
      };
    }).filter(Boolean);
  };

  const prepareWindData = () => {
    const years = [...new Set(historicalData.rawData.map(d => new Date(d.date).getFullYear()))].sort();
    return years.map(year => {
      const yearData = historicalData.rawData.filter(d => new Date(d.date).getFullYear() === year);
      if (yearData.length === 0) return null;
      
      const wind = yearData.map(d => d.windSpeed);
      return {
        year,
        maxWind: Math.max(...wind),
        avgWind: wind.reduce((sum, w) => sum + w, 0) / wind.length,
        windyDays: wind.filter(w => w > 40).length,
        dataPoints: yearData.length
      };
    }).filter(Boolean);
  };

  const prepareBoxPlotData = () => {
    const tempData = historicalData.rawData.map(d => d.temperature);
    const precipData = historicalData.rawData.map(d => d.precipitation);
    const windData = historicalData.rawData.map(d => d.windSpeed);

    return [
      {
        name: 'Temperature Max',
        data: tempData.map(t => t.max),
        color: '#EF476F'
      },
      {
        name: 'Temperature Min', 
        data: tempData.map(t => t.min),
        color: '#4CC9F0'
      },
      {
        name: 'Precipitation',
        data: precipData,
        color: '#4CC9F0'
      },
      {
        name: 'Wind Speed',
        data: windData,
        color: '#FFD60A'
      }
    ];
  };

  const temperatureData = prepareTemperatureData();
  const precipitationData = preparePrecipitationData();
  const windData = prepareWindData();
  const boxPlotData = prepareBoxPlotData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="card p-3">
          <p className="font-semibold text-white">{`Year: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value.toFixed(1)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartTabs = [
    { id: 'temperature', label: 'Temperature Trends', icon: Thermometer },
    { id: 'precipitation', label: 'Precipitation Analysis', icon: Droplets },
    { id: 'wind', label: 'Wind Patterns', icon: Wind },
    { id: 'distribution', label: 'Data Distribution', icon: BarChart3 }
  ];

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Historical Weather Patterns</h2>
        <p className="text-white/70 text-sm">
          Detailed analysis of what happened on this date in previous years
          <br />
          <span className="text-earth-cyan text-xs">📈 Shows historical trends, not future predictions</span>
        </p>
      </div>

      {/* Chart Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {chartTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeChart === tab.id
                  ? 'bg-earth-cyan text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-80 bg-transparent">
        <ResponsiveContainer width="100%" height="100%">
          {activeChart === 'temperature' && (
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                dataKey="year" 
                stroke="#ffffff60"
                fontSize={12}
              />
              <YAxis 
                stroke="#ffffff60"
                fontSize={12}
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="maxTemp" 
                stroke="#EF476F" 
                strokeWidth={2}
                name="Max Temperature"
                dot={{ fill: '#EF476F', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="minTemp" 
                stroke="#4CC9F0" 
                strokeWidth={2}
                name="Min Temperature"
                dot={{ fill: '#4CC9F0', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="avgTemp" 
                stroke="#06D6A0" 
                strokeWidth={2}
                name="Average Temperature"
                dot={{ fill: '#06D6A0', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          )}

          {activeChart === 'precipitation' && (
            <BarChart data={precipitationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                dataKey="year" 
                stroke="#ffffff60"
                fontSize={12}
              />
              <YAxis 
                stroke="#ffffff60"
                fontSize={12}
                label={{ value: 'Precipitation (mm)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="maxPrecip" 
                fill="#4CC9F0" 
                name="Max Precipitation"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="avgPrecip" 
                fill="#06D6A0" 
                name="Average Precipitation"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}

          {activeChart === 'wind' && (
            <LineChart data={windData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                dataKey="year" 
                stroke="#ffffff60"
                fontSize={12}
              />
              <YAxis 
                stroke="#ffffff60"
                fontSize={12}
                label={{ value: 'Wind Speed (km/h)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="maxWind" 
                stroke="#FFD60A" 
                strokeWidth={2}
                name="Max Wind Speed"
                dot={{ fill: '#FFD60A', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="avgWind" 
                stroke="#06D6A0" 
                strokeWidth={2}
                name="Average Wind Speed"
                dot={{ fill: '#06D6A0', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          )}

          {activeChart === 'distribution' && (
            <div className="space-y-6">
              {boxPlotData.map((dataset, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="text-white font-medium">{dataset.name}</h4>
                  <div className="h-16 bg-white/5 rounded-lg p-4 flex items-center">
                    <div className="flex-1">
                      <div className="text-xs text-white/60 mb-1">Distribution</div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-white/80">
                          Min: {Math.min(...dataset.data).toFixed(1)}
                        </div>
                        <div className="text-sm text-white/80">
                          Max: {Math.max(...dataset.data).toFixed(1)}
                        </div>
                        <div className="text-sm text-white/80">
                          Avg: {(dataset.data.reduce((a, b) => a + b, 0) / dataset.data.length).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <h3 className="font-semibold text-white mb-3">Chart Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-white/80">Data Points:</div>
            <div className="text-white font-medium">{historicalData.rawData.length} days</div>
          </div>
          <div className="space-y-1">
            <div className="text-white/80">Year Range:</div>
            <div className="text-white font-medium">
              {Math.min(...historicalData.rawData.map(d => new Date(d.date).getFullYear()))} - 
              {Math.max(...historicalData.rawData.map(d => new Date(d.date).getFullYear()))}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-white/80">Target Date:</div>
            <div className="text-white font-medium">{selectedDate}</div>
          </div>
          <div className="space-y-1">
            <div className="text-white/80">Analysis Window:</div>
            <div className="text-white font-medium">±7 days</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCharts;
