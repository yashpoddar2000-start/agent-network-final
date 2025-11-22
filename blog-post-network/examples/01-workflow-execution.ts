/**
 * SUPER DETAILED Workflow Test
 * 
 * Shows EXACT data at each step
 * Saves complete results to workflow-execution-log.txt
 */

import 'dotenv/config';
import { researchTool } from '../src/mastra/tools/research-tool';
import { writerAgent } from '../src/mastra/agents/writer-agent';
import { editingTool } from '../src/mastra/tools/editing-tool';
import { formattingTool } from '../src/mastra/tools/formatting-tool';
import { RuntimeContext } from '@mastra/core/runtime-context';
import fs from 'fs';
import path from 'path';

async function superDetailedTest() {
  // Array to collect all log entries
  const logEntries: string[] = [];
  
  // Helper function to log to both console and array
  function log(message: string) {
    console.log(message);
    logEntries.push(message);
  }
  
  log('\n' + '═'.repeat(100));
  log('🔬 SUPER DETAILED WORKFLOW EXECUTION - STEP BY STEP');
  log('═'.repeat(100));
  
  // Create runtime context
  const runtimeContext = new RuntimeContext();
  
  log('\n📦 WHAT IS RUNTIME CONTEXT?');
  log('─'.repeat(100));
  log('RuntimeContext is an object that:');
  log('  ✅ Travels through all workflow steps');
  log('  ✅ Can store custom data (like a shared memory)');
  log('  ✅ Provides context to tools and agents');
  log('  ✅ Helps with dependency injection\n');
  log('Object keys: ' + JSON.stringify(Object.keys(runtimeContext)));
  log('Type: ' + runtimeContext.constructor.name);
  log('Full object: ' + JSON.stringify(runtimeContext, null, 2));
  
  // Initial input
  const initialInput = {
    topic: 'Benefits of TypeScript',
    depth: 'moderate' as const,
    numFindings: 5,
  };
  
  log('\n\n' + '═'.repeat(100));
  log('📥 INITIAL INPUT (What user provides)');
  log('═'.repeat(100));
  log(JSON.stringify(initialInput, null, 2));
  
  // STEP 1: Research
  log('\n\n' + '═'.repeat(100));
  log('🔍 STEP 1: RESEARCH');
  log('═'.repeat(100));
  
  log('\n📥 STEP 1 INPUT:');
  log(JSON.stringify(initialInput, null, 2));
  
  const step1Result = await researchTool.execute({
    context: {
      topic: initialInput.topic,
      depth: initialInput.depth,
      numFindings: initialInput.numFindings,
    },
    runtimeContext,
  });
  
  const step1Output = {
    topic: initialInput.topic,
    researchData: {
      findings: step1Result.findings,
      keyInsights: step1Result.keyInsights,
      statistics: step1Result.statistics || [],
      examples: step1Result.examples || [],
    },
  };
  
  log('\n📤 STEP 1 OUTPUT:');
  log(JSON.stringify(step1Output, null, 2));
  log(`\n✅ Generated ${step1Result.findings.length} findings, ${step1Result.keyInsights.length} insights`);
  
  // STEP 2: Write Draft
  log('\n\n' + '═'.repeat(100));
  log('✍️ STEP 2: WRITE DRAFT');
  log('═'.repeat(100));
  
  log('\n📥 STEP 2 INPUT (from Step 1 output):');
  log(JSON.stringify(step1Output, null, 2));
  
  const prompt = `Write a comprehensive blog post about "${step1Output.topic}" using this research:

Key Insights:
${step1Output.researchData.keyInsights.map(i => `- ${i}`).join('\n')}

Statistics:
${step1Output.researchData.statistics.map(s => `- ${s}`).join('\n')}

Examples:
${step1Output.researchData.examples.map(e => `- ${e}`).join('\n')}

Create a well-structured blog post with:
- A compelling hook
- Clear introduction
- 3-4 main sections with headings
- Specific examples and data
- Strong conclusion with call-to-action

Write in markdown format with proper headings (##, ###).`;
  
  log('\n📝 PROMPT SENT TO WRITER AGENT (first 300 chars):');
  log(prompt.substring(0, 300) + '...\n');
  
  const step2Result = await writerAgent.generate(prompt);
  
  const step2Output = {
    topic: step1Output.topic,
    draftContent: step2Result.text,
  };
  
  log('\n📤 STEP 2 OUTPUT:');
  log('Topic: ' + step2Output.topic);
  log('Draft length: ' + step2Output.draftContent.length + ' characters');
  log('Draft preview (first 400 chars):');
  log(step2Output.draftContent.substring(0, 400) + '...\n');
  
  // STEP 3: Edit
  log('\n\n' + '═'.repeat(100));
  log('✏️ STEP 3: EDIT DRAFT');
  log('═'.repeat(100));
  
  log('\n📥 STEP 3 INPUT (from Step 2 output):');
  log('Topic: ' + step2Output.topic);
  log('Content to edit: ' + step2Output.draftContent.length + ' characters\n');
  
  const step3Result = await editingTool.execute({
    context: {
      content: step2Output.draftContent,
      focusAreas: ['grammar', 'clarity', 'style'],
    },
    runtimeContext,
  });
  
  const step3Output = {
    topic: step2Output.topic,
    editedContent: step3Result.editedContent,
    improvementScore: step3Result.improvementScore,
  };
  
  log('\n📤 STEP 3 OUTPUT:');
  log('Topic: ' + step3Output.topic);
  log('Issues found: ' + step3Result.issues.length);
  log('Changes made: ' + JSON.stringify(step3Result.changesMade));
  log('Improvement score: ' + step3Output.improvementScore + '/100');
  log('Edited content length: ' + step3Output.editedContent.length + ' characters\n');
  
  // STEP 4: Format
  log('\n\n' + '═'.repeat(100));
  log('📄 STEP 4: FORMAT AND EXPORT');
  log('═'.repeat(100));
  
  log('\n📥 STEP 4 INPUT (from Step 3 output):');
  log('Topic: ' + step3Output.topic);
  log('Content to format: ' + step3Output.editedContent.length + ' characters');
  log('Improvement score: ' + step3Output.improvementScore + '/100\n');
  
  const step4Result = await formattingTool.execute({
    context: {
      content: step3Output.editedContent,
      title: step3Output.topic,
      metadata: {
        author: 'Blog Network Agent',
        date: new Date().toISOString().split('T')[0],
        category: 'Generated Content',
        tags: [step3Output.topic.toLowerCase()],
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
  
  const finalOutput = {
    topic: step3Output.topic,
    finalContent: step4Result.content,
    exportPath: step4Result.exportPath || 'not-saved',
    wordCount: step4Result.wordCount,
    readingTime: step4Result.readingTime,
    summary: {
      improvementScore: step3Output.improvementScore,
      finalWordCount: step4Result.wordCount,
    },
  };
  
  log('\n📤 STEP 4 OUTPUT (FINAL):');
  log(JSON.stringify(finalOutput, null, 2));
  
  // Data transformation summary
  log('\n\n' + '═'.repeat(100));
  log('📊 DATA TRANSFORMATION THROUGH PIPELINE');
  log('═'.repeat(100));
  
  log(`
┌─────────────────────────────────────────────────────────────────┐
│ INITIAL INPUT                                                    │
├─────────────────────────────────────────────────────────────────┤
│ { topic: "Benefits of TypeScript", depth: "moderate", ... }     │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ AFTER STEP 1 (Research)                                          │
├─────────────────────────────────────────────────────────────────┤
│ {                                                                │
│   topic: "Benefits of TypeScript",                              │
│   researchData: {                                               │
│     findings: [${step1Result.findings.length} items],                                       │
│     keyInsights: [${step1Result.keyInsights.length} items],                                 │
│     statistics: [${(step1Result.statistics || []).length} items]                                        │
│   }                                                              │
│ }                                                                │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ AFTER STEP 2 (Write)                                             │
├─────────────────────────────────────────────────────────────────┤
│ {                                                                │
│   topic: "Benefits of TypeScript",                              │
│   draftContent: "${step2Output.draftContent.length} characters of blog content"     │
│ }                                                                │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ AFTER STEP 3 (Edit)                                              │
├─────────────────────────────────────────────────────────────────┤
│ {                                                                │
│   topic: "Benefits of TypeScript",                              │
│   editedContent: "${step3Output.editedContent.length} chars (${step3Result.changesMade.length} changes made)",    │
│   improvementScore: ${step3Output.improvementScore}                                        │
│ }                                                                │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ AFTER STEP 4 (Format) - FINAL OUTPUT                             │
├─────────────────────────────────────────────────────────────────┤
│ {                                                                │
│   topic: "Benefits of TypeScript",                              │
│   finalContent: "Full markdown with frontmatter",               │
│   exportPath: "${finalOutput.exportPath}",                      │
│   wordCount: ${finalOutput.wordCount},                                              │
│   readingTime: "${finalOutput.readingTime}"                                │
│ }                                                                │
└──────────────────────────────────────────────────────────────────┘
  `);
  
  log('\n🎓 KEY LEARNINGS:');
  log('─'.repeat(100));
  log('1. RuntimeContext = Just an object that travels through steps (like dependency injection)');
  log('2. Each step TRANSFORMS data (adds/modifies fields)');
  log('3. Output schema MUST match next step\'s input schema');
  log('4. Step 1 & 4: Tools called directly (mechanical tasks, fast, no LLM)');
  log('5. Step 2 & 3: Agents called (creative/intelligent tasks, use LLM)');
  log('   - Step 2: writerAgent (creates content)');
  log('   - Step 3: editorAgent (fixes issues intelligently)');
  log('6. Data flows like water through pipes: Input → Transform → Output → Next Input');
  log('7. TWO LLM agents working together = Higher quality output!');
  log('═'.repeat(100));
  log('✅ NOW YOU UNDERSTAND WORKFLOWS!\n');
  
  // Save to file
  const logFilePath = path.join(process.cwd(), 'workflow-execution-log.txt');
  const logContent = logEntries.join('\n');
  
  fs.writeFileSync(logFilePath, logContent, 'utf-8');
  
  console.log('\n' + '═'.repeat(100));
  console.log('💾 LOG SAVED TO FILE');
  console.log('═'.repeat(100));
  console.log(`📄 File: ${logFilePath}`);
  console.log(`📊 Size: ${logContent.length} characters`);
  console.log(`📝 Lines: ${logEntries.length}`);
  console.log('\n✅ You can now read the complete execution log in:');
  console.log('   workflow-execution-log.txt\n');
}

superDetailedTest().catch(console.error);

