import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { ResearchInputSchema, ResearchSummarySchema } from '../schemas/research-schema';

/**
 * Research Tool
 * 
 * Simulates web research by returning fake data about a topic.
 * In production, this would call real APIs (Exa, Google, etc.)
 * 
 * Based on: template's script-analysis-tool.ts
 * Reference: template-ai-storyboard-consistent-character/src/mastra/tools/script-analysis-tool.ts
 */

export const researchTool = createTool({
  id: 'research-topic',
  description: 'Researches a topic and returns key findings, insights, and examples. Use this when you need to gather information before writing.',
  
  // What the tool accepts as input
  inputSchema: ResearchInputSchema,
  
  // What the tool returns as output
  outputSchema: ResearchSummarySchema,
  
  // The actual implementation
  execute: async ({ context }) => {
    console.log('🔍 [Research Tool] Starting research...');
    console.log(`📋 [Research Tool] Topic: ${context.topic}`);
    console.log(`📊 [Research Tool] Depth: ${context.depth}`);
    console.log(`🎯 [Research Tool] Requested findings: ${context.numFindings}`);

    const { topic, depth, focusAreas, numFindings } = context;

    // Simulate research delay (real API would take time)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate fake research findings based on topic
    const findings = [];
    
    for (let i = 1; i <= numFindings; i++) {
      findings.push({
        point: `Research finding #${i} about ${topic}: This is important because it demonstrates key aspects of the topic.`,
        source: `Research Source ${i}`,
        relevance: (i <= 3 ? 'high' : i <= 7 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
        category: i % 3 === 0 ? 'statistics' : i % 3 === 1 ? 'trends' : 'examples',
      });
    }

    // Generate key insights
    const keyInsights = [
      `${topic} is an important topic in modern technology`,
      `Recent trends show growing interest in ${topic}`,
      `Industry experts recommend focusing on ${topic}`,
    ];

    // Generate trends if deep research
    const trends = depth === 'deep' ? [
      `${topic} adoption is increasing by 40% year over year`,
      `Major companies are investing heavily in ${topic}`,
      `${topic} is expected to transform the industry`,
    ] : undefined;

    // Generate statistics
    const statistics = [
      `85% of developers are interested in ${topic}`,
      `${topic} market size: $50 billion`,
      `${topic} usage grew 120% in 2024`,
    ];

    // Generate examples
    const examples = [
      `Company A successfully implemented ${topic} and saw 3x growth`,
      `Startup B built their entire platform on ${topic}`,
      `Enterprise C migrated to ${topic} and reduced costs by 40%`,
    ];

    console.log(`✅ [Research Tool] Generated ${findings.length} findings`);
    console.log(`📊 [Research Tool] Generated ${keyInsights.length} insights`);
    console.log(`📈 [Research Tool] Generated ${statistics.length} statistics`);

    return {
      topic,
      findings,
      keyInsights,
      trends,
      statistics,
      examples,
      timestamp: new Date().toISOString(),
    };
  },
});

