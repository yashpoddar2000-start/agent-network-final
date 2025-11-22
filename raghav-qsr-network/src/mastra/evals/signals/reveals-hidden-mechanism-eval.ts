import { Metric, type MetricResult } from '@mastra/core';
import { OpenAI } from 'openai';
import {
  getPostsBySignal,
  getFlopPostsForComparison,
  formatPostForPrompt,
} from '../utils/training-data';

/**
 * Reveals Hidden Mechanism Eval
 * 
 * Checks if post exposes insider information or hidden business mechanics
 * Examples: SEC filings, exclusivity deals, franchise economics
 */
export class RevealsHiddenMechanismMetric extends Metric {
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
    console.log('📊 [Reveals Hidden Mechanism] Evaluating insider insights...');

    const qualityExamples = getPostsBySignal('reveals_hidden_mechanism');
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

      console.log(`✅ [Reveals Hidden Mechanism] Score: ${score.toFixed(2)}`);

      return {
        score,
        info: {
          reason,
          recommendations,
          examplesUsed: qualityExamples.length,
        },
      };
    } catch (error) {
      console.error('❌ [Reveals Hidden Mechanism] Error:', error);
      return {
        score: 0,
        info: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private buildPrompt(qualityExamples: any[], flopExamples: any[], postToEval: string): string {
    let prompt = `You are evaluating if a LinkedIn post REVEALS HIDDEN MECHANISMS.

WHAT IS REVEALING HIDDEN MECHANISMS?
- Exposes insider information not widely known
- SEC filings, legal documents, franchise agreements
- Behind-the-scenes business mechanics
- "How the sausage is made" - things outsiders don't see

POSITIVE EXAMPLES (Posts revealing hidden mechanics):
───────────────────────────────────────────────

`;

    qualityExamples.slice(0, 5).forEach((post, idx) => {
      prompt += `EXAMPLE ${idx + 1}:\n`;
      prompt += formatPostForPrompt(post);
      prompt += '\n---\n\n';
    });

    prompt += `NEGATIVE EXAMPLES (Surface-level public info):
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
1. Does it reveal non-obvious insider information?
2. References SEC filings, legal docs, or internal mechanics?
3. Shows something competitors/outsiders wouldn't easily know?
4. Gives reader "aha!" moment about how business really works?

SCORING GUIDE:
- 1.0: Perfect insider reveal (SEC filings, exclusivity contracts)
- 0.8-0.9: Good insider info but could be deeper
- 0.5-0.7: Some non-obvious details
- 0.3-0.4: Mostly public information
- 0.0-0.2: No hidden mechanisms revealed

Return JSON:
{
  "score": 0.0-1.0,
  "reason": "Brief explanation of score",
  "recommendations": ["Specific fix 1", "Specific fix 2"]
}`;

    return prompt;
  }
}

export const revealsHiddenMechanismEval = new RevealsHiddenMechanismMetric();

