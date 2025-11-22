import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Post structure from all-posts.json
 */
export interface Post {
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
  isViral: boolean;
  url: string;
  urn: string;
  analysis?: {
    howItMadeReadersFeel?: string;
    whatTheyLearned?: string;
    whyShareableOrNot?: string;
    whatWorkedOrDidntWork?: string;
  };
  leverageSignals?: Array<{
    signal: string;
    impact: string;
    note: string;
  }>;
  hasViralElements: boolean;
}

/**
 * Load all posts from all-posts.json
 */
export function loadAllPosts(): Post[] {
  const dataPath = join(__dirname, '../../../../data/posts/all-posts.json');
  const rawData = readFileSync(dataPath, 'utf-8');
  return JSON.parse(rawData);
}

/**
 * Get quality posts that actually went viral
 * Filters for BOTH:
 * - hasViralElements: true (manual quality assessment)
 * - isViral: true (actual engagement performance)
 * 
 * This ensures we train on posts that have quality AND proven results
 */
export function getQualityPosts(): Post[] {
  const posts = loadAllPosts();
  return posts.filter(p => p.hasViralElements === true && p.isViral === true);
}

/**
 * Get flop posts (hasViralElements: false)
 */
export function getFlopPosts(): Post[] {
  const posts = loadAllPosts();
  return posts.filter(p => p.hasViralElements === false);
}

/**
 * Get posts with viral elements that didn't go viral (unlucky/bad timing)
 * These have quality but didn't perform due to algorithm/timing
 */
export function getUnluckyPosts(): Post[] {
  const posts = loadAllPosts();
  return posts.filter(p => p.hasViralElements === true && p.isViral === false);
}

/**
 * Get quality posts with specific leverage signal
 * 
 * HYBRID APPROACH:
 * 1. First tries to get proven winners (hasViralElements: true AND isViral: true)
 * 2. If < 3 examples found, supplements with unlucky posts (quality but didn't go viral)
 * 
 * This ensures all signals have sufficient training examples while prioritizing
 * posts that both had quality AND performed well.
 */
export function getPostsBySignal(signal: string): Post[] {
  const MIN_EXAMPLES = 3;
  
  // Start with proven winners only
  const qualityPosts = getQualityPosts();
  const provenPosts = qualityPosts.filter(post => 
    post.leverageSignals?.some(s => s.signal === signal)
  );
  
  // If we have enough proven examples, use those
  if (provenPosts.length >= MIN_EXAMPLES) {
    return provenPosts;
  }
  
  // Otherwise, supplement with unlucky posts (quality but didn't go viral)
  const unluckyPosts = getUnluckyPosts();
  const unluckyWithSignal = unluckyPosts.filter(post =>
    post.leverageSignals?.some(s => s.signal === signal)
  );
  
  // Combine proven + unlucky, prioritizing proven
  const combined = [...provenPosts, ...unluckyWithSignal];
  
  console.log(`[Training Data] Signal "${signal}": ${provenPosts.length} proven, ${unluckyWithSignal.length} unlucky (${combined.length} total)`);
  
  return combined;
}

/**
 * Get flop posts for comparison (negative examples)
 */
export function getFlopPostsForComparison(limit: number = 5): Post[] {
  const flopPosts = getFlopPosts();
  // Return random sample
  return flopPosts
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
}

/**
 * Format a post for LLM prompt (includes analysis)
 */
export function formatPostForPrompt(post: Post): string {
  let formatted = `POST ${post.id}:\n${post.text}\n`;
  
  if (post.analysis?.whatWorkedOrDidntWork) {
    formatted += `\nANALYSIS: ${post.analysis.whatWorkedOrDidntWork}\n`;
  }
  
  if (post.leverageSignals && post.leverageSignals.length > 0) {
    formatted += `\nLEVERAGE SIGNALS:\n`;
    post.leverageSignals.forEach(sig => {
      formatted += `- ${sig.signal} (${sig.impact}): ${sig.note}\n`;
    });
  }
  
  return formatted;
}

