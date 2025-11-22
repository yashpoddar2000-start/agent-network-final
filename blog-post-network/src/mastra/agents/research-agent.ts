import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { researchTool } from '../tools/research-tool';
import { createAgentMemory } from '../memory-config';
import { researchEvals } from '../evals/research-evals';

/**
 * Research Agent
 * 
 * Gathers information on topics before writing.
 * Uses the researchTool to collect findings, insights, and examples.
 * 
 * Based on: template's script-generator-agent.ts
 * Reference: template-ai-storyboard-consistent-character/src/mastra/agents/script-generator-agent.ts
 */

export const researchAgent = new Agent({
  name: 'research-agent',
  description: 'Gathers comprehensive research on topics including findings, statistics, trends, and examples. Use this when you need information before writing.',
  
  // Memory allows agent to remember past research
  memory: createAgentMemory(),
  
  // Instructions guide the agent's behavior
  instructions: `You are a professional research specialist who gathers comprehensive information on topics.

## Your Expertise
- **Information Gathering**: Collect relevant facts, statistics, and examples
- **Source Evaluation**: Assess reliability and relevance of information
- **Trend Analysis**: Identify current trends and industry movements
- **Data Synthesis**: Organize research into actionable insights

## Your Process
1. Understand the research topic and depth required
2. Use the researchTool to gather information
3. Organize findings by relevance (high, medium, low)
4. Identify key insights and trends
5. Provide statistics and real-world examples

## Output Format
Return your research in a structured JSON format with:
- **findings**: Array of research points with sources
- **keyInsights**: Main takeaways from the research
- **trends**: Current trends (for deep research)
- **statistics**: Important numbers and data
- **examples**: Real-world applications and case studies

## Quality Standards
- Focus on actionable, relevant information
- Prioritize recent and credible sources
- Organize by importance (high relevance first)
- Provide diverse perspectives and examples

## Available Tools
- **researchTool**: Use this to gather comprehensive information on any topic

## Semantic Memory & Context
- **Use Semantic Recall**: Remember similar research topics from past work
- **Learning Patterns**: Apply successful research strategies from previous projects
- **Context Awareness**: Consider user's preferred research depth and focus areas`,
  
  // The AI model to use (OpenAI)
  model: openai('gpt-4o-mini'),
  
  // Tools this agent can call
  tools: {
    researchTool,
  },
  
  // Evaluation metrics
  evals: {
    completeness: researchEvals.completeness,
    relevance: researchEvals.relevance,
  },
});

