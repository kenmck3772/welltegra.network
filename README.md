# Well-Tegra | The Well From Hell Case Study

A comprehensive web-based application for well engineering analysis, real-time drilling data monitoring, and problem-solving in complex well operations.

## Overview

Well-Tegra is an interactive case study platform designed to demonstrate advanced well engineering concepts, decision-making processes, and best practices in drilling operations. This application provides hands-on experience with well planning, problem identification, and mitigation strategies based on real-world scenarios.

## Features

### 🎯 Core Functionality
- **Interactive Well Planning**: Create and manage comprehensive well plans with detailed procedures
- **Real-Time Monitoring**: Live data visualization with dynamic gauges and charts
- **Problem Detection**: Automated identification of drilling problems and hazards
- **Asset Management**: Track equipment, inventory, and resources
- **Schematic Visualization**: Interactive well bore schematics with depth markers
- **Multi-Well Management**: Handle multiple wells simultaneously with detailed tracking

### 📊 Data Visualization
- Real-time hookload monitoring with alert thresholds
- Depth tracking and progression charts
- Cost and time savings analysis
- Interactive gauges for critical parameters (WOB, ROP, SPP, etc.)
- Dynamic well schematic generation

### 🎨 User Experience
- Dark/Light theme toggle
- Responsive design for all devices
- Intuitive navigation and workflow
- Modal-based detailed views
- Print-ready reports

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

- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript (Vanilla)
- **Charts**: Chart.js
- **Styling**: Tailwind CSS CDN
- **Fonts**: Google Fonts (Inter, Roboto Mono)

## Project Structure

```
welltegra.network/
├── index.html          # Main application file
├── assets/             # Images, icons, and media files
├── css/               # Additional stylesheets (if separated)
├── js/                # JavaScript modules (if separated)
├── docs/              # Documentation and guides
└── README.md          # Project documentation
```

## Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/kenmck3772/welltegra.network.git
   cd welltegra.network
   ```

2. **Open in browser**
   Simply open `index.html` in your web browser. No build process required!

3. **Make changes**
   Edit the `index.html` file with your preferred text editor.

### Deployment

This project can be easily deployed using GitHub Pages:

1. Go to repository Settings → Pages
2. Select source: `main` branch
3. Click Save
4. Your site will be live at: `https://kenmck3772.github.io/welltegra.network/`

## Usage

### Navigation
- Use the top navigation bar to switch between different sections
- Toggle dark/light mode using the theme button
- Access detailed views through the "View Details" buttons on each well card
- **Access the Intervention Planning Guide** via the "Guide" link in the main navigation

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

## Version History

- **v21**: Current version with enhanced UI, dark mode, and improved data visualization
- Previous versions focused on core functionality and data structures

## Contributing

This is a case study project for educational and demonstration purposes. If you'd like to suggest improvements or report issues:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Create a Pull Request

## About the Developer

**Ken McKenzie**  
30+ years of global experience in Well Engineering

This project represents real-world well engineering expertise translated into an interactive digital format for education, training, and decision-support purposes.

## License

This project is provided as-is for educational and demonstration purposes.

## Contact

For questions or feedback about this project:
- GitHub: [@kenmck3772](https://github.com/kenmck3772)
- Repository: [welltegra.network](https://github.com/kenmck3772/welltegra.network)

---

**Note**: This application uses the Tailwind CSS CDN for rapid development. For production deployment, consider installing Tailwind CSS as a PostCSS plugin for optimized performance.
# welltegra-ml-api
