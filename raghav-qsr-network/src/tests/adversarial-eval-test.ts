/**
 * Adversarial Eval Test: Designed to BREAK the System
 * 
 * This test is intentionally harsh to expose weaknesses:
 * - Compares detected signals vs actual annotated signals
 * - Tests hardest edge cases that will likely fail
 * - Measures signal detection accuracy (precision/recall)
 * - Forces 2-3 iterations before production readiness
 * 
 * Goal: FAIL initially, iterate, then achieve 90%+ accuracy
 */

import 'dotenv/config';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { viralQualityEval } from '../mastra/evals';
import { loadAllPosts, type Post } from '../mastra/evals/utils/training-data';

// ADVERSARIAL SAMPLE: Hardest posts that will expose weaknesses
const STRESS_TEST_QUALITY = [
  // Single signal posts (hardest - will they pass?)
  'P004', // Only shocking_number_contrast
  'P014', // Only comeback_story
  'P056', // Only side_by_side (weak)
  
  // Posts with less common signals
  'P035', // market_saturation (not in our signal list)
  'P007', // time_value_economics (not in our signal list)
  
  // Posts with subtle/nuanced signals
  'P037', // Time value concept (abstract)
  'P034', // Business model comparison
  'P057', // Insider info but not obvious
  
  // Multiple strong signals (should definitely pass)
  'P001', // Control case: 3 signals
  'P053', // Control case: 4 signals
];

const STRESS_TEST_FLOPS = [
  // Borderline flops (might score too high)
  'P025', // Has some data but shallow
  'P028', // Some structure but no insight
  'P051', // Conceptual, missing forensics
  'P026', // Generic advice
  
  // Clear flops with obvious issues
  'P029', // Cringy hook
  'P039', // Just news
  'P041', // Too narrow
  
  // Edge: Promotional content
  'P022', // Sales pitch at end
  'P033', // Product promotion
];

interface SignalComparison {
  annotated: string[];        // What we manually labeled
  detected: string[];         // What eval system detected
  correctlyDetected: string[]; // Annotated AND detected
  missed: string[];           // Annotated but NOT detected (false negatives)
  falsePositives: string[];   // Detected but NOT annotated
  precision: number;          // % of detected that are correct
  recall: number;             // % of annotated that were detected
  f1Score: number;            // Harmonic mean of precision/recall
}

interface AdversarialTestResult {
  id: string;
  expectedCategory: 'quality' | 'flop';
  score: number;
  passed: boolean;
  isViralWorthy?: boolean;
  
  // Signal comparison (for quality posts)
  signalComparison?: SignalComparison;
  
  // Anti-pattern detection (for flop posts)
  antiPatternsDetected?: string[];
  antiPatternsExpected?: string[];
  
  // Difficulty rating
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  
  // Diagnosis
  issue?: string;
}

function extractSignalNames(post: Post): string[] {
  if (!post.leverageSignals || post.leverageSignals.length === 0) {
    return [];
  }
  return post.leverageSignals.map(s => s.signal);
}

function calculateSignalMetrics(annotated: string[], detected: string[]): SignalComparison {
  const correctlyDetected = annotated.filter(s => detected.includes(s));
  const missed = annotated.filter(s => !detected.includes(s));
  const falsePositives = detected.filter(s => !annotated.includes(s));
  
  const precision = detected.length > 0 
    ? correctlyDetected.length / detected.length 
    : 0;
  
  const recall = annotated.length > 0 
    ? correctlyDetected.length / annotated.length 
    : 0;
  
  const f1Score = (precision + recall) > 0 
    ? 2 * (precision * recall) / (precision + recall) 
    : 0;
  
  return {
    annotated,
    detected,
    correctlyDetected,
    missed,
    falsePositives,
    precision,
    recall,
    f1Score,
  };
}

