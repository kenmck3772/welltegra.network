# WellTegra Documentation Hub

> **Comprehensive technical documentation for the WellTegra Network platform**
> Production-grade API references, architecture guides, and integration documentation

---

## 📚 Documentation Index

### **API References**

| Document | Description | Size | Status |
|----------|-------------|------|--------|
| **[Operations Dashboard API](./OPERATIONS_DASHBOARD_API.md)** | Risk analysis functions, NPT calculation, safety recommendations | 17 KB | ✅ Complete |
| **[Well Operations Planner API](./WELL_OPERATIONS_PLANNER_API.md)** | Toolstring assembly, clash detection, MOC workflow, Chart.js risk matrix | 45 KB | ✅ Complete |
| **[Crisis Command Center API](./CRISIS_COMMAND_API.md)** | Crisis management simulator, multi-lens cognitive filtering, real-time physics | 32 KB | ✅ Complete |
| **[Data Pipeline API](./DATA_PIPELINE_API.md)** | Python ETL scripts, BigQuery upload, Vertex AI training | 41 KB | ✅ Complete |
| **[Equipment Catalog API](./EQUIPMENT_CATALOG_API.md)** | 122 tools, clash detection, compatibility matrices | 28 KB | ✅ Complete |

### **Architecture & Design**

| Document | Description | Size | Status |
|----------|-------------|------|--------|
| **[Brahan Engine Troubleshooting](./BRAHAN_ENGINE_TROUBLESHOOTING.md)** | UI/UX debugging, control room design system | 14 KB | ✅ Complete |
| **[Data Ingestion Architecture](./data-ingestion-architecture.md)** | WITSML feeds, CSV processing, API integration | 17 KB | ✅ Complete |
| **[WITSML Integration Spec](./witsml-integration-spec.md)** | Real-time well data streaming | 25 KB | ✅ Complete |

### **Component Specifications**

| Document | Description | Size | Status |
|----------|-------------|------|--------|
| **[CCL Digitizer Spec](./ccl-digitizer-spec.md)** | Casing collar locator digitization | 15 KB | ✅ Complete |
| **[Cerberus Decoder Spec](./cerberus-decoder-spec.md)** | Multi-format data decoder | 20 KB | ✅ Complete |
| **[WellView Mapper Spec](./wellview-mapper-spec.md)** | Well schematic visualization | 17 KB | ✅ Complete |

---

## 🎯 Quick Start

### For **Developers**
Start here to integrate with WellTegra:

1. **[Well Operations Planner API](./WELL_OPERATIONS_PLANNER_API.md)** - Interactive toolstring builder with Chart.js and Canvas
2. **[Crisis Command Center API](./CRISIS_COMMAND_API.md)** - Real-time simulation with branching decision trees
3. **[Operations Dashboard API](./OPERATIONS_DASHBOARD_API.md)** - Understand risk calculation functions
4. **[Equipment Catalog API](./EQUIPMENT_CATALOG_API.md)** - Access the 122-tool database
5. **[Data Pipeline API](./DATA_PIPELINE_API.md)** - Run the Python ETL workflow

### For **Data Engineers**
Build on our infrastructure:

1. **[Data Pipeline API](./DATA_PIPELINE_API.md)** - ETL scripts, BigQuery schemas
2. **[Data Ingestion Architecture](./data-ingestion-architecture.md)** - Pipeline design
3. **[WITSML Integration](./witsml-integration-spec.md)** - Real-time data feeds

### For **UI/UX Designers**
Understand the design system:

1. **[Brahan Engine Troubleshooting](./BRAHAN_ENGINE_TROUBLESHOOTING.md)** - Control room aesthetic
2. **Operations Dashboard** - Risk visualization patterns
3. **WellView Mapper** - Well schematic design

### For **Recruiters / Hiring Managers**
See technical depth:

