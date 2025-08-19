# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server with PM2
- `npm test` - Run all tests with mocha
- `npm run test:file <path>` - Run a specific test file
- `npm run test-watch` - Run tests in watch mode
- `npm run test:report` - Generate mochawesome test report

### Code Quality
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run prettier` - Check code formatting
- `npm run prettier:fix` - Fix code formatting

## Architecture Overview

This is a Node.js microservice template using Clean Architecture principles.

### Clean Architecture Pattern
The repository follows these layers:
- **Controllers** (`src/controllers/`) - HTTP request/response handling
- **Use Cases** (`src/use-cases/`) - Business logic and application rules
- **Adapters/Repositories** (`src/adapters/`) - Data access layer abstraction
- **Entities** (`src/entities/`) - Domain models with business rules
- **Models** (`src/models/`) - ORM models for database (Sequelize/Mongoose)
- **Routes** (`src/routes/`) - API endpoint definitions

### Key Architectural Patterns

**Dependency Injection with Awilix:**
Controllers use the DI container to resolve dependencies:
```javascript
const container = require('../di');
const useCase = container.resolve('serviceName');
```

**DI Container Structure:**
- `src/di/container.js` - Awilix container initialization
- `src/di/bindings.js` - Service registration configuration  
- `src/di/index.js` - Exported configured container
- `src/di/README.md` - Complete DI documentation

**Service Registration Patterns:**
- **Repositories**: Registered as singletons for shared database connections
- **Use Cases**: Registered as transient for request isolation
- **Constructor Pattern**: Services use destructuring `constructor({ dependency })`

**Entity Builder Pattern:**
Domain entities use builder pattern for construction:
```javascript
const entity = Entity.builder()
  .setProperty1(value1)
  .setProperty2(value2)
  .build();
```

**Repository Pattern:**
Data access is abstracted through repositories that wrap ORM models. Repositories handle all database operations and return domain entities or primitives.

### Configuration and Environment

**Environment-specific configs:**
- Configuration loaded from `src/config/config.js` and `.env` files
- Database: PostgreSQL with Sequelize (MongoDB removed from current implementation)
- Structured config object with environment-based settings

**Configuration sections:**
- Database connection settings (PostgreSQL)
- Service configuration (service name: 'test')
- Security configurations (helmet, CORS)
- Logging configuration (Winston with daily rotation)
- PM2 process management settings

**Key Components:**
- **Express.js** with security middleware
- **Awilix** for dependency injection container with circular dependency detection
- **Winston** for structured logging with daily rotation
- **Joi** for request validation
- **Swagger** for API documentation at `/{service-name}/v1/docs`
- **Morgan** HTTP logging with custom success/error handlers
- **Centralized error handling** with custom ApiError class

### Testing Strategy

**Test Structure:**
- Unit tests: `tests/unit/` - Test individual components in isolation
- Integration tests: `tests/integration/` - Test API endpoints and database interactions
- Test setup: `tests/set-up.js` - Common test configuration

**Testing Tools:**
- **Mocha** test framework with Chai assertions
- **Sinon** for mocking/stubbing  
- **Supertest** for HTTP endpoint testing
- **Mochawesome** for coverage reporting

**Test Environment Configuration:**
- ORM logging is disabled during tests (`NODE_ENV=test`)
- Tests use clean database state for isolation
- Only test assertions and application errors displayed

**DI Testing Patterns:**
- Unit tests inject dependencies using constructor destructuring
- Integration tests use the configured DI container
- Mock dependencies provided as objects: `{ dependency: mockObject }`

### Security Considerations

**Common Security Patterns:**
- Environment-based configuration management
- Input validation and sanitization with Joi
- Request security headers with helmet
- CORS configuration for cross-origin requests
- SQL injection prevention with Sequelize ORM

### Development Workflow

**Environment Setup:**
- Database setup (PostgreSQL)
- Environment-specific configuration files (`.env` files)
- Sequelize ORM setup for database management
- Copy `.env.example` to `.env` and configure required variables

**Code Style:**
- ESLint with Airbnb config + security rules
- Prettier for formatting
- Husky git hooks for pre-commit quality checks
- No console statements allowed (use logger instead)

**Branch Strategy:**
- Feature branches created from develop with ticket IDs (e.g., `CI-XXXX` or `PROJ-XXXX`)
- Develop branch for feature development and integration
- UAT branch for UAT/QA releases
- Main branch for production releases

### Commit Strategy

**Branch Naming Convention:**
```
[PROJECT]-[TICKET-NUMBER] or [PROJECT]-[TICKET-NUMBER]-[short-description]
```
Examples: `CI-2449`, `CI-2449-authentication`

**Commit Message Structure:**
```
[PROJECT]-[TICKET-NUMBER]: [Clear summary of the feature/change]

[Detailed description explaining the business context and what was implemented]

Key Features Implemented:
- [Feature 1 with business value]
- [Feature 2 with business value]
- [Feature 3 with business value]

Technical Implementation:
- [Technical detail 1]
- [Technical detail 2]
- [Technical detail 3]

Testing & Quality:
- [Test coverage details]
- [Quality assurance measures]
- [Error handling coverage]

Database Changes: (if applicable)
- [Schema changes]
- [Migration details]
- [Data integrity measures]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Commit Principles:**
- Always start with ticket ID
- Business-first approach - explain the value before technical details
- Structured sections for easy scanning and review
- Comprehensive coverage of all changes made
- Include testing summary to demonstrate quality assurance
- Automatic compliance with repository hooks (lint, prettier, tests)

**Pre-commit Quality Gates:**
- ESLint validation with established config
- Prettier code formatting checks
- Full test suite execution
- All quality gates must pass before commit completion

### Database Operations

**PostgreSQL with Sequelize:**
- Models located in `src/models/sequelize/`
- Database configuration in `src/config/sequelize.js`
- Connection handled through `src/config/config.js`
- Supports dual database architecture pattern

### API Routing

**Service-based Routing:**
- All routes prefixed with service name: `/{service-name}/`
- Current service name: `test` (configurable in `src/config/config.js`)
- API endpoints: `/{service-name}/v1/`
- Swagger documentation: `/{service-name}/v1/docs`

### Pull Request Process

When creating pull requests, use standardized PR templates if available (located at `.github/pull_request_template.md`):

**Common PR Template Sections:**
- Summary with ticket link (CI-XXXX format)
- Type of change classification
- Key features implemented checklist
- Technical implementation details
- Testing coverage and quality assurance
- Deployment notes and breaking changes
- Reviewer checklist for thorough code review

**PR Creation Command:**
```bash
gh pr create --title "[PROJECT]-XXXX: Brief description" --body "$(cat .github/pull_request_template.md)"
```