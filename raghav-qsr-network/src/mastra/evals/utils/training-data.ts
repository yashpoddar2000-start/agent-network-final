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
 * Get quality posts (hasViralElements: true)
 */
export function getQualityPosts(): Post[] {
  const posts = loadAllPosts();
  return posts.filter(p => p.hasViralElements === true);
}

/**
 * Get flop posts (hasViralElements: false)
 */
export function getFlopPosts(): Post[] {
  const posts = loadAllPosts();
  return posts.filter(p => p.hasViralElements === false);
}

/**
 * Get quality posts with specific leverage signal
 */
export function getPostsBySignal(signal: string): Post[] {
  const qualityPosts = getQualityPosts();
  return qualityPosts.filter(post => 
    post.leverageSignals?.some(s => s.signal === signal)
  );
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

