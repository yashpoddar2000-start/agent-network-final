#!/usr/bin/env tsx
/**
 * Fetch LinkedIn Posts from Apify
 * 
 * Uses apimaestro/linkedin-profile-posts scraper
 * 
 * Usage: npm run fetch-apify
 */

import 'dotenv/config';
import { ApifyClient } from 'apify-client';
import fs from 'fs';
import path from 'path';

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID || 'LQQIXN9Othf8f7R5n';
const LINKEDIN_USERNAME = process.env.LINKEDIN_USERNAME || 'bypoddar';

// Where to save raw data for inspection
const RAW_DATA_DIR = path.join(process.cwd(), 'data', 'raw');
const RAW_OUTPUT_FILE = path.join(RAW_DATA_DIR, `apify-raw-${Date.now()}.json`);

async function fetchApifyData() {
  if (!APIFY_API_TOKEN) {
    console.error('❌ APIFY_API_TOKEN not found in .env');
    console.log('\n💡 Add to .env:');
    console.log('   APIFY_API_TOKEN=your_apify_token_here\n');
    process.exit(1);
  }

  console.log('🚀 Fetching LinkedIn posts from Apify...\n');
  console.log(`📍 Username: ${LINKEDIN_USERNAME}`);
  console.log(`📊 Fetching latest posts\n`);

  try {
    // Initialize the ApifyClient with API token
    const client = new ApifyClient({
      token: APIFY_API_TOKEN,
    });

    // Prepare Actor input
    const input = {
      username: LINKEDIN_USERNAME,
      page_number: 1,
      limit: 10, // Start with 10 posts to test
    };

    console.log('⏳ Starting Apify actor...');
    console.log('   (This may take 30-60 seconds)\n');

    // Run the Actor and wait for it to finish
    const run = await client.actor(APIFY_ACTOR_ID).call(input);

    console.log(`✅ Run completed: ${run.id}\n`);
    console.log('📦 Fetching results...\n');

    // Fetch and print Actor results from the run's dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`✅ Retrieved ${items.length} items\n`);

    // Save raw data for inspection
    if (!fs.existsSync(RAW_DATA_DIR)) {
      fs.mkdirSync(RAW_DATA_DIR, { recursive: true });
    }

    // Save all posts as array
    fs.writeFileSync(RAW_OUTPUT_FILE, JSON.stringify(items, null, 2), 'utf-8');

    console.log('✅ Raw data saved!');
    console.log(`📁 ${RAW_OUTPUT_FILE}\n`);
    console.log(`📊 Total posts saved: ${items.length}\n`);

    // Show sample of first post
    if (items.length > 0) {
      const firstPost = items[0];
      console.log('📄 SAMPLE POST (first one):');
      console.log('='.repeat(80));
      console.log(`Text: ${firstPost.text?.substring(0, 150)}...`);
      console.log(`Posted: ${firstPost.posted_at?.date}`);
      console.log(`Engagement: ${firstPost.stats?.total_reactions} reactions, ${firstPost.stats?.comments} comments`);
      console.log('='.repeat(80));
      console.log('\n💡 Next step: Transform this data');
      console.log(`   npm run transform-apify ${RAW_OUTPUT_FILE}\n`);
    }

    return items;

  } catch (error) {
    console.error('❌ Error fetching from Apify:', error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🔍 Apify LinkedIn Post Fetcher\n');
  console.log('💡 This will:');
  console.log('   1. Call Apify API to scrape LinkedIn posts');
  console.log('   2. Save raw data to data/raw/ for inspection');
  console.log('   3. Show you the data structure');
  console.log('   4. Then you transform it to our format\n');

  await fetchApifyData();
}

main().catch(console.error);
