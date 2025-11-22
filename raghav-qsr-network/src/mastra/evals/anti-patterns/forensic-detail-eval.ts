import { Metric, type MetricResult } from '@mastra/core';
import { OpenAI } from 'openai';
import {
  getQualityPosts,
  getFlopPosts,
} from '../utils/training-data';

/**
 * Forensic Detail Eval (Anti-Pattern)
 * 
 * Penalizes posts that lack depth - show WHAT without HOW/WHY
 * Returns score where 1.0 = has forensic detail, lower = surface-level
 */
export class ForensicDetailMetric extends Metric {
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
    console.log('📊 [Forensic Detail] Checking for depth...');

    const qualityPosts = getQualityPosts();
    const flopPosts = getFlopPosts();
    
    // Filter for surface-level examples
    const surfaceExamples = flopPosts.filter(p => 
      p.analysis?.whatWorkedOrDidntWork?.toLowerCase().includes('surface') ||
      p.analysis?.whatWorkedOrDidntWork?.toLowerCase().includes('detail') ||
      p.analysis?.whatWorkedOrDidntWork?.toLowerCase().includes('depth')
    ).slice(0, 5);

    const deepExamples = qualityPosts.filter(p =>
      p.leverageSignals?.some(s => s.signal === 'detailed_breakdown')
    ).slice(0, 5);

    const prompt = this.buildPrompt(deepExamples, surfaceExamples, output);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at evaluating viral LinkedIn posts for QSR/restaurant content. You judge if posts have forensic-level detail.',
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
      const hasForensicDetail = result.hasForensicDetail || false;
      const reason = result.reason || 'No explanation provided';
      const recommendations = result.recommendations || [];

      // Return score (1.0 = deep, 0.8 = somewhat shallow, 0.6 = very shallow)
      const score = hasForensicDetail ? 1.0 : 0.8;

      console.log(`✅ [Forensic Detail] Score: ${score.toFixed(2)} ${!hasForensicDetail ? '(PENALTY)' : '(PASS)'}`);

      return {
        score,
        info: {
          hasForensicDetail,
          reason,
          recommendations,
          penalty: hasForensicDetail ? 0 : 0.2,
        },
      };
    } catch (error) {
      console.error('❌ [Forensic Detail] Error:', error);
      return {
        score: 1.0, // No penalty on error
        info: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private buildPrompt(deepExamples: any[], surfaceExamples: any[], postToEval: string): string {
    let prompt = `You are detecting if a LinkedIn post has FORENSIC DETAIL vs SURFACE-LEVEL content.

WHAT IS FORENSIC DETAIL?
- Shows step-by-step HOW/WHY business works
- Deep math: $X → $Y/day → Z customers needed
- Multiple layers of breakdown
- Reader understands the mechanics, not just results

FORENSIC DETAIL EXAMPLES:
───────────────────────────────────────────────

`;

    deepExamples.forEach((post, idx) => {
      prompt += `DEEP EXAMPLE ${idx + 1}:\n`;
      prompt += post.text.substring(0, 500) + '...\n';
      if (post.analysis?.whatWorkedOrDidntWork) {
        prompt += `Why it's deep: ${post.analysis.whatWorkedOrDidntWork.substring(0, 200)}\n\n`;
      }
    });

    prompt += `SURFACE-LEVEL EXAMPLES (Missing HOW/WHY):
───────────────────────────────────────────────

`;

    surfaceExamples.forEach((post, idx) => {
      prompt += `SURFACE EXAMPLE ${idx + 1}:\n`;
      prompt += post.text.substring(0, 400) + '...\n';
      if (post.analysis?.whatWorkedOrDidntWork) {
        prompt += `Why it's shallow: ${post.analysis.whatWorkedOrDidntWork.substring(0, 200)}\n\n`;
      }
    });

    prompt += `NEW POST TO EVALUATE:
═══════════════════════════════════════════════
${postToEval}
═══════════════════════════════════════════════

EVALUATION CRITERIA:
- Shows WHAT happened only? (surface)
- Shows HOW/WHY with step-by-step? (forensic)
- Has multi-layer math breakdown? (forensic)
- Just reports news without mechanics? (surface)

Return JSON:
{
  "hasForensicDetail": true/false,
  "reason": "Brief explanation",
  "recommendations": ["How to add depth"]
}`;

    return prompt;
  }
}

export const forensicDetailEval = new ForensicDetailMetric();

