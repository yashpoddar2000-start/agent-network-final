import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { openai } from '@ai-sdk/openai';

/**
 * QSR Insight Discovery Memory Configuration
 * 
 * Creates memory instances for agents and network to maintain context
 * across recursive research sessions and insight generation.
 * 
 * Based on: blog-post-network/src/mastra/memory-config.ts
 * Customized for QSR insight discovery workflow
 */

/**
 * Create memory instance for individual research agents
 * 
 * Each agent gets its own memory to:
 * - Remember conversation history within a research session
 * - Recall similar past research patterns (semantic search)
 * - Maintain context across multiple tool calls
 * - Track progress through recursive research levels
 */
export const createAgentMemory = () => {
  return new Memory({
    // Storage for conversation history (messages, threads)
    storage: new LibSQLStore({
      url: "file:qsr-insights-memory.db",
    }),

    // Vector store for semantic search (embeddings)
    vector: new LibSQLVector({
      connectionUrl: "file:qsr-insights-memory.db",
    }),

    // Use OpenAI embedding model for semantic search
    embedder: openai.embedding('text-embedding-3-small'),

    options: {
      // Number of recent messages to include in context
      lastMessages: 12,

      // Semantic search configuration for research patterns
      semanticRecall: {
        topK: 6, // Retrieve top 6 similar research patterns
        messageRange: {
          before: 3, // Include 3 messages before each result
          after: 2,  // Include 2 messages after each result
        },
        scope: 'thread', // Search within current research session only
      },

      // Working memory configuration (persistent context)
      workingMemory: {
        enabled: true,
        scope: 'thread', // Per-research-session context
        template: `# Research Agent Context

## Current Research Session
- **Research Topic**: 
- **Current Level**: [1-5]
- **Session Phase**: [Hypothesis/Data_Gathering/Mechanism_Discovery/Deep_Analysis/Synthesis]
- **Target Shock Score**: 8+

## Research Progress
- **Level 1 Hypothesis**: 
- **Level 1 Data**: 
- **Level 2 Question**: 
- **Level 2 Data**: 
- **Level 3 Question**: 
- **Level 3 Data**: 
- **Level 4 Question**: 
- **Level 4 Data**: 
- **Level 5 Question**: 
- **Level 5 Data**: 

## Key Findings
- **Numerical Gap**: 
- **Company A**: 
- **Company B**: 
- **Gap Ratio**: 
- **Mechanism Discovered**: 

## Research Tools Used
- **Exa Answer Queries**: [count/20 limit]
- **Deep Research Calls**: [count/3 limit]
- **Successful Queries**: 
- **Failed Queries**: 

## Quality Metrics
- **Sources Found**: 
- **Data Reliability**: 
- **Shock Score**: 
- **Mechanism Clarity**: 

## Next Actions
- **Next Question**: 
- **Research Focus**: 
- **Tool Selection**: 
`,
      },

      // Thread configuration
      threads: {
        generateTitle: true, // Auto-generate research session titles
      },
    },
  });
};

/**
 * Create memory instance for the insight network (orchestrator)
 * 
 * The agent network uses this to:
 * - Track which agents have been called at each research level
 * - Remember insight discovery patterns across sessions
 * - Coordinate between multiple agents during recursive research
 * - Maintain state for complex multi-level investigations
 */
