# Capitalis - Product Requirements Document

## 1. Executive Summary

**Product Name:** Capitalis  
**Product Type:** SaaS Asset Management Platform  
**Target Market:** High-net-worth individuals, family offices, and sophisticated investors  
**Version:** 1.0  
**Document Version:** 1.0  
**Last Updated:** August 31, 2025

### Vision Statement
Capitalis is a comprehensive asset management platform that empowers users to track, analyze, and optimize their diverse investment portfolios through intelligent automation, temporal data management, and AI-powered insights.

## 2. Product Overview

### 2.1 Problem Statement
Current asset management solutions are fragmented, requiring users to manage cash accounts, physical assets (property, vehicles, yachts), and investments across multiple platforms. Users lack:
- Unified view of their complete financial picture
- Historical tracking with point-in-time analysis
- AI-powered insights and portfolio optimization
- Retroactive data correction capabilities
- Intuitive chat-based interaction for complex queries

### 2.2 Solution
Capitalis provides a unified SaaS platform that consolidates all asset types into a single, intelligent system with temporal data management and AI-powered analysis capabilities.

### 2.3 Key Value Propositions
- **Unified Asset Management**: Single platform for all asset types
- **Temporal Intelligence**: Tri-temporal database for historical accuracy and point-in-time analysis
- **AI-Powered Insights**: Intelligent agents for analysis, recommendations, and automated actions
- **Retrospective Accuracy**: Ability to correct historical data while maintaining audit trails
- **Conversational Interface**: Natural language interaction with AI agents

## 3. Target Users

### 3.1 Primary Users
- **High-Net-Worth Individuals (HNWIs)**: Personal wealth management
- **Family Offices**: Multi-generational wealth tracking
- **Private Wealth Advisors**: Client portfolio management
- **Sophisticated Retail Investors**: Advanced portfolio tracking

### 3.2 User Personas
- **"Portfolio Patricia"**: Family office manager needing comprehensive reporting
- **"Investor Ivan"**: Tech entrepreneur with diverse asset portfolio
- **"Advisor Alex"**: Wealth management professional serving multiple clients

## 4. Functional Requirements

### 4.1 Core Asset Management
- **Fungible Assets** (quantity-based, interchangeable)
  - Cash accounts and currencies
  - Stocks, bonds, ETFs, mutual funds
  - Cryptocurrency and digital tokens
  - Commodities and precious metals
  - Multiple currency support with real-time conversion

- **Non-Fungible Assets** (unique, individually tracked)
  - Real estate properties (residential, commercial, land)
  - Vehicles (cars, motorcycles, boats, aircraft)
  - Luxury items (art, jewelry, collectibles)
  - Intellectual property and patents
  - Unique investment instruments (private equity stakes, direct investments)

- **Asset Management Features**
  - Separate data models and tracking mechanisms for fungible vs non-fungible
  - Appropriate valuation methods for each asset type
  - Asset-specific performance metrics and reporting
  - Cross-asset portfolio analysis and correlation studies

### 4.2 AI-Powered Features
- **Conversational Interface**
  - Natural language query processing via Mastra Networks
  - Voice and text-based interactions
  - Context-aware responses using AI workflows
  - Multi-turn conversation support with memory

- **Intelligent Agents (Mastra Workflows)**
  - Portfolio optimization recommendations
  - Risk assessment and alerts
  - Tax optimization strategies
  - Rebalancing suggestions
  - Market trend analysis and predictions
  - Adaptive learning from user behavior

### 4.3 Temporal Data Management
- **Tri-Temporal Database Features**
  - Valid time (when facts are true in reality)
  - Transaction time (when facts are stored in database)
  - Decision time (when decisions are made based on facts)
  - Point-in-time queries and analysis
  - Retrospective data corrections with audit trails

### 4.4 Reporting and Analytics
- **Dashboard and Visualization**
  - Real-time portfolio overview with interactive ECharts
  - Asset allocation pie charts and treemaps with rich animations
  - Performance line charts with brush selection and data zoom
  - Risk analytics with heat maps and scatter plots
  - Candlestick charts with volume indicators and technical overlays

- **Interactive Charting Features**
  - Advanced data zoom and brush selection capabilities
  - Multi-dimensional analysis with parallel coordinates
  - Rich tooltip interactions with custom formatting
  - Animation transitions for data updates
  - Customizable themes matching Nuxt UI design system
  - Export capabilities (PNG, SVG, PDF) with high-quality rendering