function assessDifficulty(post: Post): 'easy' | 'medium' | 'hard' | 'extreme' {
  const signalCount = post.leverageSignals?.length || 0;
  
  if (signalCount >= 3) return 'easy';     // Multiple strong signals
  if (signalCount === 2) return 'medium';  // Two signals
  if (signalCount === 1) return 'hard';    // Single signal
  return 'extreme';                        // No clear signals or unusual pattern
}

async function adversarialTest() {
  console.log('🔥 ADVERSARIAL EVAL TEST - DESIGNED TO BREAK THE SYSTEM\n');
  console.log('='.repeat(70));
  console.log('\nThis test is INTENTIONALLY HARSH:');
  console.log('  • Tests hardest edge cases');
  console.log('  • Compares detected vs annotated signals');
  console.log('  • Measures signal detection accuracy (precision/recall)');
  console.log('  • Expected to FAIL on first run\n');
  console.log('Goal: Iterate 2-3 times to achieve 90%+ accuracy\n');
  console.log('='.repeat(70));

  const allPosts = loadAllPosts();
  const results: AdversarialTestResult[] = [];
  
  let totalPrecision = 0;
  let totalRecall = 0;
  let totalF1 = 0;
  let signalComparisonCount = 0;

  // Test quality posts
  console.log('\n🎯 TESTING QUALITY POSTS (STRESS TEST)\n');
  console.log('═'.repeat(70));

  for (const postId of STRESS_TEST_QUALITY) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) {
      console.log(`⚠️  Post ${postId} not found, skipping...`);
      continue;
    }

    console.log(`\nTesting ${postId}...`);
    const result = await viralQualityEval.measure('', post.text);
    const passed = result.score >= 0.85;
    
    // Extract signals from eval
    const detectedSignals = result.info?.breakdown?.signals 
      ? Object.entries(result.info.breakdown.signals)
          .filter(([_, score]: [string, any]) => score >= 0.7)
          .map(([signal, _]: [string, any]) => signal)
      : [];
    
    // Compare with annotated signals
    const annotatedSignals = extractSignalNames(post);
    const signalComparison = calculateSignalMetrics(annotatedSignals, detectedSignals);
    
    totalPrecision += signalComparison.precision;
    totalRecall += signalComparison.recall;
    totalF1 += signalComparison.f1Score;
    signalComparisonCount++;
    
    const difficulty = assessDifficulty(post);
    
    const testResult: AdversarialTestResult = {
      id: postId,
      expectedCategory: 'quality',
      score: result.score,
      passed,
      isViralWorthy: result.info?.isViralWorthy,
      signalComparison,
      difficulty,
    };
    
    // Diagnose issues
    if (!passed) {
      testResult.issue = `Scored ${result.score.toFixed(2)} (threshold 0.85). Detected ${detectedSignals.length}/${annotatedSignals.length} signals.`;
    } else if (signalComparison.recall < 0.5) {
      testResult.issue = `Low recall (${(signalComparison.recall * 100).toFixed(0)}%) - missed ${signalComparison.missed.join(', ')}`;
    }
    
    results.push(testResult);

    const emoji = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${emoji} ${postId} (${difficulty}): ${result.score.toFixed(2)}/1.00 ${status}`);
    console.log(`   Annotated signals: [${annotatedSignals.join(', ')}]`);
    console.log(`   Detected signals:  [${detectedSignals.join(', ')}]`);
    console.log(`   Precision: ${(signalComparison.precision * 100).toFixed(0)}% | Recall: ${(signalComparison.recall * 100).toFixed(0)}% | F1: ${(signalComparison.f1Score * 100).toFixed(0)}%`);
    
    if (signalComparison.missed.length > 0) {
      console.log(`   ⚠️  MISSED: ${signalComparison.missed.join(', ')}`);
    }
    if (signalComparison.falsePositives.length > 0) {
      console.log(`   ⚠️  FALSE POSITIVES: ${signalComparison.falsePositives.join(', ')}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test flop posts
  console.log('\n\n💣 TESTING FLOP POSTS (STRESS TEST)\n');
  console.log('═'.repeat(70));

  for (const postId of STRESS_TEST_FLOPS) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) {
      console.log(`⚠️  Post ${postId} not found, skipping...`);
      continue;
    }

    console.log(`\nTesting ${postId}...`);
    const result = await viralQualityEval.measure('', post.text);
    const passed = result.score < 0.85;
    
    const antiPatternsDetected = result.info?.breakdown?.antiPatterns 
      ? Object.entries(result.info.breakdown.antiPatterns)
          .filter(([_, score]: [string, any]) => score < 0.9)
          .map(([pattern, _]: [string, any]) => pattern)
      : [];
    
    const testResult: AdversarialTestResult = {
      id: postId,
      expectedCategory: 'flop',
      score: result.score,
      passed,
      isViralWorthy: result.info?.isViralWorthy,
      antiPatternsDetected,
      difficulty: 'medium', // Flops are generally medium difficulty
    };
    
    if (!passed) {
      testResult.issue = `FALSE POSITIVE: Scored ${result.score.toFixed(2)} but should be < 0.85. Anti-patterns not caught.`;
    }
    
    results.push(testResult);

    const emoji = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${emoji} ${postId}: ${result.score.toFixed(2)}/1.00 ${status}`);
    
    if (antiPatternsDetected.length > 0) {
      console.log(`   Anti-patterns detected: ${antiPatternsDetected.join(', ')}`);
    } else {
      console.log(`   No anti-patterns detected`);
    }
    
    if (!passed) {
      console.log(`   🚨 FALSE POSITIVE: Flop post scored as viral!`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Calculate results
  console.log('\n\n' + '═'.repeat(70));
  console.log('ADVERSARIAL TEST RESULTS');
  console.log('═'.repeat(70));

  const qualityResults = results.filter(r => r.expectedCategory === 'quality');
  const flopResults = results.filter(r => r.expectedCategory === 'flop');

  const qualityPassCount = qualityResults.filter(r => r.passed).length;
  const flopPassCount = flopResults.filter(r => r.passed).length;
  const totalPassCount = qualityPassCount + flopPassCount;
  const totalAccuracy = (totalPassCount / results.length) * 100;

  console.log('\n📊 OVERALL SCORING:');
  console.log(`   Quality posts: ${qualityPassCount}/${qualityResults.length} (${((qualityPassCount / qualityResults.length) * 100).toFixed(1)}%)`);
  console.log(`   Flop posts: ${flopPassCount}/${flopResults.length} (${((flopPassCount / flopResults.length) * 100).toFixed(1)}%)`);
  console.log(`   TOTAL ACCURACY: ${totalPassCount}/${results.length} (${totalAccuracy.toFixed(1)}%)`);

  console.log('\n📊 SIGNAL DETECTION ACCURACY:');
  const avgPrecision = totalPrecision / signalComparisonCount;
  const avgRecall = totalRecall / signalComparisonCount;
  const avgF1 = totalF1 / signalComparisonCount;
  
  console.log(`   Average Precision: ${(avgPrecision * 100).toFixed(1)}%`);
  console.log(`   Average Recall: ${(avgRecall * 100).toFixed(1)}%`);
  console.log(`   Average F1 Score: ${(avgF1 * 100).toFixed(1)}%`);

  // Breakdown by difficulty
  console.log('\n📊 BREAKDOWN BY DIFFICULTY:');
  ['easy', 'medium', 'hard', 'extreme'].forEach(diff => {
    const diffResults = qualityResults.filter(r => r.difficulty === diff);
    if (diffResults.length > 0) {
      const diffPassed = diffResults.filter(r => r.passed).length;
      console.log(`   ${diff.toUpperCase()}: ${diffPassed}/${diffResults.length} (${((diffPassed / diffResults.length) * 100).toFixed(0)}%)`);
    }
  });

  // List all failures
  const failures = results.filter(r => !r.passed);
  if (failures.length > 0) {
    console.log('\n🚨 FAILURES (Issues to fix):');
    failures.forEach(f => {
      console.log(`\n   ${f.id} (${f.expectedCategory}, ${f.difficulty}): ${f.score.toFixed(2)}`);
      if (f.issue) {
        console.log(`   → ${f.issue}`);
      }
      if (f.signalComparison?.missed && f.signalComparison.missed.length > 0) {
        console.log(`   → Fix: Improve detection for [${f.signalComparison.missed.join(', ')}]`);
      }
    });
  }

  // Diagnosis
  console.log('\n' + '═'.repeat(70));
  console.log('ITERATION PLAN');
  console.log('═'.repeat(70));

  if (totalAccuracy >= 90 && avgF1 >= 0.85) {
    console.log('\n✅ SYSTEM IS ROBUST!');
    console.log('   → Passed adversarial test');
    console.log('   → Ready for full 56-post validation\n');
  } else if (totalAccuracy >= 75 || avgF1 >= 0.70) {
    console.log('\n⚠️  ITERATION 1-2 NEEDED');
    console.log('   → Issues found (expected on first run)');
    console.log('   → Fix the failures listed above');
    console.log('   → Re-run this test\n');
    
    console.log('RECOMMENDED FIXES:');
    if (avgRecall < 0.70) {
      console.log('   • LOW RECALL: Eval missing annotated signals');
      console.log('     → Check LLM prompts - are examples clear?');
      console.log('     → Increase temperature for more lenient detection?');
    }
    if (avgPrecision < 0.70) {
      console.log('   • LOW PRECISION: Eval detecting false signals');
      console.log('     → Tighten detection criteria in prompts');
      console.log('     → Raise score threshold (0.7 → 0.75)?');
    }
    const hardFails = qualityResults.filter(r => r.difficulty === 'hard' && !r.passed);
    if (hardFails.length > 0) {
      console.log('   • SINGLE-SIGNAL POSTS FAILING:');
      console.log('     → Lower overall threshold (0.85 → 0.80)?');
      console.log('     → Increase weights for strong signals');
    }
    const falsePosCount = flopResults.filter(r => !r.passed).length;
    if (falsePosCount > 2) {
      console.log('   • TOO MANY FALSE POSITIVES:');
      console.log('     → Strengthen anti-pattern detection');
      console.log('     → Review flop posts that scored high');
    }
  } else {
    console.log('\n❌ MAJOR ISSUES DETECTED');
    console.log('   → Accuracy too low for adversarial test');
    console.log('   → Debug individual evals');
    console.log('   → Review training data loading\n');
  }

  console.log('═'.repeat(70));

  // Save results
  const outputData = {
    timestamp: new Date().toISOString(),
    testType: 'adversarial_stress_test',
    sampleSize: results.length,
    accuracy: totalAccuracy,
    signalDetectionMetrics: {
      avgPrecision,
      avgRecall,
      avgF1,
    },
    difficultyBreakdown: {
      easy: {
        total: qualityResults.filter(r => r.difficulty === 'easy').length,
        passed: qualityResults.filter(r => r.difficulty === 'easy' && r.passed).length,
      },
      medium: {
        total: qualityResults.filter(r => r.difficulty === 'medium').length,
        passed: qualityResults.filter(r => r.difficulty === 'medium' && r.passed).length,
      },
      hard: {
        total: qualityResults.filter(r => r.difficulty === 'hard').length,
        passed: qualityResults.filter(r => r.difficulty === 'hard' && r.passed).length,
      },
      extreme: {
        total: qualityResults.filter(r => r.difficulty === 'extreme').length,
        passed: qualityResults.filter(r => r.difficulty === 'extreme' && r.passed).length,
      },
    },
    results,
    failures: failures.map(f => ({
      id: f.id,
      category: f.expectedCategory,
      difficulty: f.difficulty,
      score: f.score,
      issue: f.issue,
    })),
  };

  const outputPath = join(__dirname, 'results/adversarial-test-results.json');
  writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`\n💾 Results saved to: tests/results/adversarial-test-results.json\n`);
}

adversarialTest().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