export const createNetworkMemory = () => {
  return new Memory({
    // Storage for orchestration history
    storage: new LibSQLStore({
      url: "file:qsr-insights-memory.db",
    }),

    // Vector store for pattern recognition
    vector: new LibSQLVector({
      connectionUrl: "file:qsr-insights-memory.db",
    }),

    // Use OpenAI embedding for pattern matching
    embedder: openai.embedding('text-embedding-3-small'),

    options: {
      // More messages for network coordination
      lastMessages: 20,

      // Enhanced semantic search for insight patterns
      semanticRecall: {
        topK: 8, // Retrieve top 8 similar insight patterns
        messageRange: {
          before: 3,
          after: 2,
        },
        scope: 'resource', // Search across all insight sessions for this user
      },

      // Working memory for network orchestration
      workingMemory: {
        enabled: true,
        scope: 'resource', // Shared across all insight sessions for a user
        template: `# QSR Insight Network Orchestration Memory

## Current Insight Investigation
- **Target Insight**: 
- **Research Strategy**: [SHOCKING_CONTRAST/HIDDEN_MECHANISM/CONTRARIAN_ANGLE]
- **Current Level**: [1-5]
- **Progress**: [0-100%]
- **Time Started**: 

## Agent Coordination
- **Agents Called**: 
- **Current Agent**: 
- **Pending Tasks**: 
- **Completed Tasks**: 
- **Tool Calls Made**: 

## Research State Machine
- **Hypothesis Generated**: [Yes/No]
- **Initial Data Gathered**: [Yes/No]
- **Gap Identified**: [Yes/No] 
- **Mechanism Research**: [Yes/No]
- **Deep Analysis**: [Yes/No]
- **Insight Synthesized**: [Yes/No]

## Insight Quality Tracking
- **Numerical Gaps Found**: 
- **Shock Score**: [0-10]
- **Mechanism Clarity**: [Clear/Partial/Unknown]
- **Source Quality**: [High/Medium/Low]
- **Viral Potential**: [High/Medium/Low]

## Resource Usage
- **Exa Answer Queries**: [used/20 limit]
- **Deep Research Calls**: [used/3 limit]
- **Total Cost**: $
- **Success Rate**: %

## Successful Patterns
- **Best Research Angles**: 
- **Most Viral Insights**: 
- **Effective Query Types**: 
- **High-Quality Sources**: 

## Session Context
- **Companies Analyzed**: 
- **Industries Covered**: 
- **Time Period**: 
- **Geographic Focus**: 

## Learning & Iteration
- **Strategy Adjustments**: 
- **Instruction Improvements**: 
- **Tool Usage Optimization**: 
- **Quality Score Trends**: 
`,
      },

      // Thread configuration for insight sessions
      threads: {
        generateTitle: true,
      },
    },
  });
};

/**
 * Create long-term insight memory for semantic deduplication
 * 
 * This memory persists across ALL insight sessions to:
 * - Prevent duplicate insight discovery
 * - Learn successful insight patterns over time
 * - Build knowledge base of QSR industry insights
 * - Track viral insight performance
 */
export const createInsightKnowledgeMemory = () => {
  return new Memory({
    // Storage for long-term insight knowledge
    storage: new LibSQLStore({
      url: "file:qsr-insights-memory.db",
    }),

    // Vector store for semantic deduplication
    vector: new LibSQLVector({
      connectionUrl: "file:qsr-insights-memory.db",
    }),

    // Use OpenAI embedding for semantic similarity
    embedder: openai.embedding('text-embedding-3-small'),

    options: {
      // Large message history for pattern recognition
      lastMessages: 50,

      // Advanced semantic search for deduplication
      semanticRecall: {
        topK: 10, // Find top 10 similar insights
        messageRange: {
          before: 2,
          after: 1,
        },
        scope: 'resource', // Search all insights ever generated
      },

      // Long-term knowledge base
      workingMemory: {
        enabled: true,
        scope: 'resource', // Persists across all sessions
        template: `# QSR Insight Knowledge Base

## Insight Statistics
- **Total Insights Generated**: 
- **Unique Companies Analyzed**: 
- **Average Shock Score**: 
- **Success Rate**: %
- **Best Performing Insights**: 

## Company Coverage
- **Chick-fil-A Insights**: 
- **McDonald's Insights**: 
- **Taco Bell Insights**: 
- **Pizza Hut Insights**: 
- **Subway Insights**: 
- **Other Companies**: 

## Pattern Recognition
- **Most Viral Patterns**: 
- **Best Contrast Types**: 
- **Effective Mechanisms**: 
- **Quality Source Types**: 
- **Optimal Research Depths**: 

## Research Efficiency
- **Average Queries per Insight**: 
- **Average Cost per Insight**: 
- **Average Time per Insight**: 
- **Tool Usage Patterns**: 

## Deduplication Tracking
- **Duplicate Insights Prevented**: 
- **Similarity Threshold**: 85%
- **Last Duplicate Check**: 
- **Similar Insight Clusters**: 

## Performance Metrics
- **8+ Shock Score Rate**: %
- **Source Quality Rate**: %
- **Mechanism Discovery Rate**: %
- **Research Success Rate**: %

## Learning Insights
- **Strategy Improvements**: 
- **Common Failure Patterns**: 
- **Research Optimizations**: 
- **Quality Predictors**: 
`,
      },

      // Thread configuration for knowledge base
      threads: {
        generateTitle: true,
      },
    },
  });
};

