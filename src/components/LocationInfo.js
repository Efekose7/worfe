import React from 'react';
import { MapPin, Calendar, Clock, Thermometer } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { format, parseISO } from 'date-fns';

const LocationInfo = () => {
  const { selectedLocation, selectedDate, weatherData } = useWeather();

  // Debug logging
  console.log('=== LocationInfo DEBUG ===');
  console.log('selectedLocation:', selectedLocation);
  console.log('selectedDate:', selectedDate);
  console.log('weatherData:', weatherData);
  console.log('weatherData type:', typeof weatherData);
  console.log('weatherData is null?', weatherData === null);
  console.log('weatherData is undefined?', weatherData === undefined);
  
  if (weatherData && weatherData.current) {
    console.log('weatherData.current:', weatherData.current);
    console.log('weatherData.current type:', typeof weatherData.current);
    console.log('weatherData.current is null?', weatherData.current === null);
    console.log('weatherData.current is undefined?', weatherData.current === undefined);
    
    console.log('weatherData.current.temperature_2m:', weatherData.current.temperature_2m);
    console.log('weatherData.current.relative_humidity_2m:', weatherData.current.relative_humidity_2m);
    console.log('weatherData.current.wind_speed_10m:', weatherData.current.wind_speed_10m);
    console.log('weatherData.current.precipitation:', weatherData.current.precipitation);
  }
  console.log('=== END LocationInfo DEBUG ===');

  if (!selectedLocation) return null;

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMMM do, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="card p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-nasa-blue to-earth-cyan rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{selectedLocation.name}</h2>
              <p className="text-sm text-white/70">
                {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lng.toFixed(4)}°W
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-earth-cyan" />
              <span className="text-white/80">Target Date:</span>
              <span className="text-white font-medium">{formatDate(selectedDate)}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-earth-cyan" />
              <span className="text-white/80">Analysis Date:</span>
              <span className="text-white font-medium">{formatDate(new Date().toISOString())}</span>
            </div>
          </div>
        </div>

        {/* Current Weather (if available) */}
        {weatherData && weatherData.current && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-warning-yellow to-danger-red rounded-lg flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Current Conditions</h3>
                <p className="text-sm text-white/70">Real-time weather data</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/80">Temperature:</span>
                <div className="text-white font-medium">
                  {(() => {
                    const temp = weatherData.current.temperature_2m;
                    console.log('RENDERING temperature:', temp);
                    return temp !== null && temp !== undefined ? `${temp}°C` : 'N/A';
                  })()}
                </div>
              </div>
              <div>
                <span className="text-white/80">Humidity:</span>
                <div className="text-white font-medium">
                  {(() => {
                    const humidity = weatherData.current.relative_humidity_2m;
                    console.log('RENDERING humidity:', humidity);
                    return humidity !== null && humidity !== undefined ? `${humidity}%` : 'N/A';
                  })()}
                </div>
              </div>
              <div>
                <span className="text-white/80">Wind Speed:</span>
                <div className="text-white font-medium">
                  {(() => {
                    const windSpeed = weatherData.current.wind_speed_10m;
                    console.log('RENDERING windSpeed:', windSpeed);
                    return windSpeed !== null && windSpeed !== undefined ? `${windSpeed} km/h` : 'N/A';
                  })()}
                </div>
              </div>
              <div>
                <span className="text-white/80">Precipitation:</span>
                <div className="text-white font-medium">
                  {(() => {
                    const precipitation = weatherData.current.precipitation;
                    console.log('RENDERING precipitation:', precipitation);
                    return precipitation !== null && precipitation !== undefined ? `${precipitation} mm` : 'N/A';
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationInfo;
