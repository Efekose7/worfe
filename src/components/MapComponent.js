import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useWeather } from '../context/WeatherContext';
import { MapPin, Search, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom NASA-themed marker icon
const nasaIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#0B3D91"/>
      <circle cx="12.5" cy="12.5" r="6" fill="#4CC9F0"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Map click handler component
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({
        lat: lat,
        lng: lng,
        name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°W`
      });
    }
  });
  return null;
}

// Location search component
function LocationSearch({ onLocationSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchLocation = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`
      );
      const data = await response.json();
      setResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching location:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchLocation(query);
  };

  const selectLocation = (location) => {
    onLocationSelect({
      lat: location.latitude,
      lng: location.longitude,
      name: location.name
    });
    setQuery(location.name);
    setShowResults(false);
  };

  return (
    <div className="relative mb-4">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a location..."
            className="input-field w-full pr-10"
            onFocus={() => setShowResults(results.length > 0)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
        </div>
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="btn-primary flex items-center space-x-2"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-deep-space/95 backdrop-blur-sm border border-white/30 rounded-lg shadow-xl z-10">
          {results.map((location, index) => (
            <button
              key={index}
              onClick={() => selectLocation(location)}
              className="w-full text-left px-4 py-3 hover:bg-white/20 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="font-medium text-white">{location.name}</div>
              <div className="text-sm text-white/90">
                {location.country} • {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°W
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const MapComponent = () => {
  const { selectedLocation, setLocation } = useWeather();
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC

  // Update map center when location changes
  useEffect(() => {
    if (selectedLocation) {
      setMapCenter([selectedLocation.lat, selectedLocation.lng]);
    }
  }, [selectedLocation]);

  const handleLocationSelect = (location) => {
    setLocation(location);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="w-5 h-5 text-earth-cyan" />
        <h2 className="text-lg font-semibold text-white">Location Selection</h2>
      </div>

      <LocationSearch onLocationSelect={handleLocationSelect} />

      <div className="h-64 rounded-lg overflow-hidden border border-white/20">
        <MapContainer
          center={mapCenter}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={nasaIcon}>
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-nasa-blue">{selectedLocation.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lng.toFixed(4)}°W
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {selectedLocation && (
        <div className="card p-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-earth-cyan" />
            <div>
              <div className="font-medium text-white">{selectedLocation.name}</div>
              <div className="text-sm text-white/70">
                {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lng.toFixed(4)}°W
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-white/60 text-center">
        Click on the map or search to select a location
      </div>
    </div>
  );
};

export default MapComponent;
