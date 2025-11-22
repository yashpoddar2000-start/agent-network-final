import { Metric, type MetricResult } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

/**
 * Writing Quality Metric (LLM-based)
 * 
 * Uses GPT-4o-mini to evaluate writing quality holistically
 * Based on: template's LLM-based evaluation pattern
 */

export class WritingQualityMetric extends Metric {
  private judgeAgent: Agent;
  
  constructor() {
    super();
    // Create a simple judge agent
    this.judgeAgent = new Agent({
      name: 'writing-judge',
      instructions: 'You are an expert writing quality evaluator.',
      model: openai('gpt-4o-mini'),
    });
  }
  
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('📊 [Writing Quality] Using LLM to evaluate...');
    
    try {
      const result = await this.judgeAgent.generate(
        `Evaluate this blog post for writing quality.

Topic: ${input}

Blog Post:
${output}

Analyze:
1. Engagement: Does it grab and hold attention?
2. Clarity: Is it easy to understand?
3. Style: Is it professional and polished?
4. Value: Does it provide actionable insights?
5. Flow: Does it transition well between sections?

Provide scores and feedback.`,
        {
          output: z.object({
            score: z.number().min(0).max(1),
            engagement: z.number().min(0).max(10),
            clarity: z.number().min(0).max(10),
            style: z.number().min(0).max(10),
            value: z.number().min(0).max(10),
            flow: z.number().min(0).max(10),
            reasoning: z.string(),
            strengths: z.array(z.string()),
            improvements: z.array(z.string()),
          }),
        }
      );
      
      console.log(`✅ [Writing Quality] LLM Score: ${result.object.score.toFixed(2)}`);
      
      return {
        score: result.object.score,
        info: {
          engagement: result.object.engagement,
          clarity: result.object.clarity,
          style: result.object.style,
          value: result.object.value,
          flow: result.object.flow,
          reasoning: result.object.reasoning,
          strengths: result.object.strengths,
          improvements: result.object.improvements,
        },
      };
      
    } catch (error) {
      console.error('❌ [Writing Quality] LLM evaluation failed');
      return {
        score: 0.5,
        info: { error: 'LLM evaluation failed, defaulting to 0.5' },
      };
    }
  }
}

// Export metric instance
export const writingEvals = {
  quality: new WritingQualityMetric(),
};

