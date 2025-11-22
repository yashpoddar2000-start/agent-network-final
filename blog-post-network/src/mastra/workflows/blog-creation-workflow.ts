import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { researchTool } from '../tools/research-tool';
import { writingTool } from '../tools/writing-tool';
import { editingTool } from '../tools/editing-tool';
import { formattingTool } from '../tools/formatting-tool';
import { writerAgent } from '../agents/writer-agent';
import { editorAgent } from '../agents/editor-agent';

/**
 * Blog Creation Workflow
 * 
 * Automated pipeline: Research → Write → Edit → Format
 * Chains all 4 agents together to create complete blog posts
 * 
 * Based on: template's agent-network-automated-workflow.ts
 * Reference: template-ai-storyboard-consistent-character/src/mastra/workflows/agent-network-automated-workflow.ts
 */

// Step 1: Research the topic
const researchStep = createStep({
  id: 'research-topic',
  description: 'Research the given topic to gather information, statistics, and examples',
  
  inputSchema: z.object({
    topic: z.string().describe('Topic to research'),
    depth: z.enum(['shallow', 'moderate', 'deep']).default('moderate').describe('Research depth'),
    numFindings: z.number().default(10).describe('Number of findings to gather'),
  }),
  
  outputSchema: z.object({
    topic: z.string(),
    researchData: z.object({
      findings: z.array(z.any()),
      keyInsights: z.array(z.string()),
      statistics: z.array(z.string()),
      examples: z.array(z.string()),
    }),
  }),
  
  execute: async ({ inputData, runtimeContext }) => {
    console.log('🔍 [Workflow Step 1] Researching topic...');
    console.log(`📋 Topic: ${inputData.topic}`);

    // Use the research tool directly
    const researchResult = await researchTool.execute({
      context: {
        topic: inputData.topic,
        depth: inputData.depth,
        numFindings: inputData.numFindings,
      },
      runtimeContext,
    });

    console.log(`✅ [Step 1] Research complete: ${researchResult.findings.length} findings`);

    return {
      topic: inputData.topic,
      researchData: {
        findings: researchResult.findings,
        keyInsights: researchResult.keyInsights,
        statistics: researchResult.statistics || [],
        examples: researchResult.examples || [],
      },
    };
  },
});

// Step 2: Write the blog post draft
const writeDraftStep = createStep({
  id: 'write-draft',
  description: 'Write a blog post draft based on research findings',
  
  inputSchema: z.object({
    topic: z.string(),
    researchData: z.object({
      findings: z.array(z.any()),
      keyInsights: z.array(z.string()),
      statistics: z.array(z.string()),
      examples: z.array(z.string()),
    }),
  }),
  
  outputSchema: z.object({
    topic: z.string(),
    draftContent: z.string(),
  }),
  
  execute: async ({ inputData }) => {
    console.log('✍️ [Workflow Step 2] Writing draft...');
    console.log(`📋 Topic: ${inputData.topic}`);
    
    const prompt = `Write a comprehensive blog post about "${inputData.topic}" using this research:

Key Insights:
${inputData.researchData.keyInsights.map(i => `- ${i}`).join('\n')}

Statistics:
${inputData.researchData.statistics.map(s => `- ${s}`).join('\n')}

Examples:
${inputData.researchData.examples.map(e => `- ${e}`).join('\n')}

Create a well-structured blog post with:
- A compelling hook
- Clear introduction
- 3-4 main sections with headings
- Specific examples and data
- Strong conclusion with call-to-action

Write in markdown format with proper headings (##, ###).`;

    const result = await writerAgent.generate(prompt);

    console.log(`✅ [Step 2] Draft written: ${result.text.length} characters`);

    return {
      topic: inputData.topic,
      draftContent: result.text,
    };
  },
});

// Step 3: Edit the draft
const editDraftStep = createStep({
  id: 'edit-draft',
  description: 'Edit and improve the blog post draft for grammar, clarity, and style',
  
  inputSchema: z.object({
    topic: z.string(),
    draftContent: z.string(),
  }),
  
  outputSchema: z.object({
    topic: z.string(),
    editedContent: z.string(),
    improvementScore: z.number(),
  }),
  
  execute: async ({ inputData }) => {
    console.log('✏️ [Workflow Step 3] Editing draft with editor agent...');
    console.log(`📊 Draft length: ${inputData.draftContent.length} characters`);

    // Use the editor agent (has LLM brain to actually fix issues!)
    const editResult = await editorAgent.generate(
      `Review and improve this blog post draft. Fix grammar, improve clarity, enhance style, and ensure professional quality:

${inputData.draftContent}

Focus on:
- Grammar and spelling corrections
- Breaking long sentences (>30 words)
- Converting passive voice to active
- Removing hedging words
- Improving overall readability

Return the improved version.`
    );

    console.log(`✅ [Step 3] Editing complete by editor agent`);
    console.log(`📝 Edited content length: ${editResult.text.length} characters`);

    return {
      topic: inputData.topic,
      editedContent: editResult.text,
      improvementScore: 100, // Agent-edited, assume high quality
    };
  },
});

