import { Metric, type MetricResult } from '@mastra/core';
import { OpenAI } from 'openai';
import {
  getPostsBySignal,
  getFlopPostsForComparison,
  formatPostForPrompt,
} from '../utils/training-data';

/**
 * Detailed Breakdown Eval - REDESIGNED
 * 
 * Checks if post has detailed breakdown showing HOW/WHY business works
 * 
 * Type A - Mathematical: $27.4M → $75K/day → 475 parties needed
 * Type B - Strategic: "Why growth peaked → saturation → cannibalization → optimization"
 * 
 * Both types count! Post needs forensic depth explaining mechanics.
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

WHAT IS DETAILED BREAKDOWN? (TWO TYPES - BOTH COUNT!)

TYPE A - MATHEMATICAL BREAKDOWN:
- Step-by-step calculations: $X → $Y/day → Z customers
- Works backwards from big number to daily/per-unit reality
- Shows multiple layers of forensic math
- Example: "$27.4M revenue → $75K/day → 475 parties needed → 1,660 covers"

TYPE B - STRATEGIC/MECHANISM BREAKDOWN:
- Deep explanation of WHY/HOW system works conceptually
- Shows underlying mechanics and dynamics
- Teaches frameworks (e.g., "social contract," "saturation mechanics")
- Example: "Why growth peaked: 75% within 3 miles → cannibalization → shift to optimization"

IMPORTANT: Posts with EITHER type should score 0.80+!

POSITIVE EXAMPLES (Posts with detailed breakdown):
───────────────────────────────────────────────

`;

    qualityExamples.slice(0, 6).forEach((post, idx) => {
      prompt += `EXAMPLE ${idx + 1}:\n`;
      prompt += formatPostForPrompt(post);
      prompt += '\n---\n\n';
    });

    prompt += `NEGATIVE EXAMPLES (Surface-level, no breakdown):
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

EVALUATION CRITERIA (Score 0.80+ if ANY of these):

MATHEMATICAL BREAKDOWN:
□ Shows step-by-step calculations ($X → $Y → Z)?
□ Works backwards from big number to daily reality?
□ Multiple layers of forensic math?

STRATEGIC BREAKDOWN:
□ Explains WHY the system works this way?
□ Shows underlying mechanics/dynamics?
□ Teaches framework or principle?
□ Deep analysis of HOW outcome happened?

SCORING GUIDE:
- 1.0: Perfect breakdown (mathematical OR strategic, teaches HOW/WHY)
- 0.8-0.9: Strong breakdown, reader understands the mechanics
- 0.5-0.7: Some explanation but missing depth/mechanism
- 0.3-0.4: Surface-level data, doesn't explain HOW/WHY
- 0.0-0.2: Just states facts, no breakdown

CRITICAL: If post explains WHY something happened with specific mechanics/dynamics (like saturation, psychology, economics), score 0.80+!

Return JSON:
{
  "score": 0.0-1.0,
  "reason": "Brief explanation - which type of breakdown (mathematical/strategic) and why this score",
  "recommendations": ["Specific fix 1", "Specific fix 2"]
}`;

    return prompt;
  }
}

export const detailedBreakdownEval = new DetailedBreakdownMetric();

