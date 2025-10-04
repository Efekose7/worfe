import React from 'react';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import Dashboard from './components/Dashboard';
import Controls from './components/Controls';
import ErrorBoundary from './components/ErrorBoundary';
import { WeatherProvider } from './context/WeatherContext';

function App() {

  return (
    <ErrorBoundary>
      <WeatherProvider>
        <div className="min-h-screen bg-gradient-to-br from-deep-space via-nasa-blue to-deep-space">
          <Header />
          
          <main className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Map and Controls */}
              <div className="lg:col-span-1 space-y-6">
                <div className="card p-4">
                  <MapComponent />
                </div>
                <Controls />
              </div>
              
              {/* Right Column - Dashboard */}
              <div className="lg:col-span-2">
                <Dashboard />
              </div>
            </div>
          </main>
          
        </div>
      </WeatherProvider>
    </ErrorBoundary>
  );
}

export default App;
