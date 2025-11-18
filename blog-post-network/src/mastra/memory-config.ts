import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { openai } from '@ai-sdk/openai';

/**
 * Memory Configuration
 * 
 * Creates memory instances for agents and network to maintain context
 * across conversations and generations.
 * 
 * Based on: template-ai-storyboard-consistent-character/src/mastra/memory-config.ts
 * Simplified for blog post creation workflow
 */

/**
 * Create memory instance for individual agents
 * 
 * Each agent gets its own memory to:
 * - Remember conversation history
 * - Recall similar past interactions (semantic search)
 * - Maintain context across multiple calls
 */
export const createAgentMemory = () => {
  return new Memory({
    // Storage for conversation history (messages, threads)
    storage: new LibSQLStore({
      url: "file:blog-network-memory.db",
    }),

    // Vector store for semantic search (embeddings)
    vector: new LibSQLVector({
      connectionUrl: "file:blog-network-memory.db",
    }),

    // Use OpenAI embedding model for semantic search
    embedder: openai.embedding('text-embedding-3-small'),

    options: {
      // Number of recent messages to include in context
      lastMessages: 10,

      // Semantic search configuration
      semanticRecall: {
        topK: 5, // Retrieve top 5 similar messages
        messageRange: {
          before: 2, // Include 2 messages before each result
          after: 1,  // Include 1 message after each result
        },
        scope: 'thread', // Search within current thread only
      },

      // Working memory configuration (persistent context)
      workingMemory: {
        enabled: true,
        scope: 'thread', // Per-thread context
        template: `# Agent Context

## Current Task
- **Task Type**: Blog Post Creation
- **Current Phase**: [Research/Writing/Editing/Formatting]
- **Topic**: 
- **Style**: 
- **Progress**: 

## User Preferences
- **Writing Style**: 
- **Tone**: 
- **Target Audience**: 
- **Keywords**: 

## Session State
- **Research Completed**: [Yes/No]
- **Draft Created**: [Yes/No]
- **Edits Made**: [Yes/No]
- **Final Format**: [Yes/No]

## Notes
- **Special Instructions**: 
- **Issues Encountered**: 
`,
      },

      // Thread configuration
      threads: {
        generateTitle: true, // Auto-generate thread titles
      },
    },
  });
};

/**
 * Create memory instance for the network (orchestrator)
 * 
 * The agent network uses this to:
 * - Track which agents have been called
 * - Remember task history
 * - Coordinate between multiple agents
 * - Maintain state for .loop() method
 */
export const createNetworkMemory = () => {
  return new Memory({
    // Storage for conversation history
    storage: new LibSQLStore({
      url: "file:blog-network-memory.db",
    }),

    // Vector store for semantic search
    vector: new LibSQLVector({
      connectionUrl: "file:blog-network-memory.db",
    }),

    // Use OpenAI embedding for semantic search
    embedder: openai.embedding('text-embedding-3-small'),

    options: {
      // Number of recent messages to include
      lastMessages: 15,

      // Semantic search configuration
      semanticRecall: {
        topK: 6, // Retrieve top 6 similar messages
        messageRange: {
          before: 2,
          after: 1,
        },
        scope: 'resource', // Search across all threads for this user
      },

      // Working memory for network orchestration
      workingMemory: {
        enabled: true,
        scope: 'resource', // Shared across all threads for a user
        template: `# Network Orchestration Memory

## Current Project
- **Project Type**: Blog Post Generation
- **User Request**: 
- **Current Phase**: [Planning/Execution/Review]
- **Progress**: [0-100%]

## Agent Coordination
- **Agents Called**: 
- **Completed Tasks**: 
- **Pending Tasks**: 
- **Current Agent**: 

## User Context
- **Preferred Topics**: 
- **Writing Style**: 
- **Quality Standards**: 
- **Output Format**: 

## Workflow State
- **Research Done**: [Yes/No]
- **Draft Written**: [Yes/No]
- **Content Edited**: [Yes/No]
- **Final Formatted**: [Yes/No]

## Quality Control
- **Issues Found**: 
- **Improvements Made**: 
- **Final Score**: 
`,
      },

      // Thread configuration
      threads: {
        generateTitle: true,
      },
    },
  });
};

