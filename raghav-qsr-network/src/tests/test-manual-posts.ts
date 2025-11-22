/**
 * Manual Post Test
 * 
 * Tests 3 NEW posts you wrote against the eval system
 * This is the ULTIMATE test - posts the system has NEVER seen before!
 * 
 * Usage:
 * 1. Edit tests/manual-posts.txt and add your 3 posts
 * 2. Run: npm run test-manual-posts
 * 3. Review results in console + tests/results/manual-posts-results.json
 */

import 'dotenv/config';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { viralQualityEval } from '../mastra/evals';

interface ManualPostResult {
  postNumber: number;
  postText: string;
  score: number;
  isViralWorthy: boolean;
  verdict: '✅ VIRAL-WORTHY' | '❌ NEEDS WORK' | '🔥 EXCELLENT';
  
  // Detailed breakdown
  greatSignals: Array<{ name: string; score: number }>;
  goodSignals: Array<{ name: string; score: number }>;
  weakSignals: Array<{ name: string; score: number }>;
  antiPatterns: Array<{ name: string; penalty: number }>;
  
  // Actionable feedback
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  
  // Full signal breakdown
  allSignalScores: Record<string, number>;
}

function parseManualPosts(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8');
  
  // Split by POST headers
  const posts: string[] = [];
  const postRegex = /POST (\d):\s*\n([\s\S]*?)(?=\n===|$)/g;
  
  let match;
  while ((match = postRegex.exec(content)) !== null) {
    const postText = match[2].trim();
    
    // Skip if it's still a placeholder
    if (postText.includes('[PASTE YOUR') || postText.includes('Replace this')) {
      continue;
    }
    
    posts.push(postText);
  }
  
  return posts;
}

function getVerdict(score: number): '✅ VIRAL-WORTHY' | '❌ NEEDS WORK' | '🔥 EXCELLENT' {
  if (score >= 0.90) return '🔥 EXCELLENT';
  if (score >= 0.75) return '✅ VIRAL-WORTHY';
  return '❌ NEEDS WORK';
}

