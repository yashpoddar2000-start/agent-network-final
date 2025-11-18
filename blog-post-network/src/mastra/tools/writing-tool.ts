import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { BlogPostAnalysisSchema } from '../schemas/blog-post-schema';

/**
 * Writing Tool
 * 
 * Analyzes blog post content for quality metrics.
 * Checks readability, SEO, and engagement potential.
 * 
 * Based on: template's character-consistency-tool.ts pattern
 * Reference: template-ai-storyboard-consistent-character/src/mastra/tools/character-consistency-tool.ts
 */

export const writingTool = createTool({
  id: 'analyze-content',
  description: 'Analyzes blog post content for quality, readability, SEO, and engagement potential. Use this to evaluate draft content.',
  
  inputSchema: z.object({
    content: z.string().describe('The blog post content to analyze'),
    targetKeywords: z.array(z.string()).optional().describe('Keywords to check for'),
  }),
  
  outputSchema: BlogPostAnalysisSchema,
  
  execute: async ({ context }) => {
    console.log('📝 [Writing Tool] Starting content analysis...');
    console.log(`📊 [Writing Tool] Content length: ${context.content.length} characters`);

    const { content, targetKeywords = [] } = context;

    // Calculate word count
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    console.log(`📖 [Writing Tool] Word count: ${wordCount}`);

    // Calculate readability score (simple heuristic)
    const avgWordLength = content.replace(/\s+/g, '').length / wordCount;
    const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = wordCount / sentenceCount;
    
    // Flesch reading ease approximation
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * (avgWordLength / 5)
    ));

    console.log(`📈 [Writing Tool] Readability score: ${readabilityScore.toFixed(1)}/100`);

    // Calculate SEO score
    let seoScore = 50; // Base score
    
    // Check for keywords
    const keywordsFound = targetKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    seoScore += (keywordsFound.length / Math.max(1, targetKeywords.length)) * 30;
    
    // Check for headings (markdown)
    const hasHeadings = /^#{1,6}\s/m.test(content);
    if (hasHeadings) seoScore += 10;
    
    // Check for good length (800-2000 words ideal)
    if (wordCount >= 800 && wordCount <= 2000) seoScore += 10;
    
    seoScore = Math.min(100, seoScore);
    console.log(`🎯 [Writing Tool] SEO score: ${seoScore.toFixed(1)}/100`);

    // Calculate engagement potential (0-10 scale)
    let engagementScore = 5; // Base
    
    // Good hooks (starts with question, stat, or bold claim)
    const firstLine = content.split('\n')[0].toLowerCase();
    if (firstLine.includes('?') || /\d+%/.test(firstLine) || firstLine.includes('!')) {
      engagementScore += 2;
    }
    
    // Has bullet points or lists (engaging format)
    if (/^[-*]\s/m.test(content) || /^\d+\.\s/m.test(content)) {
      engagementScore += 1.5;
    }
    
    // Good length
    if (wordCount >= 1000 && wordCount <= 1500) {
      engagementScore += 1.5;
    }
    
    engagementScore = Math.min(10, engagementScore);
    console.log(`💡 [Writing Tool] Engagement potential: ${engagementScore.toFixed(1)}/10`);

    // Identify strengths
    const strengths = [];
    if (readabilityScore > 60) strengths.push('Easy to read');
    if (seoScore > 70) strengths.push('Well optimized for SEO');
    if (wordCount >= 1000) strengths.push('Comprehensive content');
    if (hasHeadings) strengths.push('Good structure with headings');
    if (keywordsFound.length > 0) strengths.push('Target keywords included');

    // Identify improvements
    const improvements = [];
    if (readabilityScore < 60) improvements.push('Simplify sentence structure');
    if (seoScore < 70) improvements.push('Add more target keywords');
    if (wordCount < 800) improvements.push('Expand content to at least 800 words');
    if (!hasHeadings) improvements.push('Add section headings for better structure');
    if (engagementScore < 7) improvements.push('Add more engaging elements (questions, lists, stats)');

    console.log(`✅ [Writing Tool] Analysis complete!`);
    console.log(`   Strengths: ${strengths.length}`);
    console.log(`   Improvements needed: ${improvements.length}`);

    return {
      readabilityScore: Math.round(readabilityScore),
      seoScore: Math.round(seoScore),
      engagementPotential: Number(engagementScore.toFixed(1)),
      strengths,
      improvements,
      keywordsUsed: keywordsFound,
    };
  },
});

