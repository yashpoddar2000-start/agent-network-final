#!/usr/bin/env tsx
/**
 * Sync Latest Posts - ONE COMMAND WORKFLOW
 * 
 * This script:
 * 1. Fetches latest posts from Apify
 * 2. Transforms to our format (with EMPTY analysis/leverageSignals)
 * 3. Deduplicates and merges with all-posts.json
 * 4. Shows you which posts need manual analysis
 * 
 * Usage: npm run sync
 */

import 'dotenv/config';
import { ApifyClient } from 'apify-client';
import fs from 'fs';
import path from 'path';

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID || 'LQQIXN9Othf8f7R5n';
const LINKEDIN_USERNAME = process.env.LINKEDIN_USERNAME || 'bypoddar';

const DATA_DIR = path.join(process.cwd(), 'data/posts');
const ALL_POSTS_FILE = path.join(DATA_DIR, 'all-posts.json');

interface ApifyPost {
  urn: {
    activity_urn: string;
    share_urn?: string;
    ugcPost_urn?: string;
  };
  full_urn: string;
  posted_at: {
    date: string;
    relative: string;
    timestamp: number;
  };
  text: string;
  url: string;
  post_type: string;
  stats: {
    total_reactions: number;
    like: number;
    comments: number;
    reposts: number;
  };
  media?: any;
}

interface OurPost {
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
  url?: string;
  urn?: string;
  analysis?: {
    howItMadeReadersFeel: string;
    whatTheyLearned: string;
    whyShareableOrNot: string;
    whatWorkedOrDidntWork: string;
  };
  leverageSignals?: Array<{
    signal: string;
    impact: string;
    note: string;
  }>;
}

function generateNextId(existingPosts: OurPost[]): string {
  if (existingPosts.length === 0) return 'P001';
  
  const lastId = existingPosts[existingPosts.length - 1].id;
  const lastNum = parseInt(lastId.substring(1));
  const nextNum = lastNum + 1;
  
  return `P${String(nextNum).padStart(3, '0')}`;
}

function transformApifyPost(apifyPost: ApifyPost, nextId: string): OurPost {
  const text = apifyPost.text || '';
  const hasMedia = !!apifyPost.media;
  
  const engagementScore = 
    apifyPost.stats.total_reactions + 
    apifyPost.stats.comments + 
    apifyPost.stats.reposts;

  const urnId = apifyPost.urn?.activity_urn || apifyPost.full_urn;

  return {
    id: nextId,
    text: text,
    postedDate: apifyPost.posted_at.date,
    engagement: {
      totalReactions: apifyPost.stats.total_reactions,
      likes: apifyPost.stats.like,
      comments: apifyPost.stats.comments,
      reposts: apifyPost.stats.reposts,
      engagementScore: engagementScore
    },
    hasMedia: hasMedia,
    textLength: text.length,
    lineCount: text.split('\n').length,
    url: apifyPost.url,
    urn: urnId,
    // Leave these EMPTY for manual analysis
    analysis: {
      howItMadeReadersFeel: '',
      whatTheyLearned: '',
      whyShareableOrNot: '',
      whatWorkedOrDidntWork: ''
    },
    leverageSignals: []
  };
}

async function syncLatestPosts() {
  console.log('🚀 Syncing Latest LinkedIn Posts\n');
  console.log('='.repeat(80));
  
  // Step 1: Fetch from Apify
  console.log('\n📡 STEP 1: Fetching from Apify...\n');
  console.log(`   Username: ${LINKEDIN_USERNAME}`);
  console.log(`   Fetching latest 10 posts\n`);

  if (!APIFY_API_TOKEN) {
    console.error('❌ APIFY_API_TOKEN not found in .env');
    process.exit(1);
  }

  const client = new ApifyClient({ token: APIFY_API_TOKEN });

  const input = {
    username: LINKEDIN_USERNAME,
    page_number: 1,
    limit: 10,
  };

  console.log('   ⏳ Running Apify scraper (30-60 seconds)...');
  const run = await client.actor(APIFY_ACTOR_ID).call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  console.log(`   ✅ Fetched ${items.length} posts from LinkedIn\n`);

  // Step 2: Transform & Merge
  console.log('📋 STEP 2: Transforming & Merging...\n');

  // Read existing posts
  const existingData = fs.readFileSync(ALL_POSTS_FILE, 'utf-8');
  const existingPosts: OurPost[] = JSON.parse(existingData);
  console.log(`   📊 Existing posts: ${existingPosts.length}`);

  // Build URN set for deduplication
  const existingUrns = new Set(
    existingPosts
      .filter(p => p.urn)
      .map(p => p.urn)
  );

  // Transform and filter new posts
  const newPosts: OurPost[] = [];
  let duplicates = 0;

  for (const apifyPost of items) {
    const urnId = apifyPost.urn?.activity_urn || apifyPost.full_urn;
    
    // Skip if already exists
    if (existingUrns.has(urnId)) {
      duplicates++;
      continue;
    }

    const nextId = generateNextId([...existingPosts, ...newPosts]);
    const transformed = transformApifyPost(apifyPost, nextId);
    newPosts.push(transformed);
  }

  console.log(`   ✅ New posts: ${newPosts.length}`);
  console.log(`   ⏭️  Duplicates skipped: ${duplicates}\n`);

  if (newPosts.length === 0) {
    console.log('💡 No new posts to add. All posts already exist!\n');
    return;
  }

  // Merge
  const mergedPosts = [...existingPosts, ...newPosts];
  
  // Sort by date (newest first)
  mergedPosts.sort((a, b) => {
    const dateA = new Date(a.postedDate).getTime();
    const dateB = new Date(b.postedDate).getTime();
    return dateB - dateA;
  });

  // Save
  console.log('💾 STEP 3: Saving...\n');
  fs.writeFileSync(
    ALL_POSTS_FILE,
    JSON.stringify(mergedPosts, null, 2),
    'utf-8'
  );

  console.log(`   ✅ Saved ${mergedPosts.length} total posts\n`);

  // Step 3: Show what needs manual analysis
  console.log('='.repeat(80));
  console.log('\n📝 NEW POSTS ADDED (Need Manual Analysis):\n');
  console.log('='.repeat(80));
  
  newPosts.forEach(post => {
    console.log(`\n${post.id} | ${post.postedDate}`);
    console.log(`Engagement: ${post.engagement.engagementScore} (${post.engagement.totalReactions} reactions, ${post.engagement.comments} comments)`);
    console.log(`Text: ${post.text.substring(0, 100)}...`);
    console.log(`\n⚠️  NEEDS ANALYSIS:`);
    console.log(`   - howItMadeReadersFeel: [EMPTY]`);
    console.log(`   - whatTheyLearned: [EMPTY]`);
    console.log(`   - whyShareableOrNot: [EMPTY]`);
    console.log(`   - whatWorkedOrDidntWork: [EMPTY]`);
    console.log(`   - leverageSignals: [EMPTY]`);
    console.log('-'.repeat(80));
  });

  console.log('\n✅ SYNC COMPLETE!\n');
  console.log('📋 Next Steps:');
  console.log('   1. Edit data/posts/all-posts.json');
  console.log(`   2. Fill in analysis for ${newPosts.length} new posts`);
  console.log('   3. Run "npm run refresh-data" when ready to regenerate splits\n');
}

// Main
syncLatestPosts().catch(console.error);