async function testManualPosts() {
  console.log('═'.repeat(80));
  console.log('🧪 MANUAL POST TEST - TESTING YOUR 3 NEW POSTS');
  console.log('═'.repeat(80));
  console.log('\nThis is the REAL test - posts the system has NEVER seen!');
  console.log('No training data bias, no memorization, pure evaluation.\n');
  console.log('═'.repeat(80));

  // Load posts from text file
  const postsFilePath = join(__dirname, 'manual-posts.txt');
  let posts: string[];
  
  try {
    posts = parseManualPosts(postsFilePath);
  } catch (error) {
    console.error('❌ Error reading manual-posts.txt:', error);
    console.log('\nMake sure the file exists at: tests/manual-posts.txt');
    process.exit(1);
  }

  if (posts.length === 0) {
    console.log('⚠️  No posts found in manual-posts.txt!');
    console.log('\nPlease edit tests/manual-posts.txt and add your 3 posts.');
    console.log('Replace the placeholder text with your actual LinkedIn post content.\n');
    process.exit(1);
  }

  if (posts.length < 3) {
    console.log(`⚠️  Only found ${posts.length} post(s). Expected 3 posts.`);
    console.log('Please add all 3 posts to tests/manual-posts.txt\n');
  }

  console.log(`\n✅ Loaded ${posts.length} post(s) from manual-posts.txt`);
  console.log('Starting evaluation...\n');
  console.log('═'.repeat(80));

  const results: ManualPostResult[] = [];

  // Test each post
  for (let i = 0; i < posts.length; i++) {
    const postNumber = i + 1;
    const postText = posts[i];

    console.log(`\n\n🔍 TESTING POST ${postNumber}/${posts.length}`);
    console.log('─'.repeat(80));
    console.log(`\nPOST PREVIEW (first 200 chars):`);
    const preview = postText.substring(0, 200) + (postText.length > 200 ? '...' : '');
    console.log(preview + '\n');
    console.log('─'.repeat(80));

    // Run master eval
    const evalResult = await viralQualityEval.measure('', postText);

    // Extract detailed breakdown
    const signalScores = evalResult.info?.breakdown?.signals || {};
    const antiPatternScores = evalResult.info?.breakdown?.antiPatterns || {};

    const greatSignals = Object.entries(signalScores)
      .filter(([_, score]: [string, any]) => score >= 0.80)
      .map(([name, score]: [string, any]) => ({ name: name.replace(/_/g, ' '), score }));

    const goodSignals = Object.entries(signalScores)
      .filter(([_, score]: [string, any]) => score >= 0.65 && score < 0.80)
      .map(([name, score]: [string, any]) => ({ name: name.replace(/_/g, ' '), score }));

    const weakSignals = Object.entries(signalScores)
      .filter(([_, score]: [string, any]) => score < 0.65)
      .map(([name, score]: [string, any]) => ({ name: name.replace(/_/g, ' '), score }));

    const antiPatterns = Object.entries(antiPatternScores)
      .map(([name, score]: [string, any]) => ({
        name: name.replace(/_/g, ' '),
        penalty: 1.0 - score,
      }))
      .filter(ap => ap.penalty > 0.1); // Only show significant penalties

    const result: ManualPostResult = {
      postNumber,
      postText,
      score: evalResult.score,
      isViralWorthy: evalResult.info?.isViralWorthy || false,
      verdict: getVerdict(evalResult.score),
      greatSignals,
      goodSignals,
      weakSignals,
      antiPatterns,
      strengths: evalResult.info?.strengths || [],
      weaknesses: evalResult.info?.weaknesses || [],
      recommendations: evalResult.info?.recommendations || [],
      allSignalScores: signalScores,
    };

    results.push(result);

    // Print results
    console.log(`\n\n📊 RESULTS FOR POST ${postNumber}:`);
    console.log('═'.repeat(80));
    console.log(`\n   ${result.verdict}`);
    console.log(`   SCORE: ${result.score.toFixed(2)}/1.00`);
    console.log(`   Logic: ${evalResult.info?.logic || 'N/A'}`);

    if (greatSignals.length > 0) {
      console.log(`\n   🔥 EXCELLENT SIGNALS (0.80+):`);
      greatSignals.forEach(s => {
        console.log(`      • ${s.name}: ${s.score.toFixed(2)}`);
      });
    }

    if (goodSignals.length > 0) {
      console.log(`\n   ✓  GOOD SIGNALS (0.65-0.79):`);
      goodSignals.forEach(s => {
        console.log(`      • ${s.name}: ${s.score.toFixed(2)}`);
      });
    }

    if (antiPatterns.length > 0) {
      console.log(`\n   🚫 ANTI-PATTERNS DETECTED:`);
      antiPatterns.forEach(ap => {
        console.log(`      • ${ap.name}: -${ap.penalty.toFixed(2)} penalty`);
      });
    }

    if (result.strengths.length > 0) {
      console.log(`\n   💪 STRENGTHS:`);
      result.strengths.slice(0, 3).forEach(s => {
        console.log(`      • ${s}`);
      });
    }

    if (result.weaknesses.length > 0) {
      console.log(`\n   ⚠️  WEAKNESSES:`);
      result.weaknesses.slice(0, 3).forEach(w => {
        console.log(`      • ${w}`);
      });
    }

    if (!result.isViralWorthy && result.recommendations.length > 0) {
      console.log(`\n   💡 HOW TO FIX IT:`);
      result.recommendations.slice(0, 5).forEach((r, idx) => {
        console.log(`      ${idx + 1}. ${r}`);
      });
    }

    console.log('\n' + '═'.repeat(80));

    // Rate limit (1 second between posts)
    if (i < posts.length - 1) {
      console.log('\n⏳ Waiting 1 second before next post...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('\n\n' + '═'.repeat(80));
  console.log('📊 FINAL SUMMARY');
  console.log('═'.repeat(80));

  const viralCount = results.filter(r => r.isViralWorthy).length;
  const excellentCount = results.filter(r => r.score >= 0.90).length;
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

  console.log(`\n   Total posts tested: ${results.length}`);
  console.log(`   Viral-worthy: ${viralCount}/${results.length}`);
  console.log(`   Excellent (0.90+): ${excellentCount}/${results.length}`);
  console.log(`   Average score: ${avgScore.toFixed(2)}/1.00`);

  console.log('\n   POST RANKINGS:\n');
  results
    .sort((a, b) => b.score - a.score)
    .forEach((r, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
      console.log(`   ${medal} Post ${r.postNumber}: ${r.score.toFixed(2)} - ${r.verdict}`);
    });

  // Recommendations
  console.log('\n' + '═'.repeat(80));
  console.log('💡 OVERALL RECOMMENDATIONS');
  console.log('═'.repeat(80));

  if (viralCount === results.length) {
    console.log('\n   🔥 ALL POSTS ARE VIRAL-WORTHY!');
    console.log('   → Ready to publish next week');
    console.log('   → System is working as expected');
  } else if (viralCount > 0) {
    console.log('\n   ⚠️  MIXED RESULTS');
    console.log(`   → ${viralCount} post(s) ready to publish`);
    console.log(`   → ${results.length - viralCount} post(s) need revision`);
    console.log('   → Review the recommendations above for each post');
  } else {
    console.log('\n   ❌ NO POSTS ARE VIRAL-WORTHY YET');
    console.log('   → All posts need significant revision');
    console.log('   → Focus on adding 2-3 strong leverage signals');
    console.log('   → Review the recommendations for each post');
  }

  // Most common issues
  const allWeakSignals = results.flatMap(r => r.weakSignals.map(s => s.name));
  const allAntiPatterns = results.flatMap(r => r.antiPatterns.map(ap => ap.name));

  if (allWeakSignals.length > 0) {
    const weakSignalCounts = allWeakSignals.reduce((acc, signal) => {
      acc[signal] = (acc[signal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topWeak = Object.entries(weakSignalCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topWeak.length > 0) {
      console.log('\n   🎯 MOST COMMON WEAK SIGNALS:');
      topWeak.forEach(([signal, count]) => {
        console.log(`      • ${signal} (${count}/${results.length} posts)`);
      });
    }
  }

  if (allAntiPatterns.length > 0) {
    console.log('\n   ⚠️  ANTI-PATTERNS TO FIX:');
    const uniqueAntiPatterns = [...new Set(allAntiPatterns)];
    uniqueAntiPatterns.forEach(ap => {
      console.log(`      • ${ap}`);
    });
  }

  console.log('\n' + '═'.repeat(80));

  // Save results
  const outputData = {
    timestamp: new Date().toISOString(),
    testType: 'manual_posts_test',
    postsCount: results.length,
    summary: {
      viralCount,
      excellentCount,
      avgScore,
    },
    results: results.map(r => ({
      postNumber: r.postNumber,
      postPreview: r.postText.substring(0, 100) + '...',
      score: r.score,
      verdict: r.verdict,
      isViralWorthy: r.isViralWorthy,
      greatSignals: r.greatSignals,
      goodSignals: r.goodSignals,
      weakSignals: r.weakSignals,
      antiPatterns: r.antiPatterns,
      strengths: r.strengths,
      weaknesses: r.weaknesses,
      recommendations: r.recommendations,
      allSignalScores: r.allSignalScores,
    })),
  };

  const outputPath = join(__dirname, 'results/manual-posts-results.json');
  writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`\n💾 Detailed results saved to: tests/results/manual-posts-results.json\n`);
}

testManualPosts().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

