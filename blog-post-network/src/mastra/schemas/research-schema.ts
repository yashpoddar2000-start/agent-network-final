import { z } from 'zod';

/**
 * Research Schema
 * 
 * Defines the structure for research data gathered by the research agent
 * Simpler than template's script-schema.ts since we're just gathering info
 * Reference: template-ai-storyboard-consistent-character/src/mastra/schemas/script-schema.ts
 */

// Individual research finding
export const ResearchFindingSchema = z.object({
  point: z.string().describe('Key research point or fact'),
  source: z.string().optional().describe('Source of information'),
  relevance: z.enum(['high', 'medium', 'low']).describe('Relevance to the topic'),
  category: z.string().optional().describe('Category of information (e.g., statistics, trends, examples)'),
});

// Research summary
export const ResearchSummarySchema = z.object({
  topic: z.string().describe('Research topic'),
  findings: z.array(ResearchFindingSchema).min(1).describe('Research findings'),
  keyInsights: z.array(z.string()).describe('Key insights from research'),
  trends: z.array(z.string()).optional().describe('Identified trends'),
  statistics: z.array(z.string()).optional().describe('Important statistics'),
  examples: z.array(z.string()).optional().describe('Real-world examples'),
  timestamp: z.string().describe('When research was conducted'),
});

// Research input request
export const ResearchInputSchema = z.object({
  topic: z.string().min(3).describe('Topic to research'),
  depth: z.enum(['shallow', 'moderate', 'deep']).default('moderate').describe('Research depth'),
  focusAreas: z.array(z.string()).optional().describe('Specific areas to focus on'),
  numFindings: z.number().min(3).max(20).default(10).describe('Number of findings to gather'),
});

// Research quality metrics
export const ResearchQualitySchema = z.object({
  completeness: z.number().min(0).max(1).describe('How complete is the research (0-1)'),
  relevance: z.number().min(0).max(1).describe('How relevant to the topic (0-1)'),
  diversity: z.number().min(0).max(1).describe('Diversity of sources and perspectives (0-1)'),
  actionability: z.number().min(0).max(1).describe('How actionable are the findings (0-1)'),
});

// Export TypeScript types
export type ResearchFinding = z.infer<typeof ResearchFindingSchema>;
export type ResearchSummary = z.infer<typeof ResearchSummarySchema>;
export type ResearchInput = z.infer<typeof ResearchInputSchema>;
export type ResearchQuality = z.infer<typeof ResearchQualitySchema>;

