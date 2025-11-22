import { Metric, type MetricResult } from '@mastra/core';
import { OpenAI } from 'openai';
import {
  getPostsBySignal,
  getFlopPostsForComparison,
  formatPostForPrompt,
} from '../utils/training-data';

/**
 * David vs Goliath Eval
 * 
 * Checks if post shows underdog beating giant
 * Examples: Dutch Bros (1,043 stores) crushing Starbucks (17,186 stores)
 */
export class DavidVsGoliathMetric extends Metric {
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
    console.log('📊 [David vs Goliath] Evaluating underdog narrative...');

    const qualityExamples = getPostsBySignal('david_vs_goliath');
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

      console.log(`✅ [David vs Goliath] Score: ${score.toFixed(2)}`);

      return {
        score,
        info: {
          reason,
          recommendations,
          examplesUsed: qualityExamples.length,
        },
      };
    } catch (error) {
      console.error('❌ [David vs Goliath] Error:', error);
      return {
        score: 0,
        info: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private buildPrompt(qualityExamples: any[], flopExamples: any[], postToEval: string): string {
    let prompt = `You are evaluating if a LinkedIn post has a DAVID VS GOLIATH narrative.

WHAT IS DAVID VS GOLIATH?
- Smaller player outperforming much larger competitor
- Massive scale disparity (10x-100x size difference)
- Shows HOW underdog wins despite size disadvantage
- Execution or strategy advantage that beats scale

POSITIVE EXAMPLES (Underdog beating giant):
───────────────────────────────────────────────

`;

    qualityExamples.slice(0, 5).forEach((post, idx) => {
      prompt += `EXAMPLE ${idx + 1}:\n`;
      prompt += formatPostForPrompt(post);
      prompt += '\n---\n\n';
    });

    prompt += `NEGATIVE EXAMPLES (No underdog story):
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
1. Does it compare small player vs giant?
2. Is scale disparity MASSIVE (not just 2x, more like 10x+)?
3. Shows underdog outperforming on key metrics?
4. Explains HOW/WHY smaller player wins?

SCORING GUIDE:
- 1.0: Perfect David vs Goliath (massive scale gap + clear win)
- 0.8-0.9: Good underdog story but gap could be more dramatic
- 0.5-0.7: Small vs large but not truly underdog winning
- 0.3-0.4: Mentions size but no real competitive advantage
- 0.0-0.2: No underdog narrative at all

Return JSON:
{
  "score": 0.0-1.0,
  "reason": "Brief explanation of score",
  "recommendations": ["Specific fix 1", "Specific fix 2"]
}`;

    return prompt;
  }
}

export const davidVsGoliathEval = new DavidVsGoliathMetric();

