import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { researchAgent } from './agents/research-agent';
import { writerAgent } from './agents/writer-agent';
import { editorAgent } from './agents/editor-agent';
import { formatterAgent } from './agents/formatter-agent';
import { blogCreationWorkflow } from './workflows/blog-creation-workflow';
import { blogNetwork } from './agentnetwork/blog-network';

/**
 * Main Mastra Configuration
 * 
 * This is the central hub where all components come together:
 * - Agents (Phase 3) ✅
 * - Networks (will add in Phase 5)
 * - Workflows (will add in Phase 4)
 * - Storage (for memory)
 * - Logger (for debugging)
 * 
 * Based on: template-ai-storyboard-consistent-character/src/mastra/index.ts
 */

// Create shared storage for all memory instances
// All agents and networks will use this same database
const sharedStorage = new LibSQLStore({
  url: "file:blog-network-memory.db",
});

/**
 * Main Mastra Instance
 * 
 * This is what you import when you want to use the system:
 * import { mastra } from './src/mastra';
 */
export const mastra = new Mastra({
  // Agents registered (Phase 3) ✅
  agents: {
    researchAgent,
    writerAgent,
    editorAgent,
    formatterAgent,
  },

  // Legacy networks (optional, for playground compatibility)
  networks: {
    // Will add if needed
  },

  // Modern vNext networks (Phase 5) ✅
  vnext_networks: {
    blogNetwork,
  },

  // Workflows (Phase 4) ✅
  workflows: {
    blogCreationWorkflow,
  },

  // Shared storage for memory across all components
  storage: sharedStorage,

  // Logger for debugging and monitoring
  logger: new PinoLogger({
    name: 'BlogNetworkMastra',
    level: 'info', // Can be: 'debug', 'info', 'warn', 'error'
  }),
});

// Export schemas for type safety
export * from './schemas/blog-post-schema';
export * from './schemas/research-schema';
export * from './schemas/content-schema';

// Export memory configuration
export * from './memory-config';

// Agents exported (Phase 3) ✅
export { researchAgent } from './agents/research-agent';
export { writerAgent } from './agents/writer-agent';
export { editorAgent } from './agents/editor-agent';
export { formatterAgent } from './agents/formatter-agent';

// Tools exported (Phase 2) ✅
export { researchTool } from './tools/research-tool';
export { writingTool } from './tools/writing-tool';
export { editingTool } from './tools/editing-tool';
export { formattingTool } from './tools/formatting-tool';

// Network exported (Phase 5) ✅
export { 
  blogNetwork,
  generateBlogPost,
  researchTopic,
  createMultiTopicBlog,
  streamBlogPost
} from './agentnetwork/blog-network';

// Workflow exported (Phase 4) ✅
export { blogCreationWorkflow, createBlogPost } from './workflows/blog-creation-workflow';

// Evals will be exported here (Phase 6)
// export * from './evals';

