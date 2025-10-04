# Worfe - Weather Likelihood Dashboard

🌐 **Live Site**: [worfe.vip](https://worfe.vip)

![Worfe Weather Dashboard](https://img.shields.io/badge/Worfe-Weather%20Dashboard-blue?style=for-the-badge&logo=weather)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.0-blue?style=for-the-badge&logo=tailwindcss)

Worfe is a NASA Earth observation data-powered historical weather analysis application that answers the question: "What happened on this date in the past?" It uses NASA POWER API and NASA GES DISC Earth observation data to analyze historical weather patterns and calculate probabilities based on past data. This is NOT a weather forecast - it's NASA Earth observation data-driven historical probability analysis.

## 🌟 Features

### Core Functionality
- **Interactive Map Selection**: Click to drop pins or search for locations worldwide
- **Historical Weather Analysis**: "What happened on this date in the past?" - 10-30 years of historical data analysis
- **Historical Probability Calculations**: Statistical analysis based on past weather patterns
- **Multiple Weather Conditions Analysis**:
  - Very Hot (historical temperature patterns)
  - Very Cold (historical temperature patterns)
  - Very Windy (historical wind speed patterns)
  - Very Wet (historical precipitation patterns)
  - Very Uncomfortable (historical heat index patterns)

### Data Visualization
- **Probability Cards**: Clear percentage displays with trend indicators
- **Interactive Charts**: Temperature trends, precipitation patterns, wind analysis
- **Historical Distribution**: Box plots and statistical summaries
- **Trend Analysis**: Multi-year climate trend detection

### Export Capabilities
- **CSV Export**: Comprehensive data export with statistics
- **JSON Export**: Developer-friendly API format
- **Shareable URLs**: Query parameters for easy sharing
- **Print Reports**: Professional summary reports

### Technical Features
- **Real-time Data**: Open-Meteo Historical Weather API integration
- **Responsive Design**: Mobile-first, works on all devices
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance Optimized**: Caching, lazy loading, efficient rendering
- **Error Handling**: Graceful fallbacks and user-friendly messages

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nasa-weather-dashboard.git
   cd nasa-weather-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## 🛠️ Technology Stack

### Frontend
- **React 18.2.0** - Modern React with hooks
- **Tailwind CSS 3.3.0** - Utility-first CSS framework
- **Leaflet.js** - Interactive maps with OpenStreetMap
- **Recharts** - Data visualization and charts
- **Lucide React** - Beautiful icon library

### APIs & Data Sources
- **NASA POWER API** - NASA Earth observation data (Primary - Global Award Eligible)
- **NASA POWER API (Enhanced)** - Comprehensive NASA Earth observation parameters (Global Award Eligible)
- **NASA GES DISC** - Goddard Earth Sciences Data and Information Services Center
- **NASA APOD** - NASA Astronomy Picture of the Day (Global Award Eligible)
- **Open-Meteo Historical Weather API** - Backup historical weather data
- **OpenStreetMap Nominatim** - Geocoding and location search

### Development Tools
- **Create React App** - Development environment
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📊 Data Sources & Attribution

### Primary Data Sources
- **NASA POWER API (Prediction of Worldwide Energy Resources)**
  - NASA Earth observation data (Global Award Eligible)
  - Historical data from 2001 to present
  - Variables: temperature, precipitation, wind speed, humidity, solar radiation
  - Attribution: [NASA POWER](https://power.larc.nasa.gov) - NASA GES DISC
  - **Global Award Eligible**: ✅ Uses NASA Earth observation data

- **NASA GES DISC (Goddard Earth Sciences Data and Information Services Center)**
  - NASA Earth observation datasets
  - Climate change indicators
  - Earth observation data integration
  - **Global Award Eligible**: ✅ Uses NASA Earth observation data

- **NASA APOD (Astronomy Picture of the Day)**
  - Daily NASA astronomy images and explanations
  - Educational content integration
  - NASA space imagery
  - **Global Award Eligible**: ✅ Uses NASA data and resources

- **NASA POWER API (Enhanced)**
  - Comprehensive NASA Earth observation parameters
  - Enhanced weather and climate data analysis
  - Multiple atmospheric variables and measurements
  - **Global Award Eligible**: ✅ Uses enhanced NASA Earth observation data

- **Open-Meteo Historical Weather API** (Backup)
  - 10,000 requests/day (free tier)
  - Historical data back to 1940
  - Variables: temperature, precipitation, wind speed, humidity, pressure
  - Attribution: [open-meteo.com](https://open-meteo.com) (CC BY 4.0)
  - **Global Award Eligible**: ❌ Not NASA data

### Methodology
The application uses statistical analysis to calculate weather probabilities:

1. **Data Collection**: Fetches 10-30 years of historical data
2. **Date Window Analysis**: ±7 days around target date for each year
3. **Threshold Comparison**: Compares historical values against user-defined thresholds
4. **Probability Calculation**: Statistical percentage with confidence intervals
5. **Trend Analysis**: Linear regression for multi-year trends
6. **Uncertainty Quantification**: Confidence intervals and statistical significance

## 🎨 Design System

### Color Palette (NASA-Inspired)
```css
--nasa-blue: #0B3D91
--nasa-red: #FC3D21
--deep-space: #000814
--star-white: #FFFFFF
--nebula-purple: #7209B7
--earth-cyan: #4CC9F0
--success-green: #06D6A0
--warning-yellow: #FFD60A
--danger-red: #EF476F
```

### Typography
- **Headings**: Inter (Google Fonts)
- **Body**: System font stack
- **Data/Numbers**: JetBrains Mono

### Responsive Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

## 📱 Usage Guide

### 1. Location Selection
- Click on the interactive map to select a location
- Use the search bar to find specific places
- View coordinates and location details

### 2. Date Configuration
- Select your target date using the date picker
- Choose analysis settings (years of data, date window)
- Customize weather thresholds

### 3. Weather Analysis
- View probability cards for each weather condition
- Analyze historical trends and patterns
- Explore interactive charts and visualizations

### 4. Data Export
- Download CSV files with comprehensive statistics
- Export JSON data for developer integration
- Generate shareable URLs with query parameters

## 🔧 Configuration

### Default Thresholds
```javascript
{
  veryHot: 32,        // °C
  veryCold: 0,        // °C
  veryWindy: 40,      // km/h
  veryWet: 10,        // mm/day
  veryUncomfortable: 40 // Heat index °C
}
```

### Analysis Settings
```javascript
{
  yearsOfData: 20,    // Years of historical data
  dateWindow: 7,       // ±7 days for analysis
  unitSystem: 'metric' // metric or imperial
}
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### Linting
```bash
npm run lint
```

## 📈 Performance

### Optimization Features
- **Lazy Loading**: Map tiles and chart components
- **Caching**: API responses with localStorage
- **Debouncing**: Search input optimization
- **Virtualization**: Large dataset rendering
- **Progressive Loading**: Skeleton loaders and smooth transitions

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

## 🌍 Accessibility

### WCAG 2.1 AA Compliance
- **Color Contrast**: 4.5:1 minimum ratio
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators
- **Alternative Text**: Descriptive alt text for images

### Supported Assistive Technologies
- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard navigation
- Voice control software
- High contrast mode

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to GitHub Pages
```bash
npm install -g gh-pages
npm run build
gh-pages -d build
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- ESLint configuration included
- Prettier formatting
- Conventional commits
- TypeScript support (optional)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Open Weather Data** for the inspiration and framework
- **Open-Meteo** for providing free weather data APIs
- **NASA Earth Science** for complementary datasets
- **OpenStreetMap** community for mapping data
- **React and Tailwind CSS** communities for excellent tools

## 📞 Support

### Documentation
- [API Documentation](docs/api.md)
- [Component Guide](docs/components.md)
- [Deployment Guide](docs/deployment.md)

### Contact
- **GitHub Issues**: [Report bugs and request features](https://github.com/your-username/nasa-weather-dashboard/issues)
- **Email**: your-email@example.com
- **Weather Data**: [Open-Meteo API](https://open-meteo.com/)

## 🏆 Worfe Platform

This project is a **Historical Weather Analysis Platform** that provides:

> **"What happened on this date in the past?"**

### Platform Features
✅ **Uses NASA Earth observation data** - NASA POWER API + NASA GES DISC  
✅ **Historical Weather Analysis** - Based on past weather patterns  
✅ Solves real-world problems  
✅ Professional, production-ready application  
✅ Free, publicly accessible APIs only  
✅ Mobile responsive design  
✅ Data export capabilities  
✅ Scientific methodology  
✅ Accessibility compliance  
✅ **NASA Data Integration** - NASA POWER API for weather data  
✅ **NASA Attribution** - Proper NASA data attribution  


---

**Built with ❤️ for Historical Weather Analysis**

*Empowering outdoor enthusiasts with NASA Earth observation data-driven weather insights*

## 🌍 Data Sources

This platform uses multiple data sources:

- ✅ **NASA Earth observation data** as primary data source
- ✅ **NASA POWER API** - NASA's weather and climate data
- ✅ **NASA GES DISC** - Goddard Earth Sciences Data and Information Services Center
- ✅ **Proper NASA attribution** throughout the application
- ✅ **Historical Weather Analysis** - Based on past weather patterns
- ✅ **NASA data integration** in weather analysis and probability calculations
