import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { EditingResultSchema } from '../schemas/content-schema';

/**
 * Editing Tool
 * 
 * Performs grammar checking, style improvements, and content editing.
 * In production, this would use real grammar APIs (Grammarly, LanguageTool, etc.)
 * 
 * Based on: template's tool pattern
 * Simpler implementation for learning purposes
 */

export const editingTool = createTool({
  id: 'edit-content',
  description: 'Edits and improves blog post content by fixing grammar, improving clarity, and enhancing style. Use this to polish draft content.',
  
  inputSchema: z.object({
    content: z.string().describe('Content to edit'),
    focusAreas: z.array(z.enum(['grammar', 'clarity', 'style', 'conciseness'])).optional().describe('Specific areas to focus on'),
  }),
  
  outputSchema: EditingResultSchema,
  
  execute: async ({ context }) => {
    console.log('✏️ [Editing Tool] Starting content editing...');
    console.log(`📊 [Editing Tool] Content length: ${context.content.length} characters`);

    const { content, focusAreas = ['grammar', 'clarity', 'style'] } = context;

    // Simulate editing process
    await new Promise(resolve => setTimeout(resolve, 300));

    const issues = [];
    const changesMade = [];
    let editedContent = content;

    // Grammar checks (simple examples)
    console.log('🔍 [Editing Tool] Checking grammar...');
    
    // Fix common issues
    if (editedContent.includes('alot')) {
      issues.push({
        type: 'spelling' as const,
        severity: 'high' as const,
        location: 'Throughout document',
        suggestion: 'Change "alot" to "a lot"',
        originalText: 'alot',
        suggestedText: 'a lot',
      });
      editedContent = editedContent.replace(/alot/g, 'a lot');
      changesMade.push('Fixed "alot" → "a lot"');
    }

    if (editedContent.includes('  ')) {
      issues.push({
        type: 'grammar' as const,
        severity: 'low' as const,
        location: 'Multiple locations',
        suggestion: 'Remove double spaces',
        originalText: '  ',
        suggestedText: ' ',
      });
      editedContent = editedContent.replace(/  +/g, ' ');
      changesMade.push('Removed double spaces');
    }

    // Clarity checks
    console.log('🔍 [Editing Tool] Checking clarity...');
    
    const longSentences = editedContent.split(/[.!?]+/).filter(s => 
      s.split(/\s+/).length > 30
    );
    
    if (longSentences.length > 0) {
      issues.push({
        type: 'clarity' as const,
        severity: 'medium' as const,
        location: 'Multiple sentences',
        suggestion: 'Break down long sentences (>30 words) for better readability',
      });
      changesMade.push(`Flagged ${longSentences.length} long sentences for review`);
    }

    // Style improvements
    console.log('🔍 [Editing Tool] Checking style...');
    
    // Check for passive voice (simple check)
    const passiveCount = (editedContent.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/g) || []).length;
    if (passiveCount > 5) {
      issues.push({
        type: 'tone' as const,
        severity: 'medium' as const,
        location: 'Throughout document',
        suggestion: 'Consider using more active voice for stronger writing',
      });
      changesMade.push(`Identified ${passiveCount} instances of passive voice`);
    }

    // Check for hedging words
    const hedgingWords = ['maybe', 'perhaps', 'possibly', 'might', 'could'];
    const hedgingCount = hedgingWords.reduce((count, word) => {
      return count + (editedContent.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    }, 0);
    
    if (hedgingCount > 3) {
      issues.push({
        type: 'tone' as const,
        severity: 'low' as const,
        location: 'Throughout document',
        suggestion: 'Reduce hedging words for more confident writing',
      });
      changesMade.push(`Found ${hedgingCount} hedging words`);
    }

    // Calculate improvement score
    const issueCount = issues.length;
    const improvementScore = Math.max(0, 100 - (issueCount * 10));

    console.log(`✅ [Editing Tool] Editing complete!`);
    console.log(`   Issues found: ${issues.length}`);
    console.log(`   Changes made: ${changesMade.length}`);
    console.log(`   Improvement score: ${improvementScore}/100`);

    return {
      originalContent: content,
      editedContent,
      issues,
      changesMade,
      improvementScore,
      timestamp: new Date().toISOString(),
    };
  },
});

