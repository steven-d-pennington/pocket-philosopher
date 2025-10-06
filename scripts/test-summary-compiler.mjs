#!/usr/bin/env node

/**
 * Test Summary Compiler
 * 
 * Parses test execution results from markdown files and generates
 * a comprehensive summary report for the community features test suite.
 * 
 * Usage:
 *   node scripts/test-summary-compiler.mjs
 * 
 * Output:
 *   - Console summary
 *   - docs/testing/TEST_SUMMARY_REPORT.md (generated file)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TESTING_DIR = path.join(__dirname, '..', 'docs', 'testing');
const OUTPUT_FILE = path.join(TESTING_DIR, 'TEST_SUMMARY_REPORT.md');

const TEST_FILES = [
  '01-community-onboarding.md',
  '02-coach-sharing.md',
  '03-community-feed.md',
  '04-reflection-sharing.md',
  '05-today-widget.md',
  '06-practice-milestones.md',
  '07-state-sync.md',
  '08-display-name-validation.md',
  '09-content-type-rendering.md',
];

// Parse test result from markdown file
function parseTestFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  
  // Extract test metadata
  const testNumber = fileName.match(/^(\d+)-/)?.[1] || '??';
  const titleMatch = content.match(/^#\s+Test Case \d+:\s+(.+)$/m);
  const title = titleMatch?.[1] || 'Unknown Test';
  
  const priorityMatch = content.match(/\*\*Priority\*\*:\s+(.+)$/m);
  const priority = priorityMatch?.[1] || 'Unknown';
  
  const timeMatch = content.match(/\*\*Estimated Time\*\*:\s+(.+)$/m);
  const estimatedTime = timeMatch?.[1] || 'Unknown';
  
  // Extract overall result
  const resultMatch = content.match(/\*\*Overall Result\*\*:\s+\[(x|X| )\]\s+PASS\s+\/\s+\[(x|X| )\]\s+PASS WITH WARNINGS\s+\/\s+\[(x|X| )\]\s+FAIL/);
  let status = 'Not Started';
  if (resultMatch) {
    if (resultMatch[1].toLowerCase() === 'x') status = 'PASS';
    else if (resultMatch[2].toLowerCase() === 'x') status = 'PASS WITH WARNINGS';
    else if (resultMatch[3].toLowerCase() === 'x') status = 'FAIL';
  }
  
  // Extract steps passed
  const stepsMatch = content.match(/\*\*Steps Passed\*\*:\s+(\d+)\s+\/\s+(\d+)/);
  const stepsPassed = stepsMatch?.[1] || '0';
  const stepsTotal = stepsMatch?.[2] || '?';
  
  // Extract tester info
  const testerMatch = content.match(/\*\*Tested By\*\*:\s+(.+)$/m);
  const tester = testerMatch?.[1]?.trim() || '';
  
  const dateMatch = content.match(/\*\*Date\*\*:\s+(.+)$/m);
  const testDate = dateMatch?.[1]?.trim() || '';
  
  // Extract critical issues
  const issuesSection = content.match(/\*\*Critical Issues\*\*:\s*\n([\s\S]*?)(?:\n\n|\*\*|$)/);
  const issuesText = issuesSection?.[1]?.trim() || '';
  const issues = issuesText
    .split('\n')
    .filter(line => line.trim() && line.match(/^\d+\./))
    .map(line => line.replace(/^\d+\.\s*/, '').trim());
  
  return {
    testNumber,
    title,
    priority,
    estimatedTime,
    status,
    stepsPassed,
    stepsTotal,
    tester: tester || 'Not Tested',
    testDate: testDate || 'N/A',
    issues: issues.length > 0 ? issues : ['None'],
    fileName,
  };
}