- **Custom Reporting**
  - Automated report generation with embedded ECharts visualizations
  - Regulatory compliance reports with interactive charts
  - Tax reporting with performance trend analysis
  - Performance attribution analysis with waterfall and funnel charts

### 4.5 Workflow Management
- **Deterministic Workflows (Temporal)**
  - Portfolio rebalancing calculations
  - Tax loss harvesting automation
  - Dividend reinvestment processing
  - Asset valuation updates
  - Compliance reporting generation
  - Data synchronization and validation
  - Point-in-time portfolio reconstruction

- **Non-Deterministic Workflows (Mastra)**
  - AI-driven investment recommendations
  - Market sentiment analysis
  - Personalized content generation
  - Dynamic risk assessment
  - Conversational AI interactions
  - Adaptive user experience optimization
  - Predictive analytics and forecasting

## 5. Architecture & Deployment

### 5.1 System Architecture
- **Frontend**: Nuxt 4 with Nuxt UI components
- **API Layer**: GraphQL with PostGraphile 5
- **Database**: PostgreSQL 18 with temporal and vector extensions
- **Real-time Updates**: GraphQL Subscriptions
- **Authentication**: JWT with role-based access control

### 5.2 Deployment
- **Container Orchestration**: Kubernetes (supports both cloud and on-premise)
- **CI/CD**: GitOps workflow with ArgoCD
- **Environments**: Development, Staging, Production
- **Scaling**: Horizontal pod autoscaling based on load

### 5.3 User Roles
1. **Standard Users**
   - Access to personal portfolio and assets
   - Role-based permissions for different features
   - Self-service account management

2. **Admin Users**
   - All standard user privileges
   - Manage system configuration
   - Update static/reference data
   - User management

3. **Audit Users**
   - Read-only access to all data
   - Audit logging and reporting
   - No modification capabilities

## 6. Technical Requirements

### 6.0 Development Environment
- **Package Manager**: pnpm (required)
  - Ensures deterministic builds and efficient dependency management
  - Required for proper workspace management in the monorepo
  - All development and CI/CD processes must use pnpm
  - Scripts in package.json should be pnpm-compatible

- **Code Quality**:
  - ESLint with `@nuxt/eslint-plugin` for Nuxt-specific linting rules
  - Pre-commit hooks for automated code quality checks
  - Consistent code formatting across the codebase
  - TypeScript type checking in CI/CD pipeline

### 6.1 Database Naming Conventions
For database design, we follow these standards:
- **Table Names**: Singular (e.g., `user`, `organization`, `portfolio`)
- **Primary Keys**: `[table_name]_id` (e.g., `user_id`, `organization_id`)
- **Foreign Keys**: Use the primary key name only (e.g., `user_id` instead of `owner_user_id`) to enable USING in joins
- **Junction Tables**: Named by combining the two table names in alphabetical order (e.g., `user_organization`)

See the [Data Model Documentation](data-model.md) for complete schema details.

### 6.2 Technology Stack
- **Frontend Framework**: Nuxt 4 with SSR/SPA hybrid architecture
- **UI Components**: Nuxt UI for consistent design system
- **Typography**: Nuxt Fonts with Roboto Condensed (body) and Playfair (headings)
- **Nuxt 4 Modules**: @nuxtjs/apollo, @nuxtjs/i18n, echarts module (with fallback implementation)
- **API Layer**: PostGraphile 5 (with PostGraphile 4 compatibility) for automatic GraphQL API generation
- **GraphQL Client**: Apollo Client for efficient data management
- **Database**: PostgreSQL 18 with tri-temporal and pgvector extensions
- **Authentication**: Hanko (hosted → self-hosted migration) with passkeys and OAuth providers
- **OAuth Providers**: GitHub, Google, Apple, Microsoft for frictionless onboarding
- **AI Framework**: Mastra for AI agent orchestration and management
- **Workflow Engines**: 
  - Temporal for deterministic workflows (financial calculations, data processing)
  - Mastra Workflows and Networks for non-deterministic AI-driven processes
- **Charting Library**: ECharts for interactive financial visualizations
- **Hosting**: Cloud-native deployment (AWS/Azure/GCP) with PostgreSQL 18

### 6.3 Database Architecture
- **Tri-Temporal Implementation**
  - Custom PostgreSQL 18 extensions for temporal data
  - Automated versioning and audit trails
  - Point-in-time query optimization
  - Data integrity and consistency enforcement
