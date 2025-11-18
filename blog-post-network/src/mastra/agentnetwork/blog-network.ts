import { NewAgentNetwork } from '@mastra/core/network/vNext';
import { openai } from '@ai-sdk/openai';
import { researchAgent } from '../agents/research-agent';
import { writerAgent } from '../agents/writer-agent';
import { editorAgent } from '../agents/editor-agent';
import { formatterAgent } from '../agents/formatter-agent';
import { blogCreationWorkflow } from '../workflows/blog-creation-workflow';
import { createNetworkMemory } from '../memory-config';
import { RuntimeContext } from '@mastra/core/runtime-context';

/**
 * Blog Post Creation Agent Network
 * 
 * Intelligent multi-agent system that dynamically routes content creation tasks.
 * Uses LLM-based routing to decide which agents/workflows to use.
 * 
 * Based on: template-ai-storyboard-consistent-character/src/mastra/agentnetwork/agent-network.ts
 * 
 * ARCHITECTURE:
 * - 4 Specialized Agents (research, writer, editor, formatter)
 * - 1 Complete Workflow (automated pipeline)
 * - LLM Router (decides which primitive to use)
 * - Memory System (learns from interactions)
 */

/**
 * Helper function to create runtime context
 */
function createRuntimeContext() {
  return new RuntimeContext();
}

/**
 * The vNext Agent Network - Modern Approach
 * 
 * This is the intelligent orchestrator that:
 * 1. Receives user requests (structured or unstructured)
 * 2. Decides which agent or workflow to use
 * 3. Coordinates execution
 * 4. Returns results
 */
export const blogNetwork = new NewAgentNetwork({
  id: 'blog-post-network',
  name: 'Blog Post Creation Network',
  
  // All available agents (the network can choose from these)
  agents: {
    researchAgent,
    writerAgent,
    editorAgent,
    formatterAgent,
  },
  
  // All available workflows (network can choose these too)
  workflows: {
    blogCreationWorkflow,
  },
  
  // The routing model (makes decisions about which agent/workflow to use)
  model: openai('gpt-4o'),
  
  // Memory for the network (resource-scoped, learns user patterns)
  memory: createNetworkMemory(),
  
  // Instructions for the routing agent (HOW to make decisions)
  instructions: `You are an intelligent blog post creation system that coordinates specialized agents and workflows.

## Your Role
You are the ORCHESTRATOR. You decide which agents or workflows to use based on the user's request.

## Available Primitives

### Agents (Use for SPECIFIC tasks):
1. **researchAgent**: Gathers information on topics
   - Use when: User needs research on a topic
   - Returns: Findings, statistics, trends, examples
   
2. **writerAgent**: Creates blog post drafts
   - Use when: User needs content written
   - Returns: Written blog post content
   
3. **editorAgent**: Reviews and improves content
   - Use when: User has draft that needs editing
   - Returns: Edited content with improvements
   
4. **formatterAgent**: Formats and exports to markdown
   - Use when: User needs final markdown export
   - Returns: Formatted markdown file

### Workflows (Use for COMPLETE pipelines):
1. **blogCreationWorkflow**: Complete pipeline (Research → Write → Edit → Format)
   - Use when: User wants complete blog post from just a topic
   - Input: { topic: string, depth?: string, numFindings?: number }
   - Returns: Complete blog post exported to file

## Routing Strategy

### Simple Requests → Use Workflow
If user says: "Write a blog post about X"
└─ Use: blogCreationWorkflow
└─ Why: Complete pipeline, one-shot solution

### Specific Requests → Use Individual Agents
If user says: "Research TypeScript" 
└─ Use: researchAgent only
└─ Why: They only need research, not full blog

If user says: "Edit this draft: [content]"
└─ Use: editorAgent only
└─ Why: They already have content

### Complex Requests → Use .loop() with Multiple Primitives
If user says: "Research 3 topics, compare them, write a blog"
└─ Use: Multiple agents in sequence
└─ Why: Complex task needs coordination

## Decision Making Examples

User: "Write a blog about TypeScript"
→ Decision: Use blogCreationWorkflow
→ Reason: Simple, complete pipeline needed

User: "What are the benefits of TypeScript?"
→ Decision: Use researchAgent
→ Reason: Just research needed, not full blog

User: "Here's my draft: [content]. Make it better."
→ Decision: Use editorAgent → formatterAgent
→ Reason: Skip research and writing, just improve and export

User: "Research TypeScript and Python. Compare them. Write a detailed blog."
→ Decision: researchAgent (TypeScript) → researchAgent (Python) → writerAgent → editorAgent → formatterAgent
→ Reason: Multiple steps, need coordination

## CRITICAL RULES
- If request is simple and complete → Use workflow (most efficient)
- If request is partial → Use specific agents
- If request is complex → Coordinate multiple agents
- Always consider what the user actually needs
- Don't over-engineer - use simplest solution

## Memory Usage
- Remember user's preferred writing styles
- Learn which topics they write about often
- Track successful content patterns
- Build user profile over time (resource-scoped memory)

Always provide helpful, high-quality blog content that meets user needs.`,
});