1. **[Main README](../README.md)** - Portfolio overview with architecture
2. **[Well Operations Planner API](./WELL_OPERATIONS_PLANNER_API.md)** - 27 functions, Chart.js + Canvas visualization
3. **[Crisis Command Center API](./CRISIS_COMMAND_API.md)** - Educational software development, cognitive scaffolding
4. **[Operations Dashboard API](./OPERATIONS_DASHBOARD_API.md)** - Production JavaScript code
5. **[Data Pipeline API](./DATA_PIPELINE_API.md)** - Production Python code

---

## 📖 Documentation by Use Case

### **Building a Toolstring**
```
1. Well Operations Planner API → Interactive toolstring assembly
2. Equipment Catalog API → Browse 122 tools
3. Well Operations Planner API → Real-time clash detection
4. Operations Dashboard API → Risk analysis for configuration
```

### **Processing Well Data**
```
1. Data Ingestion Architecture → Understand pipeline
2. Data Pipeline API → Run synthetic data generator
3. Data Pipeline API → Upload to BigQuery
4. Data Pipeline API → Train ML model
```

### **Creating a Dashboard**
```
1. Operations Dashboard API → Risk calculation functions
2. Brahan Engine Troubleshooting → Control room UI patterns
3. Crisis Command Center API → Real-time Chart.js visualization
4. WellView Mapper Spec → Wellbore visualization
```

### **Building Training Simulations**
```
1. Crisis Command Center API → Multi-lens cognitive filtering system
2. Crisis Command Center API → Real-time physics simulation (kick detection)
3. Crisis Command Center API → Branching decision trees
4. Operations Dashboard API → Risk scenarios and consequences
```

