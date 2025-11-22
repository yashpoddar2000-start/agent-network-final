import { Metric, type MetricResult } from '@mastra/core';
import { MastraAgentJudge } from '@mastra/evals/judge';
import { type LanguageModel } from '@mastra/core/llm';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

/**
 * Writing Quality Scorer
 * 
 * Advanced LLM-based judge for comprehensive writing evaluation
 * Based on: template's character-visual-consistency-scorer.ts pattern
 */

const INSTRUCTIONS = `You are an expert writing quality judge. You evaluate blog posts for professional quality, engagement, and effectiveness.`;

class WritingQualityJudge extends MastraAgentJudge {
  constructor(model: LanguageModel) {
    super('WritingQualityJudge', INSTRUCTIONS, model);
    console.log('🤖 [WritingQualityJudge] Initialized');
  }
  
  async evaluate(input: string, output: string): Promise<MetricResult> {
    console.log('🔍 [WritingQualityJudge] Starting comprehensive evaluation...');
    
    const prompt = `Evaluate this blog post comprehensively.

Topic: ${input}

Blog Post:
${output}

Provide detailed analysis across these dimensions:

1. ENGAGEMENT (0-10):
   - Hook quality
   - Reader retention
   - Call-to-action effectiveness

2. PROFESSIONALISM (0-10):
   - Tone appropriateness
   - Grammar and spelling
   - Overall polish

3. VALUE (0-10):
   - Actionable insights
   - Depth of information
   - Usefulness to reader

4. STRUCTURE (0-10):
   - Logical flow
   - Section organization
   - Transitions

5. STYLE (0-10):
   - Voice consistency
   - Readability
   - Writing quality

Provide overall score (0.0-1.0) and detailed feedback.`;
    
    const result = await this.agent.generate(prompt, {
      output: z.object({
        score: z.number().min(0).max(1),
        info: z.object({
          engagement: z.number().min(0).max(10),
          professionalism: z.number().min(0).max(10),
          value: z.number().min(0).max(10),
          structure: z.number().min(0).max(10),
          style: z.number().min(0).max(10),
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string()),
          recommendations: z.array(z.string()),
          overallFeedback: z.string(),
        }),
      }),
    });
    
    console.log(`✅ [WritingQualityJudge] Score: ${result.object.score.toFixed(2)}`);
    
    return result.object;
  }
}

export class WritingQualityScorerMetric extends Metric {
  judge: WritingQualityJudge;
  
  constructor(model: LanguageModel) {
    super();
    this.judge = new WritingQualityJudge(model);
  }
  
  async measure(input: string, output: string): Promise<MetricResult> {
    return await this.judge.evaluate(input, output);
  }
}

// Export default instance using GPT-4o-mini
export const writingQualityScorer = new WritingQualityScorerMetric(openai('gpt-4o-mini'));

