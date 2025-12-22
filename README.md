# WellTegra Network

A comprehensive well engineering and AI portfolio platform for the oil and gas industry, featuring real-time operations monitoring, equipment management, and machine learning-powered analytics.

## Overview

WellTegra Network is an enterprise-grade platform that combines traditional well engineering expertise with modern AI capabilities. The system provides comprehensive tools for well planning, equipment catalog management, operations monitoring, and predictive analytics, all backed by a sophisticated ML API running on Google Cloud Platform.

## Features

### 🎯 Core Functionality
- **Operations Intelligence Dashboard**: ML-powered analytics with real-time monitoring
- **Equipment Catalog**: 119+ North Sea tools with clash detection and safety checks
- **Interactive Well Planning**: Multi-well management with comprehensive procedure generation
- **Survey Visualization Tool**: Interactive wellbore schematics with depth tracking
- **Standard Operating Procedures**: Complete SOP library with 6-phase intervention planning
- **ROI Calculator**: Financial analysis and cost optimization tools
- **Well Locking System**: Safety-critical concurrent operation prevention

### 📊 Data Visualization & Analytics
- Real-time drilling parameters with configurable alert thresholds
- Predictive analytics via Vertex AI integration
- Interactive 3D wellbore visualizations
- Cost optimization and ROI analysis
- Historical performance tracking and trend analysis
- Equipment failure prediction and maintenance scheduling

### 🎨 User Experience
- Dark/Light theme toggle with system preference detection
- Mobile-first responsive design
- Intuitive multi-page navigation with breadcrumbs
- Progress tracking and bookmarking
- Export capabilities (PDF, Excel, CSV)
- Multi-language support framework

### 📚 Documentation & Knowledge Resources
- **Comprehensive Intervention Planning Guide**: A complete 6-phase methodology covering the entire intervention lifecycle
  - Phase 1: Intervention Scoping, Justification & Concept Selection
  - Phase 2: Comprehensive Data Gathering & Well History Analysis
  - Phase 3: Detailed Engineering, Program Development & Risk Mitigation
  - Phase 4: Human Factors, Decision-Making & Crew Resource Management
  - Phase 5: Pre-Execution, Logistics & Field Execution
  - Phase 6: Post-Job Analysis, Knowledge Management & Continuous Improvement
- **Interactive HTML Guide**: User-friendly web interface with collapsible sections and navigation
- **Markdown Reference**: Version-controlled technical documentation for developers and engineers
- **Integrated Help**: Contextual links throughout the W666 planner connecting to relevant guide sections

## Technology Stack

### Frontend
- **Framework**: Vanilla HTML5/CSS3/JavaScript (Multi-page SPA)
- **Styling**: Tailwind CSS (local build)
- **Charts**: Chart.js, D3.js for advanced visualizations
- **Testing**: Playwright E2E with visual regression
- **Icons**: Lucide, custom SVG assets

### Backend & ML
- **ML API**: Python Flask on Google Cloud Functions
- **Database**: Google BigQuery for analytics and training data
- **ML Platform**: Vertex AI for predictive models
- **Data Processing**: Python scripts for synthetic data generation
- **Authentication**: Firebase Auth integration

### Infrastructure
- **Hosting**: GitHub Pages (frontend)
- **Serverless**: Google Cloud Functions (ML API)
- **CI/CD**: GitHub Actions for automated testing
- **Monitoring**: Google Cloud Monitoring

## Project Structure

```
welltegra.network/
├── *.html             # 113 standalone HTML pages
├── assets/            # Static assets (13MB)
│   ├── css/          # Stylesheets
│   ├── js/           # Shared JavaScript utilities
│   ├── images/       # Company branding and diagrams
│   └── video/        # Training videos
├── data/             # Centralized data stores (3.2MB)
│   ├── equipment*.json  # Equipment catalogs
│   ├── wells*.json      # Well operations data
│   ├── sops.json        # Standard procedures
│   └── synthetic-data/  # ML training data
├── scripts/          # Python data processing (88KB)
├── tests/            # Playwright E2E tests (56KB)
├── ml-api-setup/     # ML API deployment kit
└── docs/             # Documentation and guides
```

## Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/kenmck3772/welltegra.network.git
   cd welltegra.network
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies (for testing)
   npm install

   # Python environment (for data processing)
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Run tests**
   ```bash
   npm test                    # Run all E2E tests
   npm run test:headed       # Run tests with visible browser
   npm run test:debug        # Debug mode
   ```

4. **Start development**
   - No build process required - open any HTML file directly in browser
   - For ML API: `cd welltegra-ml-api && python main.py`
   - For data generation: `cd scripts && python generate-synthetic-data.py`

