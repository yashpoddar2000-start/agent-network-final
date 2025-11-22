/**
 * Validation Script: Test Eval System on All Posts
 * 
 * Validates that the eval system works correctly:
 * - 31 quality posts (hasViralElements: true) should score >= 0.85
 * - 25 flop posts (hasViralElements: false) should score < 0.85
 * 
 * Reports accuracy and identifies any misclassified posts
 */

import 'dotenv/config';
import { viralQualityEval } from '../mastra/evals';
import { loadAllPosts } from '../mastra/evals/utils/training-data';

async function validateEvals() {
  console.log('🧪 VALIDATING EVAL SYSTEM ON ALL 56 POSTS\n');
  console.log('='.repeat(70));
  console.log('\nExpected Results:');
  console.log('  • 31 quality posts (hasViralElements: true) → score >= 0.85');
  console.log('  • 25 flop posts (hasViralElements: false) → score < 0.85\n');
  console.log('='.repeat(70));

  const allPosts = loadAllPosts();
  const qualityPosts = allPosts.filter(p => p.hasViralElements === true);
  const flopPosts = allPosts.filter(p => p.hasViralElements === false);

  console.log(`\nTotal posts: ${allPosts.length}`);
  console.log(`Quality posts: ${qualityPosts.length}`);
  console.log(`Flop posts: ${flopPosts.length}\n`);

  // Test quality posts
  console.log('═'.repeat(70));
  console.log('TESTING QUALITY POSTS (should score >= 0.85)');
  console.log('═'.repeat(70));

  const qualityResults: Array<{ id: string; score: number; passed: boolean }> = [];
  
  for (const post of qualityPosts) {
    console.log(`\nTesting ${post.id}...`);
    const result = await viralQualityEval.measure('', post.text);
    const passed = result.score >= 0.85;
    
    qualityResults.push({
      id: post.id,
      score: result.score,
      passed,
    });

    console.log(`${passed ? '✅' : '❌'} ${post.id}: ${result.score.toFixed(2)}/1.00 ${passed ? 'PASS' : 'FAIL'}`);
    
    // Add delay to avoid rate limits (adjust as needed)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test flop posts
  console.log('\n' + '═'.repeat(70));
  console.log('TESTING FLOP POSTS (should score < 0.85)');
  console.log('═'.repeat(70));

  const flopResults: Array<{ id: string; score: number; passed: boolean }> = [];
  
  for (const post of flopPosts) {
    console.log(`\nTesting ${post.id}...`);
    const result = await viralQualityEval.measure('', post.text);
    const passed = result.score < 0.85;
    
    flopResults.push({
      id: post.id,
      score: result.score,
      passed,
    });

    console.log(`${passed ? '✅' : '❌'} ${post.id}: ${result.score.toFixed(2)}/1.00 ${passed ? 'PASS' : 'FAIL'}`);
    
    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Calculate accuracy
  console.log('\n' + '═'.repeat(70));
  console.log('VALIDATION RESULTS');
  console.log('═'.repeat(70));

  const qualityPassCount = qualityResults.filter(r => r.passed).length;
  const flopPassCount = flopResults.filter(r => r.passed).length;
  const totalPassCount = qualityPassCount + flopPassCount;
  const totalAccuracy = (totalPassCount / allPosts.length) * 100;

  console.log('\n📊 QUALITY POSTS (should score >= 0.85):');
  console.log(`   Passed: ${qualityPassCount}/${qualityPosts.length} (${((qualityPassCount / qualityPosts.length) * 100).toFixed(1)}%)`);
  
  const qualityFails = qualityResults.filter(r => !r.passed);
  if (qualityFails.length > 0) {
    console.log('   Failed posts:');
    qualityFails.forEach(f => console.log(`     - ${f.id}: ${f.score.toFixed(2)}`));
  }

  console.log('\n📊 FLOP POSTS (should score < 0.85):');
  console.log(`   Passed: ${flopPassCount}/${flopPosts.length} (${((flopPassCount / flopPosts.length) * 100).toFixed(1)}%)`);
  
  const flopFails = flopResults.filter(r => !r.passed);
  if (flopFails.length > 0) {
    console.log('   Failed posts (scored too high):');
    flopFails.forEach(f => console.log(`     - ${f.id}: ${f.score.toFixed(2)}`));
  }

  console.log('\n📊 OVERALL ACCURACY:');
  console.log(`   Total: ${totalPassCount}/${allPosts.length} (${totalAccuracy.toFixed(1)}%)`);
  console.log(`   Target: 90%+ (51/56 posts)`);

  if (totalAccuracy >= 90) {
    console.log('\n✅ VALIDATION PASSED! Eval system is working well.\n');
  } else if (totalAccuracy >= 80) {
    console.log('\n⚠️  VALIDATION MODERATE. System needs tuning.\n');
  } else {
    console.log('\n❌ VALIDATION FAILED. System needs significant improvement.\n');
  }

  console.log('═'.repeat(70));

  // Export results to file
  const summary = {
    timestamp: new Date().toISOString(),
    accuracy: totalAccuracy,
    qualityPostsAccuracy: (qualityPassCount / qualityPosts.length) * 100,
    flopPostsAccuracy: (flopPassCount / flopPosts.length) * 100,
    qualityResults,
    flopResults,
  };

  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, 'results/validation-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  console.log(`\n💾 Results saved to: tests/results/validation-results.json\n`);
}

validateEvals().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});

