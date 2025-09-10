# Developer Test Coverage Analysis Tool

A comprehensive Node.js script that provides dual analysis of test coverage for specific developers over given time periods. This tool measures individual developer contributions through two distinct perspectives: their specific changes and overall file coverage.

## Features

- **Dual Analysis Approach**: 
  - **Developer Changes Only**: Analyzes test coverage for exact lines/functions modified by the developer
  - **Entire Files**: Shows coverage for complete files touched by the developer
- **Developer-Specific Analysis**: Identify commits and changes by specific developer email/name
- **Date Range Filtering**: Analyze contributions within specific time periods
- **Git Diff Integration**: Precisely tracks which lines were changed by the developer
- **Comprehensive Metrics**: Shows statements, branches, functions, and lines coverage for both analysis types
- **Professional Reporting**: Clean, detailed summary with actionable insights and coverage comparisons
- **Git Repository Validation**: Ensures script is run within a valid git repository
- **Enhanced Error Handling**: Robust error handling with clear, actionable messages
- **TypeScript Support**: Supports both JavaScript (.js) and TypeScript (.ts) files
- **Configurable File Patterns**: Customizable test directories and file extensions
- **Performance Optimized**: Efficient file processing for large repositories
- **Automatic Cleanup**: Removes temporary coverage files after analysis

## Installation

### For Existing Projects Using Node Template
No additional installation required - uses your project's existing test setup.

### For New Projects
To use this script in a different Node.js project, ensure you have the following dependencies:

#### Required Dependencies
```bash
npm install --save-dev mocha nyc
```

#### Required Package.json Configuration
Add the following to your `package.json`:

```json
{
  "nyc": {
    "reporter": ["text", "html"],
    "all": true,
    "include": ["src/**/*.js"],
    "exclude": [
      "src/migrations/*",
      "src/seeders/*", 
      "src/docs/*",
      "src/config/*"
    ],
    "extension": [".js"]
  },
  "scripts": {
    "test": "mocha tests/**/*.test.js",
    "test:file": "mocha"
  }
}
```

#### Project Structure Requirements
Your project should have this structure:
```
project-root/
├── src/                   # Source code directory
├── tests/                 # Test directory
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── features/          # Feature tests
└── scripts/
    └── developer-coverage-analysis/
        ├── developer-test-coverage.js
        └── README.md
```

## Usage

### Basic Syntax
```bash
node scripts/developer-coverage-analysis/developer-test-coverage.js [OPTIONS]
```

### Options

| Option | Short | Description | Required |
|--------|-------|-------------|----------|
| `--developer` | `-d` | Developer email or name | ✅ Yes |
| `--start-date` | `-s` | Start date (YYYY-MM-DD format) | ❌ No |
| `--end-date` | `-e` | End date (YYYY-MM-DD format) | ❌ No |
| `--help` | `-h` | Show help message | ❌ No |

### Examples

#### Analyze all contributions by a developer since a specific date:
```bash
node scripts/developer-coverage-analysis/developer-test-coverage.js --developer "john.doe@company.com" --start-date "2024-01-01"
```

#### Analyze contributions within a specific date range:
```bash
node scripts/developer-coverage-analysis/developer-test-coverage.js --developer "Jane Smith" --start-date "2024-01-01" --end-date "2024-12-31"
```

#### Using short options:
```bash
node scripts/developer-coverage-analysis/developer-test-coverage.js -d "kasun@blott.io" -s "2024-12-01"
```

#### Show help:
```bash
node scripts/developer-coverage-analysis/developer-test-coverage.js --help
```

## Sample Output

```
================================================================================
ENHANCED DEVELOPER TEST COVERAGE ANALYSIS
================================================================================
Developer: kasun@blott.io
Analysis Period: 2025-07-08 to 2025-09-02
Total Commits: 47
Total Files Modified: 229
Source Files Modified: 62
Test Files Modified: 39
Test Files Found: 39

🎯 DEVELOPER CHANGES ONLY:
------------------------------------------------------------
Developer's Changes Coverage: 67.67%
  - Statements: 381/563 (67.67%)
  - Branches: 95/221 (42.99%)
  - Functions: 74/125 (59.20%)
  - Lines: 374/549 (68.12%)
  - Total Lines Changed: 9365

📁 ENTIRE FILES:
------------------------------------------------------------
Entire Files Coverage: 43.05%
  - Statements: 1844/4283 (43.05%)
  - Branches: 517/1902 (27.18%)
  - Functions: 355/928 (38.25%)
  - Lines: 1844/4283 (43.05%)

📊 COMPARISON & INSIGHTS:
------------------------------------------------------------
Impact of Existing Code: +24.62 percentage points
✅ Developer significantly improved overall file coverage
   Excellent contribution to both new features and code quality
⚡ Fair: Developer's changes need more test coverage (65-74%)
================================================================================
```