- **Vector Search Capabilities (pgvector)**
  - AI-powered semantic search across financial documents
  - Investment similarity matching and clustering
  - Portfolio analysis using vector embeddings
  - Enhanced AI agent context retrieval

### 5.3 Known Technical Considerations
- **ECharts Integration**: Nuxt 4 module compatibility issues identified, fallback implementation planned
- **PostGraphile Migration**: Support for both PostGraphile 4 and 5 during transition period
- **Vector Database**: Optimized indexing strategies for financial data embeddings

### 5.4 UI Components and Icons

- **Icon Library**: Nuxt UI v4 includes built-in support for Nuxt Icons
  - No additional installation required as it's part of the Nuxt UI package
  - Provides access to multiple icon sets (including Hero Icons, Material Icons, etc.)
  - Tree-shaking support for optimal bundle size
  - TypeScript support for better developer experience
  - Simple and consistent API for all icon sets
  - Used throughout the application for consistent visual language

### 5.5 Internationalization
- **i18n Framework**: Nuxt i18n module for comprehensive internationalization support
- **Supported Languages**: English (en), Spanish (es), French (fr), German (de), Chinese (zh-CN), Japanese (ja)
- **Localization Features**:
  - Route-based language switching
  - Automatic browser language detection
  - RTL (Right-to-Left) language support
  - Localized number, date, and currency formatting
  - Dynamic content translation management
  - SEO-friendly language-specific URLs

### 5.5 Performance Requirements
- **Response Time**: < 200ms for standard queries
- **Availability**: 99.9% uptime SLA
- **Scalability**: Support for 10,000+ concurrent users
- **Data Processing**: Real-time market data updates
- **AI Response Time**: < 2 seconds for chat interactions

### 5.5 Security Requirements
- **Authentication Strategy**
  - **Phase 1**: Hanko Cloud (hosted) for rapid deployment and testing
  - **Phase 2**: Self-hosted Hanko for enhanced data control and compliance
  - **Passkey Support**: WebAuthn-based biometric and hardware key authentication
  - **OAuth Integration**: GitHub, Google, Apple, Microsoft for seamless social login
  - **Progressive Authentication**: Allow trial usage with minimal friction, require stronger auth for sensitive operations

- **Data Encryption**: End-to-end encryption for all data
- **Authorization**: Role-based access control (RBAC)
- **Compliance**: SOC 2 Type II, ISO 27001
- **Data Residency**: Configurable geographic data storage

## 6. Integration Requirements

### 6.1 Financial Data Providers
- **Market Data**: Bloomberg, Refinitiv, Alpha Vantage
- **Banking**: Plaid, Yodlee for account aggregation
- **Cryptocurrency**: CoinGecko, CryptoCompare APIs
- **Real Estate**: Zillow, CoreLogic for property valuations

### 6.2 Third-Party Services
- **Tax Software**: Integration with TurboTax, FreeTaxUSA
- **Accounting Systems**: QuickBooks, Xero integration
- **Document Management**: Secure document storage and retrieval
- **Notification Services**: Email, SMS, push notifications

## 7. User Experience Requirements

### 7.1 Internationalization (i18n)
- **Supported Languages**: English (en), French (fr), German (de), Spanish (es)
- **Implementation**: Using Nuxt i18n module for seamless language integration
- **Features**:
  - Language switching in the application header
  - Locale-based number and date formatting
  - RTL support for applicable languages
  - Language detection based on browser settings
  - Fallback to English for untranslated content
  - Support for dynamic content translation

### 7.2 Core User Flows
1. **Frictionless Onboarding Flow**
   - Social login with GitHub, Google, Apple, or Microsoft (single click)
   - Optional passkey enrollment for enhanced security
   - Guided asset discovery and initial portfolio setup
   - Trial mode with limited functionality before full verification
   - Progressive data collection to minimize initial friction

2. **Daily Usage Flow**
   - Seamless authentication via passkey or social login
   - Dashboard overview of portfolio performance
   - AI chat interactions for queries and commands
   - Asset transaction recording and management

3. **Security Enhancement Flow**
   - Progressive upgrade from social login to passkeys
   - Additional verification for high-value operations
   - Migration from hosted to self-hosted authentication (enterprise)

4. **Analysis Flow**
   - Point-in-time portfolio analysis
   - Performance attribution and benchmarking
   - Risk assessment and optimization recommendations

