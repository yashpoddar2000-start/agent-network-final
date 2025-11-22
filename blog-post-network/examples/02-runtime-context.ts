/**
 * Understanding RuntimeContext vs Data Flow
 * 
 * This shows the DIFFERENCE between:
 * - How data flows between steps (return values)
 * - What runtimeContext is used for (shared context)
 */

import 'dotenv/config';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { researchTool } from '../src/mastra/tools/research-tool';
import * as fs from 'fs';
import * as path from 'path';

async function understandRuntimeContext() {
  const log: string[] = [];
  
  function l(msg: string) {
    console.log(msg);
    log.push(msg);
  }
  
  l('\n' + '═'.repeat(100));
  l('🎓 UNDERSTANDING: RuntimeContext vs Data Flow');
  l('═'.repeat(100));
  
  // Create runtime context
  const runtimeContext = new RuntimeContext();
  
  l('\n📦 RUNTIME CONTEXT - INITIAL STATE:');
  l('─'.repeat(100));
  l('Type: ' + typeof runtimeContext);
  l('Constructor: ' + runtimeContext.constructor.name);
  l('Keys: ' + JSON.stringify(Object.keys(runtimeContext)));
  l('Is it empty? ' + (Object.keys(runtimeContext).length === 1 ? 'YES (just registry key)' : 'NO'));
  l('Full object: ' + JSON.stringify(runtimeContext, null, 2));
  
  l('\n💡 KEY INSIGHT:');
  l('RuntimeContext starts mostly EMPTY!');
  l('It\'s just a container you CAN use, not one that HAS data by default.\n');
  
  // Simulate Step 1
  l('\n' + '═'.repeat(100));
  l('STEP 1: Research');
  l('═'.repeat(100));
  
  const step1Input = {
    topic: 'TypeScript',
    depth: 'moderate' as const,
    numFindings: 3,
  };
  
  l('\n📥 Step 1 INPUT (from user):');
  l(JSON.stringify(step1Input, null, 2));
  
  l('\n📦 RuntimeContext BEFORE Step 1:');
  l(JSON.stringify(runtimeContext, null, 2));
  l('(Empty - no data yet)');
  
  // Execute step 1
  const step1Result = await researchTool.execute({
    context: step1Input,
    runtimeContext,  // Passed to tool
  });
  
  const step1Output = {
    topic: step1Input.topic,
    researchData: {
      findings: step1Result.findings,
      keyInsights: step1Result.keyInsights,
    },
  };
  
  l('\n📤 Step 1 OUTPUT (returned):');
  l(JSON.stringify(step1Output, null, 2));
  
  l('\n📦 RuntimeContext AFTER Step 1:');
  l(JSON.stringify(runtimeContext, null, 2));
  l('(Still mostly empty - step didn\'t modify it)');
  
  l('\n💡 KEY INSIGHT:');
  l('Step 1 OUTPUT is stored in step1Output variable, NOT in runtimeContext!');
  l('RuntimeContext is passed TO the tool, but doesn\'t store the result.\n');
  
  // Simulate Step 2
  l('\n' + '═'.repeat(100));
  l('STEP 2: Writing');
  l('═'.repeat(100));
  
  l('\n📥 Step 2 INPUT (HOW does it get data from Step 1?):');
  l('─'.repeat(100));
  l('WRONG WAY (not how it works):');
  l('  ❌ Read from runtimeContext');
  l('  ❌ Global variable');
  l('  ❌ Database lookup\n');
  l('CORRECT WAY (how it actually works):');
  l('  ✅ Step 1\'s return value is PASSED as inputData parameter');
  l('  ✅ Workflow engine handles this automatically with .then()');
  l('  ✅ No magic, just function parameters!\n');
  
  l('Step 2 receives inputData:');
  l(JSON.stringify(step1Output, null, 2));
  l('\n^ This is EXACTLY Step 1\'s output!');
  l('  .then() automatically passed it!\n');
  
  l('\n📦 RuntimeContext during Step 2:');
  l(JSON.stringify(runtimeContext, null, 2));
  l('(Still the same - hasn\'t changed)');
  
  // Show the difference
  l('\n\n' + '═'.repeat(100));
  l('🎯 THE BIG DIFFERENCE');
  l('═'.repeat(100));
  
  l(`
┌─────────────────────────────────────────────────────────────────┐
│ HOW DATA FLOWS BETWEEN STEPS (The Pipeline)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: execute({ inputData })                                 │
│    ↓                                                             │
│  return { topic, researchData }  ← RETURN VALUE                 │
│    ↓                                                             │
│  [.then() magic happens]                                        │
│    ↓                                                             │
│  Step 2: execute({ inputData })                                 │
│           ↑                                                      │
│           inputData = Step 1's return value!                    │
│    ↓                                                             │
│  return { topic, draftContent }  ← RETURN VALUE                 │
│    ↓                                                             │
│  [.then() magic happens]                                        │
│    ↓                                                             │
│  Step 3: execute({ inputData })                                 │
│           ↑                                                      │
│           inputData = Step 2's return value!                    │
│                                                                  │
│  This is FUNCTION COMPOSITION - simple CS concept!              │
│  result1 = step1(input)                                         │
│  result2 = step2(result1)  ← Step 2 gets Step 1's result       │
│  result3 = step3(result2)  ← Step 3 gets Step 2's result       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ WHAT RUNTIME CONTEXT IS FOR                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  RuntimeContext = Shared container (like global state)          │
│                                                                  │
│  Used for:                                                       │
│  ✅ Passing to tools/agents (they might need it)                │
│  ✅ Dependency injection (services, config)                     │
│  ✅ Shared metadata (user ID, session info)                     │
│  ✅ Custom context data (if you add it)                         │
│                                                                  │
│  NOT used for:                                                   │
│  ❌ Passing data between steps (use return values!)             │
│  ❌ Pipeline data transformation                                │
│                                                                  │
│  Example use case:                                               │
│  runtimeContext.set('userId', 'raghav')                         │
│  → All steps can access userId                                  │
│  → But step data still flows through returns                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
  `);
  
  l('\n🎓 SUMMARY:');
  l('─'.repeat(100));
  l('1. Data flows through RETURN VALUES (inputData parameter)');
  l('2. RuntimeContext is a SHARED CONTAINER (global-ish state)');
  l('3. .then() automatically passes return → next inputData');
  l('4. RuntimeContext travels alongside but doesn\'t hold step data');
  l('5. Think: Pipeline data vs Backpack that follows the pipeline');
  l('═'.repeat(100));
  l('✅ NOW YOU UNDERSTAND THE DIFFERENCE!\n');
  
  // Save
  const logPath = path.join(process.cwd(), 'runtime-context-explained.txt');
  fs.writeFileSync(logPath, log.join('\n'), 'utf-8');
  
  console.log('\n💾 Saved to: runtime-context-explained.txt');
  console.log('📖 Read this file to understand the difference!\n');
}

understandRuntimeContext().catch(console.error);

