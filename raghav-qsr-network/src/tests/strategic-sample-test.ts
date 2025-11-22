/**
 * Strategic Sample Test: Representative Subset
 * 
 * Tests 20 carefully selected posts that cover:
 * - All leverage signal types
 * - Different signal combinations (1, 2-3, 4+ signals)
 * - All anti-patterns
 * - Edge cases (borderline quality/flops)
 * 
 * Goal: 95%+ accuracy (19/20 posts) before running full validation
 * Time: ~3-5 minutes
 */

import 'dotenv/config';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { viralQualityEval } from '../mastra/evals';
import { loadAllPosts } from '../mastra/evals/utils/training-data';

// Strategic sample selection
const QUALITY_SAMPLE = [
  // High confidence - Multiple strong signals
  'P001', // shocking_number + detailed_breakdown + reveals_hidden
  'P052', // shocking_number + side_by_side + detailed_breakdown
  'P053', // shocking_number + side_by_side + contrarian + detailed_breakdown (4 signals)
  'P054', // contrarian + detailed_breakdown
  'P058', // shocking_number + detailed_breakdown
  'P037', // shocking_number + reveals_hidden
  
  // Medium confidence - Fewer or less common signals
  'P035', // market_saturation (different pattern)
  'P014', // comeback_story
  'P004', // shocking_number (single strong signal)
  
  // Edge cases - Posts with 1-2 moderate signals
  'P056', // To test borderline quality
  'P057', // To test borderline quality
  'P034', // To test borderline quality
];

const FLOP_SAMPLE = [
  // Clear flops - Multiple anti-patterns
  'P029', // cringy_hook + zero_insight
  'P020', // missing_shocking_numbers + surface_level
  'P039', // zero_insight (news reporting)
  'P041', // missing_broad_appeal (too narrow)
  
  // Edge cases - Has some good elements but failed
  'P025', // Borderline flop
  'P028', // Borderline flop
  'P051', // Borderline flop
  'P022', // Borderline flop (sales pitch)
];

interface TestResult {
  id: string;
  expectedCategory: 'quality' | 'flop';
  score: number;
  passed: boolean;
  signals?: string[];
  antiPatterns?: string[];
  isViralWorthy?: boolean;
}