### 7.2 Mobile Experience
- **Responsive Design**: Fully responsive web application
- **Mobile App**: Native iOS/Android applications (future phase)
- **Offline Capability**: Limited offline functionality for viewing data

## 8. Success Metrics

### 8.1 Business Metrics
- **User Acquisition**: Monthly active users growth
- **Revenue**: Monthly recurring revenue (MRR) targets
- **Retention**: Customer churn rate < 5% annually
- **Satisfaction**: Net Promoter Score (NPS) > 50

### 8.2 Technical Metrics
- **Performance**: 95% of queries under 200ms
- **Reliability**: 99.9% uptime achievement
- **AI Accuracy**: 90%+ accuracy for AI recommendations
- **Data Quality**: 99.5% data accuracy across integrations

## 9. Implementation Phases

### 9.1 Phase 1 - MVP (Months 1-6)
- Basic asset tracking (cash, stocks, property)
- User authentication and basic security
- Simple dashboard and reporting
- Core tri-temporal database implementation

### 9.2 Phase 2 - AI Integration (Months 7-12)
- AI chat interface implementation
- Basic intelligent agents for recommendations
- Advanced analytics and reporting
- Mobile responsive optimization

### 9.3 Phase 3 - Advanced Features (Months 13-18)
- Complex asset types (alternatives, luxury items)
- Advanced AI capabilities and automation
- Third-party integrations expansion
- Enterprise features for family offices

## 10. Risk Assessment

### 10.1 Technical Risks
- **Database Complexity**: Tri-temporal implementation complexity
- **AI Accuracy**: Ensuring reliable AI recommendations
- **Integration Challenges**: Third-party API reliability and changes
- **Scalability**: Handling large datasets efficiently

### 10.2 Business Risks
- **Regulatory Compliance**: Changing financial regulations
- **Competition**: Established players in asset management
- **Data Security**: High-value target for cyber attacks
- **Market Adoption**: User education on temporal data benefits

## 11. Compliance and Legal

### 11.1 Financial Regulations
- **Investment Advisor Act**: Compliance with investment advisory regulations
- **Data Protection**: GDPR, CCPA compliance for user data
- **Financial Privacy**: Bank Secrecy Act compliance
- **Export Controls**: International data transfer regulations

### 11.2 Data Governance
- **Data Retention**: Configurable retention policies
- **Data Portability**: User data export capabilities
- **Right to be Forgotten**: GDPR deletion requirements
- **Audit Trails**: Comprehensive logging and monitoring

## 12. Related Documentation

This PRD is part of a comprehensive documentation suite for the Capitalis project:

### 12.1 Technical Documentation
- **Data Model Document**: Detailed tri-temporal database schema, entity relationships, and SQL implementation
- **llms.md**: High-level technical overview optimized for AI coding assistants and LLM consumption
- **README.md**: Human-readable project overview, setup instructions, and getting started guide

### 12.2 Project Management
- **contributions.md**: Contribution guidelines, code standards, and development workflow for contributors
- **governance.md**: Project governance structure, decision-making processes, and organizational rules

### 12.3 Document Hierarchy
1. **governance.md** - Defines project structure and rules
2. **README.md** - Entry point for human developers
3. **Capitalis PRD** (this document) - Comprehensive product requirements
4. **Data Model Document** - Technical database implementation
5. **llms.md** - AI assistant reference guide
6. **contributions.md** - Developer workflow and standards

### 12.4 Usage Guidelines
- **For Product Stakeholders**: Start with this PRD and README.md
- **For AI Coding Assistants**: Reference llms.md for high-level context, then consult specific technical documents
- **For Developers**: Begin with README.md, review governance.md and contributions.md, then dive into technical specs
- **For Database Design**: Use the Data Model Document as the authoritative source

All documents should be kept in sync as the project evolves, with this PRD serving as the master requirements document that drives updates to other documentation.

## 13. Next Steps

1. **Data Model Implementation**: Implement tri-temporal PostgreSQL schema
2. **Technical Architecture**: Detailed system architecture and API design
3. **UI/UX Mockups**: User interface design and user experience flows
4. **Development Roadmap**: Detailed project timeline and resource allocation
5. **Pilot Program**: Beta testing with select users and feedback collection

---

**Document Status**: Draft v1.0  
**Next Review**: September 15, 2025  
**Stakeholders**: Product, Engineering, Design, Legal, Compliance
