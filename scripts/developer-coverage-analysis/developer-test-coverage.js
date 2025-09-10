#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */

const { execSync } = require('child_process');
const fs = require('fs');

class DeveloperTestCoverageAnalyzer {
  constructor(config = {}) {
    this.testDirs = config.testDirs || ['tests/unit', 'tests/features', 'tests/integration'];
    this.testExtensions = config.testExtensions || ['.test.js', '.spec.js'];
    this.srcDirs = config.srcDirs || ['src/'];
    this.srcExtensions = config.srcExtensions || ['.js', '.ts'];
    this.excludeDirs = config.excludeDirs || ['/config/', '/migrations/', '/seeders/'];
    this.showDualAnalysis = config.showDualAnalysis || true;
  }

  parseArgs() {
    const args = process.argv.slice(2);
    const params = {
      developer: null,
      startDate: null,
      endDate: null,
      help: false,
    };

    for (let i = 0; i < args.length; i += 1) {
      switch (args[i]) {
        case '--developer':
        case '-d':
          params.developer = args[i + 1];
          i += 1;
          break;
        case '--start-date':
        case '-s':
          params.startDate = args[i + 1];
          i += 1;
          break;
        case '--end-date':
        case '-e':
          params.endDate = args[i + 1];
          i += 1;
          break;
        case '--help':
        case '-h':
          params.help = true;
          break;
        default:
          break;
      }
    }

    return params;
  }

  showHelp() {
    console.log(`
Developer Test Coverage Analyzer

Usage: node developer-test-coverage.js [OPTIONS]

Options:
  -d, --developer <email|name>  Developer email or name (required)
  -s, --start-date <date>       Start date (YYYY-MM-DD format)
  -e, --end-date <date>         End date (YYYY-MM-DD format)
  -h, --help                    Show this help message

Examples:
  node developer-test-coverage.js --developer "john.doe@company.com" --start-date "2024-01-01" --end-date "2024-12-31"
  node developer-test-coverage.js -d "John Doe" -s "2024-06-01"
    `);
  }

  validateParams(params) {
    if (params.help) {
      this.showHelp();
      process.exit(0);
    }

    // Validate git repository
    if (!this.isGitRepository()) {
      console.error('Error: Not a git repository. Please run this script from within a git repository.');
      process.exit(1);
    }

    if (!params.developer) {
      console.error('Error: Developer email or name is required');
      this.showHelp();
      process.exit(1);
    }

    if (params.startDate && !this.isValidDate(params.startDate)) {
      console.error('Error: Invalid start date format. Use YYYY-MM-DD');
      process.exit(1);
    }

    if (params.endDate && !this.isValidDate(params.endDate)) {
      console.error('Error: Invalid end date format. Use YYYY-MM-DD');
      process.exit(1);
    }
  }

