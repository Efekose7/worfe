import React from 'react';
import { useWeather } from '../context/WeatherContext';
import ProbabilityCards from './ProbabilityCards';
import WeatherCharts from './WeatherCharts';
import LocationInfo from './LocationInfo';
import DataExplorer from './data/DataExplorer';
import { AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { 
    selectedLocation, 
    probabilities, 
    weatherData,
    loading, 
    error 
  } = useWeather();

  if (!selectedLocation) {
    return (
      <div className="card p-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-nasa-blue to-earth-cyan rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">🌍</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Select a Location</h2>
            <p className="text-white/70">
              Choose a location on the map or search for a specific place to begin your weather analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-nasa-blue to-earth-cyan rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-2xl">⏳</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Analyzing Historical Data</h2>
            <p className="text-white/70">
              Fetching historical weather patterns and calculating probabilities based on past data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <div className="space-y-4">
          <AlertCircle className="w-16 h-16 text-danger-red mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Data</h2>
            <p className="text-white/70 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!probabilities) {
    return (
      <div className="card p-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-nasa-blue to-earth-cyan rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">No Data Available</h2>
            <p className="text-white/70">
              Unable to fetch weather data for the selected location and date.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location and Date Info */}
      <LocationInfo />

      {/* Probability Cards */}
      <ProbabilityCards />

      {/* Interactive NASA Data Explorer */}
      <DataExplorer 
        location={selectedLocation} 
        weatherData={weatherData} 
      />

      {/* Weather Charts */}
      <WeatherCharts />

      {/* Data Attribution */}
      <div className="card p-4">
        <div className="text-center">
          <h3 className="font-semibold text-white mb-2">Data Sources & Attribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
            <div>
              <strong className="text-earth-cyan">Weather Data:</strong>
              <br />
              Open-Meteo Historical Weather API
              <br />
              <a href="https://open-meteo.com" className="text-earth-cyan hover:underline">
                open-meteo.com
              </a>
            </div>
            <div>
              <strong className="text-earth-cyan">NASA Data:</strong>
              <br />
              Complementary Earth Science datasets
              <br />
              <a href="https://disc.gsfc.nasa.gov" className="text-earth-cyan hover:underline">
                GES DISC
              </a>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/60">
            Analysis based on {probabilities.totalDays} days of historical data from {probabilities.dateRange.start} to {probabilities.dateRange.end}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
