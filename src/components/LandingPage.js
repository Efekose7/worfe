import React from 'react';
import { ArrowRight, Shield, BarChart3, Globe, Zap, Users, Calendar } from 'lucide-react';

const LandingPage = () => {
  const scrollToMain = () => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-space via-nasa-blue to-deep-space">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Etkinliğinize Yağmur Yağacak mı? 🌧️
          </h1>
          <p className="text-2xl md:text-3xl text-white/80 mb-12 leading-relaxed">
            NASA verileriyle öğrenin, güvenle planlayın
          </p>
          
          <button 
            onClick={scrollToMain}
            className="bg-gradient-to-r from-earth-cyan to-nebula-purple hover:from-earth-cyan/90 hover:to-nebula-purple/90 text-white font-bold py-4 px-8 rounded-full text-xl transition-all transform hover:scale-105 shadow-2xl flex items-center space-x-3 mx-auto"
          >
            <span>Hemen Başla</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card p-8 text-center hover:scale-105 transition-transform">
            <div className="text-6xl mb-6">📊</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              10+ Yıl Veri
            </h3>
            <p className="text-white/70 text-lg">
              NASA'nın tarihsel meteoroloji verileri ile güvenilir analiz
            </p>
          </div>
          
          <div className="card p-8 text-center hover:scale-105 transition-transform">
            <div className="text-6xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              %95 Güven
            </h3>
            <p className="text-white/70 text-lg">
              İstatistiksel olasılık hesaplamaları ile doğru tahminler
            </p>
          </div>
          
          <div className="card p-8 text-center hover:scale-105 transition-transform">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              5 Etkinlik Türü
            </h3>
            <p className="text-white/70 text-lg">
              Özel risk analizi her etkinlik türü için optimize edilmiş
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Nasıl Çalışır?
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-earth-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-earth-cyan" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">1. Konum Seç</h3>
            <p className="text-white/70">Haritadan veya arama ile konumunuzu belirleyin</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-nebula-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-nebula-purple" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">2. Tarih Seç</h3>
            <p className="text-white/70">Etkinliğiniz için hedef tarihi belirleyin</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-warning-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-warning-yellow" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">3. Etkinlik Türü</h3>
            <p className="text-white/70">Düğün, konser, spor gibi etkinlik türünü seçin</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-success-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-success-green" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">4. Analiz Al</h3>
            <p className="text-white/70">Risk skoru ve alternatif tarihleri görün</p>
          </div>
        </div>
      </div>

      {/* Event Types */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Desteklenen Etkinlik Türleri
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { icon: "👰", name: "Düğün", desc: "Açık hava düğünü" },
            { icon: "🎵", name: "Konser", desc: "Müzik etkinlikleri" },
            { icon: "⚽", name: "Spor", desc: "Açık hava sporları" },
            { icon: "🧺", name: "Piknik", desc: "Aile pikniği" },
            { icon: "🎉", name: "Geçit", desc: "Geçit töreni" }
          ].map((event, index) => (
            <div key={index} className="card p-6 text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">{event.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{event.name}</h3>
              <p className="text-white/70 text-sm">{event.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Veri Kaynakları
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card p-6 text-center">
            <div className="w-16 h-16 bg-nasa-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-nasa-blue" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">NASA POWER</h3>
            <p className="text-white/70 text-sm">NASA Earth observation data</p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="w-16 h-16 bg-earth-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-earth-cyan" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Open-Meteo</h3>
            <p className="text-white/70 text-sm">Historical weather data</p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="w-16 h-16 bg-nebula-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-nebula-purple" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">OpenStreetMap</h3>
            <p className="text-white/70 text-sm">Location services</p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="w-16 h-16 bg-success-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-success-green" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Statistical Analysis</h3>
            <p className="text-white/70 text-sm">Advanced probability calculations</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="card p-12 text-center bg-gradient-to-r from-nasa-blue/20 to-nebula-purple/20 border border-earth-cyan/30">
          <h2 className="text-4xl font-bold text-white mb-6">
            Etkinliğinizi Güvenle Planlayın
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            NASA'nın 25+ yıllık veri seti ile etkinliğiniz için en uygun tarihi bulun. 
            Risk skorları ve alternatif önerilerle kararınızı güvenle verin.
          </p>
          <button 
            onClick={scrollToMain}
            className="bg-gradient-to-r from-earth-cyan to-nebula-purple hover:from-earth-cyan/90 hover:to-nebula-purple/90 text-white font-bold py-4 px-8 rounded-full text-xl transition-all transform hover:scale-105 shadow-2xl flex items-center space-x-3 mx-auto"
          >
            <span>Ücretsiz Analiz Başlat</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-8 border-t border-white/20">
        <div className="text-center">
          <p className="text-white/60 mb-2">
            Powered by NASA Earth Observation Data
          </p>
          <p className="text-white/40 text-sm">
            © 2024 Worfe Weather Dashboard - Historical Weather Analysis Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
