#!/usr/bin/env tsx
/**
 * LinkedIn Post Analyzer - Standalone Scorer Runner
 * 
 * Usage:
 *   tsx src/linkedin-eval/analyze-post.ts
 *   tsx src/linkedin-eval/analyze-post.ts --test-high
 *   tsx src/linkedin-eval/analyze-post.ts --test-low
 */

import 'dotenv/config';
import { linkedInEngagementScorer } from './scorers';
import highEngagementPosts from './data/high-engagement-posts.json';
import lowEngagementPosts from './data/low-engagement-posts.json';

// Get command line argument
const arg = process.argv[2];

async function analyzePost(postText: string, label?: string) {
  console.log('\n' + '='.repeat(80));
  if (label) {
    console.log(`📝 ANALYZING: ${label}`);
  }
  console.log('='.repeat(80));
  console.log(`\n📄 POST:\n${postText.substring(0, 200)}${postText.length > 200 ? '...' : ''}\n`);
  console.log('⏳ Running scorer...\n');

  try {
    const result = await linkedInEngagementScorer.run({
      input: null,
      output: postText,
      runId: `manual-${Date.now()}`
    });

    console.log(`📊 SCORE: ${result.score.toFixed(3)} (${Math.round(result.score * 100)}/100)\n`);
    console.log('💬 DETAILED FEEDBACK:\n');
    console.log(result.reason);
    console.log('\n' + '='.repeat(80) + '\n');

    return result;
  } catch (error) {
    console.error('❌ Error analyzing post:', error);
    throw error;
  }
}

async function testHighEngagementPost() {
  const post = highEngagementPosts[0]; // Top performer
  console.log(`\n🔥 Testing TOP PERFORMING POST (${post.engagement.engagementScore} engagement)`);
  await analyzePost(post.text, 'Chick-fil-A vs Subway');
}

async function testLowEngagementPost() {
  const post = lowEngagementPosts[lowEngagementPosts.length - 1]; // Worst performer
  console.log(`\n❌ Testing LOW PERFORMING POST (${post.engagement.engagementScore} engagement)`);
  await analyzePost(post.text, 'Low engagement post');
}

async function analyzeCustomPost() {
  // Example post - replace with your own!
  const examplePost = `Your custom LinkedIn post goes here.

This is just an example. Replace this with your actual post content to get real feedback.`;

  console.log('\n💡 TIP: Edit src/linkedin-eval/analyze-post.ts to add your own post text!');
  await analyzePost(examplePost, 'Custom Post');
}

// Main execution
async function main() {
  console.log('\n🚀 LinkedIn Post Engagement Analyzer');
  console.log('Using brutal restaurant industry analyst evaluation\n');

  if (arg === '--test-high') {
    await testHighEngagementPost();
  } else if (arg === '--test-low') {
    await testLowEngagementPost();
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Usage:
  tsx src/linkedin-eval/analyze-post.ts              # Analyze custom post (edit file)
  tsx src/linkedin-eval/analyze-post.ts --test-high  # Test with top performer
  tsx src/linkedin-eval/analyze-post.ts --test-low   # Test with low performer
  tsx src/linkedin-eval/analyze-post.ts --help       # Show this help
    `);
  } else {
    await analyzeCustomPost();
  }
}

main().catch(console.error);

