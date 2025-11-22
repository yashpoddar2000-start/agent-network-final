#!/usr/bin/env tsx
/**
 * Transform Apify Data to Our Format
 * 
 * Transforms apimaestro/linkedin-profile-posts data to our all-posts.json format
 * Merges with existing posts and deduplicates
 * 
 * Usage: npm run transform-apify <raw-file-path>
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { splitPosts } from '../analysis/utils/split-posts';

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
  author: {
    first_name: string;
    last_name: string;
    headline: string;
    username: string;
    profile_url: string;
  };
  stats: {
    total_reactions: number;
    like: number;
    support?: number;
    love?: number;
    insight?: number;
    celebrate?: number;
    funny?: number;
    comments: number;
    reposts: number;
  };
  media?: any;
  article?: any;
  document?: any;
  reshared_post?: any;
  pagination_token?: string;
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
}

function transformApifyPost(apifyPost: ApifyPost, nextId: string): OurPost {
  const text = apifyPost.text || '';
  const hasMedia = !!(apifyPost.media || apifyPost.article || apifyPost.document);
  
  // Calculate engagement score (same formula as our existing posts)
  const engagementScore = 
    apifyPost.stats.total_reactions + 
    apifyPost.stats.comments + 
    apifyPost.stats.reposts;

  // Use activity_urn as the unique identifier
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
    urn: urnId
  };
}

function generateNextId(existingPosts: OurPost[]): string {
  if (existingPosts.length === 0) return 'P001';
  
  const lastId = existingPosts[existingPosts.length - 1].id;
  const lastNum = parseInt(lastId.substring(1));
  const nextNum = lastNum + 1;
  
  return `P${String(nextNum).padStart(3, '0')}`;
}

async function transformAndMerge(rawFilePath: string) {
  console.log('🔄 Transform & Merge Apify Data\n');
  
  // Read raw Apify data
  console.log(`📖 Reading: ${rawFilePath}`);
  const rawData = fs.readFileSync(rawFilePath, 'utf-8');
  const apifyPosts: ApifyPost[] = JSON.parse(rawData);
  
  if (!Array.isArray(apifyPosts)) {
    console.error('❌ Expected an array of posts');
    process.exit(1);
  }
  
  console.log(`📊 Found ${apifyPosts.length} posts in Apify data\n`);

  // Read existing posts
  console.log(`📖 Reading existing posts: ${ALL_POSTS_FILE}`);
  const existingData = fs.readFileSync(ALL_POSTS_FILE, 'utf-8');
  const existingPosts: OurPost[] = JSON.parse(existingData);
  console.log(`📊 Existing posts: ${existingPosts.length}\n`);

  // Build URN set for deduplication
  const existingUrns = new Set(
    existingPosts
      .filter(p => p.urn)
      .map(p => p.urn)
  );

  // Transform and filter new posts
  const newPosts: OurPost[] = [];
  let duplicates = 0;

  for (const apifyPost of apifyPosts) {
    // Skip if already exists
    if (existingUrns.has(apifyPost.urn)) {
      duplicates++;
      continue;
    }

    // Generate next ID
    const nextId = generateNextId([...existingPosts, ...newPosts]);
    
    // Transform
    const transformed = transformApifyPost(apifyPost, nextId);
    newPosts.push(transformed);
  }

  console.log(`✅ New posts: ${newPosts.length}`);
  console.log(`⏭️  Duplicates skipped: ${duplicates}\n`);

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
  console.log(`💾 Saving ${mergedPosts.length} total posts to ${ALL_POSTS_FILE}`);
  fs.writeFileSync(
    ALL_POSTS_FILE,
    JSON.stringify(mergedPosts, null, 2),
    'utf-8'
  );

  console.log('✅ Saved!\n');

  // Show new posts summary
  console.log('📋 New Posts Added:');
  console.log('='.repeat(80));
  newPosts.forEach(post => {
    console.log(`${post.id} | ${post.postedDate} | Engagement: ${post.engagement.engagementScore}`);
    console.log(`   ${post.text.substring(0, 80)}...`);
    console.log();
  });
  console.log('='.repeat(80));

  // Auto-refresh splits
  console.log('\n🔄 Auto-refreshing viral/flop splits...\n');
  await splitPosts();

  console.log('\n✅ Complete! All data merged and refreshed.\n');
}

// Main
async function main() {
  const rawFilePath = process.argv[2];

  if (!rawFilePath) {
    console.error('❌ Please provide path to raw Apify JSON file\n');
    console.log('Usage:');
    console.log('  npm run transform-apify data/raw/apify-raw-1234567890.json\n');
    process.exit(1);
  }

  if (!fs.existsSync(rawFilePath)) {
    console.error(`❌ File not found: ${rawFilePath}\n`);
    process.exit(1);
  }

  await transformAndMerge(rawFilePath);
}

main().catch(console.error);