## Output Details

### Summary Section
- **Developer**: Email or name of the analyzed developer
- **Analysis Period**: Date range of commits analyzed
- **Total Commits**: Number of commits made by the developer
- **Total Files Modified**: All files touched by the developer
- **Source Files Modified**: Number of implementation files changed
- **Test Files Modified**: Number of test files created/modified
- **Test Files Found**: Existing test files that could be analyzed

### Dual Analysis Sections

#### 🎯 DEVELOPER CHANGES ONLY
Analyzes test coverage for **only the specific lines, functions, and statements** that the developer modified:
- **Developer's Changes Coverage**: Primary percentage for fair evaluation of developer's testing discipline
- **Statements/Branches/Functions/Lines**: Coverage metrics for only the code they changed
- **Total Lines Changed**: Total number of lines modified across all commits

#### 📁 ENTIRE FILES
Shows coverage for **complete files** that the developer worked on:
- **Entire Files Coverage**: Traditional coverage including all code in the files
- **Statements/Branches/Functions/Lines**: Coverage metrics for complete files

#### 📊 COMPARISON & INSIGHTS
- **Impact Analysis**: Shows the difference between developer-specific and file-wide coverage
- **Performance Feedback**: Evaluates developer's testing discipline with actionable insights
- **Coverage Quality Ratings**:
  - 🏆 **Excellent**: ≥85% coverage
  - 👍 **Good**: 75-84% coverage  
  - ⚡ **Fair**: 65-74% coverage
  - 📝 **Needs Improvement**: <65% coverage

## How It Works

1. **Git Analysis**: 
   - Queries git log for commits by the specified developer
   - Extracts file changes from each commit
   - Uses `git diff` to identify exact lines changed by the developer

2. **File Classification**:
   - **Source Files**: Files in `src/` directory (excluding config, migrations, seeders)
   - **Test Files**: Files in `tests/` directories with `.test.js` or `.spec.js` extensions

3. **Dual Coverage Analysis**:
   - Runs nyc (Istanbul) coverage analysis on developer-specific test files
   - Includes only the source files modified by the developer
   - **Developer Changes**: Maps coverage to specific changed lines using git diff data
   - **Entire Files**: Calculates traditional coverage across complete files

4. **Report Generation**:
   - Parses coverage data from generated JSON files
   - Provides both targeted and comprehensive coverage metrics
   - Generates comparison insights and actionable feedback

## Understanding the Analysis

### Developer Changes Only Analysis
This provides **fair evaluation** by analyzing only the code the developer actually wrote:

