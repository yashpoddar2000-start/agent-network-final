/**
 * Split Posts Utility
 * 
 * Automatically splits all-posts.json into:
 * - viral-posts.json (high engagement)
 * - flop-posts.json (low engagement)
 * 
 * Usage: npm run refresh-data
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data/posts');
const ALL_POSTS_FILE = path.join(DATA_DIR, 'all-posts.json');
const VIRAL_POSTS_FILE = path.join(DATA_DIR, 'viral-posts.json');
const FLOP_POSTS_FILE = path.join(DATA_DIR, 'flop-posts.json');

// Engagement threshold (can adjust this)
const VIRAL_THRESHOLD = 100;

interface Post {
  id: string;
  text: string;
  postedDate: string;
  engagement: {
    totalReactions: number;
    likes: number;
    comments: number;
    reposts: number;
    engagementScore: number;
  };
  hasMedia: boolean;
  textLength: number;
  lineCount: number;
  isViral?: boolean;
  analysis?: any;
  leverageSignals?: any[];
}

export async function splitPosts() {
  console.log('📊 Splitting posts into viral and flop categories...\n');

  // Read all posts
  const allPostsData = fs.readFileSync(ALL_POSTS_FILE, 'utf-8');
  const allPosts: Post[] = JSON.parse(allPostsData);

  console.log(`📄 Total posts: ${allPosts.length}`);

  // Split based on engagement score OR isViral flag
  const viralPosts = allPosts.filter(
    post => post.isViral === true || post.engagement.engagementScore >= VIRAL_THRESHOLD
  );

  const flopPosts = allPosts.filter(
    post => post.isViral === false || post.engagement.engagementScore < VIRAL_THRESHOLD
  );

  console.log(`🔥 Viral posts: ${viralPosts.length}`);
  console.log(`❌ Flop posts: ${flopPosts.length}`);

  // Write split files
  fs.writeFileSync(
    VIRAL_POSTS_FILE,
    JSON.stringify(viralPosts, null, 2),
    'utf-8'
  );

  fs.writeFileSync(
    FLOP_POSTS_FILE,
    JSON.stringify(flopPosts, null, 2),
    'utf-8'
  );

  console.log('\n✅ Successfully split posts!');
  console.log(`   📁 ${VIRAL_POSTS_FILE}`);
  console.log(`   📁 ${FLOP_POSTS_FILE}`);

  // Generate stats
  const viralAvgScore = viralPosts.reduce((sum, p) => sum + p.engagement.engagementScore, 0) / viralPosts.length;
  const flopAvgScore = flopPosts.reduce((sum, p) => sum + p.engagement.engagementScore, 0) / flopPosts.length;

  console.log('\n📈 Stats:');
  console.log(`   Viral avg engagement: ${Math.round(viralAvgScore)}`);
  console.log(`   Flop avg engagement: ${Math.round(flopAvgScore)}`);
  console.log(`   Engagement gap: ${Math.round(viralAvgScore - flopAvgScore)}x\n`);
}

// Run if called directly
if (require.main === module) {
  splitPosts().catch(console.error);
}

