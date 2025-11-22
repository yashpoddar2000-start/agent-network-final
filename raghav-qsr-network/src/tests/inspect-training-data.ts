/**
 * Training Data Inspector
 * 
 * Shows EXACTLY what data is used for training each eval:
 * - Which posts are quality vs flop
 * - Which posts have each signal
 * - The EXACT prompts sent to GPT-4o (without calling OpenAI)
 * 
 * NO API CALLS - just data inspection
 * 
 * Output: tests/results/training-data-inspection.txt
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import {
  loadAllPosts,
  getQualityPosts,
  getFlopPosts,
  getUnluckyPosts,
  getPostsBySignal,
  getFlopPostsForComparison,
  formatPostForPrompt,
} from '../mastra/evals/utils/training-data';

// All signal types we're testing
const ALL_SIGNALS = [
  'shocking_number_contrast',
  'side_by_side_comparison',
  'contrarian_with_proof',
  'detailed_breakdown',
  'reveals_hidden_mechanism',
  'comeback_story',
  'david_vs_goliath',
];

function generateOutput(): string {
  let output = '';
  
  output += '═'.repeat(80) + '\n';
  output += '📊 TRAINING DATA INSPECTION REPORT\n';
  output += '═'.repeat(80) + '\n\n';
  output += `Generated: ${new Date().toISOString()}\n\n`;
  
  const allPosts = loadAllPosts();
  const qualityPosts = getQualityPosts();
  const flopPosts = getFlopPosts();
  const unluckyPosts = getUnluckyPosts();
  
  // ============================================================================
  // SECTION 1: OVERALL STATISTICS
  // ============================================================================
  output += '═'.repeat(80) + '\n';
  output += 'SECTION 1: OVERALL STATISTICS\n';
  output += '═'.repeat(80) + '\n\n';
  
  output += `Total posts in dataset: ${allPosts.length}\n\n`;
  
  output += '📊 TRAINING DATA STRATEGY (Hybrid Approach):\n\n';
  
  output += `   PRIMARY: Quality posts (hasViralElements: true AND isViral: true): ${qualityPosts.length}\n`;
  output += `   → These went viral AND have quality elements\n`;
  output += `   → Used as POSITIVE training examples (proven winners)\n\n`;
  
  output += `   FALLBACK: Unlucky posts used when signal has < 3 proven examples\n`;
  output += `   → Ensures all signals have sufficient training data\n`;
  output += `   → Prioritizes proven winners, supplements as needed\n\n`;
  
  output += `   NEGATIVE: Flop posts (hasViralElements: false): ${flopPosts.length}\n`;
  output += `   → These lack viral elements\n`;
  output += `   → Used as NEGATIVE training examples\n\n`;
  
  output += '📋 NOT USED FOR TRAINING:\n';
  output += `   Unlucky posts (hasViralElements: true BUT isViral: false): ${unluckyPosts.length}\n`;
  output += `   → These have quality but didn't perform (bad timing/algorithm)\n`;
  output += `   → NOT used for training (unreliable signal)\n\n`;
  
  const unlabeled = allPosts.length - qualityPosts.length - flopPosts.length - unluckyPosts.length;
  output += `   Unlabeled posts: ${unlabeled}\n`;
  output += `   → Need manual review\n\n`;
  
  // ============================================================================
  // SECTION 2: QUALITY POSTS LIST
  // ============================================================================
  output += '═'.repeat(80) + '\n';
  output += 'SECTION 2: QUALITY POSTS (hasViralElements: true)\n';
  output += '═'.repeat(80) + '\n\n';
  output += 'These are used as POSITIVE EXAMPLES for training.\n\n';
  
  qualityPosts.forEach((post, idx) => {
    output += `${idx + 1}. ${post.id} - Engagement: ${post.engagement.engagementScore}\n`;
    output += `   Hook: "${post.text.substring(0, 100)}..."\n`;
    if (post.leverageSignals && post.leverageSignals.length > 0) {
      output += `   Signals: ${post.leverageSignals.map(s => s.signal).join(', ')}\n`;
    }
    output += '\n';
  });
  
  // ============================================================================
  // SECTION 3: UNLUCKY POSTS (Not used for training)
  // ============================================================================
  output += '═'.repeat(80) + '\n';
  output += 'SECTION 3: UNLUCKY POSTS (hasViralElements: true, isViral: false)\n';
  output += '═'.repeat(80) + '\n\n';
  output += 'These posts have quality elements but didn\'t go viral.\n';
  output += 'NOT used for training (unreliable - could be timing/algorithm).\n\n';
  
  if (unluckyPosts.length === 0) {
    output += '✅ No unlucky posts found. All quality posts went viral!\n\n';
  } else {
    unluckyPosts.forEach((post, idx) => {
      output += `${idx + 1}. ${post.id} - Engagement: ${post.engagement.engagementScore}\n`;
      output += `   Hook: "${post.text.substring(0, 100)}..."\n`;
      if (post.leverageSignals && post.leverageSignals.length > 0) {
        output += `   Signals: ${post.leverageSignals.map(s => s.signal).join(', ')}\n`;
      }
      output += `   ⚠️  Has quality but low engagement (timing/algorithm issue)\n`;
      output += '\n';
    });
  }
  
  // ============================================================================
  // SECTION 4: FLOP POSTS LIST
  // ============================================================================
  output += '═'.repeat(80) + '\n';
  output += 'SECTION 3: FLOP POSTS (hasViralElements: false)\n';
  output += '═'.repeat(80) + '\n\n';
  output += 'These are used as NEGATIVE EXAMPLES for training.\n\n';
  
  flopPosts.forEach((post, idx) => {
    output += `${idx + 1}. ${post.id} - Engagement: ${post.engagement.engagementScore}\n`;
    output += `   Hook: "${post.text.substring(0, 100)}..."\n`;
    output += '\n';
  });
  
  // ============================================================================
  // SECTION 5: SIGNAL DISTRIBUTION
  // ============================================================================
  output += '═'.repeat(80) + '\n';
  output += 'SECTION 4: SIGNAL DISTRIBUTION\n';
  output += '═'.repeat(80) + '\n\n';
  output += 'Shows which quality posts have each signal.\n\n';
  
  ALL_SIGNALS.forEach(signal => {
    const postsWithSignal = getPostsBySignal(signal);
    
    // Calculate proven vs unlucky breakdown
    const provenPosts = qualityPosts.filter(post => 
      post.leverageSignals?.some(s => s.signal === signal)
    );
    const unluckyWithSignal = unluckyPosts.filter(post =>
      post.leverageSignals?.some(s => s.signal === signal)
    );
    
    output += `\n${signal.toUpperCase().replace(/_/g, ' ')}\n`;
    output += '-'.repeat(80) + '\n';
    output += `Total posts with this signal: ${postsWithSignal.length}\n`;
    output += `  → Proven winners (went viral): ${provenPosts.length}\n`;
    output += `  → Unlucky posts (didn't go viral): ${unluckyWithSignal.length}\n`;
    
    if (unluckyWithSignal.length > 0) {
      output += `\n📝 HYBRID MODE: Using unlucky posts as supplement (< 3 proven examples)\n`;
    }
    output += '\n';
    
    if (postsWithSignal.length === 0) {
      output += '⚠️  WARNING: No posts found with this signal!\n';
      output += '   This eval will have NO positive examples.\n\n';
    } else {
      postsWithSignal.forEach((post, idx) => {
        const isProven = post.isViral === true;
        const badge = isProven ? '✅ PROVEN' : '⚠️  UNLUCKY';
        
        output += `${idx + 1}. ${post.id} ${badge} - Engagement: ${post.engagement.engagementScore}\n`;
        output += `   "${post.text.substring(0, 80)}..."\n`;
        
        // Show the signal note
        const signalData = post.leverageSignals?.find(s => s.signal === signal);
        if (signalData) {
          output += `   WHY: ${signalData.note}\n`;
        }
        output += '\n';
      });
    }
  });
  
  // ============================================================================
  // SECTION 6: SAMPLE FLOP POSTS FOR COMPARISON
  // ============================================================================
  output += '═'.repeat(80) + '\n';
  output += 'SECTION 5: SAMPLE FLOP POSTS SELECTION\n';
  output += '═'.repeat(80) + '\n\n';
  output += 'When each eval runs, it randomly selects 3-5 flop posts.\n';
  output += 'Here\'s a sample of what could be selected:\n\n';
  
  const sampleFlops = getFlopPostsForComparison(5);
  sampleFlops.forEach((post, idx) => {
    output += `${idx + 1}. ${post.id}\n`;
    output += `   Hook: "${post.text.substring(0, 100)}..."\n`;
    if (post.analysis?.whatWorkedOrDidntWork) {
      output += `   Why it failed: "${post.analysis.whatWorkedOrDidntWork.substring(0, 150)}..."\n`;
    }
    output += '\n';
  });
  
  // ============================================================================
  // SECTION 7: FORMATTED EXAMPLES (What GPT sees)
  // ============================================================================
  output += '═'.repeat(80) + '\n';
  output += 'SECTION 6: FORMATTED EXAMPLES (What GPT-4o Sees)\n';
  output += '═'.repeat(80) + '\n\n';
  output += 'This is how posts are formatted in the LLM prompt.\n\n';
  
  output += '--- QUALITY EXAMPLE (Positive) ---\n\n';
  const sampleQuality = qualityPosts[0];
  if (sampleQuality) {
    output += formatPostForPrompt(sampleQuality);
    output += '\n';
  }
  
  output += '\n--- FLOP EXAMPLE (Negative) ---\n\n';
  const sampleFlop = flopPosts[0];
  if (sampleFlop) {
    output += `POST ${sampleFlop.id}:\n${sampleFlop.text.substring(0, 300)}...\n`;
    if (sampleFlop.analysis?.whatWorkedOrDidntWork) {
      output += `WHY IT FAILED: ${sampleFlop.analysis.whatWorkedOrDidntWork}\n`;
    }
    output += '\n';
  }
  
  // ============================================================================
  // SECTION 8: ACTUAL PROMPTS FOR EACH SIGNAL EVAL
  // ============================================================================
  output += '═'.repeat(80) + '\n';
  output += 'SECTION 7: COMPLETE PROMPTS FOR SIGNAL EVALS\n';
  output += '═'.repeat(80) + '\n\n';
  output += 'These are the EXACT prompts sent to GPT-4o for each signal eval.\n\n';
  
  ALL_SIGNALS.forEach(signal => {
    output += '\n\n';
    output += '▼'.repeat(80) + '\n';
    output += `PROMPT FOR: ${signal.toUpperCase().replace(/_/g, ' ')} EVAL\n`;
    output += '▼'.repeat(80) + '\n\n';
    
    const qualityExamples = getPostsBySignal(signal);
    const flopExamples = getFlopPostsForComparison(3);
    
    // Build the actual prompt (simplified version)
    output += buildSignalPrompt(signal, qualityExamples, flopExamples, '[NEW POST TO EVALUATE WOULD GO HERE]');
    output += '\n\n';
  });
  
  // ============================================================================
  // SECTION 9: ACTUAL PROMPTS FOR ANTI-PATTERN EVALS
  // ============================================================================
  output += '═'.repeat(80) + '\n';
  output += 'SECTION 8: COMPLETE PROMPTS FOR ANTI-PATTERN EVALS\n';
  output += '═'.repeat(80) + '\n\n';
  
  const antiPatterns = ['cringy_hook', 'broad_appeal', 'forensic_detail'];
  
  antiPatterns.forEach(pattern => {
    output += '\n\n';
    output += '▼'.repeat(80) + '\n';
    output += `PROMPT FOR: ${pattern.toUpperCase().replace(/_/g, ' ')} EVAL\n`;
    output += '▼'.repeat(80) + '\n\n';
    
    const qualityExamples = getQualityPosts();
    const flopExamples = getFlopPostsForComparison(5);
    
    output += buildAntiPatternPrompt(pattern, qualityExamples, flopExamples, '[NEW POST TO EVALUATE WOULD GO HERE]');
    output += '\n\n';
  });
  
  // ============================================================================
  // SECTION 10: DATA QUALITY CHECKS
  // ============================================================================
  output += '═'.repeat(80) + '\n';
  output += 'SECTION 9: DATA QUALITY CHECKS\n';
  output += '═'.repeat(80) + '\n\n';
  
  output += '🔍 CHECKING FOR POTENTIAL ISSUES:\n\n';
  
  // Check 1: Signals with few examples
  let issuesFound = 0;
  ALL_SIGNALS.forEach(signal => {
    const count = getPostsBySignal(signal).length;
    if (count < 3) {
      output += `⚠️  WARNING: "${signal}" has only ${count} example(s)\n`;
      output += `   Recommendation: Need at least 3-5 examples for good training\n\n`;
      issuesFound++;
    }
  });
  
  // Check 2: Quality vs Flop balance
  const ratio = qualityPosts.length / flopPosts.length;
  if (ratio < 0.5 || ratio > 2.0) {
    output += `⚠️  WARNING: Imbalanced dataset\n`;
    output += `   Quality: ${qualityPosts.length}, Flop: ${flopPosts.length}\n`;
    output += `   Ratio: ${ratio.toFixed(2)}:1\n`;
    output += `   Recommendation: Aim for 1:1 to 2:1 ratio\n\n`;
    issuesFound++;
  }
  
  // Check 3: Posts without signals
  const qualityWithoutSignals = qualityPosts.filter(p => !p.leverageSignals || p.leverageSignals.length === 0);
  if (qualityWithoutSignals.length > 0) {
    output += `⚠️  WARNING: ${qualityWithoutSignals.length} quality posts have NO signals annotated\n`;
    output += `   Posts: ${qualityWithoutSignals.map(p => p.id).join(', ')}\n`;
    output += `   Recommendation: Add leverageSignals annotations\n\n`;
    issuesFound++;
  }
  
  if (issuesFound === 0) {
    output += '✅ All checks passed! Data quality looks good.\n\n';
  } else {
    output += `\nTotal issues found: ${issuesFound}\n\n`;
  }
  
  // ============================================================================
  // END
  // ============================================================================
  output += '═'.repeat(80) + '\n';
  output += 'END OF INSPECTION REPORT\n';
  output += '═'.repeat(80) + '\n';
  
  return output;
}

// Build a simplified version of signal eval prompt
function buildSignalPrompt(signal: string, qualityExamples: any[], flopExamples: any[], newPost: string): string {
  let prompt = `You are evaluating if a LinkedIn post has "${signal.replace(/_/g, ' ').toUpperCase()}".\n\n`;
  
  prompt += `POSITIVE EXAMPLES (Posts WITH this signal):\n`;
  prompt += '─'.repeat(80) + '\n\n';
  
  if (qualityExamples.length === 0) {
    prompt += '⚠️  NO EXAMPLES AVAILABLE!\n\n';
  } else {
    qualityExamples.slice(0, 5).forEach((post, idx) => {
      prompt += `EXAMPLE ${idx + 1}:\n`;
      prompt += formatPostForPrompt(post);
      prompt += '\n' + '─'.repeat(80) + '\n\n';
    });
  }
  
  prompt += `\nNEGATIVE EXAMPLES (Posts WITHOUT this signal):\n`;
  prompt += '─'.repeat(80) + '\n\n';
  
  flopExamples.forEach((post, idx) => {
    prompt += `FLOP ${idx + 1}: POST ${post.id}\n`;
    prompt += `${post.text.substring(0, 300)}...\n`;
    if (post.analysis?.whatWorkedOrDidntWork) {
      prompt += `WHY IT FAILED: ${post.analysis.whatWorkedOrDidntWork.substring(0, 200)}\n`;
    }
    prompt += '\n' + '─'.repeat(80) + '\n\n';
  });
  
  prompt += `\nNEW POST TO EVALUATE:\n`;
  prompt += '═'.repeat(80) + '\n';
  prompt += newPost + '\n';
  prompt += '═'.repeat(80) + '\n\n';
  
  prompt += `EVALUATION CRITERIA:\n`;
  prompt += `- Score 0.0-1.0 based on presence and quality of "${signal}"\n`;
  prompt += `- Compare to positive examples above\n`;
  prompt += `- Provide reason and recommendations\n\n`;
  
  return prompt;
}

// Build simplified anti-pattern prompt
function buildAntiPatternPrompt(pattern: string, qualityExamples: any[], flopExamples: any[], newPost: string): string {
  let prompt = `You are detecting "${pattern.replace(/_/g, ' ').toUpperCase()}" anti-pattern.\n\n`;
  
  prompt += `GOOD EXAMPLES (Posts WITHOUT this anti-pattern):\n`;
  prompt += '─'.repeat(80) + '\n\n';
  
  qualityExamples.slice(0, 5).forEach((post, idx) => {
    prompt += `GOOD ${idx + 1}: ${post.id}\n`;
    prompt += `Hook: "${post.text.split('\\n').slice(0, 2).join(' ')}"\n\n`;
  });
  
  prompt += `\nBAD EXAMPLES (Posts WITH this anti-pattern):\n`;
  prompt += '─'.repeat(80) + '\n\n';
  
  flopExamples.forEach((post, idx) => {
    prompt += `BAD ${idx + 1}: ${post.id}\n`;
    prompt += `${post.text.substring(0, 300)}...\n`;
    if (post.analysis?.whatWorkedOrDidntWork) {
      prompt += `WHY: ${post.analysis.whatWorkedOrDidntWork.substring(0, 150)}\n`;
    }
    prompt += '\n';
  });
  
  prompt += `\nNEW POST TO EVALUATE:\n`;
  prompt += '═'.repeat(80) + '\n';
  prompt += newPost + '\n';
  prompt += '═'.repeat(80) + '\n\n';
  
  return prompt;
}

// Main execution
console.log('🔍 Inspecting training data...\n');

const output = generateOutput();

const outputPath = join(__dirname, 'results/training-data-inspection.txt');
writeFileSync(outputPath, output);

console.log('✅ Inspection complete!');
console.log(`📄 Report saved to: ${outputPath}`);
console.log(`\nReport contains:`);
console.log('  - Quality vs flop post lists');
console.log('  - Signal distribution analysis');
console.log('  - Complete prompts for all evals');
console.log('  - Data quality checks');
console.log('\nReview the file to verify training data quality.');

