import { Metric, type MetricResult } from '@mastra/core';
import { OpenAI } from 'openai';
import {
  getPostsBySignal,
  getFlopPostsForComparison,
  formatPostForPrompt,
} from '../utils/training-data';

/**
 * Shocking Number Contrast Eval
 * 
 * Checks if post has shocking numbers that stop scrolling:
 * - TYPE A: ABSURD contrasts ("$8.5M vs $500K", "23% vs 4.5%")
 * - TYPE B: Single shocking numbers ("$1.5B revenue", "23,000 stores")
 */
export class ShockingNumberContrastMetric extends Metric {
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
    console.log('📊 [Shocking Number Contrast] Evaluating number contrast...');

    // Load training examples
    const qualityExamples = getPostsBySignal('shocking_number_contrast');
    const flopExamples = getFlopPostsForComparison(3);

    // Build few-shot prompt
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

      console.log(`✅ [Shocking Number Contrast] Score: ${score.toFixed(2)}`);
      console.log(`   Reason: ${reason}`);

      return {
        score,
        info: {
          reason,
          recommendations,
          examplesUsed: qualityExamples.length,
        },
      };
    } catch (error) {
      console.error('❌ [Shocking Number Contrast] Error:', error);
      return {
        score: 0,
        info: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private buildPrompt(qualityExamples: any[], flopExamples: any[], postToEval: string): string {
    let prompt = `You are evaluating if a LinkedIn post has SHOCKING NUMBERS - the kind that make people stop scrolling.

WHAT ARE SHOCKING NUMBERS?
Two types that work:

TYPE A: HEAD-TO-HEAD CONTRAST
- $8.5M vs $500K (17x gap)
- 23% margin vs 4.5% margin
- Revenue/performance gaps that seem impossible
- Must be ABSURD gap (5x-20x+, not 2x)

TYPE B: SINGLE SHOCKING NUMBER
- $1.5 BILLION in revenue (unexpectedly massive)
- 23,000 store locations (stops you in your tracks)
- One number so big/unexpected it triggers "wait, WHAT?"
- Not just "a big number" - must be SURPRISING in context

Both must be:
- SPECIFIC numbers (not "a lot" or "way more")
- In the HOOK (first 2-3 lines ideally)
- Reveal hidden business dynamics or unexpected scale

POSITIVE EXAMPLES (Posts with shocking numbers):
───────────────────────────────────────────────

`;

    // Add quality examples (limit to 5 for token efficiency)
    qualityExamples.slice(0, 5).forEach((post, idx) => {
      prompt += `EXAMPLE ${idx + 1}:\n`;
      prompt += formatPostForPrompt(post);
      prompt += '\n---\n\n';
    });

    prompt += `NEGATIVE EXAMPLES (Posts WITHOUT shocking numbers):
───────────────────────────────────────────────

`;

    // Add flop examples
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
1. Does it have SPECIFIC shocking number(s)? (contrast OR single massive number)
2. TYPE A: Is the gap ABSURD? (5x-20x+) OR TYPE B: Is single number surprisingly massive?
3. Are numbers in the HOOK (first 2-3 lines)?
4. Do numbers reveal hidden business dynamics or unexpected scale?

SCORING GUIDE:
- 1.0: Perfect shocking numbers (contrast like $8.5M vs $500K OR single like $1.5B)
- 0.8-0.9: Good shocking numbers but could be more dramatic
- 0.5-0.7: Has numbers but not shocking enough (small gap or unsurprising number)
- 0.3-0.4: Conceptual only, missing specific numbers
- 0.0-0.2: No shocking numbers at all

Return JSON:
{
  "score": 0.0-1.0,
  "reason": "Brief explanation of score (specify TYPE A or TYPE B if present)",
  "recommendations": ["Specific fix 1", "Specific fix 2"]
}`;

    return prompt;
  }
}

// Export metric instance
export const shockingNumberContrastEval = new ShockingNumberContrastMetric();