/**
 * Convenience Functions for Common Workflows
 * These make it easy to use the network for specific tasks
 */

/**
 * Generate a complete blog post from a topic
 * Uses the network's .generate() method for single-task execution
 */
export async function generateBlogPost(
  topic: string,
  options?: {
    style?: 'professional' | 'casual' | 'technical' | 'storytelling';
    length?: 'short' | 'medium' | 'long';
    depth?: 'shallow' | 'moderate' | 'deep';
    resourceId?: string;
    threadId?: string;
  }
) {
  const runtimeContext = createRuntimeContext();
  
  const result = await blogNetwork.generate(
    `Create a complete blog post about "${topic}". ` +
    `Style: ${options?.style || 'professional'}, ` +
    `Length: ${options?.length || 'medium'}, ` +
    `Research depth: ${options?.depth || 'moderate'}. ` +
    `Please create a comprehensive, well-researched blog post.`,
    {
      runtimeContext,
      resourceId: options?.resourceId || 'default-user',
      threadId: options?.threadId || `blog-${Date.now()}`,
    }
  );
  
  return result;
}

/**
 * Research a topic (just research, no writing)
 * Uses the network's .generate() method to route to research agent
 */
export async function researchTopic(
  topic: string,
  options?: {
    depth?: 'shallow' | 'moderate' | 'deep';
    numFindings?: number;
    resourceId?: string;
    threadId?: string;
  }
) {
  const runtimeContext = createRuntimeContext();
  
  const result = await blogNetwork.generate(
    `Research the topic: "${topic}". ` +
    `Depth: ${options?.depth || 'moderate'}. ` +
    `Provide ${options?.numFindings || 10} key findings with insights and examples.`,
    {
      runtimeContext,
      resourceId: options?.resourceId || 'default-user',
      threadId: options?.threadId || `research-${Date.now()}`,
    }
  );
  
  return result;
}

/**
 * Complex multi-step blog creation using .loop()
 * The network will figure out the steps needed
 */
export async function createMultiTopicBlog(
  topics: string[],
  options?: {
    compareTopics?: boolean;
    resourceId?: string;
    threadId?: string;
  }
) {
  const runtimeContext = createRuntimeContext();
  
  const topicList = topics.join(', ');
  const instruction = options?.compareTopics
    ? `Research these topics: ${topicList}. Compare and contrast them. Write a comprehensive blog post with comparison table.`
    : `Research these topics: ${topicList}. Write a comprehensive blog post covering all of them.`;
  
  const result = await blogNetwork.loop(
    instruction,
    {
      runtimeContext,
      resourceId: options?.resourceId || 'default-user',
      threadId: options?.threadId || `multi-blog-${Date.now()}`,
    }
  );
  
  return result;
}

/**
 * Streaming version - see real-time progress
 */
export async function streamBlogPost(
  topic: string,
  options?: {
    style?: string;
    resourceId?: string;
    threadId?: string;
  }
) {
  const runtimeContext = createRuntimeContext();
  
  const stream = await blogNetwork.stream(
    `Create a blog post about "${topic}" in ${options?.style || 'professional'} style.`,
    {
      runtimeContext,
      resourceId: options?.resourceId || 'default-user',
      threadId: options?.threadId || `stream-blog-${Date.now()}`,
    }
  );
  
  return stream;
}