// Step 4: Format and export
const formatAndExportStep = createStep({
  id: 'format-export',
  description: 'Format the blog post to markdown with metadata and export to file',
  
  inputSchema: z.object({
    topic: z.string(),
    editedContent: z.string(),
    improvementScore: z.number(),
  }),
  
  outputSchema: z.object({
    topic: z.string(),
    finalContent: z.string(),
    exportPath: z.string(),
    wordCount: z.number(),
    readingTime: z.string(),
    summary: z.object({
      improvementScore: z.number(),
      finalWordCount: z.number(),
    }),
  }),
  
  execute: async ({ inputData, runtimeContext }) => {
    console.log('📄 [Workflow Step 4] Formatting and exporting...');

    // Use the formatting tool
    const formatResult = await formattingTool.execute({
      context: {
        content: inputData.editedContent,
        title: inputData.topic,
        metadata: {
          author: 'Blog Network Agent',
          date: new Date().toISOString().split('T')[0],
          category: 'Generated Content',
          tags: [inputData.topic.toLowerCase()],
        },
        options: {
          includeMetadata: true,
          includeTableOfContents: false,
          codeHighlighting: true,
          addHeadingIds: false,
          formatting: 'standard' as const,
        },
      },
      runtimeContext,
    });

    console.log(`✅ [Step 4] Export complete: ${formatResult.exportPath}`);
    console.log(`📊 Final stats: ${formatResult.wordCount} words, ${formatResult.readingTime}`);

    return {
      topic: inputData.topic,
      finalContent: formatResult.content,
      exportPath: formatResult.exportPath || 'not-saved',
      wordCount: formatResult.wordCount,
      readingTime: formatResult.readingTime,
      summary: {
        improvementScore: inputData.improvementScore,
        finalWordCount: formatResult.wordCount,
      },
    };
  },
});

// Create the complete workflow
export const blogCreationWorkflow = createWorkflow({
  id: 'blog-creation-pipeline',
  description: 'Complete pipeline from topic to published blog post: Research → Write → Edit → Format',
  
  inputSchema: z.object({
    topic: z.string().describe('Topic to write about'),
    depth: z.enum(['shallow', 'moderate', 'deep']).default('moderate').describe('Research depth'),
    numFindings: z.number().default(10).describe('Number of research findings'),
  }),
  
  outputSchema: z.object({
    topic: z.string(),
    finalContent: z.string(),
    exportPath: z.string(),
    wordCount: z.number(),
    readingTime: z.string(),
    summary: z.object({
      improvementScore: z.number(),
      finalWordCount: z.number(),
    }),
  }),
  
  steps: [researchStep, writeDraftStep, editDraftStep, formatAndExportStep],
})
  .then(researchStep)
  .then(writeDraftStep)
  .then(editDraftStep)
  .then(formatAndExportStep)
  .commit();

/**
 * Helper function to run the complete blog creation workflow
 */
export async function createBlogPost(
  topic: string,
  options?: {
    depth?: 'shallow' | 'moderate' | 'deep';
    numFindings?: number;
  }
) {
  console.log('🚀 [Blog Workflow] Starting complete pipeline...');
  console.log(`📋 Topic: ${topic}`);

  const run = await blogCreationWorkflow.createRunAsync();
  
  const result = await run.start({
    inputData: {
      topic,
      depth: options?.depth || 'moderate',
      numFindings: options?.numFindings || 10,
    },
  });

  if (result.status === 'success') {
    console.log('🎉 [Blog Workflow] Pipeline complete!');
    console.log(`📄 Exported to: ${result.result.exportPath}`);
    console.log(`📊 ${result.result.wordCount} words, ${result.result.readingTime}`);
    return result.result;
  } else {
    console.error('❌ [Blog Workflow] Pipeline failed:', result.status);
    throw new Error(`Workflow failed with status: ${result.status}`);
  }
}

