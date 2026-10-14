/**
 * CardioVision AI - Risk Mapping & Threshold Logic Unit Test
 * Verifies:
 * - Low: 0% - 33%
 * - Moderate: 34% - 66%
 * - High: 67% - 100%
 */

function getRiskCategory(prob) {
  if (prob >= 0.67) return 'high';
  if (prob >= 0.34) return 'moderate';
  return 'low';
}

function runTests() {
  console.log("=".repeat(60));
  console.log("CARDIOVISION AI - RISK MAPPING UNIT TESTS");
  console.log("=".repeat(60));

  const testCases = [
    { prob: 0.00, expected: 'low' },
    { prob: 0.20, expected: 'low' },
    { prob: 0.33, expected: 'low' },
    { prob: 0.34, expected: 'moderate' },
    { prob: 0.50, expected: 'moderate' },
    { prob: 0.66, expected: 'moderate' },
    { prob: 0.67, expected: 'high' },
    { prob: 0.85, expected: 'high' },
    { prob: 1.00, expected: 'high' }
  ];

  let passed = 0;
  testCases.forEach((tc, i) => {
    const res = getRiskCategory(tc.prob);
    if (res === tc.expected) {
      console.log(`[PASS] Case ${i + 1}: prob=${tc.prob} -> '${res}' matches '${tc.expected}'`);
      passed++;
    } else {
      console.error(`[FAIL] Case ${i + 1}: prob=${tc.prob} -> got '${res}', expected '${tc.expected}'`);
    }
  });

  console.log("=".repeat(60));
  console.log(`RESULTS: ${passed}/${testCases.length} RISK MAPPING TESTS PASSED`);
  console.log("=".repeat(60));
  return passed === testCases.length;
}

const success = runTests();
process.exit(success ? 0 : 1);