/**
 * Create resource-scoped memory instance
 * 
 * This memory persists across ALL conversation threads for a user.
 * Use this to:
 * - Remember user preferences long-term
 * - Learn from past successful posts
 * - Track user's writing patterns
 * - Build user profile over time
 */
export const createResourceScopedMemory = () => {
  return new Memory({
    // Storage for conversation history
    storage: new LibSQLStore({
      url: "file:blog-network-memory.db",
    }),

    // Vector store for semantic search
    vector: new LibSQLVector({
      connectionUrl: "file:blog-network-memory.db",
    }),

    // Use OpenAI embedding for semantic search
    embedder: openai.embedding('text-embedding-3-small'),

    options: {
      // More messages for long-term memory
      lastMessages: 20,

      // Enhanced semantic search for user history
      semanticRecall: {
        topK: 8, // More results for better context
        messageRange: {
          before: 3,
          after: 2,
        },
        scope: 'resource', // CRITICAL: Search across all threads
      },

      // Comprehensive user profile
      workingMemory: {
        enabled: true,
        scope: 'resource', // CRITICAL: Persists across all threads
        template: `# User Profile & Learning Memory

## Personal Information
- **Name**: 
- **Role**: 
- **Industry**: 
- **Experience Level**: 

## Writing Preferences
- **Preferred Styles**: 
- **Favorite Topics**: 
- **Tone Preferences**: 
- **Typical Length**: 
- **Target Audience**: 

## Content History
- **Posts Created**: 
- **Best Performing Topics**: 
- **Most Used Keywords**: 
- **Successful Patterns**: 
- **Common Themes**: 

## Quality Patterns
- **Average Quality Score**: 
- **Strengths**: 
- **Areas for Improvement**: 
- **Successful Formulas**: 

## User Behavior
- **Typical Request Type**: 
- **Revision Patterns**: 
- **Feedback History**: 
- **Learning Progress**: 

## Long-term Goals
- **Content Strategy**: 
- **Target Metrics**: 
- **Growth Areas**: 
`,
      },

      // Thread configuration
      threads: {
        generateTitle: true,
      },
    },
  });
};

/**
 * Convenience function for shared memory
 * Alias for resource-scoped memory
 */
export const createSharedMemory = () => createResourceScopedMemory();

/**
 * Debug function to test memory functionality
 * Use this to verify memory is working correctly
 */
export const debugMemory = async (memory: Memory, resourceId: string, threadId: string) => {
  try {
    console.log(`🔍 [Memory Debug] Testing memory for resourceId: ${resourceId}, threadId: ${threadId}`);

    // Test 1: Get all threads for this resource
    const threads = await memory.getThreadsByResourceId({ resourceId });
    console.log(`📋 [Memory Debug] Found ${threads.length} threads for resource ${resourceId}`);

    // Test 2: Query recent messages
    const queryResult = await memory.query({
      threadId,
      resourceId,
      selectBy: { last: 5 }
    });
    console.log(`💬 [Memory Debug] Recent messages: ${queryResult.messages.length} found`);

    // Test 3: Semantic search test
    const semanticResult = await memory.query({
      threadId,
      resourceId,
      selectBy: {
        vectorSearchString: "blog post writing research"
      },
      threadConfig: {
        semanticRecall: true
      }
    });
    console.log(`🔍 [Memory Debug] Semantic search results: ${semanticResult.messages.length} found`);

    return {
      threadsCount: threads.length,
      recentMessagesCount: queryResult.messages.length,
      semanticResultsCount: semanticResult.messages.length
    };
  } catch (error) {
    console.error(`❌ [Memory Debug] Error testing memory:`, error);
    throw error;
  }
};

