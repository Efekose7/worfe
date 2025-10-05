import React from 'react';
import { Thermometer, Wind, Droplets, Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

const ProbabilityCard = ({ 
  title, 
  icon: Icon, 
  probability, 
  threshold, 
  unit, 
  trend, 
  trendValue,
  color, 
  description 
}) => {
  const getTrendIcon = (trend) => {
    if (trend.includes('↑↑')) return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (trend.includes('↑')) return <TrendingUp className="w-4 h-4 text-orange-400" />;
    if (trend.includes('↓↓')) return <TrendingDown className="w-4 h-4 text-blue-400" />;
    if (trend.includes('↓')) return <TrendingDown className="w-4 h-4 text-cyan-400" />;
    return <Minus className="w-4 h-4 text-white/60" />;
  };

  const getTrendText = (trend) => {
    return trend;
  };

  const getTrendColor = (trend) => {
    if (trend.includes('↑↑')) return 'text-red-400';
    if (trend.includes('↑')) return 'text-orange-400';
    if (trend.includes('↓↓')) return 'text-blue-400';
    if (trend.includes('↓')) return 'text-cyan-400';
    return 'text-white/60';
  };

  return (
    <div className={`probability-card ${color} hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5" />
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          {getTrendIcon(trend)}
          <span className={`text-xs ${getTrendColor(trend)}`}>
            {getTrendText(trend)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">
            {probability.percentage.toFixed(1)}%
          </div>
          <div className="text-sm text-white/70">
            {probability.count} of {probability.total} days
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/80">Threshold:</span>
            <span className="text-white font-medium">
              {threshold > 0 ? '>' : '<'}{Math.abs(threshold)}{unit}
            </span>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                color === 'bg-danger-red/20' ? 'bg-danger-red' :
                color === 'bg-earth-cyan/20' ? 'bg-earth-cyan' :
                color === 'bg-warning-yellow/20' ? 'bg-warning-yellow' :
                color === 'bg-nebula-purple/20' ? 'bg-nebula-purple' :
                'bg-success-green'
              }`}
              style={{ width: `${Math.min(probability.percentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-white/60 text-center mb-2">
          {description}
        </div>
        
        <div className="text-center">
          <div className={`text-xs font-medium ${
            trend.includes('↑↑') ? 'text-red-400' :
            trend.includes('↑') ? 'text-orange-400' :
            trend.includes('↓↓') ? 'text-blue-400' :
            trend.includes('↓') ? 'text-cyan-400' :
            'text-white/60'
          }`}>
            {trend}
          </div>
          <div className="text-xs text-white/50">
            {trendValue} vs previous decade
          </div>
        </div>
      </div>
    </div>
  );
};

const ProbabilityCards = () => {
  const { probabilities, thresholds, loading } = useWeather();

  console.log('=== ProbabilityCards DEBUG ===');
  console.log('probabilities:', probabilities);
  console.log('thresholds:', thresholds);
  console.log('loading:', loading);
  
  if (probabilities) {
    console.log('probabilities.probabilities:', probabilities.probabilities);
    console.log('probabilities.climateTrends:', probabilities.climateTrends);
    console.log('probabilities.totalDays:', probabilities.totalDays);
  }
  console.log('=== END ProbabilityCards DEBUG ===');

  if (loading) {
    return (
      <div className="card p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-cyan mx-auto mb-4"></div>
        <p className="text-white/80">Analyzing Historical Data</p>
        <p className="text-sm text-white/60 mt-2">Fetching historical weather patterns and calculating probabilities based on past data...</p>
      </div>
    );
  }

  if (!loading && !probabilities) {
    return (
      <div className="card p-6 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
        <p className="text-white/60">Unable to fetch weather data for the selected location and date</p>
      </div>
    );
  }

  if (!probabilities) {
    return (
      <div className="card p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-cyan mx-auto mb-4"></div>
        <p className="text-white/80">Analyzing Historical Data</p>
        <p className="text-sm text-white/60 mt-2">Fetching historical weather patterns and calculating probabilities based on past data...</p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Very Hot',
      icon: Thermometer,
      probability: probabilities.probabilities.veryHot,
      threshold: thresholds.veryHot,
      unit: '°C',
      trend: probabilities.climateTrends?.veryHot?.trend || 'stable',
      trendValue: probabilities.climateTrends?.veryHot?.value || '±0%',
      color: 'bg-danger-red/20 border-danger-red/30',
      description: `Temperatures above ${thresholds.veryHot}°C`
    },
    {
      title: 'Very Cold',
      icon: Thermometer,
      probability: probabilities.probabilities.veryCold,
      threshold: -thresholds.veryCold,
      unit: '°C',
      trend: probabilities.climateTrends?.veryCold?.trend || 'stable',
      trendValue: probabilities.climateTrends?.veryCold?.value || '±0%',
      color: 'bg-earth-cyan/20 border-earth-cyan/30',
      description: `Temperatures below ${thresholds.veryCold}°C`
    },
    {
      title: 'Very Windy',
      icon: Wind,
      probability: probabilities.probabilities.veryWindy,
      threshold: thresholds.veryWindy,
      unit: ' km/h',
      trend: probabilities.climateTrends?.veryWindy?.trend || 'stable',
      trendValue: probabilities.climateTrends?.veryWindy?.value || '±0%',
      color: 'bg-warning-yellow/20 border-warning-yellow/30',
      description: `Wind speeds above ${thresholds.veryWindy} km/h`
    },
    {
      title: 'Very Wet',
      icon: Droplets,
      probability: probabilities.probabilities.veryWet,
      threshold: thresholds.veryWet,
      unit: ' mm/day',
      trend: probabilities.climateTrends?.veryWet?.trend || 'stable',
      trendValue: probabilities.climateTrends?.veryWet?.value || '±0%',
      color: 'bg-earth-cyan/20 border-earth-cyan/30',
      description: `Precipitation above ${thresholds.veryWet} mm/day`
    },
    {
      title: 'Very Uncomfortable',
      icon: Eye,
      probability: probabilities.probabilities.veryUncomfortable,
      threshold: thresholds.veryUncomfortable,
      unit: '°C',
      trend: probabilities.climateTrends?.veryUncomfortable?.trend || 'stable',
      trendValue: probabilities.climateTrends?.veryUncomfortable?.value || '±0%',
      color: 'bg-nebula-purple/20 border-nebula-purple/30',
      description: `Heat index above ${thresholds.veryUncomfortable}°C`
    }
  ];

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Historical Weather Analysis</h2>
        <p className="text-white/70 text-sm">
          Based on historical data: "What happened on this date in the past?"
          <br />
          <span className="text-earth-cyan text-xs">⚠️ This is NOT a weather forecast - it's historical probability analysis</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <ProbabilityCard key={index} {...card} />
        ))}
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="text-center">
          <h3 className="font-semibold text-white mb-2">Historical Data Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-white/80">Historical Days Analyzed:</span>
              <div className="text-white font-medium">{probabilities.totalDays} days</div>
            </div>
            <div>
              <span className="text-white/80">Data Period:</span>
              <div className="text-white font-medium">
                {probabilities.dateRange.start} - {probabilities.dateRange.end}
              </div>
            </div>
            <div>
              <span className="text-white/80">Most Common Historical Condition:</span>
              <div className="text-white font-medium">
                {Object.entries(probabilities.probabilities)
                  .sort(([,a], [,b]) => b.percentage - a.percentage)[0][0]
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                }
              </div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-earth-cyan/10 rounded-lg border border-earth-cyan/20">
            <p className="text-xs text-earth-cyan">
              📊 Analysis based on historical weather patterns from the past {probabilities.totalDays} days 
              on this date. This shows what happened historically, not what will happen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProbabilityCards;
