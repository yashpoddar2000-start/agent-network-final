import { Metric, type MetricResult } from '@mastra/core';
import { OpenAI } from 'openai';
import {
  getQualityPosts,
  getFlopPosts,
} from '../utils/training-data';

/**
 * Broad Appeal Eval
 * 
 * Penalizes posts that are too narrow (restaurant-only tactics, sales pitches)
 * Returns score where 1.0 = universal appeal, lower = too narrow
 */
export class BroadAppealMetric extends Metric {
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
    console.log('📊 [Broad Appeal] Checking for universal applicability...');

    const qualityPosts = getQualityPosts();
    const flopPosts = getFlopPosts();
    
    // Filter for narrow/sales pitch examples
    const narrowExamples = flopPosts.filter(p => 
      p.analysis?.whatWorkedOrDidntWork?.toLowerCase().includes('narrow') ||
      p.analysis?.whatWorkedOrDidntWork?.toLowerCase().includes('sales') ||
      p.analysis?.whatWorkedOrDidntWork?.toLowerCase().includes('promotional')
    ).slice(0, 5);

    const broadExamples = qualityPosts.slice(0, 5);

    const prompt = this.buildPrompt(broadExamples, narrowExamples, output);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at evaluating viral LinkedIn posts for QSR/restaurant content. You judge if posts have universal business appeal.',
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
      const hasBroadAppeal = result.hasBroadAppeal || false;
      const reason = result.reason || 'No explanation provided';
      const recommendations = result.recommendations || [];

      // Return score (1.0 = universal, 0.75 = somewhat narrow, 0.5 = very narrow)
      const score = hasBroadAppeal ? 1.0 : 0.75;

      console.log(`✅ [Broad Appeal] Score: ${score.toFixed(2)} ${!hasBroadAppeal ? '(PENALTY)' : '(PASS)'}`);

      return {
        score,
        info: {
          hasBroadAppeal,
          reason,
          recommendations,
          penalty: hasBroadAppeal ? 0 : 0.25,
        },
      };
    } catch (error) {
      console.error('❌ [Broad Appeal] Error:', error);
      return {
        score: 1.0, // No penalty on error
        info: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private buildPrompt(broadExamples: any[], narrowExamples: any[], postToEval: string): string {
    let prompt = `You are detecting if a LinkedIn post has BROAD APPEAL vs NARROW AUDIENCE.

WHAT IS BROAD APPEAL?
- Universal business principles anyone can learn from
- Restaurant example but teaches general strategy
- No sales pitch or promotional content
- Valuable even if you're not in the exact industry

BROAD APPEAL EXAMPLES:
───────────────────────────────────────────────

`;

    broadExamples.forEach((post, idx) => {
      prompt += `BROAD EXAMPLE ${idx + 1}:\n`;
      prompt += post.text.substring(0, 400) + '...\n';
      if (post.analysis?.whyShareableOrNot) {
        prompt += `Why it works: ${post.analysis.whyShareableOrNot.substring(0, 200)}\n\n`;
      }
    });

    prompt += `NARROW APPEAL EXAMPLES (Too specific or sales-y):
───────────────────────────────────────────────

`;

    narrowExamples.forEach((post, idx) => {
      prompt += `NARROW EXAMPLE ${idx + 1}:\n`;
      prompt += post.text.substring(0, 400) + '...\n';
      if (post.analysis?.whatWorkedOrDidntWork) {
        prompt += `Why it's too narrow: ${post.analysis.whatWorkedOrDidntWork.substring(0, 200)}\n\n`;
      }
    });

    prompt += `NEW POST TO EVALUATE:
═══════════════════════════════════════════════
${postToEval}
═══════════════════════════════════════════════

EVALUATION CRITERIA:
- Teaches universal business principle? (broad)
- Only useful to restaurant owners? (narrow)
- Ends with sales pitch or promotion? (narrow)
- Tactical without strategic insight? (narrow)

Return JSON:
{
  "hasBroadAppeal": true/false,
  "reason": "Brief explanation",
  "recommendations": ["How to add universal principle"]
}`;

    return prompt;
  }
}

export const broadAppealEval = new BroadAppealMetric();