**Example Scenario:**
- Developer A creates a file with no tests
- Developer B adds new functions with comprehensive tests
- **Developer Changes Only** shows high coverage (Developer B's work)
- **Entire Files** shows lower coverage (includes Developer A's untested code)

This approach ensures developers are evaluated based on their own testing discipline.

### Use Cases

1. **Code Review**: Fair assessment of testing discipline for new changes
2. **Sprint Review**: Measure individual contributions to code quality
3. **Quality Gate**: Set coverage requirements based on new code only  
4. **Developer Feedback**: Help identify specific areas needing more tests
5. **Team Management**: Track testing practices across team members
6. **Performance Reviews**: Objective measurement of code quality contributions

## Technical Requirements

- **Node.js**: Version 20.0.0 or higher (as specified in package.json)
- **Test Framework**: Mocha (already configured in the project)
- **Coverage Tool**: NYC/Istanbul (already installed as devDependency)
- **Git Repository**: Must be run in a git repository with commit history

## File Structure

```
scripts/developer-coverage-analysis/
├── developer-test-coverage.js    # Main analysis script
├── README.md                     # Comprehensive documentation
└── QUICK_REFERENCE.md           # Quick command reference
```

## Supported File Types

### Source Files
- **JavaScript files** in `src/` directory (`.js`)
- **TypeScript files** in `src/` directory (`.ts`)
- **Configurable exclusions**: `/config/`, `/migrations/`, `/seeders/` (customizable)
- **Configurable source directories**: `src/` by default (customizable)

### Test Files
- **Test directories**: `tests/unit`, `tests/features`, `tests/integration` (customizable)
- **Test file extensions**: `.test.js`, `.spec.js` (customizable)
- **Performance optimized**: Batch file existence checking for large repositories

## Error Handling

The script includes robust error handling for common scenarios:

- **Git Repository Validation**: Validates git repository before starting analysis
- **Commit Hash Validation**: Prevents crashes from malformed git data
- **Command Timeouts**: Prevents hanging on slow git operations (3-5 second timeouts)
- **No commits found**: When developer has no commits in specified period
- **No source files**: When developer hasn't modified any source code
- **No test files**: When developer hasn't created/modified any tests
- **Coverage generation failures**: Graceful fallback with informative messages
- **Clean Console Output**: Suppresses test errors for professional reporting
- **Automatic Cleanup**: Removes temporary files even if analysis fails

## Integration with CI/CD

This tool can be integrated into CI/CD pipelines to:

- Track developer test coverage contributions over time
- Set minimum coverage requirements based on new changes only
- Generate coverage reports for sprint reviews
- Monitor team testing practices and improvements
- Provide fair evaluation metrics for performance reviews

## Troubleshooting

### Common Issues

1. **"Not a git repository"**
   - Ensure you're running the script from within a git repository
   - Check that `.git` directory exists in your project root

2. **"No commits found"**
   - Verify developer email/name spelling
   - Check if commits exist in the specified date range
   - Ensure you're in the correct git repository

3. **"Invalid commit hash format detected"**
   - Git data may be corrupted or incomplete
   - Try with a different date range or developer

4. **"Coverage data not available"**
   - Ensure tests run successfully
   - Check that nyc is properly installed
   - Verify test files exist and are executable

5. **"Command not found: nyc"**
   - This should not occur as the script uses `npx nyc`
   - Ensure NYC is listed in devDependencies

### Debug Tips

- **Git Repository Check**: Verify with `git status` that you're in a git repository
- **Broader Date Range**: Run with a broader date range to see if commits exist
- **Manual Git Check**: Check git log manually: `git log --author="developer@email.com"`
- **Individual Test Run**: Verify test files run individually: `npm run test:file path/to/test.js`
- **Verbose Errors**: Check console for warning messages with specific error details

## Recent Improvements

### Enhanced Dual Analysis
- ✅ **Developer Changes Only**: Fair evaluation based on exact code changes
- ✅ **Entire Files Coverage**: Complete file coverage for context
- ✅ **Git Diff Integration**: Precise line-by-line change tracking
- ✅ **Comparison Insights**: Automated analysis of coverage impact
- ✅ **Performance Feedback**: Actionable insights with coverage quality ratings

### Technical Enhancements
- ✅ **Performance Optimization**: Two-pass file filtering reduces filesystem calls
- ✅ **Enhanced Error Handling**: Comprehensive git command validation and timeouts
- ✅ **TypeScript Support**: Analyzes `.ts` files alongside `.js` files
- ✅ **Git Validation**: Prevents execution outside git repositories
- ✅ **Clean Output**: Suppresses test noise for professional reporting
- ✅ **Auto Cleanup**: Removes temporary coverage files automatically
- ✅ **Configurable Patterns**: Customizable file patterns via constructor
- ✅ **Code Quality**: All ESLint issues resolved, production-ready

## Contributing

When modifying this script:

1. Maintain backward compatibility with existing command-line options
2. Add comprehensive error handling for new features
3. Update this documentation with any new functionality
4. Test with multiple developers and date ranges
5. Follow the existing code style and patterns
6. Run linting: Use `npm run lint` and `npm run lint:fix` for code quality
7. Test edge cases: Verify git validation and error handling scenarios
8. Maintain dual analysis accuracy: Ensure both analysis types remain precise