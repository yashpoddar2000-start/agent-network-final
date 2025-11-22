import { Metric, type MetricResult } from '@mastra/core';

// Import all signal evals
import { shockingNumberContrastEval } from './signals/shocking-number-contrast-eval';
import { sideBySideComparisonEval } from './signals/side-by-side-comparison-eval';
import { contrarianWithProofEval } from './signals/contrarian-with-proof-eval';
import { detailedBreakdownEval } from './signals/detailed-breakdown-eval';
import { revealsHiddenMechanismEval } from './signals/reveals-hidden-mechanism-eval';
import { comebackStoryEval } from './signals/comeback-story-eval';
import { davidVsGoliathEval } from './signals/david-vs-goliath-eval';

// Import all anti-pattern evals
import { antiCringyHookEval } from './anti-patterns/anti-cringy-hook-eval';
import { broadAppealEval } from './anti-patterns/broad-appeal-eval';
import { forensicDetailEval } from './anti-patterns/forensic-detail-eval';

/**
 * Master Viral Quality Eval
 * 
 * Combines all signal and anti-pattern evals into final score
 * Score 0.85+ = viral-worthy, ready to publish
 */
export class ViralQualityMetric extends Metric {
  async measure(input: string, output: string): Promise<MetricResult> {
    console.log('\n🎯 [MASTER EVAL] Running complete viral quality assessment...\n');
    console.log('='.repeat(60));

    const results: any = {
      signals: {},
      antiPatterns: {},
      strengths: [],
      weaknesses: [],
      recommendations: [],
    };

    // Run all signal evals
    console.log('\n📈 LEVERAGE SIGNALS:\n');
    
    const signalEvals = [
      { name: 'shocking_number_contrast', eval: shockingNumberContrastEval, weight: 0.15 },
      { name: 'side_by_side_comparison', eval: sideBySideComparisonEval, weight: 0.12 },
      { name: 'contrarian_with_proof', eval: contrarianWithProofEval, weight: 0.12 },
      { name: 'detailed_breakdown', eval: detailedBreakdownEval, weight: 0.15 },
      { name: 'reveals_hidden_mechanism', eval: revealsHiddenMechanismEval, weight: 0.10 },
      { name: 'comeback_story', eval: comebackStoryEval, weight: 0.08 },
      { name: 'david_vs_goliath', eval: davidVsGoliathEval, weight: 0.08 },
    ];

    let signalScore = 0;
    for (const { name, eval: evalInstance, weight } of signalEvals) {
      const result = await evalInstance.measure(input, output);
      results.signals[name] = result;
      
      const contribution = result.score * weight;
      signalScore += contribution;

      // Track strengths (score >= 0.8)
      if (result.score >= 0.8) {
        results.strengths.push(`✓ ${name.replace(/_/g, ' ')} (${result.score.toFixed(2)})`);
      } else if (result.score < 0.5) {
        results.weaknesses.push(`✗ Missing ${name.replace(/_/g, ' ')} (${result.score.toFixed(2)})`);
        if (result.info && result.info.recommendations?.length > 0) {
          results.recommendations.push(...result.info.recommendations);
        }
      }
    }

    // Run all anti-pattern evals
    console.log('\n🚫 ANTI-PATTERNS:\n');
    
    const antiPatternEvals = [
      { name: 'cringy_hook', eval: antiCringyHookEval },
      { name: 'broad_appeal', eval: broadAppealEval },
      { name: 'forensic_detail', eval: forensicDetailEval },
    ];

    let antiPatternPenalty = 0;
    for (const { name, eval: evalInstance } of antiPatternEvals) {
      const result = await evalInstance.measure(input, output);
      results.antiPatterns[name] = result;
      
      const penalty = (result.info && result.info.penalty) ? result.info.penalty : (1.0 - result.score);
      antiPatternPenalty += penalty;

      if (penalty > 0) {
        results.weaknesses.push(`✗ Issue: ${name.replace(/_/g, ' ')} (-${penalty.toFixed(2)})`);
        if (result.info && result.info.recommendations?.length > 0) {
          results.recommendations.push(...result.info.recommendations);
        }
      }
    }

    // Calculate final score
    // Base: 0.20 (starting point)
    // Signals: up to 0.80 (weighted sum)
    // Anti-patterns: subtract penalties
    const baseScore = 0.20;
    const finalScore = Math.max(0, Math.min(1, baseScore + signalScore - antiPatternPenalty));

    const isViralWorthy = finalScore >= 0.85;

    console.log('\n' + '='.repeat(60));
    console.log(`\n🎯 FINAL SCORE: ${finalScore.toFixed(2)}/1.00`);
    console.log(`   Status: ${isViralWorthy ? '✅ VIRAL-WORTHY' : '❌ NEEDS IMPROVEMENT'}`);
    console.log(`   Threshold: 0.85+\n`);

    if (results.strengths.length > 0) {
      console.log('💪 STRENGTHS:');
      results.strengths.forEach((s: string) => console.log(`   ${s}`));
      console.log('');
    }

    if (results.weaknesses.length > 0) {
      console.log('⚠️  WEAKNESSES:');
      results.weaknesses.forEach((w: string) => console.log(`   ${w}`));
      console.log('');
    }

    if (results.recommendations.length > 0 && !isViralWorthy) {
      console.log('💡 RECOMMENDATIONS:');
      results.recommendations.slice(0, 5).forEach((r: string, i: number) => {
        console.log(`   ${i + 1}. ${r}`);
      });
      console.log('');
    }

    console.log('='.repeat(60) + '\n');

    return {
      score: finalScore,
      info: {
        isViralWorthy,
        signalScore,
        antiPatternPenalty,
        breakdown: {
          signals: Object.fromEntries(
            Object.entries(results.signals).map(([k, v]: [string, any]) => [k, v.score])
          ),
          antiPatterns: Object.fromEntries(
            Object.entries(results.antiPatterns).map(([k, v]: [string, any]) => [k, v.score])
          ),
        },
        strengths: results.strengths,
        weaknesses: results.weaknesses,
        recommendations: results.recommendations.slice(0, 5),
      },
    };
  }
}

export const viralQualityEval = new ViralQualityMetric();

