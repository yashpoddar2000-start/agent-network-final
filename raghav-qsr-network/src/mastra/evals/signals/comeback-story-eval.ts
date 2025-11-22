import { Metric, type MetricResult } from '@mastra/core';
import { OpenAI } from 'openai';
import {
  getPostsBySignal,
  getFlopPostsForComparison,
  formatPostForPrompt,
} from '../utils/training-data';

/**
 * Comeback Story Eval
 * 
 * Checks if post has crisis → solution → triumph narrative
 * Examples: DoorDash losses → profitability, Chipotle E. coli → industry leader
 */
export class ComebackStoryMetric extends Metric {
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
    console.log('📊 [Comeback Story] Evaluating turnaround narrative...');

    const qualityExamples = getPostsBySignal('comeback_story');
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

      console.log(`✅ [Comeback Story] Score: ${score.toFixed(2)}`);

      return {
        score,
        info: {
          reason,
          recommendations,
          examplesUsed: qualityExamples.length,
        },
      };
    } catch (error) {
      console.error('❌ [Comeback Story] Error:', error);
      return {
        score: 0,
        info: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private buildPrompt(qualityExamples: any[], flopExamples: any[], postToEval: string): string {
    let prompt = `You are evaluating if a LinkedIn post has a COMEBACK STORY narrative.

WHAT IS A COMEBACK STORY?
- Company/brand in crisis or major distress
- Shows SPECIFIC solution/pivot taken
- Quantified turnaround results
- Arc: Crisis → Solution → Triumph (with numbers)

POSITIVE EXAMPLES (Posts with comeback narratives):
───────────────────────────────────────────────

`;

    qualityExamples.slice(0, 5).forEach((post, idx) => {
      prompt += `EXAMPLE ${idx + 1}:\n`;
      prompt += formatPostForPrompt(post);
      prompt += '\n---\n\n';
    });

    prompt += `NEGATIVE EXAMPLES (No turnaround story):
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
1. Does it show clear crisis/distress state?
2. Explains SPECIFIC solution/pivot taken?
3. Shows quantified recovery results?
4. Has complete arc (crisis → solution → triumph)?

SCORING GUIDE:
- 1.0: Perfect comeback arc with crisis, solution, and numbers
- 0.8-0.9: Good comeback but missing some quantification
- 0.5-0.7: Has turnaround but arc is incomplete
- 0.3-0.4: Mentions challenge but no clear recovery
- 0.0-0.2: No comeback story at all

Return JSON:
{
  "score": 0.0-1.0,
  "reason": "Brief explanation of score",
  "recommendations": ["Specific fix 1", "Specific fix 2"]
}`;

    return prompt;
  }
}

export const comebackStoryEval = new ComebackStoryMetric();

