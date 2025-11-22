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
 * Master Viral Quality Eval - REDESIGNED
 * 
 * NEW SYSTEM LOGIC (matches reality):
 * - Viral posts have 2-3 GREAT signals (0.80+), not all signals
 * - Execution matters more than quantity
 * - No major penalties (anti-patterns)
 * 
 * PASS CRITERIA:
 * - 2+ great signals (0.80+) AND no deal-breaker penalties
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
      greatSignals: [], // NEW: Track which signals are great (0.80+)
      goodSignals: [],  // NEW: Track which signals are good (0.65-0.79)
    };

    // Run all signal evals
    console.log('\n📈 LEVERAGE SIGNALS:\n');
    
    const signalEvals = [
      { name: 'shocking_number_contrast', eval: shockingNumberContrastEval },
      { name: 'side_by_side_comparison', eval: sideBySideComparisonEval },
      { name: 'contrarian_with_proof', eval: contrarianWithProofEval },
      { name: 'detailed_breakdown', eval: detailedBreakdownEval },
      { name: 'reveals_hidden_mechanism', eval: revealsHiddenMechanismEval },
      { name: 'comeback_story', eval: comebackStoryEval },
      { name: 'david_vs_goliath', eval: davidVsGoliathEval },
    ];

    for (const { name, eval: evalInstance } of signalEvals) {
      const result = await evalInstance.measure(input, output);
      results.signals[name] = result;

      // NEW LOGIC: Categorize signals by quality
      if (result.score >= 0.80) {
        results.greatSignals.push(name);
        results.strengths.push(`✓ ${name.replace(/_/g, ' ')} (${result.score.toFixed(2)})`);
      } else if (result.score >= 0.65) {
        results.goodSignals.push(name);
        results.strengths.push(`~ ${name.replace(/_/g, ' ')} (${result.score.toFixed(2)}) - good`);
      } else if (result.score < 0.50) {
        results.weaknesses.push(`✗ Weak ${name.replace(/_/g, ' ')} (${result.score.toFixed(2)})`);
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

    const majorPenalties: string[] = [];
    let totalPenalty = 0;

    for (const { name, eval: evalInstance } of antiPatternEvals) {
      const result = await evalInstance.measure(input, output);
      results.antiPatterns[name] = result;
      
      const penalty = (result.info && result.info.penalty) ? result.info.penalty : (1.0 - result.score);
      totalPenalty += penalty;

      // Track major penalties (deal-breakers)
      if (penalty >= 0.25) {
        majorPenalties.push(name);
        results.weaknesses.push(`🚨 MAJOR ISSUE: ${name.replace(/_/g, ' ')} (-${penalty.toFixed(2)})`);
      } else if (penalty > 0) {
        results.weaknesses.push(`⚠️  Minor issue: ${name.replace(/_/g, ' ')} (-${penalty.toFixed(2)})`);
      }

      if (result.info && result.info.recommendations?.length > 0) {
        results.recommendations.push(...result.info.recommendations);
      }
    }

    // NEW SCORING SYSTEM (based on reality)
    // Rule: Need 2-3 GREAT signals (0.80+) AND no major penalties
    const greatCount = results.greatSignals.length;
    const goodCount = results.goodSignals.length;
    const hasMajorPenalties = majorPenalties.length > 0;

    let isViralWorthy = false;
    let finalScore = 0;
    let passReason = '';

    // Tier 1: 3+ great signals = definitely viral
    if (greatCount >= 3 && !hasMajorPenalties) {
      isViralWorthy = true;
      finalScore = 0.95 - (totalPenalty * 0.5);
      passReason = `${greatCount} excellent signals`;
    }
    // Tier 2: 2 great signals = viral (most common pattern)
    else if (greatCount >= 2 && !hasMajorPenalties) {
      isViralWorthy = true;
      finalScore = 0.85 - (totalPenalty * 0.5);
      passReason = `${greatCount} excellent signals`;
    }
    // Tier 3: 1 great + 2 good signals = viral
    else if (greatCount >= 1 && goodCount >= 2 && !hasMajorPenalties) {
      isViralWorthy = true;
      finalScore = 0.80 - (totalPenalty * 0.5);
      passReason = `${greatCount} excellent + ${goodCount} good signals`;
    }
    // Tier 4: 4+ good signals = borderline viral
    else if (goodCount >= 4 && !hasMajorPenalties) {
      isViralWorthy = true;
      finalScore = 0.75 - (totalPenalty * 0.5);
      passReason = `${goodCount} good signals (high volume)`;
    }
    // Otherwise: Not viral-worthy
    else {
      isViralWorthy = false;
      // Calculate score based on signal quality
      const signalScore = (greatCount * 0.30) + (goodCount * 0.15);
      finalScore = Math.max(0, signalScore - totalPenalty);
      passReason = `Only ${greatCount} excellent, ${goodCount} good signals (need 2+ excellent)`;
    }

    // Cap score at 1.0
    finalScore = Math.min(1.0, finalScore);

    console.log('\n' + '='.repeat(60));
    console.log(`\n🎯 FINAL SCORE: ${finalScore.toFixed(2)}/1.00`);
    console.log(`   Status: ${isViralWorthy ? '✅ VIRAL-WORTHY' : '❌ NEEDS IMPROVEMENT'}`);
    console.log(`   Logic: ${passReason}\n`);

    // NEW: Show signal breakdown
    console.log('📊 SIGNAL BREAKDOWN:');
    console.log(`   🔥 Excellent signals (0.80+): ${greatCount} → [${results.greatSignals.map((s: string) => s.replace(/_/g, ' ')).join(', ') || 'none'}]`);
    console.log(`   ✓  Good signals (0.65-0.79): ${goodCount} → [${results.goodSignals.map((s: string) => s.replace(/_/g, ' ')).join(', ') || 'none'}]`);
    console.log(`   🚫 Major penalties: ${majorPenalties.length} → [${majorPenalties.map((s: string) => s.replace(/_/g, ' ')).join(', ') || 'none'}]`);
    console.log('');

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
        passReason,
        greatSignalCount: greatCount,
        goodSignalCount: goodCount,
        majorPenaltyCount: majorPenalties.length,
        totalPenalty,
        breakdown: {
          signals: Object.fromEntries(
            Object.entries(results.signals).map(([k, v]: [string, any]) => [k, v.score])
          ),
          antiPatterns: Object.fromEntries(
            Object.entries(results.antiPatterns).map(([k, v]: [string, any]) => [k, v.score])
          ),
          greatSignals: results.greatSignals,
          goodSignals: results.goodSignals,
          majorPenalties,
        },
        strengths: results.strengths,
        weaknesses: results.weaknesses,
        recommendations: results.recommendations.slice(0, 5),
      },
    };
  }
}

export const viralQualityEval = new ViralQualityMetric();

