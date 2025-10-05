import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import EventPlanner from './components/EventPlanner';
import EventRiskCard from './components/EventRiskCard';
import AlternativeDates from './components/AlternativeDates';
import MapComponent from './components/MapComponent';
import Dashboard from './components/Dashboard';
import Controls from './components/Controls';
import ErrorBoundary from './components/ErrorBoundary';
import { WeatherProvider } from './context/WeatherContext';

function App() {
  const [selectedEvent] = useState(null);
  const [showLanding, setShowLanding] = useState(true);

  const handleDateChange = (newDate) => {
    console.log('Date changed to:', newDate);
  };

  const handleStartAnalysis = () => {
    setShowLanding(false);
  };

  if (showLanding) {
    return (
      <div>
        <LandingPage onStartAnalysis={handleStartAnalysis} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <WeatherProvider>
        <div className="min-h-screen bg-gradient-to-br from-deep-space via-nasa-blue to-deep-space">
          <Header />
          
          <main className="container mx-auto px-4 py-6">
            {/* Event Planning Section */}
            <div className="mb-8">
              <EventPlanner />
            </div>

            {/* Event Risk Analysis */}
            {selectedEvent && (
              <div className="mb-8">
                <EventRiskCard 
                  eventType={selectedEvent}
                  riskData={null} // Will be calculated by EventPlanner
                  weatherData={null} // Will be passed from context
                />
              </div>
            )}

            {/* Alternative Dates */}
            {selectedEvent && (
              <div className="mb-8">
                <AlternativeDates 
                  selectedEvent={selectedEvent}
                  onSelectDate={handleDateChange}
                />
              </div>
            )}

            {/* Original Dashboard */}
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
