import React from 'react';
import { useWeather } from '../context/WeatherContext';
import ProbabilityCards from './ProbabilityCards';
import WeatherCharts from './WeatherCharts';
import DataProvenance from './DataProvenance';
import { AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { 
    selectedLocation, 
    probabilities, 
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
    <div className="space-y-6" data-section="weather-data">
      {/* Probability Cards */}
      <ProbabilityCards />

      {/* Weather Charts */}
      <WeatherCharts />

      {/* Data Provenance & Sources */}
      <DataProvenance />
    </div>
  );
};

export default Dashboard;
