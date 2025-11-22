/**
 * Token Analysis Script
 * 
 * Analyzes the worst-case token usage for eval prompts
 * GPT-4o limit: 128K tokens
 * 
 * Rough estimate: 1 token ≈ 4 characters (conservative)
 */

import {
  loadAllPosts,
  getPostsBySignal,
  getFlopPostsForComparison,
  formatPostForPrompt,
} from '../mastra/evals/utils/training-data';

const ALL_SIGNALS = [
  'shocking_number_contrast',
  'side_by_side_comparison',
  'contrarian_with_proof',
  'detailed_breakdown',
  'reveals_hidden_mechanism',
  'comeback_story',
  'david_vs_goliath',
];

function estimateTokens(textLength: number): number {
  // Conservative estimate: 1 token ≈ 4 characters
  // GPT-4 actual is closer to 1 token ≈ 3.5 chars for English
  return Math.ceil(textLength / 4);
}

function analyzePromptSize() {
  console.log('═'.repeat(80));
  console.log('📊 PROMPT TOKEN ANALYSIS');
  console.log('═'.repeat(80));
  console.log('\nGPT-4o Context Window: 128,000 tokens');
  console.log('Safe Target: < 100,000 tokens (leave room for response)\n');
  console.log('═'.repeat(80));
  
  let maxTokens = 0;
  let maxSignal = '';
  
  // Analyze each signal eval
  ALL_SIGNALS.forEach(signal => {
    const qualityExamples = getPostsBySignal(signal);
    const flopExamples = getFlopPostsForComparison(3);
    
    // Build the prompt (simplified)
    let promptText = `You are evaluating if a LinkedIn post has "${signal}".\n\n`;
    promptText += `POSITIVE EXAMPLES:\n\n`;
    
    // Add up to 5 quality examples (what the actual eval does)
    qualityExamples.slice(0, 5).forEach((post, idx) => {
      promptText += `EXAMPLE ${idx + 1}:\n`;
      promptText += formatPostForPrompt(post);
      promptText += '\n---\n\n';
    });
    
    promptText += `NEGATIVE EXAMPLES:\n\n`;
    
    // Add 3 flop examples
    flopExamples.forEach((post, idx) => {
      promptText += `FLOP ${idx + 1}: POST ${post.id}\n`;
      promptText += post.text.substring(0, 300) + '...\n';
      if (post.analysis?.whatWorkedOrDidntWork) {
        promptText += `WHY IT FAILED: ${post.analysis.whatWorkedOrDidntWork.substring(0, 200)}\n`;
      }
      promptText += '\n---\n\n';
    });
    
    // Add evaluation instructions (fixed overhead)
    promptText += `\nNEW POST TO EVALUATE:\n`;
    promptText += '[Post text here - assume max 2000 chars]\n\n';
    promptText += `EVALUATION CRITERIA:\n`;
    promptText += `- Score 0.0-1.0\n`;
    promptText += `- Provide reason and recommendations\n`;
    promptText += `[Additional instructions ~500 chars]\n`;
    
    // Add worst-case new post (2000 chars)
    const totalChars = promptText.length + 2000 + 500;
    const estimatedTokens = estimateTokens(totalChars);
    
    console.log(`\n${signal.replace(/_/g, ' ').toUpperCase()}`);
    console.log('-'.repeat(80));
    console.log(`  Quality examples: ${qualityExamples.slice(0, 5).length}`);
    console.log(`  Flop examples: ${flopExamples.length}`);
    console.log(`  Total characters: ${totalChars.toLocaleString()}`);
    console.log(`  Estimated tokens: ${estimatedTokens.toLocaleString()}`);
    console.log(`  Percentage of limit: ${((estimatedTokens / 128000) * 100).toFixed(2)}%`);
    
    if (estimatedTokens > 50000) {
      console.log(`  ⚠️  WARNING: High token usage`);
    } else if (estimatedTokens > 30000) {
      console.log(`  ⚠️  NOTICE: Moderate token usage`);
    } else {
      console.log(`  ✅ SAFE: Low token usage`);
    }
    
    if (estimatedTokens > maxTokens) {
      maxTokens = estimatedTokens;
      maxSignal = signal;
    }
  });
  
  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('SUMMARY');
  console.log('═'.repeat(80));
  console.log(`\nWorst-case signal: ${maxSignal.replace(/_/g, ' ')}`);
  console.log(`Maximum tokens: ${maxTokens.toLocaleString()} / 128,000`);
  console.log(`Percentage used: ${((maxTokens / 128000) * 100).toFixed(2)}%`);
  console.log(`Tokens remaining: ${(128000 - maxTokens).toLocaleString()}`);
  
  if (maxTokens > 100000) {
    console.log('\n🚨 CRITICAL: Exceeds safe limit (100K tokens)');
    console.log('   Recommendation: Reduce examples per prompt');
  } else if (maxTokens > 50000) {
    console.log('\n⚠️  WARNING: High usage but within limits');
    console.log('   Recommendation: Monitor as dataset grows');
  } else {
    console.log('\n✅ SAFE: Well within context window limits');
    console.log('   Room for growth: Dataset can expand significantly');
  }
  
  // Calculate average post length for reference
  const allPosts = loadAllPosts();
  const avgLength = allPosts.reduce((sum, p) => sum + p.text.length, 0) / allPosts.length;
  const maxLength = Math.max(...allPosts.map(p => p.text.length));
  
  console.log('\n' + '═'.repeat(80));
  console.log('DATASET STATISTICS');
  console.log('═'.repeat(80));
  console.log(`\nTotal posts: ${allPosts.length}`);
  console.log(`Average post length: ${Math.round(avgLength)} characters`);
  console.log(`Longest post: ${maxLength} characters`);
  console.log(`Average tokens per post: ~${Math.round(avgLength / 4)}`);
  
  console.log('\n' + '═'.repeat(80));
}

analyzePromptSize();
