import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = "Loading weather data..." }) => {
  return (
    <div className="fixed inset-0 bg-deep-space/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="card p-8 text-center max-w-md mx-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-earth-cyan animate-spin" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Analyzing Weather Data</h3>
            <p className="text-white/70 text-sm">{message}</p>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-gradient-to-r from-earth-cyan to-nebula-purple h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
