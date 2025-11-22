import { Metric, type MetricResult } from '@mastra/core';
import { OpenAI } from 'openai';
import {
  getQualityPosts,
  getFlopPosts,
  formatPostForPrompt,
} from '../utils/training-data';

/**
 * Anti-Cringy Hook Eval
 * 
 * Penalizes desperate, manufactured hooks like "Did you know?" "Surprisingly..."
 * Returns PENALTY score (0 = no issue, negative = has problem)
 */
export class AntiCringyHookMetric extends Metric {
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
    console.log('📊 [Anti-Cringy Hook] Checking for desperate hooks...');

    // Get examples of GOOD hooks (quality posts) and BAD hooks (flop posts with forced hooks)
    const qualityPosts = getQualityPosts();
    const flopPosts = getFlopPosts();
    
    // Filter flop posts that have cringy hooks
    const cringyExamples = flopPosts.filter(p => 
      p.analysis?.whatWorkedOrDidntWork?.toLowerCase().includes('hook') ||
      p.text.toLowerCase().includes('did you know') ||
      p.text.toLowerCase().includes('surprisingly')
    ).slice(0, 5);

    const goodHookExamples = qualityPosts.slice(0, 5);

    const prompt = this.buildPrompt(goodHookExamples, cringyExamples, output);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at evaluating viral LinkedIn posts for QSR/restaurant content. You identify desperate, amateur hooks.',
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
      const hasCringyHook = result.hasCringyHook || false;
      const reason = result.reason || 'No explanation provided';
      const recommendations = result.recommendations || [];

      // Return penalty score (1.0 = good, lower = has cringy hook)
      const score = hasCringyHook ? 0.7 : 1.0; // 30% penalty if cringy

      console.log(`✅ [Anti-Cringy Hook] Score: ${score.toFixed(2)} ${hasCringyHook ? '(PENALTY)' : '(PASS)'}`);

      return {
        score,
        info: {
          hasCringyHook,
          reason,
          recommendations,
          penalty: hasCringyHook ? 0.3 : 0,
        },
      };
    } catch (error) {
      console.error('❌ [Anti-Cringy Hook] Error:', error);
      return {
        score: 1.0, // No penalty on error
        info: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private buildPrompt(goodExamples: any[], cringyExamples: any[], postToEval: string): string {
    let prompt = `You are detecting CRINGY/DESPERATE HOOKS in LinkedIn posts.

WHAT IS A CRINGY HOOK?
- Manufactured suspense: "Did you know?", "Surprisingly...", "Not what you think"
- Amateur tone that sounds like trying too hard
- Clickbait without substance
- Asks obvious questions instead of leading with data

GOOD HOOKS (Confident, data-driven):
───────────────────────────────────────────────

`;

    goodExamples.forEach((post, idx) => {
      const hookLines = post.text.split('\n').slice(0, 2).join('\n');
      prompt += `GOOD EXAMPLE ${idx + 1}:\n"${hookLines}"\n\n`;
    });

    prompt += `BAD HOOKS (Desperate, cringy):
───────────────────────────────────────────────

`;

    cringyExamples.forEach((post, idx) => {
      const hookLines = post.text.split('\n').slice(0, 2).join('\n');
      prompt += `BAD EXAMPLE ${idx + 1}:\n"${hookLines}"\n`;
      if (post.analysis?.whatWorkedOrDidntWork) {
        prompt += `Why it's bad: ${post.analysis.whatWorkedOrDidntWork.substring(0, 200)}\n\n`;
      }
    });

    const hookToEval = postToEval.split('\n').slice(0, 3).join('\n');

    prompt += `NEW HOOK TO EVALUATE:
═══════════════════════════════════════════════
${hookToEval}
═══════════════════════════════════════════════

DETECTION CRITERIA:
- Does it use "Did you know?", "Surprisingly...", "Not what you think"?
- Asks obvious questions instead of stating facts?
- Manufactured suspense or curiosity gaps?
- Amateur tone vs confident expert tone?

Return JSON:
{
  "hasCringyHook": true/false,
  "reason": "Brief explanation",
  "recommendations": ["How to fix it"]
}`;

    return prompt;
  }
}

export const antiCringyHookEval = new AntiCringyHookMetric();