### **Integrating WITSML**
```
1. WITSML Integration Spec → Real-time feed setup
2. Data Ingestion Architecture → Pipeline architecture
3. Cerberus Decoder Spec → Multi-format parsing
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  • Equipment Catalog (122 tools)                                │
│  • Well Operations Data (2.1M+ rows)                            │
│  • BigQuery Warehouse (well_ops_london)                         │
│  • GCS Bucket (gus001)                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      PROCESSING LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  • Python ETL Scripts (generate, upload, train)                 │
│  • BigQuery SQL (efficiency calculations)                       │
│  • Vertex AI ML (stuck-pipe prediction)                         │
│  • Risk Calculation Engine (JavaScript)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     PRESENTATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  • Brahan Engine (Control Room)                                 │
│  • Operations Dashboard (Risk Analysis)                         │
│  • Equipment Catalog (Tool Selector)                            │
│  • Looker Studio (Data Viz)                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 API Coverage Matrix

| Component | JavaScript API | Python API | REST API | SQL Schema |
|-----------|---------------|-----------|----------|------------|
| **Operations Dashboard** | ✅ Documented | N/A | 🔜 Planned | N/A |
| **Equipment Catalog** | ✅ Documented | ✅ Documented | 🔜 Planned | ✅ JSON |
| **Data Pipeline** | N/A | ✅ Documented | N/A | ✅ BigQuery |
| **Risk Analysis** | ✅ Documented | 🔜 Planned | 🔜 Planned | N/A |
| **WITSML Integration** | ✅ Spec | ✅ Spec | ✅ Spec | ✅ Spec |

---

## 🔍 Search Documentation

### Find by Technology

**JavaScript:**
- [Operations Dashboard API](./OPERATIONS_DASHBOARD_API.md) - Risk calculation functions
- [Equipment Catalog API](./EQUIPMENT_CATALOG_API.md) - Search and filter methods

**Python:**
- [Data Pipeline API](./DATA_PIPELINE_API.md) - ETL scripts, ML training
- [WITSML Integration](./witsml-integration-spec.md) - Data feed processing

**SQL / BigQuery:**
- [Data Pipeline API](./DATA_PIPELINE_API.md#bigquery-uploader) - Table schemas
- [Operations Dashboard API](./OPERATIONS_DASHBOARD_API.md#data-pipeline) - SQL queries

**Google Cloud Platform:**
- [Data Pipeline API](./DATA_PIPELINE_API.md) - BigQuery, Vertex AI, Cloud Functions
- [Data Ingestion Architecture](./data-ingestion-architecture.md) - GCS, Cloud Storage

### Find by Topic

**Machine Learning:**
- [Data Pipeline API - Vertex AI Trainer](./DATA_PIPELINE_API.md#3-vertex-ai-trainer)
- Accuracy: 94.2%, AUC-PRC: 0.97

**Data Engineering:**
- [Data Pipeline API](./DATA_PIPELINE_API.md)
- [Data Ingestion Architecture](./data-ingestion-architecture.md)
- [WITSML Integration Spec](./witsml-integration-spec.md)

**Risk Analysis:**
- [Operations Dashboard API](./OPERATIONS_DASHBOARD_API.md)
- NPT calculation, safety recommendations, cost analysis

**Equipment Management:**
- [Equipment Catalog API](./EQUIPMENT_CATALOG_API.md)
- 122 tools, clash detection, compatibility matrices

**UI/UX Design:**
- [Brahan Engine Troubleshooting](./BRAHAN_ENGINE_TROUBLESHOOTING.md)
- Control room design system, dark mode patterns

---

## 📝 Documentation Standards

All WellTegra documentation follows these standards:

### ✅ Structure
- Table of contents with anchor links
- Clear section hierarchy (H1 → H2 → H3)
- Code examples with syntax highlighting
- Usage examples for every function

### ✅ Content
- **What**: Function purpose and behavior
- **Why**: Design rationale and trade-offs
- **How**: Parameters, returns, examples
- **When**: Use cases and best practices

### ✅ Code Quality
- TypeScript-style type definitions
- JSDoc comments for JavaScript
- Python docstrings for Python
- SQL query examples with comments

### ✅ Examples
- Minimal reproducible examples
- Real-world use cases
- Error handling patterns
- Performance considerations

---

## 🔧 Contributing to Documentation

### Reporting Issues
Found an error or outdated info?
1. Check existing issues: [GitHub Issues](https://github.com/kenmck3772/welltegra.network/issues)
2. Create new issue with:
   - Document name
   - Section affected
   - Description of problem
   - Suggested correction (optional)

### Suggesting Improvements
Ideas for better documentation?
- API endpoints that need docs
- Missing usage examples
- Unclear explanations
- Additional diagrams/charts

---

## 📈 Documentation Statistics

| Metric | Value |
|--------|-------|
| **Total Documents** | 10 |
| **Total Size** | 227 KB |
| **API References** | 5 |
| **Architecture Guides** | 3 |
| **Component Specs** | 3 |
| **Code Examples** | 50+ |
| **Functions Documented** | 40+ |
| **Last Updated** | December 25, 2025 |

---

## 🗺️ Roadmap

### Q1 2025
- [ ] REST API documentation (OpenAPI/Swagger spec)
- [ ] Interactive API playground
- [ ] Video walkthroughs for key workflows
- [ ] Mobile-responsive doc site

### Q2 2025
- [ ] Multilingual support (Norwegian, Arabic)
- [ ] Offline documentation (PDF exports)
- [ ] Developer SDK documentation
- [ ] Integration tutorials

---

## 📞 Contact

**Documentation Maintainer:** Ken McKenzie
**GitHub:** [@kenmck3772](https://github.com/kenmck3772)
**Email:** welltegra@gmail.com

**For:**
- Technical questions → Open GitHub issue
- Bug reports → GitHub issues with `bug` label
- Feature requests → GitHub issues with `enhancement` label
- General inquiries → Email

---

## 📄 License

This documentation is part of the WellTegra portfolio demonstration.

**Allowed:**
- ✅ Educational reference
- ✅ Code review for employment purposes
- ✅ Academic citation
- ✅ Internal company reference

**Not Allowed:**
- ❌ Commercial redistribution
- ❌ Derivative works for profit
- ❌ Use in competing products
- ❌ Claiming authorship

---

<div align="center">

**Built with 30 years of North Sea experience and modern software engineering**

[Main Portfolio](../README.md) • [Live Demo](https://kenmck3772.github.io/welltegra.network/) • [GitHub](https://github.com/kenmck3772/welltegra.network)

⭐ **Comprehensive, production-grade documentation for a production-grade platform**

</div>
