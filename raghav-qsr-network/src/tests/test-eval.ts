/**
 * Test Script: Eval System Proof of Concept
 * 
 * Tests both individual evals and master viral quality eval:
 * 1. A known quality post (should score high)
 * 2. A known flop post (should score low)
 * 3. A sample generated post
 * 4. Master eval on quality post
 * 
 * Results are saved to tests/results/test-eval-results.json
 */

import 'dotenv/config';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { shockingNumberContrastEval, viralQualityEval } from '../mastra/evals';
import { loadAllPosts } from '../mastra/evals/utils/training-data';

interface TestResult {
  testNumber: number;
  testName: string;
  postId?: string;
  expected: string;
  score: number;
  passed: boolean;
  reason?: string;
  recommendations?: string[];
  isViralWorthy?: boolean;
}

async function testEval() {
  console.log('🧪 Testing Eval System\n');
  console.log('='.repeat(60));

  const allPosts = loadAllPosts();
  const testResults: TestResult[] = [];

  // Test 1: Quality post with shocking numbers (should score high)
  const qualityPost = allPosts.find(p => p.id === 'P001'); // $8.5M vs $500K
  if (qualityPost) {
    console.log('\n📌 TEST 1: Quality Post (P001 - Chick-fil-A vs Subway)');
    console.log('Expected: High score (0.85+)\n');
    
    const result1 = await shockingNumberContrastEval.measure('', qualityPost.text);
    const passed = result1.score >= 0.85;
    
    console.log(`\nResult: ${result1.score.toFixed(2)}/1.00 ${passed ? '✅ PASS' : '❌ FAIL'}`);
    if (result1.info) {
      console.log(`Reason: ${result1.info.reason}`);
      if (result1.info.recommendations && result1.info.recommendations.length > 0) {
        console.log('Recommendations:');
        result1.info.recommendations.forEach((rec: string) => console.log(`  - ${rec}`));
      }
    }

    testResults.push({
      testNumber: 1,
      testName: 'Quality Post - Shocking Number Contrast',
      postId: 'P001',
      expected: 'score >= 0.85',
      score: result1.score,
      passed,
      reason: result1.info?.reason,
      recommendations: result1.info?.recommendations,
    });
  }

  console.log('\n' + '='.repeat(60));

  // Test 2: Flop post without shocking numbers (should score low)
  const flopPost = allPosts.find(p => p.id === 'P020' && p.hasViralElements === false);
  if (flopPost) {
    console.log('\n📌 TEST 2: Flop Post (P020 - Missing shocking numbers)');
    console.log('Expected: Low score (<0.5)\n');
    
    const result2 = await shockingNumberContrastEval.measure('', flopPost.text);
    const passed = result2.score < 0.5;
    
    console.log(`\nResult: ${result2.score.toFixed(2)}/1.00 ${passed ? '✅ PASS' : '❌ FAIL'}`);
    if (result2.info) {
      console.log(`Reason: ${result2.info.reason}`);
      if (result2.info.recommendations && result2.info.recommendations.length > 0) {
        console.log('Recommendations:');
        result2.info.recommendations.forEach((rec: string) => console.log(`  - ${rec}`));
      }
    }

    testResults.push({
      testNumber: 2,
      testName: 'Flop Post - Shocking Number Contrast',
      postId: 'P020',
      expected: 'score < 0.5',
      score: result2.score,
      passed,
      reason: result2.info?.reason,
      recommendations: result2.info?.recommendations,
    });
  }

  console.log('\n' + '='.repeat(60));

  // Test 3: Sample generated post
  const samplePost = `Chipotle makes $10B/year. Qdoba makes $800M.

Same burritos. Same format. Same market.

Why is Chipotle 12.5x bigger?

Three decisions changed everything:

1. Real estate strategy
Chipotle: High-traffic urban corners
Qdoba: Strip malls and food courts

2. Menu simplicity
Chipotle: 5 proteins, build-your-own
Qdoba: 15+ proteins, overwhelming choice

3. Digital-first transformation
Chipotle invested $50M in digital in 2018
Qdoba still relied on in-store in 2020

The result?
Chipotle: 3,200 locations, $3.1M per store
Qdoba: 750 locations, $1.1M per store

Market leadership isn't about being first.
It's about being FOCUSED.`;

  console.log('\n📌 TEST 3: Sample Generated Post (Chipotle vs Qdoba)');
  console.log('Expected: High score (has $10B vs $800M contrast)\n');
  
  const result3 = await shockingNumberContrastEval.measure('', samplePost);
  const passed3 = result3.score >= 0.8;
  
  console.log(`\nResult: ${result3.score.toFixed(2)}/1.00 ${passed3 ? '✅ PASS' : '❌ FAIL'}`);
  if (result3.info) {
    console.log(`Reason: ${result3.info.reason}`);
    if (result3.info.recommendations && result3.info.recommendations.length > 0) {
      console.log('Recommendations:');
      result3.info.recommendations.forEach((rec: string) => console.log(`  - ${rec}`));
    }
  }

  testResults.push({
    testNumber: 3,
    testName: 'Sample Generated Post - Shocking Number Contrast',
    postId: 'SAMPLE',
    expected: 'score >= 0.8',
    score: result3.score,
    passed: passed3,
    reason: result3.info?.reason,
    recommendations: result3.info?.recommendations,
  });

  console.log('\n' + '='.repeat(60));

  // Test 4: Master Viral Quality Eval on quality post
  console.log('\n📌 TEST 4: Master Eval on Quality Post (P053)');
  console.log('Expected: High score (0.85+)\n');
  
  const qualityPost2 = allPosts.find(p => p.id === 'P053');
  if (qualityPost2) {
    const result4 = await viralQualityEval.measure('', qualityPost2.text);
    const passed4 = result4.score >= 0.85;
    
    console.log(`\nFinal Score: ${result4.score.toFixed(2)}/1.00 ${passed4 ? '✅ PASS' : '❌ FAIL'}`);
    if (result4.info) {
      console.log(`Status: ${result4.info.isViralWorthy ? '✅ VIRAL-WORTHY' : '❌ NEEDS WORK'}`);
    }

    testResults.push({
      testNumber: 4,
      testName: 'Quality Post - Master Viral Quality Eval',
      postId: 'P053',
      expected: 'score >= 0.85',
      score: result4.score,
      passed: passed4,
      isViralWorthy: result4.info?.isViralWorthy,
    });
  }

  console.log('\n' + '='.repeat(60));

  // Calculate overall pass rate
  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.passed).length;
  const passRate = (passedTests / totalTests) * 100;

  console.log('\n📊 TEST SUMMARY:');
  console.log(`   Total tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${totalTests - passedTests}`);
  console.log(`   Pass rate: ${passRate.toFixed(1)}%\n`);

  if (passRate === 100) {
    console.log('✅ ALL TESTS PASSED!\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED - Review results below\n');
    testResults.filter(t => !t.passed).forEach(t => {
      console.log(`   ❌ Test ${t.testNumber}: ${t.testName} (${t.score.toFixed(2)})`);
    });
    console.log('');
  }

  // Save results to file
  const outputData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      passRate,
    },
    tests: testResults,
  };

  const outputPath = join(__dirname, 'results/test-eval-results.json');
  writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`💾 Results saved to: tests/results/test-eval-results.json\n`);
  
  console.log('='.repeat(60));
  console.log('\n✅ Eval test complete!\n');
}

testEval().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

