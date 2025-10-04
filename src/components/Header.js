import React, { useState } from 'react';
import { Info, Github } from 'lucide-react';

const Header = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="bg-deep-space/50 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12">
              <img 
                src="/@worfe.png" 
                alt="Worfe Logo" 
                className="w-12 h-12 object-contain brightness-0 invert"
              />
            </div>
            <div>
    <h1 className="text-2xl font-bold text-gradient">
      Worfe Weather Dashboard
    </h1>
    <p className="text-sm text-white/70">
      Historical Weather Analysis
    </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="btn-secondary flex items-center space-x-2"
              aria-label="Show information"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </button>
            
            <a
              href="https://github.com/Efekose7"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center space-x-2"
              aria-label="View on GitHub"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-earth-cyan mb-2">About Worfe</h3>
                <p className="text-sm text-white/80 mb-2">
                  Worfe analyzes historical weather patterns to determine the likelihood of weather conditions 
                  for specific dates and locations. <strong>This is NOT a weather forecast</strong> - it's based 
                  on historical data analysis.
                </p>
                <p className="text-sm text-white/80">
                  "What happened on this date in the past?" - Historical probability analysis using 
                  Open-Meteo Historical Weather API (1940-2025).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-earth-cyan mb-2">Data Sources</h3>
                <ul className="text-sm text-white/80 space-y-1">
                  <li>• Open-Meteo Historical Weather API</li>
                  <li>• NASA Earth Science Data</li>
                  <li>• OpenStreetMap for geocoding</li>
                  <li>• WMO weather codes</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-white/60">
                <a href="https://open-meteo.com" className="text-earth-cyan hover:underline">
                  Data Attribution
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
