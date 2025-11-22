/**
 * Evaluation Metrics Index
 * 
 * Exports all evaluation metrics for agents
 * Based on: template's evals/index.ts pattern
 */

import { researchEvals } from './research-evals';
import { contentEvals } from './content-evals';
import { writingEvals } from './writing-evals';

// Export all evaluation metrics
export const evals = {
  // Research metrics
  researchCompleteness: researchEvals.completeness,
  researchRelevance: researchEvals.relevance,
  
  // Content metrics
  contentStructure: contentEvals.structure,
  contentSEO: contentEvals.seo,
  
  // Writing metrics
  writingQuality: writingEvals.quality,
};

// Export individual evals for convenience
export const {
  researchCompleteness,
  researchRelevance,
  contentStructure,
  contentSEO,
  writingQuality,
} = evals;

// Export the main evals object as default
export default evals;

// Re-export eval modules
export { researchEvals } from './research-evals';
export { contentEvals } from './content-evals';
export { writingEvals } from './writing-evals';