  isGitRepository() {
    try {
      execSync('git rev-parse --git-dir', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 3000,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date.toISOString().slice(0, 10) === dateString;
  }

  buildGitLogCommand(developer, startDate, endDate) {
    let cmd = `git log --author="${developer}" --pretty=format:"%H" --name-only`;

    if (startDate) {
      cmd += ` --since="${startDate}"`;
    }

    if (endDate) {
      cmd += ` --until="${endDate}"`;
    }

    return cmd;
  }

  getCommitsByDeveloper(developer, startDate, endDate) {
    try {
      const cmd = this.buildGitLogCommand(developer, startDate, endDate);
      const output = execSync(cmd, { encoding: 'utf8' }).trim();

      if (!output) {
        console.log(`No commits found for developer: ${developer}`);
        return [];
      }

      const lines = output.split('\n');
      const commits = [];
      let currentCommit = null;

      for (const line of lines) {
        if (line.match(/^[a-f0-9]{40}$/)) {
          if (currentCommit) {
            commits.push(currentCommit);
          }
          currentCommit = { hash: line, files: [] };
        } else if (line.trim() && currentCommit) {
          currentCommit.files.push(line.trim());
        }
      }

      if (currentCommit) {
        commits.push(currentCommit);
      }

      return commits;
    } catch (error) {
      console.error('Error getting git commits:', error.message);
      return [];
    }
  }

  getDeveloperChangedLines(commits) {
    const changedLines = new Map(); // file -> Set of line numbers

    commits.forEach((commit) => {
      try {
        // Get the diff for this specific commit
        const diffCmd = `git show ${commit.hash} --unified=0 --no-merges --format=""`;
        const diffOutput = execSync(diffCmd, {
          encoding: 'utf8',
          timeout: 10000,
          stdio: ['pipe', 'pipe', 'pipe'],
        });

        this.parseDiffOutput(diffOutput, changedLines);
      } catch (error) {
        console.log(`Warning: Could not get diff for commit ${commit.hash}: ${error.message}`);
      }
    });

    return changedLines;
  }

  parseDiffOutput(diffOutput, changedLines) {
    const lines = diffOutput.split('\n');
    let currentFile = null;

    lines.forEach((line) => {
      if (line.startsWith('+++')) {
        // Extract filename: +++ b/src/file.js
        currentFile = line.substring(6); // Remove "+++ b/"
        if (currentFile === '/dev/null') {
          currentFile = null;
        }
      } else if (line.startsWith('@@') && currentFile) {
        // Parse hunk header: @@ -10,5 +12,8 @@
        const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
        if (match) {
          const startLine = parseInt(match[1], 10);
          const lineCount = parseInt(match[2], 10) || 1;

          if (!changedLines.has(currentFile)) {
            changedLines.set(currentFile, new Set());
          }

          // Mark all added/modified lines
          for (let i = 0; i < lineCount; i += 1) {
            changedLines.get(currentFile).add(startLine + i);
          }
        }
      }
    });
  }

  filterTestFiles(commits) {
    const testFileCandidates = new Set();

    // First pass: collect all potential test files without file system checks
    commits.forEach((commit) => {
      commit.files.forEach((file) => {
        const isInTestDir = this.testDirs.some((dir) => file.startsWith(dir));
        const hasTestExtension = this.testExtensions.some((ext) => file.endsWith(ext));

        if (isInTestDir && hasTestExtension) {
          testFileCandidates.add(file);
        }
      });
    });

    // Second pass: batch file existence checks
    const testFiles = Array.from(testFileCandidates).filter((file) => fs.existsSync(file));
    return testFiles;
  }

  filterSourceFiles(commits) {
    const sourceFileCandidates = new Set();

    // First pass: collect all potential source files without file system checks
    commits.forEach((commit) => {
      commit.files.forEach((file) => {
        const isInSrcDir = this.srcDirs.some((dir) => file.startsWith(dir));
        const hasSrcExtension = this.srcExtensions.some((ext) => file.endsWith(ext));
        const isNotExcluded = !this.excludeDirs.some((excludeDir) => file.includes(excludeDir));

        if (isInSrcDir && hasSrcExtension && isNotExcluded) {
          sourceFileCandidates.add(file);
        }
      });
    });

    // Second pass: batch file existence checks
    const sourceFiles = Array.from(sourceFileCandidates).filter((file) => fs.existsSync(file));
    return sourceFiles;
  }

  runDualCoverageAnalysis(testFiles, sourceFiles, commits) {
    if (testFiles.length === 0) {
      console.log('No test files found for the specified developer and date range.');
      return { filesCoverage: null, changesCoverage: null };
    }

    if (sourceFiles.length === 0) {
      console.log('No source files found for the specified developer and date range.');
      return { filesCoverage: null, changesCoverage: null };
    }

    console.log(`\nFound ${testFiles.length} test files by the developer:`);
    testFiles.forEach((file) => console.log(`  - ${file}`));
    console.log(`\nFound ${sourceFiles.length} source files by the developer:`);
    sourceFiles.forEach((file) => console.log(`  - ${file}`));
    console.log('');

    try {
      // Create nyc include patterns for only the developer's source files
      const includePatterns = sourceFiles.map((file) => `--include="${file}"`).join(' ');
      const testFilesArg = testFiles.join(' ');

      // Run coverage only on developer's source files with their test files
      const cmd = `NODE_ENV=test npx nyc ${includePatterns} --reporter=json mocha ${testFilesArg} --require tests/hooks.js --reporter spec`;

      console.log('Running enhanced coverage analysis...');
      console.log('');

      try {
        execSync(cmd, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        });
      } catch (cmdError) {
        // Coverage command may fail due to thresholds, but we still want to process the results
        if (!cmdError.message.includes('Coverage for')) {
          throw cmdError; // Re-throw if it's not a threshold error
        }
      }

      // Parse the JSON coverage report
      const rawCoverage = this.parseCoverageOutput();

      if (!rawCoverage) {
        console.log('Warning: No coverage data generated');
        return { filesCoverage: null, changesCoverage: null };
      }

      // Extract entire files coverage (existing functionality)
      const filesCoverage = this.extractCoverageMetrics(rawCoverage);

      // Get developer's specific changed lines
      console.log('Analyzing developer-specific changes...');
      const changedLines = this.getDeveloperChangedLines(commits);

      // Extract developer changes coverage
      const changesCoverage = this.extractLineCoverage(rawCoverage, changedLines);

      // Clean up coverage files
      this.cleanupCoverageFiles();

      return { filesCoverage, changesCoverage, changedLines };
    } catch (error) {
      console.error('Error running coverage analysis:', error.message);
      return { filesCoverage: null, changesCoverage: null };
    }
  }

  runCoverageAnalysis(testFiles, sourceFiles) {
    // Legacy method for backward compatibility
    const result = this.runDualCoverageAnalysis(testFiles, sourceFiles, []);
    return result.filesCoverage;
  }

  parseCoverageOutput() {
    try {
      // Read coverage from generated file
      if (fs.existsSync('coverage/coverage-final.json')) {
        const coverageContent = fs.readFileSync('coverage/coverage-final.json', 'utf8');
        const coverage = JSON.parse(coverageContent);
        return coverage; // Return raw coverage data, not processed metrics
      }
      console.log('Coverage file not found');
      return null;
    } catch (fileError) {
      console.log('Could not parse coverage data:', fileError.message);
      return null;
    }
  }

  cleanupCoverageFiles() {
    try {
      if (fs.existsSync('coverage/coverage-final.json')) {
        fs.unlinkSync('coverage/coverage-final.json');
      }
      if (fs.existsSync('.nyc_output')) {
        const files = fs.readdirSync('.nyc_output');
        files.forEach((file) => {
          fs.unlinkSync(`.nyc_output/${file}`);
        });
        fs.rmdirSync('.nyc_output');
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  extractLineCoverage(coverage, changedLines) {
    const developerCoverage = {
      statements: { total: 0, covered: 0 },
      branches: { total: 0, covered: 0 },
      functions: { total: 0, covered: 0 },
      lines: { total: 0, covered: 0 },
    };

    Object.entries(coverage).forEach(([fullFilePath, fileCoverage]) => {
      // Find matching changed lines by checking if coverage path ends with any changed file path
      let developerLines = null;
      for (const [changedPath, lines] of changedLines.entries()) {
        if (fullFilePath.endsWith(changedPath)) {
          developerLines = lines;
          break;
        }
      }

      if (!developerLines || developerLines.size === 0) return;

      // Analyze statements for developer's changed lines only
      Object.entries(fileCoverage.statementMap || {}).forEach(([stmtId, stmt]) => {
        const lineNumber = stmt.start.line;
        if (developerLines.has(lineNumber)) {
          developerCoverage.statements.total += 1;
          if ((fileCoverage.s || {})[stmtId] > 0) {
            developerCoverage.statements.covered += 1;
          }
        }
      });

      // Analyze branches for developer's changed lines
      Object.entries(fileCoverage.branchMap || {}).forEach(([branchId, branch]) => {
        const lineNumber = branch.line || branch.loc?.start?.line;
        if (lineNumber && developerLines.has(lineNumber)) {
          const branchData = (fileCoverage.b || {})[branchId] || [];
          branchData.forEach((hits) => {
            developerCoverage.branches.total += 1;
            if (hits > 0) {
              developerCoverage.branches.covered += 1;
            }
          });
        }
      });

      // Analyze functions for developer's changed lines
      Object.entries(fileCoverage.fnMap || {}).forEach(([fnId, fn]) => {
        const lineNumber = fn.line || fn.loc?.start?.line;
        if (lineNumber && developerLines.has(lineNumber)) {
          developerCoverage.functions.total += 1;
          if ((fileCoverage.f || {})[fnId] > 0) {
            developerCoverage.functions.covered += 1;
          }
        }
      });

      // Count lines coverage
      developerLines.forEach((lineNumber) => {
        // Check if this line has any statements
        const hasStatement = Object.values(fileCoverage.statementMap || {}).some(
          (stmt) => stmt.start.line === lineNumber,
        );
        if (hasStatement) {
          developerCoverage.lines.total += 1;
          // Check if any statement on this line is covered
          const isLineCovered = Object.entries(fileCoverage.statementMap || {}).some(
            ([stmtId, stmt]) => stmt.start.line === lineNumber
              && (fileCoverage.s || {})[stmtId] > 0,
          );
          if (isLineCovered) {
            developerCoverage.lines.covered += 1;
          }
        }
      });
    });

    // Calculate percentages
    ['statements', 'branches', 'functions', 'lines'].forEach((metric) => {
      const data = developerCoverage[metric];
      const percentage = data.total > 0 ? ((data.covered / data.total) * 100).toFixed(2) : '0.00';
      data.percentage = percentage;
    });

    return developerCoverage;
  }

  extractCoverageMetrics(coverage) {
    if (!coverage) {
      return null;
    }

    // NYC coverage format has individual file coverage, not a "total" field
    // We need to aggregate across all files
    const totalStatements = { covered: 0, total: 0 };
    const totalBranches = { covered: 0, total: 0 };
    const totalFunctions = { covered: 0, total: 0 };
    const totalLines = { covered: 0, total: 0 };

    Object.values(coverage).forEach((fileCoverage) => {
      if (fileCoverage.s) {
        totalStatements.total += Object.keys(fileCoverage.s).length;
        totalStatements.covered += Object.values(fileCoverage.s).filter((hits) => hits > 0).length;
      }
      if (fileCoverage.b) {
        Object.values(fileCoverage.b).forEach((branch) => {
          totalBranches.total += branch.length;
          totalBranches.covered += branch.filter((hits) => hits > 0).length;
        });
      }
      if (fileCoverage.f) {
        totalFunctions.total += Object.keys(fileCoverage.f).length;
        totalFunctions.covered += Object.values(fileCoverage.f).filter((hits) => hits > 0).length;
      }
      if (fileCoverage.statementMap) {
        totalLines.total += Object.keys(fileCoverage.statementMap).length;
        const sCoverage = fileCoverage.s || {};
        totalLines.covered += Object.keys(sCoverage).filter((key) => sCoverage[key] > 0).length;
      }
    });

    return {
      statements: {
        covered: totalStatements.covered,
        total: totalStatements.total,
        percentage: totalStatements.total > 0 ? ((totalStatements.covered / totalStatements.total) * 100).toFixed(2) : '0.00',
      },
      branches: {
        covered: totalBranches.covered,
        total: totalBranches.total,
        percentage: totalBranches.total > 0 ? ((totalBranches.covered / totalBranches.total) * 100).toFixed(2) : '0.00',
      },
      functions: {
        covered: totalFunctions.covered,
        total: totalFunctions.total,
        percentage: totalFunctions.total > 0 ? ((totalFunctions.covered / totalFunctions.total) * 100).toFixed(2) : '0.00',
      },
      lines: {
        covered: totalLines.covered,
        total: totalLines.total,
        percentage: totalLines.total > 0 ? ((totalLines.covered / totalLines.total) * 100).toFixed(2) : '0.00',
      },
    };
  }

  getCommitStats(commits) {
    const stats = {
      totalCommits: commits.length,
      testFilesModified: 0,
      totalFilesModified: 0,
      dateRange: { earliest: null, latest: null },
    };

    const testFiles = new Set();
    let allFiles = 0;

    commits.forEach((commit) => {
      allFiles += commit.files.length;
      commit.files.forEach((file) => {
        const isInTestDir = this.testDirs.some((dir) => file.startsWith(dir));
        const hasTestExtension = this.testExtensions.some((ext) => file.endsWith(ext));

        if (isInTestDir && hasTestExtension) {
          testFiles.add(file);
        }
      });
    });

    stats.testFilesModified = testFiles.size;
    stats.totalFilesModified = allFiles;

    // Get date range
    if (commits.length > 0) {
      try {
        const firstCommit = commits[commits.length - 1].hash;
        const lastCommit = commits[0].hash;

        // Validate commit hashes before using them
        if (!firstCommit || !lastCommit || !firstCommit.match(/^[a-f0-9]{40}$/)) {
          console.log('Warning: Invalid commit hash format detected');
          return stats;
        }

        const firstDate = execSync(`git show -s --format=%ci ${firstCommit}`, {
          encoding: 'utf8',
          timeout: 5000,
        }).trim();
        const lastDate = execSync(`git show -s --format=%ci ${lastCommit}`, {
          encoding: 'utf8',
          timeout: 5000,
        }).trim();

        const [firstDateOnly] = firstDate.split(' ');
        const [lastDateOnly] = lastDate.split(' ');

        if (firstDateOnly && lastDateOnly) {
          stats.dateRange.earliest = firstDateOnly;
          stats.dateRange.latest = lastDateOnly;
        }
      } catch (error) {
        console.log(`Warning: Could not retrieve commit dates: ${error.message}`);
      }
    }

    return stats;
  }

  printEnhancedSummary(developer, stats, testFiles, sourceFiles, coverageResults) {
    console.log(`\n${'='.repeat(80)}`);
    console.log('ENHANCED DEVELOPER TEST COVERAGE ANALYSIS');
    console.log('='.repeat(80));
    console.log(`Developer: ${developer}`);
    console.log(`Analysis Period: ${stats.dateRange.earliest || 'N/A'} to ${stats.dateRange.latest || 'N/A'}`);
    console.log(`Total Commits: ${stats.totalCommits}`);
    console.log(`Total Files Modified: ${stats.totalFilesModified}`);
    console.log(`Source Files Modified: ${sourceFiles.length}`);
    console.log(`Test Files Modified: ${stats.testFilesModified}`);
    console.log(`Test Files Found: ${testFiles.length}`);

    if (coverageResults.changesCoverage) {
      console.log('\n🎯 DEVELOPER CHANGES ONLY:');
      console.log('-'.repeat(60));
      this.printCoverageMetrics(coverageResults.changesCoverage, 'changes');

      if (coverageResults.changedLines) {
        const totalChangedLines = Array.from(coverageResults.changedLines.values())
          .reduce((sum, lines) => sum + lines.size, 0);
        console.log(`  - Total Lines Changed: ${totalChangedLines}`);
      }
    }

    if (coverageResults.filesCoverage) {
      console.log('\n📁 ENTIRE FILES:');
      console.log('-'.repeat(60));
      this.printCoverageMetrics(coverageResults.filesCoverage, 'files');
    }

    if (coverageResults.changesCoverage && coverageResults.filesCoverage) {
      console.log('\n📊 COMPARISON & INSIGHTS:');
      console.log('-'.repeat(60));
      this.printComparison(coverageResults);
    }

    if (!coverageResults.changesCoverage && !coverageResults.filesCoverage) {
      console.log('\nCoverage data not available');
    }

    console.log('='.repeat(80));
  }

  printCoverageMetrics(coverage, mode) {
    const label = mode === 'changes' ? "Developer's Changes" : 'Entire Files';
    console.log(`${label} Coverage: ${coverage.statements.percentage}%`);
    console.log(`  - Statements: ${coverage.statements.covered}/${coverage.statements.total} (${coverage.statements.percentage}%)`);
    console.log(`  - Branches: ${coverage.branches.covered}/${coverage.branches.total} (${coverage.branches.percentage}%)`);
    console.log(`  - Functions: ${coverage.functions.covered}/${coverage.functions.total} (${coverage.functions.percentage}%)`);
    console.log(`  - Lines: ${coverage.lines.covered}/${coverage.lines.total} (${coverage.lines.percentage}%)`);
  }

  printComparison(results) {
    const changesPercent = parseFloat(results.changesCoverage.statements.percentage);
    const filesPercent = parseFloat(results.filesCoverage.statements.percentage);
    const difference = changesPercent - filesPercent;

    console.log(`Impact of Legacy Code: ${difference > 0 ? '+' : ''}${difference.toFixed(2)} percentage points`);

    if (difference < -20) {
      console.log('🚨 Developer heavily penalized by untested legacy code');
      console.log('   Consider adding tests for related legacy code when feasible');
    } else if (difference < -5) {
      console.log('⚠️  Developer somewhat penalized by legacy code');
      console.log('   Their changes have good coverage, but file overall needs improvement');
    } else if (difference > 10) {
      console.log('✅ Developer significantly improved overall file coverage');
      console.log('   Excellent contribution to both new features and legacy code quality');
    } else if (difference > 0) {
      console.log('✅ Developer has good testing discipline');
      console.log('   Their changes are well-tested and maintain file quality');
    } else {
      console.log('ℹ️  Developer changes aligned with existing code quality');
      console.log('   Consistent testing approach with current codebase standards');
    }

    // Additional insights
    if (results.changesCoverage.statements.total > 0) {
      const changesCoverage = parseFloat(results.changesCoverage.statements.percentage);
      if (changesCoverage >= 85) {
        console.log('🏆 Excellent: Developer\'s changes have strong test coverage (≥85%)');
      } else if (changesCoverage >= 75) {
        console.log('👍 Good: Developer\'s changes have decent test coverage (75-84%)');
      } else if (changesCoverage >= 65) {
        console.log('⚡ Fair: Developer\'s changes need more test coverage (65-74%)');
      } else {
        console.log('📝 Needs Improvement: Developer\'s changes lack sufficient tests (<65%)');
      }
    }
  }

  printSummary(developer, stats, testFiles, sourceFiles, coverageData) {
    // Legacy method for backward compatibility
    const coverageResults = {
      filesCoverage: coverageData,
      changesCoverage: null,
      changedLines: null,
    };
    this.printEnhancedSummary(developer, stats, testFiles, sourceFiles, coverageResults);
  }

  async analyze() {
    const params = this.parseArgs();
    this.validateParams(params);

    console.log('Analyzing developer test coverage...');
    console.log(`Developer: ${params.developer}`);
    console.log(`Date Range: ${params.startDate || 'Beginning'} to ${params.endDate || 'Present'}`);
    console.log('');

    const commits = this.getCommitsByDeveloper(params.developer, params.startDate, params.endDate);
    const stats = this.getCommitStats(commits);
    const testFiles = this.filterTestFiles(commits);
    const sourceFiles = this.filterSourceFiles(commits);

    // Run enhanced dual analysis
    const coverageResults = this.runDualCoverageAnalysis(testFiles, sourceFiles, commits);
    this.printEnhancedSummary(params.developer, stats, testFiles, sourceFiles, coverageResults);

    if (testFiles.length === 0 || sourceFiles.length === 0) {
      console.log('\nInsights:');
      if (testFiles.length === 0) {
        console.log('- No test files found for this developer in the specified period');
      }
      if (sourceFiles.length === 0) {
        console.log('- No source files found for this developer in the specified period');
      }
      console.log('- The test files or source files may have been moved or deleted');
      console.log('- The date range or developer name/email might be incorrect');
    }

    return coverageResults;
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new DeveloperTestCoverageAnalyzer();
  analyzer.analyze().catch((error) => {
    console.error('Analysis failed:', error.message);
    process.exit(1);
  });
}

module.exports = DeveloperTestCoverageAnalyzer;
