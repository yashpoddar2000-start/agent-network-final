#!/usr/bin/env tsx
/**
 * Refresh Data
 * 
 * Regenerates viral-posts.json and flop-posts.json from all-posts.json
 * Run this after adding new posts
 * 
 * Usage: npm run refresh-data
 */

import { splitPosts } from '../analysis/utils/split-posts';

console.log('🔄 Refreshing data files...\n');

splitPosts()
  .then(() => {
    console.log('✅ Data refresh complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error refreshing data:', error);
    process.exit(1);
  });

