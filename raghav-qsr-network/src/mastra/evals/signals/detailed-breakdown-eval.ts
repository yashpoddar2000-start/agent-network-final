import { Metric, type MetricResult } from '@mastra/core';
import { OpenAI } from 'openai';
import {
  getPostsBySignal,
  getFlopPostsForComparison,
  formatPostForPrompt,
} from '../utils/training-data';

/**
 * Detailed Breakdown Eval
 * 
 * Checks if post has forensic math showing HOW business works
 * Examples: $27.4M → $75K/day → 475 parties, rent forensics 23% vs 4.5%
 */
export class DetailedBreakdownMetric extends Metric {
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
    console.log('📊 [Detailed Breakdown] Evaluating forensic detail...');

    const qualityExamples = getPostsBySignal('detailed_breakdown');
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

      console.log(`✅ [Detailed Breakdown] Score: ${score.toFixed(2)}`);

      return {
        score,
        info: {
          reason,
          recommendations,
          examplesUsed: qualityExamples.length,
        },
      };
    } catch (error) {
      console.error('❌ [Detailed Breakdown] Error:', error);
      return {
        score: 0,
        info: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private buildPrompt(qualityExamples: any[], flopExamples: any[], postToEval: string): string {
    let prompt = `You are evaluating if a LinkedIn post has DETAILED FORENSIC BREAKDOWN.

WHAT IS DETAILED BREAKDOWN?
- Step-by-step math showing HOW business actually works
- Works backwards from big number to daily/per-unit reality
- Shows multiple layers: $X → $Y/day → Z units needed
- Makes abstract numbers concrete and understandable

POSITIVE EXAMPLES (Posts with forensic breakdown):
───────────────────────────────────────────────

`;

    qualityExamples.slice(0, 5).forEach((post, idx) => {
      prompt += `EXAMPLE ${idx + 1}:\n`;
      prompt += formatPostForPrompt(post);
      prompt += '\n---\n\n';
    });

    prompt += `NEGATIVE EXAMPLES (Surface-level, no deep math):
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
1. Does it show step-by-step calculation?
2. Works backwards from big number to daily reality?
3. Multiple layers of math? ($X → $Y/day → Z customers)
4. Makes reader understand HOW business actually operates?

SCORING GUIDE:
- 1.0: Perfect forensic breakdown (shows multiple calculation layers)
- 0.8-0.9: Good breakdown but could go deeper
- 0.5-0.7: Has some math but missing step-by-step
- 0.3-0.4: Surface-level numbers only
- 0.0-0.2: No breakdown, just states results

Return JSON:
{
  "score": 0.0-1.0,
  "reason": "Brief explanation of score",
  "recommendations": ["Specific fix 1", "Specific fix 2"]
}`;

    return prompt;
  }
}

export const detailedBreakdownEval = new DetailedBreakdownMetric();

