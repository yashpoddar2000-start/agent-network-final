/**
 * Mastra Evals - Viral Post Evaluation System
 * 
 * This system evaluates generated LinkedIn posts against proven viral patterns
 * from Raghav's 31 quality posts and 25 flop posts.
 */

// Master eval (use this for final scoring)
export { viralQualityEval } from './viral-quality-eval';

// Individual signal evals
export { shockingNumberContrastEval } from './signals/shocking-number-contrast-eval';
export { sideBySideComparisonEval } from './signals/side-by-side-comparison-eval';
export { contrarianWithProofEval } from './signals/contrarian-with-proof-eval';
export { detailedBreakdownEval } from './signals/detailed-breakdown-eval';
export { revealsHiddenMechanismEval } from './signals/reveals-hidden-mechanism-eval';
export { comebackStoryEval } from './signals/comeback-story-eval';
export { davidVsGoliathEval } from './signals/david-vs-goliath-eval';

// Anti-pattern evals
export { antiCringyHookEval } from './anti-patterns/anti-cringy-hook-eval';
export { broadAppealEval } from './anti-patterns/broad-appeal-eval';
export { forensicDetailEval } from './anti-patterns/forensic-detail-eval';

// Export utility functions for testing
export {
  loadAllPosts,
  getQualityPosts,
  getFlopPosts,
  getPostsBySignal,
} from './utils/training-data';

