import { Metric, type MetricResult } from '@mastra/core';

/**
 * Research Quality Metrics
 * 
 * Evaluates the quality of research output from researchAgent
 * Based on: template's storyboard-evals.ts pattern
 */

/**
 * Research Completeness Metric
 * Checks if research has adequate findings and insights
 */
export class ResearchCompletenessMetric extends Metric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('📊 [Research Completeness] Evaluating research quality...');
    
    try {
      // Parse the research output (should be JSON)
      const cleanOutput = output.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const research = JSON.parse(cleanOutput);
      
      let score = 0;
      const issues: string[] = [];
      
      // Check findings count (need at least 5)
      const findingsCount = research.findings?.length || 0;
      if (findingsCount >= 5) {
        score += 0.4;
      } else {
        issues.push(`Only ${findingsCount} findings (need 5+)`);
      }
      
      // Check insights (need at least 3)
      const insightsCount = research.keyInsights?.length || 0;
      if (insightsCount >= 3) {
        score += 0.3;
      } else {
        issues.push(`Only ${insightsCount} insights (need 3+)`);
      }
      
      // Check statistics present
      const statsCount = research.statistics?.length || 0;
      if (statsCount >= 2) {
        score += 0.2;
      } else {
        issues.push(`Only ${statsCount} statistics (need 2+)`);
      }
      
      // Check examples
      const examplesCount = research.examples?.length || 0;
      if (examplesCount >= 2) {
        score += 0.1;
      } else {
        issues.push(`Only ${examplesCount} examples (need 2+)`);
      }
      
      console.log(`✅ [Research Completeness] Score: ${score}`);
      
      return {
        score,
        info: {
          findingsCount,
          insightsCount,
          statsCount,
          examplesCount,
          issues: issues.length > 0 ? issues : ['Research is complete'],
        },
      };
      
    } catch (error) {
      console.error('❌ [Research Completeness] Error parsing research output');
      return {
        score: 0,
        info: { error: 'Failed to parse research output' },
      };
    }
  }
}

/**
 * Research Relevance Metric
 * Checks if research findings are relevant to the topic
 */
export class ResearchRelevanceMetric extends Metric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('📊 [Research Relevance] Evaluating topic relevance...');
    
    try {
      const cleanOutput = output.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const research = JSON.parse(cleanOutput);
      
      let score = 0;
      const topicWords = input.toLowerCase().split(/\s+/);
      
      // Check if findings mention the topic
      const findings = research.findings || [];
      const relevantFindings = findings.filter((f: any) => {
        const findingText = (f.point || '').toLowerCase();
        return topicWords.some(word => word.length > 3 && findingText.includes(word));
      });
      
      const relevanceRatio = findings.length > 0 ? relevantFindings.length / findings.length : 0;
      score = relevanceRatio;
      
      console.log(`✅ [Research Relevance] Score: ${score.toFixed(2)}`);
      
      return {
        score,
        info: {
          totalFindings: findings.length,
          relevantFindings: relevantFindings.length,
          relevanceRatio: (relevanceRatio * 100).toFixed(1) + '%',
        },
      };
      
    } catch (error) {
      return {
        score: 0,
        info: { error: 'Failed to evaluate relevance' },
      };
    }
  }
}

// Export metric instances
export const researchEvals = {
  completeness: new ResearchCompletenessMetric(),
  relevance: new ResearchRelevanceMetric(),
};

