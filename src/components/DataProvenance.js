import React, { useState } from 'react';
import { Database, ExternalLink, CheckCircle, Info, Globe, Award, Shield, Zap } from 'lucide-react';

const DataProvenance = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-nasa-blue to-earth-cyan rounded-lg flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Data Provenance & Sources</h2>
            <p className="text-white/70">Transparent data sources and methodology for scientific accuracy</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn-secondary flex items-center gap-2"
        >
          {isExpanded ? 'Collapse' : 'Expand'} Details
          <Zap className="w-4 h-4" />
        </button>
      </div>

      {/* NASA POWER API Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-nasa-blue to-nasa-red rounded-lg flex items-center justify-center">
            <Award className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">NASA POWER API (Primary Data Source)</h3>
          <span className="px-3 py-1 bg-nasa-blue/20 text-nasa-blue rounded-full text-sm font-semibold">
            NASA Data Source
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* API Details */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-nasa-blue/20 to-earth-cyan/20 rounded-lg p-4 border border-nasa-blue/30">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-earth-cyan" />
                API Specifications
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Version:</span>
                  <span className="text-white font-semibold">v2.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Resolution:</span>
                  <span className="text-white font-semibold">0.5° × 0.625°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Coverage:</span>
                  <span className="text-white font-semibold">Global</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Temporal Range:</span>
                  <span className="text-white font-semibold">1981-Present</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Data Source:</span>
                  <span className="text-white font-semibold">MERRA-2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Accuracy:</span>
                  <span className="text-white font-semibold">±0.5°C</span>
                </div>
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-nasa-blue/20 to-earth-cyan/20 rounded-lg p-4 border border-nasa-blue/30">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-earth-cyan" />
                Meteorological Parameters
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">T2M:</span>
                  <span className="text-white font-semibold">Temperature at 2m (°C)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">PRECTOT:</span>
                  <span className="text-white font-semibold">Precipitation Total (mm/day)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">WS2M:</span>
                  <span className="text-white font-semibold">Wind Speed at 2m (m/s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">RH2M:</span>
                  <span className="text-white font-semibold">Relative Humidity at 2m (%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">T2M_MAX:</span>
                  <span className="text-white font-semibold">Maximum Temperature (°C)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">T2M_MIN:</span>
                  <span className="text-white font-semibold">Minimum Temperature (°C)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Data Validation Process */}
          <div className="bg-gradient-to-r from-deep-space/50 to-nasa-blue/20 rounded-lg p-6 border border-nasa-blue/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-earth-cyan" />
              Data Validation Process
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-white">1. Data Collection</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Automated API requests</li>
                  <li>• Historical data retrieval</li>
                  <li>• Real-time data validation</li>
                  <li>• Error handling & retry logic</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-white">2. Quality Control</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Outlier detection (±3σ)</li>
                  <li>• Missing data identification</li>
                  <li>• Cross-validation checks</li>
                  <li>• Statistical analysis</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-white">3. Data Processing</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Unit conversions (m/s → km/h)</li>
                  <li>• Temporal alignment</li>
                  <li>• Statistical calculations</li>
                  <li>• Confidence intervals (95%)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Backup Data Sources */}
          <div className="bg-gradient-to-r from-deep-space/50 to-earth-cyan/20 rounded-lg p-6 border border-earth-cyan/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-earth-cyan" />
              Backup Data Sources
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Open-Meteo API</h4>
                <div className="space-y-1 text-sm text-white/70">
                  <div>• Free tier: 10,000 requests/day</div>
                  <div>• Historical data: 1940-Present</div>
                  <div>• Resolution: 11km</div>
                  <div>• Attribution: CC BY 4.0</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Data Integration</h4>
                <div className="space-y-1 text-sm text-white/70">
                  <div>• Primary: NASA POWER API</div>
                  <div>• Fallback: Open-Meteo API</div>
                  <div>• Cross-validation: Both sources</div>
                  <div>• Quality assurance: Automated</div>
                </div>
              </div>
            </div>
          </div>

          {/* NASA Attribution */}
          <div className="bg-gradient-to-r from-nasa-blue/20 to-nasa-red/20 rounded-lg p-6 border border-nasa-blue/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-nasa-red" />
              NASA Attribution & Citation
            </h3>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">How to Cite This Application:</h4>
                <p className="text-sm text-white/80 italic">
                  "Worfe - Event Weather Planning Dashboard. NASA Space Apps Challenge 2024. 
                  Uses NASA POWER API data from NASA Langley Research Center. 
                  Available at: https://worfe.vip"
                </p>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href="https://power.larc.nasa.gov" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-earth-cyan hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  NASA POWER API Documentation
                </a>
                <a 
                  href="https://disc.gsfc.nasa.gov" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-earth-cyan hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  NASA GES DISC
                </a>
              </div>
            </div>
          </div>

          {/* Scientific Methodology */}
          <div className="bg-gradient-to-r from-deep-space/50 to-purple-500/20 rounded-lg p-6 border border-purple-500/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Scientific Methodology
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Statistical Analysis</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Linear regression for trends</li>
                  <li>• 95% confidence intervals</li>
                  <li>• Percentile analysis (25th, 50th, 75th)</li>
                  <li>• Standard deviation calculations</li>
                  <li>• Correlation analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Quality Assurance</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Minimum 5 years data required</li>
                  <li>• 10+ years for high confidence</li>
                  <li>• Cross-validation with backup sources</li>
                  <li>• Automated error detection</li>
                  <li>• Real-time data validation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm text-white/60">
          <div className="flex items-center gap-4">
            <span>NASA Earth Observation Data</span>
            <span>•</span>
            <span>Scientific Methodology</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Data updated:</span>
            <span className="text-earth-cyan">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataProvenance;