/**
 * Debug function to test memory functionality
 * Use this to verify memory is working correctly during development
 */
export const debugInsightMemory = async (
  memory: Memory, 
  resourceId: string, 
  threadId: string
) => {
  try {
    console.log(`🔍 [Memory Debug] Testing QSR insight memory`);
    console.log(`   ResourceId: ${resourceId}`);
    console.log(`   ThreadId: ${threadId}`);

    // Test 1: Get all threads for this user
    const threads = await memory.getThreadsByResourceId({ resourceId });
    console.log(`📋 [Memory Debug] Found ${threads.length} insight sessions for user`);

    // Test 2: Create test thread (memory is managed automatically by agents)
    const testThread = await memory.createThread({
      resourceId,
      threadId,
      title: 'Test Insight Research Session',
      metadata: {
        purpose: 'memory-testing',
        phase: 'initialization'
      }
    });
    console.log(`✅ [Memory Debug] Test thread created: ${testThread.id}`);

    // Test 3: Query messages (will be empty initially, but tests the API)
    const queryResult = await memory.query({
      threadId,
      resourceId,
      selectBy: { last: 5 }
    });
    console.log(`💬 [Memory Debug] Recent messages: ${queryResult.messages.length} found (empty is normal for new thread)`);

    // Test 4: Semantic search for similar insights
    const semanticResult = await memory.query({
      threadId,
      resourceId,
      selectBy: {
        vectorSearchString: "Chick-fil-A revenue gap McDonald's"
      },
      threadConfig: {
        semanticRecall: true
      }
    });
    console.log(`🔍 [Memory Debug] Semantic search results: ${semanticResult.messages.length} found`);

    return {
      threadsCount: threads.length,
      recentMessagesCount: queryResult.messages.length,
      semanticResultsCount: semanticResult.messages.length,
      status: 'healthy'
    };
  } catch (error) {
    console.error(`❌ [Memory Debug] Error testing insight memory:`, error);
    throw error;
  }
};

/**
 * Initialize memory infrastructure for the entire insight network
 * Call this once during system startup
 */
export const initializeInsightMemory = async () => {
  try {
    console.log('🚀 Initializing QSR Insight Memory Infrastructure...');
    
    // Create memory instances
    const agentMemory = createAgentMemory();
    const networkMemory = createNetworkMemory();
    const knowledgeMemory = createInsightKnowledgeMemory();
    
    console.log('✅ Memory infrastructure initialized successfully');
    console.log('📊 Database: qsr-insights-memory.db');
    console.log('🔍 Vector search: Enabled with text-embedding-3-small');
    console.log('💾 Working memory: Enabled with insight-specific templates');
    
    return {
      agentMemory,
      networkMemory,
      knowledgeMemory,
    };
  } catch (error) {
    console.error('❌ Failed to initialize insight memory:', error);
    throw error;
  }
};
