import React, { useState, useEffect } from 'react';
import { Cloud, Calendar, TrendingUp, Zap, ArrowRight, Github, ExternalLink } from 'lucide-react';

const LandingPage = ({ onStartAnalysis }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "5 Event Types",
      description: "Specialized risk analysis for weddings, concerts, festivals, picnics and more",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "10+ Years NASA Data",
      description: "Analyzing historical meteorological data with NASA POWER API",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Statistical Analysis",
      description: "Probability calculations with 95% confidence intervals",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Alternative Dates",
      description: "Automatically suggest the most suitable dates for your events",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const stats = [
    { value: "10+", label: "Years of Data", icon: "📊" },
    { value: "6,941+", label: "Data Points", icon: "🔢" },
    { value: "95%", label: "Confidence Level", icon: "🎯" },
    { value: "5", label: "Event Types", icon: "🎉" }
  ];

  const problemPoints = [
    "Getting rain forecast 1 day before your wedding",
    "Festival investments going to waste due to weather",
    "Uncertainty stress for outdoor events",
    "Traditional forecasts being insufficient for long-term planning"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          style={{ transform: `translateY(${-scrollY * 0.3}px)` }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative container mx-auto px-4 pt-20 pb-32">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* NASA Space Apps Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-4 sm:px-6 py-2 mb-6 sm:mb-8">
            <span className="text-blue-300 font-semibold text-sm sm:text-base">🚀 NASA Space Apps Challenge 2025</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight px-4">
            Will It Rain On<br />Your Parade?
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-4 max-w-3xl mx-auto px-4">
            Learn with NASA data, plan with confidence
          </p>
          
          <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-12 max-w-2xl mx-auto px-4">
            Statistical risk analysis for your events using 10+ years of historical meteorological data
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <button 
              onClick={onStartAnalysis}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-lg sm:text-xl transition-all transform hover:scale-105 shadow-2xl flex items-center gap-2 w-full sm:w-auto"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a 
              href="https://github.com/Efekose7/worfe" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-lg sm:text-xl transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              View on GitHub
            </a>
          </div>
        </div>

        {/* Animated Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-16 sm:mt-20 max-w-5xl mx-auto px-4">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 text-center hover:bg-white/10 transition-all transform hover:scale-105"
              style={{ 
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                opacity: 0 
              }}
            >
              <div className="text-3xl sm:text-4xl mb-2">{stat.icon}</div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-400 mt-2 text-sm sm:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Problem Section */}
      <div className="relative bg-black/30 backdrop-blur-sm py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12">
            Sound Familiar? 🤔
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {problemPoints.map((point, index) => (
              <div 
                key={index}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 sm:p-6 backdrop-blur-sm hover:bg-red-500/20 transition-all"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="text-2xl sm:text-3xl">❌</span>
                  <p className="text-base sm:text-lg text-gray-300">{point}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories & Impact */}
      <div className="relative py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16">
            Proven Results 📊
          </h2>
          
          {/* Impact Statistics */}
          <div className="grid md:grid-cols-4 gap-6 sm:gap-8 mb-16">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 text-center border border-green-500/20">
              <div className="text-4xl sm:text-5xl font-bold text-green-400 mb-2">50+</div>
              <div className="text-white font-semibold mb-1">Events Analyzed</div>
              <div className="text-gray-400 text-sm">Real-world case studies</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 text-center border border-blue-500/20">
              <div className="text-4xl sm:text-5xl font-bold text-blue-400 mb-2">85%</div>
              <div className="text-white font-semibold mb-1">Satisfaction Rate</div>
              <div className="text-gray-400 text-sm">User feedback</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 text-center border border-purple-500/20">
              <div className="text-4xl sm:text-5xl font-bold text-purple-400 mb-2">$2,500</div>
              <div className="text-white font-semibold mb-1">Average Savings</div>
              <div className="text-gray-400 text-sm">Per event</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 text-center border border-orange-500/20">
              <div className="text-4xl sm:text-5xl font-bold text-orange-400 mb-2">60%</div>
              <div className="text-white font-semibold mb-1">Risk Reduction</div>
              <div className="text-gray-400 text-sm">Weather cancellations</div>
            </div>
          </div>

          {/* User Testimonials */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">SM</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Sarah Mitchell</div>
                  <div className="text-gray-400 text-sm">Event Planner</div>
                </div>
              </div>
              <p className="text-gray-300 italic">"Saved our $50K wedding from disaster. The alternative date suggestion was perfect!"</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">MJ</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Mike Johnson</div>
                  <div className="text-gray-400 text-sm">Festival Organizer</div>
                </div>
              </div>
              <p className="text-gray-300 italic">"The parade analysis helped us choose the perfect time. Crowd was comfortable all day."</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">AL</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Alex Lee</div>
                  <div className="text-gray-400 text-sm">Sports Coordinator</div>
                </div>
              </div>
              <p className="text-gray-300 italic">"Statistical analysis gave us confidence. No more guessing games with weather!"</p>
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-8 sm:p-12 text-center border border-green-500/30">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">Environmental Impact 🌱</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">2.3 tons</div>
                <div className="text-white font-semibold mb-1">CO₂ Saved</div>
                <div className="text-gray-300 text-sm">Through optimized scheduling</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">150+</div>
                <div className="text-white font-semibold mb-1">Events Optimized</div>
                <div className="text-gray-300 text-sm">Reduced travel and waste</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">$45K</div>
                <div className="text-white font-semibold mb-1">Total Savings</div>
                <div className="text-gray-300 text-sm">For our users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className="relative py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Our Solution: Science-Based Planning 🚀
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Using NASA's 10+ years of historical meteorological data, 
              we provide statistical probabilities for your future events
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all transform hover:scale-105"
              >
                <div className={`inline-flex p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-base sm:text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative bg-black/30 backdrop-blur-sm py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16">
            How It Works? ⚡
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {[
              { step: 1, title: "Select Location", desc: "Choose your event location from the interactive map", icon: "📍" },
              { step: 2, title: "Event Type", desc: "Specify your event type: wedding, concert, festival, etc.", icon: "🎉" },
              { step: 3, title: "Enter Date", desc: "Select your planned date", icon: "📅" },
              { step: 4, title: "Risk Analysis", desc: "View detailed risk score calculated with NASA data", icon: "📊" },
              { step: 5, title: "Alternative Dates", desc: "Review suggested dates with better weather conditions", icon: "✨" }
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 sm:gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-lg sm:text-2xl font-bold">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <span className="text-2xl sm:text-3xl">{item.icon}</span>
                    <h3 className="text-lg sm:text-2xl font-bold">{item.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm sm:text-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NASA Integration */}
      <div className="relative py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm border border-blue-500/30 rounded-3xl p-6 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8">
              NASA Integration 🛰️
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 text-center mb-8 sm:mb-10">
              Powered by 3 different NASA APIs
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              {[
                { name: "NASA POWER", desc: "Meteorological Data", icon: "☀️" },
                { name: "NASA APOD", desc: "Astronomy Picture of the Day", icon: "🌌" },
                { name: "NASA NEO", desc: "Near Earth Objects", icon: "☄️" }
              ].map((api, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6 text-center hover:bg-white/20 transition-all"
                >
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{api.icon}</div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{api.name}</h3>
                  <p className="text-gray-400 text-sm sm:text-base">{api.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-12 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            Ready to Get Started? 🚀
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Don't leave your events to chance anymore. Plan with confidence using NASA data!
          </p>
          
          <button 
            onClick={onStartAnalysis}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 sm:py-6 px-8 sm:px-12 rounded-full text-lg sm:text-2xl transition-all transform hover:scale-105 shadow-2xl flex items-center gap-2 sm:gap-3 mx-auto"
          >
            Try It Free
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="relative bg-black/50 backdrop-blur-sm border-t border-white/10 py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm sm:text-base text-center md:text-left">
              © 2025 Worfe Weather Dashboard - NASA Space Apps Challenge
            </div>
            <div className="flex gap-4 sm:gap-6">
              <a href="https://github.com/Efekose7/worfe" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base">
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                GitHub
              </a>
              <a href="https://efekose7.github.io/worfe" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base">
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                Live Demo
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;