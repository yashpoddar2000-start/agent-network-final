import { Metric, type MetricResult } from '@mastra/core';
import { OpenAI } from 'openai';
import {
  getPostsBySignal,
  getFlopPostsForComparison,
  formatPostForPrompt,
} from '../utils/training-data';

/**
 * Side-by-Side Comparison Eval
 * 
 * Checks if post has head-to-head competitor comparison
 * Examples: DoorDash vs Uber Eats, Taco Bell vs Pizza Hut, 3 bowl chains
 */
export class SideBySideComparisonMetric extends Metric {
  private openai: OpenAI;

  constructor() {
    super();
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('📊 [Side-by-Side Comparison] Evaluating comparison structure...');

    const qualityExamples = getPostsBySignal('side_by_side_comparison');
    const flopExamples = getFlopPostsForComparison(3);

    const prompt = this.buildPrompt(qualityExamples, flopExamples, output);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at evaluating viral LinkedIn posts for QSR/restaurant content. You judge posts based on proven patterns from high-performing content.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      const score = result.score || 0;
      const reason = result.reason || 'No explanation provided';
      const recommendations = result.recommendations || [];

      console.log(`✅ [Side-by-Side Comparison] Score: ${score.toFixed(2)}`);

      return {
        score,
        info: {
          reason,
          recommendations,
          examplesUsed: qualityExamples.length,
        },
      };
    } catch (error) {
      console.error('❌ [Side-by-Side Comparison] Error:', error);
      return {
        score: 0,
        info: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private buildPrompt(qualityExamples: any[], flopExamples: any[], postToEval: string): string {
    let prompt = `You are evaluating if a LinkedIn post uses SIDE-BY-SIDE COMPARISON effectively.

WHAT IS SIDE-BY-SIDE COMPARISON?
- Head-to-head setup: Company A vs Company B (or 2+ companies)
- Same market pressures, different results
- Clear winner/loser narrative
- Shows HOW execution differences create different outcomes

POSITIVE EXAMPLES (Posts with strong comparisons):
───────────────────────────────────────────────

`;

    qualityExamples.slice(0, 5).forEach((post, idx) => {
      prompt += `EXAMPLE ${idx + 1}:\n`;
      prompt += formatPostForPrompt(post);
      prompt += '\n---\n\n';
    });

    prompt += `NEGATIVE EXAMPLES (Posts WITHOUT comparisons):
───────────────────────────────────────────────

`;

    flopExamples.forEach((post, idx) => {
      prompt += `FLOP ${idx + 1}:\n`;
      prompt += `POST ${post.id}: ${post.text.substring(0, 300)}...\n`;
      if (post.analysis?.whatWorkedOrDidntWork) {
        prompt += `WHY IT FAILED: ${post.analysis.whatWorkedOrDidntWork}\n`;
      }
      prompt += '\n---\n\n';
    });

    prompt += `NEW POST TO EVALUATE:
═══════════════════════════════════════════════
${postToEval}
═══════════════════════════════════════════════

EVALUATION CRITERIA:
1. Does it compare 2+ companies/brands head-to-head?
2. Are they in the same market/category?
3. Does it show DIFFERENT outcomes from different execution?
4. Is there a clear winner/loser or ranking?

SCORING GUIDE:
- 1.0: Perfect comparison (DoorDash vs Uber level clarity)
- 0.8-0.9: Good comparison but could be sharper
- 0.5-0.7: Mentions competitors but not true head-to-head
- 0.3-0.4: Single company focus, no real comparison
- 0.0-0.2: No comparison at all

Return JSON:
{
  "score": 0.0-1.0,
  "reason": "Brief explanation of score",
  "recommendations": ["Specific fix 1", "Specific fix 2"]
}`;

    return prompt;
  }
}

export const sideBySideComparisonEval = new SideBySideComparisonMetric();