async function strategicSampleTest() {
  console.log('🎯 STRATEGIC SAMPLE TEST\n');
  console.log('='.repeat(70));
  console.log('\nTesting 20 representative posts:');
  console.log('  • 12 quality posts (should score >= 0.85)');
  console.log('  • 8 flop posts (should score < 0.85)\n');
  console.log('Goal: 95%+ accuracy (19/20 posts)\n');
  console.log('='.repeat(70));

  const allPosts = loadAllPosts();
  const results: TestResult[] = [];

  // Test quality posts
  console.log('\n📈 TESTING QUALITY POSTS (12 posts)\n');
  console.log('═'.repeat(70));

  for (const postId of QUALITY_SAMPLE) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) {
      console.log(`⚠️  Post ${postId} not found, skipping...`);
      continue;
    }

    console.log(`\nTesting ${postId}...`);
    const result = await viralQualityEval.measure('', post.text);
    const passed = result.score >= 0.85;

    const testResult: TestResult = {
      id: postId,
      expectedCategory: 'quality',
      score: result.score,
      passed,
      isViralWorthy: result.info?.isViralWorthy,
    };

    // Extract which signals scored high
    if (result.info?.breakdown?.signals) {
      testResult.signals = Object.entries(result.info.breakdown.signals)
        .filter(([_, score]: [string, any]) => score >= 0.7)
        .map(([signal, _]: [string, any]) => signal);
    }

    results.push(testResult);

    const emoji = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${emoji} ${postId}: ${result.score.toFixed(2)}/1.00 ${status}`);
    
    if (!passed && result.info?.weaknesses) {
      console.log(`   Weaknesses: ${result.info.weaknesses.slice(0, 2).join(', ')}`);
    }

    // Rate limit delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test flop posts
  console.log('\n\n📉 TESTING FLOP POSTS (8 posts)\n');
  console.log('═'.repeat(70));

  for (const postId of FLOP_SAMPLE) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) {
      console.log(`⚠️  Post ${postId} not found, skipping...`);
      continue;
    }

    console.log(`\nTesting ${postId}...`);
    const result = await viralQualityEval.measure('', post.text);
    const passed = result.score < 0.85;

    const testResult: TestResult = {
      id: postId,
      expectedCategory: 'flop',
      score: result.score,
      passed,
      isViralWorthy: result.info?.isViralWorthy,
    };

    // Extract which anti-patterns were detected
    if (result.info?.breakdown?.antiPatterns) {
      testResult.antiPatterns = Object.entries(result.info.breakdown.antiPatterns)
        .filter(([_, score]: [string, any]) => score < 0.9)
        .map(([pattern, _]: [string, any]) => pattern);
    }

    results.push(testResult);

    const emoji = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${emoji} ${postId}: ${result.score.toFixed(2)}/1.00 ${status}`);
    
    if (!passed) {
      console.log(`   ⚠️  Scored too high! Expected < 0.85`);
      if (result.info?.strengths) {
        console.log(`   Strengths: ${result.info.strengths.slice(0, 2).join(', ')}`);
      }
    }

    // Rate limit delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Calculate results
  console.log('\n\n' + '═'.repeat(70));
  console.log('STRATEGIC SAMPLE RESULTS');
  console.log('═'.repeat(70));

  const qualityResults = results.filter(r => r.expectedCategory === 'quality');
  const flopResults = results.filter(r => r.expectedCategory === 'flop');

  const qualityPassCount = qualityResults.filter(r => r.passed).length;
  const flopPassCount = flopResults.filter(r => r.passed).length;
  const totalPassCount = qualityPassCount + flopPassCount;
  const totalAccuracy = (totalPassCount / results.length) * 100;

  console.log('\n📊 QUALITY POSTS:');
  console.log(`   Passed: ${qualityPassCount}/${qualityResults.length} (${((qualityPassCount / qualityResults.length) * 100).toFixed(1)}%)`);
  
  const qualityFails = qualityResults.filter(r => !r.passed);
  if (qualityFails.length > 0) {
    console.log('   Failed (scored < 0.85):');
    qualityFails.forEach(f => console.log(`     - ${f.id}: ${f.score.toFixed(2)}`));
  }

  console.log('\n📊 FLOP POSTS:');
  console.log(`   Passed: ${flopPassCount}/${flopResults.length} (${((flopPassCount / flopResults.length) * 100).toFixed(1)}%)`);
  
  const flopFails = flopResults.filter(r => !r.passed);
  if (flopFails.length > 0) {
    console.log('   Failed (scored >= 0.85):');
    flopFails.forEach(f => console.log(`     - ${f.id}: ${f.score.toFixed(2)}`));
  }

  console.log('\n📊 OVERALL ACCURACY:');
  console.log(`   Total: ${totalPassCount}/${results.length} (${totalAccuracy.toFixed(1)}%)`);
  console.log(`   Target: 95%+ (19/20 posts)`);

  // Diagnosis and recommendations
  console.log('\n' + '═'.repeat(70));
  console.log('DIAGNOSIS & RECOMMENDATIONS');
  console.log('═'.repeat(70));

  if (totalAccuracy >= 95) {
    console.log('\n✅ EXCELLENT! Eval system is ready.');
    console.log('   → Proceed to full 56-post validation');
    console.log('   → Expect 90-95% accuracy on full test\n');
  } else if (totalAccuracy >= 85) {
    console.log('\n⚠️  GOOD, but needs minor tuning.');
    console.log('   → Review failed posts below');
    console.log('   → Adjust weights or thresholds');
    console.log('   → Re-run strategic test before full validation\n');
    
    if (qualityFails.length > 0) {
      console.log('   Quality posts that failed:');
      qualityFails.forEach(f => {
        console.log(`     ${f.id} (${f.score.toFixed(2)}): Likely needs higher signal weights`);
      });
    }
    
    if (flopFails.length > 0) {
      console.log('   Flop posts that passed as quality:');
      flopFails.forEach(f => {
        console.log(`     ${f.id} (${f.score.toFixed(2)}): Anti-patterns not catching issues`);
      });
    }
  } else {
    console.log('\n❌ NEEDS SIGNIFICANT TUNING');
    console.log('   → Scoring formula has issues');
    console.log('   → Review LLM prompts in individual evals');
    console.log('   → DO NOT run full validation yet\n');
  }

  console.log('═'.repeat(70));

  // Save results
  const outputData = {
    timestamp: new Date().toISOString(),
    testType: 'strategic_sample',
    sampleSize: results.length,
    accuracy: totalAccuracy,
    qualityAccuracy: (qualityPassCount / qualityResults.length) * 100,
    flopAccuracy: (flopPassCount / flopResults.length) * 100,
    results,
    diagnosis: totalAccuracy >= 95 ? 'ready' : totalAccuracy >= 85 ? 'needs_tuning' : 'needs_major_work',
  };

  const outputPath = join(__dirname, 'results/strategic-sample-results.json');
  writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`\n💾 Results saved to: tests/results/strategic-sample-results.json\n`);
}

strategicSampleTest().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

