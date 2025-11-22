#!/usr/bin/env tsx
/**
 * Add Post Helper
 * 
 * Interactive CLI to add new posts to all-posts.json
 * Automatically handles ID generation and validation
 * 
 * Usage: npm run add-post
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const DATA_DIR = path.join(process.cwd(), 'data/posts');
const ALL_POSTS_FILE = path.join(DATA_DIR, 'all-posts.json');

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function addPost() {
  console.log('\n🆕 Add New Post to all-posts.json\n');

  // Read existing posts
  const allPostsData = fs.readFileSync(ALL_POSTS_FILE, 'utf-8');
  const allPosts: Post[] = JSON.parse(allPostsData);

  // Generate next ID
  const lastId = allPosts[allPosts.length - 1]?.id || 'P000';
  const nextIdNum = parseInt(lastId.substring(1)) + 1;
  const nextId = `P${String(nextIdNum).padStart(3, '0')}`;

  console.log(`📝 New Post ID: ${nextId}\n`);

  // Collect post data
  const text = await question('Post text (paste full text): ');
  const postedDate = await question('Posted date (YYYY-MM-DD HH:MM:SS): ');
  const totalReactions = parseInt(await question('Total reactions: '));
  const likes = parseInt(await question('Likes: '));
  const comments = parseInt(await question('Comments: '));
  const reposts = parseInt(await question('Reposts: '));
  const hasMedia = (await question('Has media? (y/n): ')).toLowerCase() === 'y';
  const isViral = (await question('Is viral? (y/n): ')).toLowerCase() === 'y';

  // Calculate derived fields
  const engagementScore = totalReactions + comments + reposts;
  const textLength = text.length;
  const lineCount = text.split('\n').length;

  // Optionally add analysis
  const addAnalysis = (await question('\nAdd analysis now? (y/n): ')).toLowerCase() === 'y';
  let analysis = undefined;
  let leverageSignals = undefined;

  if (addAnalysis) {
    console.log('\n📊 Analysis (leave blank to skip):');
    const howFeel = await question('How it made readers feel: ');
    const whatLearned = await question('What they learned: ');
    const whyShareable = await question('Why shareable or not: ');
    const whatWorked = await question('What worked or didn\'t work: ');

    if (howFeel || whatLearned || whyShareable || whatWorked) {
      analysis = {
        howItMadeReadersFeel: howFeel,
        whatTheyLearned: whatLearned,
        whyShareableOrNot: whyShareable,
        whatWorkedOrDidntWork: whatWorked
      };
    }

    const addSignals = (await question('\nAdd leverage signals? (y/n): ')).toLowerCase() === 'y';
    if (addSignals) {
      leverageSignals = [];
      let addMore = true;
      while (addMore) {
        const signal = await question('  Signal name: ');
        const impact = await question('  Impact (high/medium/low): ');
        const note = await question('  Note: ');
        
        leverageSignals.push({ signal, impact, note });
        
        addMore = (await question('  Add another signal? (y/n): ')).toLowerCase() === 'y';
      }
    }
  }

  // Create new post object
  const newPost: Post = {
    id: nextId,
    text,
    postedDate,
    engagement: {
      totalReactions,
      likes,
      comments,
      reposts,
      engagementScore
    },
    hasMedia,
    textLength,
    lineCount,
    isViral,
    ...(analysis && { analysis }),
    ...(leverageSignals && { leverageSignals })
  };

  // Add to posts array
  allPosts.push(newPost);

  // Write back to file
  fs.writeFileSync(
    ALL_POSTS_FILE,
    JSON.stringify(allPosts, null, 2),
    'utf-8'
  );

  console.log('\n✅ Post added successfully!');
  console.log(`   ID: ${nextId}`);
  console.log(`   Engagement: ${engagementScore}`);
  console.log(`   Viral: ${isViral ? 'Yes' : 'No'}`);
  console.log('\n💡 Run "npm run refresh-data" to update viral/flop splits\n');

  rl.close();
}

// Run
addPost().catch(console.error);