### Deployment

#### Frontend (GitHub Pages)
Automatically deployed via GitHub Actions on push to main branch:
- Live at: https://kenmck3772.github.io/welltegra.network/

#### ML API (Google Cloud Functions)
```bash
cd welltegra-ml-api
gcloud functions deploy welltegra-ml-api \
  --runtime python39 \
  --trigger-http \
  --allow-unauthenticated
```

## Usage

### Key Pages
- **Home** (`index.html`): Main landing page with ROI calculator
- **Operations Dashboard** (`operations-dashboard.html`): ML-powered analytics
- **Equipment Catalog** (`equipment.html`): 119+ tools with clash detection
- **Planner** (`planner.html`): Operations planning with AI recommendations
- **Survey Tool** (`survey-tool.html`): Interactive wellbore visualization
- **SOP Library** (`sop-library.html`): Standard operating procedures
- **Well W-666** (`well-666.html`): Detailed disaster case study

### Navigation
- Use the persistent navigation bar to access all sections
- Toggle dark/light mode (respects system preference)
- Breadcrumb trails for complex workflows
- Contextual help links throughout

### Intervention Planning Guide
The comprehensive planning guide is accessible in two formats:

1. **Interactive HTML Version** (`intervention-guide.html`):
   - Beautiful, user-friendly interface with collapsible sections
   - Sticky navigation for easy jumping between phases
   - Print-friendly styling for offline reference
   - Accessible from the main navigation bar

2. **Markdown Documentation** (`WELL_INTERVENTION_PLANNING_GUIDE.md`):
   - Version-controlled source document
   - Perfect for developers and technical review
   - Single source of truth for the methodology

The guide provides the theoretical foundation and best practices that inform the W666 planner and can be used as:
- A training resource for intervention planning teams
- A reference during actual planning activities
- A template for developing well-specific programs
- A knowledge base for continuous improvement initiatives

### Well Management
1. Click on any well card to view comprehensive details
2. Review objectives, problems, and generated plans
3. Monitor live data through interactive gauges and charts
4. Manage assets and equipment through the Asset Management tab

### Problem Analysis
- The system automatically identifies potential problems based on drilling parameters
- Problems are highlighted in red throughout the interface
- View detailed problem descriptions and recommended actions in the modal views

## Well Engineering Concepts Covered

- **Well Planning**: Comprehensive procedure generation and optimization
- **Drilling Operations**: Real-time monitoring and control
- **Problem Detection**: Stuck pipe, wellbore instability, kicks, losses, etc.
- **Asset Management**: Equipment tracking and inventory control
- **Cost Analysis**: Time and cost savings calculations
- **Safety**: Hazard identification and mitigation strategies

## Key Features Deep Dive

### Equipment Clash Detection
- Real-time compatibility checking between tools
- Visual warnings for incompatible combinations
- Safety-critical well locking mechanisms
- 119+ North Sea tools with detailed specifications

### ML-Powered Analytics
- Predictive failure modeling using Vertex AI
- Real-time anomaly detection
- Performance optimization recommendations
- Historical data from 2M+ toolstring runs

### Safety Systems
- Multi-factor well locking
- Concurrent operation prevention
- Automated safety checks
- Emergency response procedures

## Version History

- **v2.1**: Operations Intelligence Dashboard with authentic ML demonstration
- **v2.0**: Multi-page SPA architecture with enhanced navigation
- **v1.x**: Original single-page application prototype

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed
4. **Run tests** (`npm test`)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Create a Pull Request**

### Development Guidelines
- Use semantic commit messages
- Test on multiple browsers
- Ensure mobile responsiveness
- Document new APIs or data structures

## About the Developer

**Ken McKenzie**  
30+ years of global experience in Well Engineering

This project represents real-world well engineering expertise translated into an interactive digital format for education, training, and decision-support purposes.

## License

This project is provided as-is for educational and demonstration purposes. See LICENSE file for details.

## Support

For documentation, tutorials, and community support:
- 📖 [Documentation](https://github.com/kenmck3772/welltegra.network/wiki)
- 🐛 [Issue Tracker](https://github.com/kenmck3772/welltegra.network/issues)
- 💬 [Discussions](https://github.com/kenmck3772/welltegra.network/discussions)

## Contact

For questions or feedback about this project:
- GitHub: [@kenmck3772](https://github.com/kenmck3772)
- Repository: [welltegra.network](https://github.com/kenmck3772/welltegra.network)

---

**Quick Start**: Open any HTML file in your browser - no build process required!

**Note**: The frontend uses a local Tailwind CSS build for production optimization. The CDN is available for rapid prototyping.
