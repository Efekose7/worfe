import React, { useState } from 'react';
import { Calendar, Settings, Download, Thermometer, Wind, Droplets, Eye } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { weatherService } from '../services/weatherService';

const Controls = () => {
  const { 
    selectedDate, 
    setDate, 
    thresholds, 
    updateThresholds, 
    settings, 
    updateSettings,
    selectedLocation,
    weatherData,
    probabilities
  } = useWeather();

  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    if (!weatherData || !probabilities || !selectedLocation) return;
    
    setIsExporting(true);
    try {
      const csvData = weatherService.exportToCSV(weatherData, probabilities, selectedLocation);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-analysis-${selectedLocation.name.replace(/\s+/g, '-')}-${selectedDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    if (!weatherData || !probabilities || !selectedLocation) return;
    
    setIsExporting(true);
    try {
      const jsonData = weatherService.exportToJSON(weatherData, probabilities, selectedLocation);
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-analysis-${selectedLocation.name.replace(/\s+/g, '-')}-${selectedDate}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Selection */}
      <div className="card p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-5 h-5 text-earth-cyan" />
          <h3 className="font-semibold text-white">Date Selection</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/80 mb-1">Target Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setDate(e.target.value)}
              className="input-field w-full"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="text-xs text-white/60">
            Select a future date to analyze historical weather patterns
          </div>
        </div>
      </div>

      {/* Threshold Settings */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-earth-cyan" />
            <h3 className="font-semibold text-white">Weather Thresholds</h3>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-sm text-earth-cyan hover:text-earth-cyan/80 transition-colors"
          >
            {showSettings ? 'Hide' : 'Customize'}
          </button>
        </div>

        {showSettings && (
          <div className="space-y-4 animate-fade-in">
            {/* Very Hot Threshold */}
            <div>
              <label className="flex items-center space-x-2 text-sm text-white/80 mb-2">
                <Thermometer className="w-4 h-4 text-danger-red" />
                <span>Very Hot (°C)</span>
              </label>
              <input
                type="number"
                value={thresholds.veryHot}
                onChange={(e) => updateThresholds({ veryHot: parseFloat(e.target.value) })}
                className="input-field w-full"
                min="0"
                max="50"
                step="0.1"
              />
            </div>

            {/* Very Cold Threshold */}
            <div>
              <label className="flex items-center space-x-2 text-sm text-white/80 mb-2">
                <Thermometer className="w-4 h-4 text-earth-cyan" />
                <span>Very Cold (°C)</span>
              </label>
              <input
                type="number"
                value={thresholds.veryCold}
                onChange={(e) => updateThresholds({ veryCold: parseFloat(e.target.value) })}
                className="input-field w-full"
                min="-50"
                max="20"
                step="0.1"
              />
            </div>

            {/* Very Windy Threshold */}
            <div>
              <label className="flex items-center space-x-2 text-sm text-white/80 mb-2">
                <Wind className="w-4 h-4 text-warning-yellow" />
                <span>Very Windy (km/h)</span>
              </label>
              <input
                type="number"
                value={thresholds.veryWindy}
                onChange={(e) => updateThresholds({ veryWindy: parseFloat(e.target.value) })}
                className="input-field w-full"
                min="0"
                max="100"
                step="1"
              />
            </div>

            {/* Very Wet Threshold */}
            <div>
              <label className="flex items-center space-x-2 text-sm text-white/80 mb-2">
                <Droplets className="w-4 h-4 text-earth-cyan" />
                <span>Very Wet (mm/day)</span>
              </label>
              <input
                type="number"
                value={thresholds.veryWet}
                onChange={(e) => updateThresholds({ veryWet: parseFloat(e.target.value) })}
                className="input-field w-full"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            {/* Very Uncomfortable Threshold */}
            <div>
              <label className="flex items-center space-x-2 text-sm text-white/80 mb-2">
                <Eye className="w-4 h-4 text-nebula-purple" />
                <span>Very Uncomfortable (Heat Index °C)</span>
              </label>
              <input
                type="number"
                value={thresholds.veryUncomfortable}
                onChange={(e) => updateThresholds({ veryUncomfortable: parseFloat(e.target.value) })}
                className="input-field w-full"
                min="20"
                max="60"
                step="0.1"
              />
            </div>
          </div>
        )}

        {!showSettings && (
          <div className="space-y-2 text-sm text-white/70">
            <div>🌡️ Hot: &gt;{thresholds.veryHot}°C</div>
            <div>❄️ Cold: &lt;{thresholds.veryCold}°C</div>
            <div>💨 Windy: &gt;{thresholds.veryWindy} km/h</div>
            <div>🌧️ Wet: &gt;{thresholds.veryWet} mm/day</div>
            <div>😰 Uncomfortable: &gt;{thresholds.veryUncomfortable}°C heat index</div>
          </div>
        )}
      </div>

      {/* Analysis Settings */}
      <div className="card p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Settings className="w-5 h-5 text-earth-cyan" />
          <h3 className="font-semibold text-white">Analysis Settings</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/80 mb-1">Years of Data</label>
            <select
              value={settings.yearsOfData}
              onChange={(e) => updateSettings({ yearsOfData: parseInt(e.target.value) })}
              className="select-field w-full"
            >
              <option value="5">5 years (2019-2024)</option>
              <option value="7">7 years (2017-2024)</option>
              <option value="10">10 years (2015-2024)</option>
              <option value="9">9 years (2016-2024)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-white/80 mb-1">Date Window (±days)</label>
            <select
              value={settings.dateWindow}
              onChange={(e) => updateSettings({ dateWindow: parseInt(e.target.value) })}
              className="select-field w-full"
            >
              <option value="3">±3 days</option>
              <option value="7">±7 days</option>
              <option value="14">±14 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Download className="w-5 h-5 text-earth-cyan" />
          <h3 className="font-semibold text-white">Export Data</h3>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={handleExportCSV}
            disabled={!weatherData || !probabilities || isExporting}
            className="btn-secondary w-full flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Download CSV'}</span>
          </button>
          
          <button
            onClick={handleExportJSON}
            disabled={!weatherData || !probabilities || isExporting}
            className="btn-secondary w-full flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Download JSON'}</span>
          </button>
        </div>
        
        {(!weatherData || !probabilities) && (
          <div className="text-xs text-white/60 mt-2">
            Select a location and date to enable export
          </div>
        )}
      </div>
    </div>
  );
};

export default Controls;
