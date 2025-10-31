# Klysera People & Culture

## Project Overview

This repository contains Klysera's comprehensive People & Culture documentation and research system, designed to build a world-class HR department through systematic learning from successful remote-first technology companies.

## Repository Structure

```
People-Culture/
├── documentation/          # 📚 People & Culture Documentation
│   ├── Klysera/           # Core organizational content (culture, HR, leadership)
│   ├── Research/          # Company analysis (GitLab, Zapier, Doist)
│   └── index.md           # People & Culture documentation index
├── docs/                  # 📋 BMAD Framework Documentation
│   ├── *.md              # Generated project analysis and technical docs
│   ├── bmm-workflow-status.yaml  # BMAD workflow tracking
│   └── project-scan-report.json  # BMAD project analysis
├── bmad/                  # 📋 BMAD Methodology Framework
│   ├── bmm/              # Business Method Module
│   └── core/             # Core methodology tools
├── tests/                 # 🧪 Quality assurance
├── .github/              # 🔄 CI/CD workflows
└── index.html            # 🌐 Docsify application entry point
```

## Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/klysera/people-and-culture.git
   cd people-and-culture
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start local development server**
   ```bash
   # Install docsify-cli globally (optional)
   npm install -g docsify-cli

   # Start development server
   docsify serve .

   # Access at: http://localhost:3000
   ```

### Documentation Structure

#### People & Culture Content (`/documentation/`)
- **Klysera/Culture/** - Company culture, values, and identity
- **Klysera/Hiring-Onboarding/** - HR processes and talent management
- **Klysera/Leadership/** - Leadership development and management
- **Klysera/Operating-Principles/** - Daily operational frameworks
- **Research/** - Analysis of successful remote-first companies
- **index.md** - People & Culture documentation index

#### BMAD Framework Documentation (`/docs/`)
- **index.md** - BMAD project analysis index
- **project-overview.md** - Executive summary and project goals
- **architecture_patterns.md** - Technical architecture and design
- **development-guide.md** - Setup and contribution workflow
- **bmm-workflow-status.yaml** - BMAD workflow tracking
- **project-scan-report.json** - Detailed project analysis

## Key Features

- **📱 Mobile-Responsive**: Optimized for distributed team access
- **🔍 Full-Text Search**: Quick information discovery
- **📊 Mermaid Diagrams**: Interactive process and organizational charts
- **🔄 Continuous Deployment**: Automated GitHub Pages deployment
- **📚 Documentation-as-Code**: Git-based collaborative workflow

## Technology Stack

- **Documentation**: Docsify + Markdown + Mermaid
- **Hosting**: GitHub Pages with custom domain support
- **Testing**: Playwright for quality assurance
- **Methodology**: BMAD framework integration

## Contributing

1. Create a feature branch from `main`
2. Make your documentation changes in the `/documentation/` folder
3. Test locally with `docsify serve .`
4. Submit a pull request for review
5. Automatic deployment to GitHub Pages after merge

## Project Mission

Transform Klysera into a leading remote-first organization by:

1. **Defining Culture** - Clear values, principles, and behavioral expectations
2. **Building HR Excellence** - Comprehensive talent management systems
3. **Learning from Leaders** - Systematic study of GitLab, Zapier, and Doist
4. **Enabling Implementation** - Practical tools and frameworks
5. **Ensuring Accessibility** - Professional, mobile-friendly documentation

## Documentation Access

- **Live Site**: [GitHub Pages URL] (deployed automatically)
- **Local Development**: `http://localhost:3000` (after running `docsify serve .`)
- **People & Culture Index**: `/documentation/index.md` (primary content navigation)
- **BMAD Framework Index**: `/docs/index.md` (technical project analysis)

---

**This repository represents Klysera's commitment to building exceptional remote work culture through research-driven, evidence-based practices.**