// Generate summary report
function generateSummaryReport(results) {
  const timestamp = new Date().toISOString();
  
  // Calculate statistics
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'PASS').length;
  const passedWithWarnings = results.filter(r => r.status === 'PASS WITH WARNINGS').length;
  const failedTests = results.filter(r => r.status === 'FAIL').length;
  const notStarted = results.filter(r => r.status === 'Not Started').length;
  
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';
  
  const totalSteps = results.reduce((sum, r) => sum + parseInt(r.stepsTotal), 0);
  const passedSteps = results.reduce((sum, r) => sum + parseInt(r.stepsPassed), 0);
  const stepPassRate = totalSteps > 0 ? ((passedSteps / totalSteps) * 100).toFixed(1) : '0.0';
  
  const allIssues = results.flatMap(r => 
    r.issues.filter(i => i !== 'None').map(issue => ({ test: r.title, issue }))
  );
  
  // Generate markdown report
  let report = `# Community Features Test Summary Report

**Generated**: ${timestamp}  
**Test Suite**: Community Features (9 tests)  
**Branch**: feature/community

---

## 📊 Executive Summary

**Overall Status**: ${passedTests === totalTests ? '✅ ALL TESTS PASSED' : failedTests > 0 ? '❌ FAILURES DETECTED' : '⚠️ TESTING IN PROGRESS'}

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Tests** | ${totalTests} | 100% |
| **Passed** | ${passedTests} | ${passRate}% |
| **Passed with Warnings** | ${passedWithWarnings} | ${((passedWithWarnings/totalTests)*100).toFixed(1)}% |
| **Failed** | ${failedTests} | ${((failedTests/totalTests)*100).toFixed(1)}% |
| **Not Started** | ${notStarted} | ${((notStarted/totalTests)*100).toFixed(1)}% |

**Step-Level Pass Rate**: ${passedSteps} / ${totalSteps} steps (${stepPassRate}%)

---

## 🎯 Test Results

| # | Test | Priority | Status | Steps | Tester | Date |
|---|------|----------|--------|-------|--------|------|
`;

  results.forEach(r => {
    const statusIcon = 
      r.status === 'PASS' ? '✅' :
      r.status === 'PASS WITH WARNINGS' ? '⚠️' :
      r.status === 'FAIL' ? '❌' :
      '🔲';
    
    report += `| ${r.testNumber} | ${r.title} | ${r.priority} | ${statusIcon} ${r.status} | ${r.stepsPassed}/${r.stepsTotal} | ${r.tester} | ${r.testDate} |\n`;
  });

  report += `\n---

## 🐛 Issues Summary

**Total Issues Found**: ${allIssues.length}

`;

  if (allIssues.length === 0) {
    report += '✅ No issues found during testing!\n';
  } else {
    allIssues.forEach((item, idx) => {
      report += `${idx + 1}. **${item.test}**: ${item.issue}\n`;
    });
  }

  report += `\n---

## 📋 Detailed Test Breakdown

`;

  results.forEach(r => {
    report += `### ${r.testNumber}. ${r.title}

- **Priority**: ${r.priority}
- **Estimated Time**: ${r.estimatedTime}
- **Status**: ${r.status}
- **Steps Passed**: ${r.stepsPassed} / ${r.stepsTotal}
- **Tester**: ${r.tester}
- **Date**: ${r.testDate}
- **Critical Issues**: ${r.issues.join(', ')}

`;
  });

  report += `---

## ✅ Pre-Merge Readiness

`;

  const criticalPassed = results
    .filter(r => r.priority.includes('P1') || r.priority.includes('CRITICAL'))
    .every(r => r.status === 'PASS');
  
  const highPassed = results
    .filter(r => r.priority.includes('P2') || r.priority.includes('P3') || r.priority.includes('P4'))
    .filter(r => r.status === 'PASS' || r.status === 'PASS WITH WARNINGS')
    .length;
  
  const highTotal = results
    .filter(r => r.priority.includes('P2') || r.priority.includes('P3') || r.priority.includes('P4'))
    .length;

  report += `- ${criticalPassed ? '✅' : '❌'} All critical tests (P1) passed
- ${highPassed >= highTotal * 0.8 ? '✅' : '❌'} At least 80% of high-priority tests passed (${highPassed}/${highTotal})
- ${failedTests === 0 ? '✅' : '❌'} No failed tests
- ${allIssues.length === 0 ? '✅' : '⚠️'} ${allIssues.length} critical issues to resolve

`;

  const readyToMerge = criticalPassed && failedTests === 0 && highPassed >= highTotal * 0.8;

  report += `**Merge Recommendation**: ${readyToMerge ? '✅ READY TO MERGE' : '❌ NOT READY - Fix issues first'}

---

## 🔄 Next Steps

`;

  if (notStarted > 0) {
    report += `1. Complete ${notStarted} remaining tests\n`;
  }
  if (failedTests > 0) {
    report += `2. Fix ${failedTests} failed tests\n`;
  }
  if (allIssues.length > 0) {
    report += `3. Address ${allIssues.length} critical issues\n`;
  }
  if (readyToMerge) {
    report += `1. ✅ All tests passed - proceed with pre-merge checklist\n`;
    report += `2. Review \`docs/testing/pre-merge-checklist.md\`\n`;
    report += `3. Merge to main when approved\n`;
  }

  report += `\n---

## 📁 Test Documentation

All test files are located in \`docs/testing/\`:

${TEST_FILES.map((f, i) => `${i + 1}. [${f}](./docs/testing/${f})`).join('\n')}

---

**Report Generated By**: test-summary-compiler.mjs  
**Timestamp**: ${timestamp}
`;

  return report;
}

// Main execution
function main() {
  console.log('🔍 Community Features Test Summary Compiler\n');
  console.log(`Reading test files from: ${TESTING_DIR}\n`);
  
  const results = [];
  
  for (const file of TEST_FILES) {
    const filePath = path.join(TESTING_DIR, file);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Warning: ${file} not found, skipping...`);
      continue;
    }
    
    try {
      const result = parseTestFile(filePath);
      results.push(result);
      console.log(`✅ Parsed: ${file} - Status: ${result.status}`);
    } catch (error) {
      console.error(`❌ Error parsing ${file}:`, error.message);
    }
  }
  
  console.log(`\n📊 Generating summary report...`);
  
  const report = generateSummaryReport(results);
  
  // Write to file
  fs.writeFileSync(OUTPUT_FILE, report, 'utf-8');
  console.log(`\n✅ Summary report written to: ${OUTPUT_FILE}`);
  
  // Print summary to console
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'PASS').length;
  const failedTests = results.filter(r => r.status === 'FAIL').length;
  const notStarted = results.filter(r => r.status === 'Not Started').length;
  
  console.log(`\nTests Completed: ${passedTests + failedTests} / ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`🔲 Not Started: ${notStarted}`);
  
  const allIssues = results.flatMap(r => r.issues.filter(i => i !== 'None'));
  console.log(`\n🐛 Critical Issues: ${allIssues.length}`);
  
  const readyToMerge = passedTests === totalTests && failedTests === 0 && allIssues.length === 0;
  console.log(`\n${readyToMerge ? '✅ READY TO MERGE' : '⚠️  NOT READY TO MERGE'}`);
  console.log('\n' + '='.repeat(60) + '\n');
}

// Run the script
main();
