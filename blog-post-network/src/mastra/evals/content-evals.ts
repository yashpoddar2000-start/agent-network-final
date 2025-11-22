import { Metric, type MetricResult } from '@mastra/core';

/**
 * Content Quality Metrics
 * 
 * Evaluates blog post content quality
 */

/**
 * Content Structure Metric
 * Checks if blog post has proper structure (hook, intro, sections, conclusion)
 */
export class ContentStructureMetric extends Metric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('📊 [Content Structure] Evaluating post structure...');
    
    let score = 0;
    const issues: string[] = [];
    
    // Check for markdown headings
    const hasHeadings = /^#{2,4}\s+.+$/m.test(output);
    if (hasHeadings) {
      score += 0.3;
    } else {
      issues.push('No section headings found');
    }
    
    // Check word count (should be 800-2000)
    const wordCount = output.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount >= 800 && wordCount <= 2000) {
      score += 0.3;
    } else {
      issues.push(`Word count ${wordCount} (ideal: 800-2000)`);
    }
    
    // Check for lists or bullet points
    const hasLists = /^[-*]\s/m.test(output) || /^\d+\.\s/m.test(output);
    if (hasLists) {
      score += 0.2;
    } else {
      issues.push('No lists or bullet points for readability');
    }
    
    // Check for bold emphasis
    const hasBold = /\*\*[^*]+\*\*/.test(output);
    if (hasBold) {
      score += 0.1;
    } else {
      issues.push('No bold text for emphasis');
    }
    
    // Check for conclusion
    const hasConclusion = /conclusion|summary|final|takeaway/i.test(output);
    if (hasConclusion) {
      score += 0.1;
    } else {
      issues.push('No clear conclusion section');
    }
    
    console.log(`✅ [Content Structure] Score: ${score.toFixed(2)}`);
    
    return {
      score,
      info: {
        wordCount,
        hasHeadings,
        hasLists,
        hasBold,
        hasConclusion,
        issues: issues.length > 0 ? issues : ['Structure is good'],
      },
    };
  }
}

/**
 * SEO Quality Metric
 * Checks SEO optimization (keywords, meta elements)
 */
export class SEOQualityMetric extends Metric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('📊 [SEO Quality] Evaluating SEO optimization...');
    
    let score = 0;
    
    // Extract topic keywords from input
    const topicWords = input.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    
    // Check keyword density
    const outputLower = output.toLowerCase();
    const keywordsFound = topicWords.filter(word => outputLower.includes(word));
    const keywordScore = topicWords.length > 0 ? keywordsFound.length / topicWords.length : 0;
    score += keywordScore * 0.4;
    
    // Check for headings (good for SEO)
    const headingCount = (output.match(/^#{2,4}\s+.+$/gm) || []).length;
    if (headingCount >= 3) score += 0.3;
    else if (headingCount >= 1) score += 0.15;
    
    // Check word count (800-2000 ideal for SEO)
    const wordCount = output.split(/\s+/).length;
    if (wordCount >= 800 && wordCount <= 2000) score += 0.3;
    else if (wordCount >= 500) score += 0.15;
    
    console.log(`✅ [SEO Quality] Score: ${score.toFixed(2)}`);
    
    return {
      score,
      info: {
        keywordsFound: keywordsFound.length,
        keywordDensity: (keywordScore * 100).toFixed(1) + '%',
        headingCount,
        wordCount,
      },
    };
  }
}

// Export metric instances
export const contentEvals = {
  structure: new ContentStructureMetric(),
  seo: new SEOQualityMetric(),
};

