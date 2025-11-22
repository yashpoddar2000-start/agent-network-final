import { Mastra } from '@mastra/core';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Raghav QSR Network - Production System
 * 
 * This is the main Mastra instance that will coordinate:
 * - Agents (research, writer, editor)
 * - Tools (Exa research, financial extraction)
 * - Evals (custom leverage signals)
 * - Memory (resource-scoped learning from 51 posts)
 * 
 * Current Status: Phase 1 - Building Custom Evals
 */

export const mastra = new Mastra({
  // Agents, tools, workflows, and networks will be added as we build
});

console.log('✅ Raghav QSR Network - Mastra initialized');
