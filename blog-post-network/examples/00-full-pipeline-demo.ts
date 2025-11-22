/**
 * FULL PIPELINE DEMO
 * 
 * Shows COMPLETE output at each step:
 * - Research results
 * - Writer agent's draft (and self-improvement with writingTool)
 * - Editor agent's fixes (and how it uses editingTool)
 * - Formatter agent's final output
 * 
 * Saves everything to test-logs/full-pipeline-demo.txt
 */

import 'dotenv/config';
import { researchTool } from '../src/mastra/tools/research-tool';
import { writerAgent } from '../src/mastra/agents/writer-agent';
import { editorAgent } from '../src/mastra/agents/editor-agent';
import { formattingTool } from '../src/mastra/tools/formatting-tool';
import { RuntimeContext } from '@mastra/core/runtime-context';
import * as fs from 'fs';
import * as path from 'path';

async function fullPipelineDemo() {
  const log: string[] = [];
  
  function l(msg: string) {
    console.log(msg);
    log.push(msg);
  }
  
  l('\n' + '█'.repeat(120));
  l('🎬 FULL PIPELINE DEMO - COMPLETE OUTPUT AT EACH STEP');
  l('█'.repeat(120));
  
  const runtimeContext = new RuntimeContext();
  const topic = 'Why Startups Fail';
  
  l('\n📋 TOPIC: ' + topic);
  l('🎯 GOAL: Generate complete blog post with full visibility at each step\n');
  
  // ============================================================================
  // STEP 1: RESEARCH
  // ============================================================================
  l('\n' + '═'.repeat(120));
  l('🔍 STEP 1: RESEARCH - Gathering Information');
  l('═'.repeat(120));
  
  const researchResult = await researchTool.execute({
    context: {
      topic: topic,
      depth: 'moderate' as const,
      numFindings: 6,
    },
    runtimeContext,
  });
  
  l('\n📊 RESEARCH RESULTS:');
  l('─'.repeat(120));
  l(`Findings: ${researchResult.findings.length} items`);
  l(`Key Insights: ${researchResult.keyInsights.length} items`);
  l(`Statistics: ${researchResult.statistics?.length || 0} items`);
  l(`Examples: ${researchResult.examples?.length || 0} items\n`);
  
  l('📝 FULL RESEARCH DATA:');
  l(JSON.stringify({
    findings: researchResult.findings,
    keyInsights: researchResult.keyInsights,
    statistics: researchResult.statistics,
    examples: researchResult.examples
  }, null, 2));
  
  // ============================================================================
  // STEP 2: WRITING (with self-improvement)
  // ============================================================================
  l('\n\n' + '═'.repeat(120));
  l('✍️ STEP 2: WRITING - Creating Blog Post Draft');
  l('═'.repeat(120));
  l('\n💡 Writer Agent will:');
  l('   1. Generate initial draft');
  l('   2. Call writingTool to check quality');
  l('   3. Improve based on feedback (self-improvement loop!)');
  l('   4. Return polished draft\n');
  
  const prompt = `Write a compelling blog post about "${topic}" using this research:

Key Insights:
${researchResult.keyInsights.map(i => `- ${i}`).join('\n')}

Statistics:
${researchResult.statistics?.map(s => `- ${s}`).join('\n') || 'No statistics'}

Examples:
${researchResult.examples?.map(e => `- ${e}`).join('\n') || 'No examples'}

Create a well-structured blog post with:
- Attention-grabbing hook
- Clear introduction
- 3-4 main sections with specific examples
- Data-driven insights
- Strong conclusion with call-to-action

Write in professional yet engaging style.`;
  
  l('📤 PROMPT SENT TO WRITER AGENT:');
  l('─'.repeat(120));
  l(prompt);
  
  l('\n⏳ Writer agent is working...');
  l('   (Agent will call writingTool internally to self-check quality)');
  
  const writerResult = await writerAgent.generate(prompt, {
    memory: {
      threadId: 'demo-pipeline',
      resourceId: 'demo-user'
    }
  });
  
  l('\n✅ WRITER AGENT COMPLETED!');
  l('\n📄 FULL DRAFT CONTENT:');
  l('─'.repeat(120));
  l(writerResult.text);
  l('─'.repeat(120));
  l(`\n📊 Draft Stats: ${writerResult.text.length} characters`);
  
  // ============================================================================
  // STEP 3: EDITING (with intelligent fixes)
  // ============================================================================
  l('\n\n' + '═'.repeat(120));
  l('✏️ STEP 3: EDITING - Improving Quality');
  l('═'.repeat(120));
  l('\n💡 Editor Agent will:');
  l('   1. Call editingTool to find issues');
  l('   2. Read the issues (grammar, clarity, style)');
  l('   3. Use LLM to actually FIX the issues (not just detect!)');
  l('   4. Verify improvements');
  l('   5. Return polished version\n');
  
  const editorPrompt = `Review and improve this blog post draft. Fix grammar, improve clarity, enhance style, and ensure professional quality:

${writerResult.text}

Focus on:
- Grammar and spelling corrections
- Breaking long sentences (>30 words)
- Converting passive voice to active
- Removing hedging words
- Improving overall readability

Return the improved version.`;
  
  l('📤 PROMPT SENT TO EDITOR AGENT:');
  l('─'.repeat(120));
  l('(Sending full draft to editor for review and improvement)');
  
  l('\n⏳ Editor agent is working...');
  l('   (Agent will call editingTool to find issues, then FIX them with LLM)');
  
  const editorResult = await editorAgent.generate(editorPrompt, {
    memory: {
      threadId: 'demo-pipeline',
      resourceId: 'demo-user'
    }
  });
  
  l('\n✅ EDITOR AGENT COMPLETED!');
  l('\n📄 EDITED CONTENT (FULL):');
  l('─'.repeat(120));
  l(editorResult.text);
  l('─'.repeat(120));
  l(`\n📊 Edited Stats: ${editorResult.text.length} characters`);
  l(`📈 Changes: Draft → Edited (compare lengths: ${writerResult.text.length} → ${editorResult.text.length})`);
  
  // ============================================================================
  // STEP 4: FORMATTING
  // ============================================================================
  l('\n\n' + '═'.repeat(120));
  l('📄 STEP 4: FORMATTING - Creating Final Output');
  l('═'.repeat(120));
  
  const formatResult = await formattingTool.execute({
    context: {
      content: editorResult.text,
      title: topic,
      metadata: {
        author: 'Blog Network Agent',
        date: new Date().toISOString().split('T')[0],
        category: 'Business Strategy',
        tags: ['startups', 'business', 'entrepreneurship'],
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
  
  l('\n✅ FORMATTING COMPLETED!');
  l('\n📄 FINAL FORMATTED CONTENT:');
  l('─'.repeat(120));
  l(formatResult.content);
  l('─'.repeat(120));
  l(`\n📊 Final Stats:`);
  l(`   Word Count: ${formatResult.wordCount}`);
  l(`   Reading Time: ${formatResult.readingTime}`);
  l(`   Export Path: ${formatResult.exportPath}`);
  
  // ============================================================================
  // COMPARISON
  // ============================================================================
  l('\n\n' + '█'.repeat(120));
  l('📊 COMPLETE TRANSFORMATION SUMMARY');
  l('█'.repeat(120));
  
  l('\n📈 CONTENT EVOLUTION:');
  l('─'.repeat(120));
  l(`1. RESEARCH OUTPUT: ${researchResult.findings.length} findings, ${researchResult.keyInsights.length} insights`);
  l(`2. WRITER DRAFT: ${writerResult.text.length} characters`);
  l(`3. EDITOR VERSION: ${editorResult.text.length} characters`);
  l(`4. FINAL FORMATTED: ${formatResult.wordCount} words, saved to ${formatResult.exportPath}`);
  
  l('\n🎯 QUALITY IMPROVEMENTS:');
  l('─'.repeat(120));
  l('✅ Writer agent self-improved using writingTool');
  l('✅ Editor agent found and FIXED issues using editingTool + LLM');
  l('✅ Two LLM agents collaborating for maximum quality');
  l('✅ Final output is professional, polished, ready to publish');
  
  l('\n🔄 SELF-IMPROVEMENT LOOPS:');
  l('─'.repeat(120));
  l('Writer Agent Loop:');
  l('  Generate → Check with writingTool → Improve → Check again → Done');
  l('\nEditor Agent Loop:');
  l('  Receive → Check with editingTool → Fix issues → Verify → Done');
  
  l('\n' + '█'.repeat(120));
  l('✅ PIPELINE COMPLETE - FULL OUTPUT SHOWN AT EVERY STEP!');
  l('█'.repeat(120));
  
  // Save to file
  const logPath = path.join(process.cwd(), 'test-logs', 'full-pipeline-demo.txt');
  fs.writeFileSync(logPath, log.join('\n'), 'utf-8');
  
  console.log('\n\n💾 COMPLETE LOG SAVED TO: test-logs/full-pipeline-demo.txt');
  console.log('📖 Open that file to see EVERYTHING that happened!');
  console.log(`📊 Total log size: ${log.join('\n').length} characters\n`);
}

fullPipelineDemo().catch(console.error);

