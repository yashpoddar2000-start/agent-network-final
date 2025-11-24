import { loadAllPosts, Post } from '../../mastra/evals/utils/training-data';

/**
 * Example Loader - Loads successful posts for few-shot learning
 * 
 * Uses your existing all-posts.json training data to teach agents
 * your voice, structure, and quality standards
 */

// Map of post IDs to their flavors
const FLAVOR_MAP: Record<string, string[]> = {
  'heavy_math': ['P054'], // Chipotle franchise refusal - heavy financial analysis
  'comparison': ['P053', 'P001'], // Taco Bell vs Pizza Hut, Chick-fil-A vs Subway
  'storytelling': ['P055'], // Starbucks China crisis
  'unit_economics': ['P058'], // Din Tai Fung $27.4M breakdown
};

export function loadExamplePosts(flavors: string[]): Post[] {
  const allPosts = loadAllPosts();
  
  // Get post IDs for requested flavors
  const relevantIds = flavors.flatMap(flavor => FLAVOR_MAP[flavor] || []);
  
  // Filter posts by IDs
  const examples = allPosts.filter(post => relevantIds.includes(post.id));
  
  console.log(`📚 Loaded ${examples.length} example posts for flavors: ${flavors.join(', ')}`);
  
  return examples;
}

export function loadBestPosts(count: number = 5): Post[] {
  const allPosts = loadAllPosts();
  
  // Get posts that are viral with high leverage signals
  const bestPosts = allPosts
    .filter(p => p.isViral && p.hasViralElements)
    .sort((a, b) => {
      const aSignals = a.leverageSignals?.length || 0;
      const bSignals = b.leverageSignals?.length || 0;
      return bSignals - aSignals;
    })
    .slice(0, count);
  
  console.log(`📚 Loaded ${bestPosts.length} best performing posts`);
  
  return bestPosts;
}

export function formatExamplesForPrompt(posts: Post[]): string {
  return posts.map(post => {
    const signals = post.leverageSignals?.map(s => s.signal).join(', ') || 'None';
    const analysisText = post.analysis 
      ? `How readers felt: ${post.analysis.howItMadeReadersFeel || 'N/A'}\nWhat they learned: ${post.analysis.whatTheyLearned || 'N/A'}`
      : 'No analysis available';
    
    return `
POST ID: ${post.id}
LEVERAGE SIGNALS: ${signals}
ANALYSIS: ${analysisText}

CONTENT:
${post.text}

---
`;
  }).join('\n');
}

export function getViralPatterns(): string {
  const allPosts = loadAllPosts();
  const viralPosts = allPosts.filter(p => p.isViral);
  
  // Analyze common patterns
  const signalCounts: Record<string, number> = {};
  viralPosts.forEach(post => {
    if (post.leverageSignals) {
      post.leverageSignals.forEach(signalObj => {
        const signalName = signalObj.signal;
        signalCounts[signalName] = (signalCounts[signalName] || 0) + 1;
      });
    }
  });
  
  const topSignals = Object.entries(signalCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([signal, count]) => `${signal} (${count} posts)`)
    .join(', ');
  
  return `Most successful leverage signals: ${topSignals}`;
}

