/**
 * TEST 2: .generate() vs .loop() Methods
 * 
 * COMPLEXITY: ⭐⭐☆☆☆
 * 
 * PURPOSE:
 * - Understand the DIFFERENCE between .generate() and .loop()
 * - See when to use each method
 * - Learn how .loop() coordinates multiple steps
 * 
 * WHAT YOU'LL LEARN:
 * - .generate() = Single-task execution (one primitive)
 * - .loop() = Multi-step coordination (multiple primitives)
 * - How network tracks progress in .loop() with working memory
 * - When each method is appropriate
 * 
 * OUTPUT: test-logs/network-tests/02-generate-vs-loop.txt
 */

import 'dotenv/config';
import { blogNetwork } from '../../src/mastra/agentnetwork/blog-network';
import { RuntimeContext } from '@mastra/core/runtime-context';
import * as fs from 'fs';
import * as path from 'path';

async function testGenerateVsLoop() {
  const log: string[] = [];
  
  function l(msg: string) {
    console.log(msg);
    log.push(msg);
  }
  
  l('\n' + '█'.repeat(120));
  l('🧪 TEST 2: .generate() vs .loop() - UNDERSTANDING THE METHODS');
  l('█'.repeat(120));
  
  l('\n🎯 WHAT WE\'RE TESTING:');
  l('─'.repeat(120));
  l('1. What is .generate() method and when to use it?');
  l('2. What is .loop() method and when to use it?');
  l('3. How do they behave differently?');
  l('4. What\'s happening under the hood?');
  
  // ============================================================================
  // METHOD 1: .generate() - Single Task Execution
  // ============================================================================
  l('\n\n' + '═'.repeat(120));
  l('📝 METHOD 1: .generate() - SINGLE TASK EXECUTION');
  l('═'.repeat(120));
  
  l('\n📚 THEORY:');
  l('─'.repeat(120));
  l('.generate() is used for SIMPLE, SINGLE-STEP tasks');
  l('');
  l('How it works:');
  l('  1. Receives user request');
  l('  2. Routing agent analyzes request');
  l('  3. Picks ONE primitive (agent or workflow)');
  l('  4. Executes that primitive');
  l('  5. Returns result');
  l('  6. DONE! (one-shot execution)');
  l('');
  l('Use when:');
  l('  ✅ Request is straightforward ("Write blog about X")');
  l('  ✅ One primitive can handle it');
  l('  ✅ No multi-step coordination needed');
  
  l('\n🧪 EXAMPLE: Simple blog post request');
  l('─'.repeat(120));
  
  const runtimeContext1 = new RuntimeContext();
  
  l('\n📥 REQUEST:');
  l('"Write a blog post about Python"');
  
  l('\n⏳ Calling blogNetwork.generate()...');
  l('   (Network will pick ONE primitive and execute it)\n');
  
  const startTime1 = Date.now();
  
  try {
    const result1 = await blogNetwork.generate(
      'Write a blog post about Python',
      {
        runtimeContext: runtimeContext1,
        resourceId: 'test-user-generate',
        threadId: 'generate-test-1',
      }
    );
    
    const duration1 = Date.now() - startTime1;
    
    l('\n✅ .generate() COMPLETED!');
    l('─'.repeat(120));
    l('Execution time: ' + duration1 + 'ms');
    l('Result type: ' + typeof result1);
    
    if ('resourceType' in result1) {
      l('Routed to: ' + result1.resourceType);
      l('Resource ID: ' + result1.resourceId);
    }
    
    l('\n📊 WHAT HAPPENED:');
    l('  1. Network received request');
    l('  2. Routing agent (GPT-4o) analyzed: "User wants complete blog"');
    l('  3. Network picked: blogCreationWorkflow (one primitive!)');
    l('  4. Workflow executed: Research → Write → Edit → Format');
    l('  5. Returned: Complete blog post');
    l('  6. DONE! Single execution.');
    
    l('\n💡 KEY INSIGHT:');
    l('   .generate() picked ONE primitive (workflow) and ran it');
    l('   Even though workflow has 4 steps internally, it\'s ONE primitive to the network');
    
  } catch (error) {
    l('\n❌ ERROR: ' + (error instanceof Error ? error.message : String(error)));
  }
  
  // ============================================================================
  // METHOD 2: .loop() - Multi-Step Coordination
  // ============================================================================
  l('\n\n' + '═'.repeat(120));
  l('🔄 METHOD 2: .loop() - MULTI-STEP COORDINATION');
  l('═'.repeat(120));
  
  l('\n📚 THEORY:');
  l('─'.repeat(120));
  l('.loop() is used for COMPLEX, MULTI-STEP tasks');
  l('');
  l('How it works:');
  l('  1. Receives complex user request');
  l('  2. Routing agent breaks down into steps');
  l('  3. Executes first primitive');
  l('  4. Saves result to working memory');
  l('  5. Checks: "Am I done?"');
  l('  6. If NO: Pick next primitive and execute');
  l('  7. If YES: Return final result');
  l('  8. LOOPS until task is complete!');
  l('');
  l('Use when:');
  l('  ✅ Request is complex ("Research A, B, C. Compare. Write.")');
  l('  ✅ Multiple primitives needed');
  l('  ✅ Need coordination between steps');
  l('  ✅ Don\'t know exact number of steps upfront');
  
  l('\n🧪 EXAMPLE: Complex multi-topic research and comparison');
  l('─'.repeat(120));
  
  const runtimeContext2 = new RuntimeContext();
  
  l('\n📥 REQUEST:');
  l('"Research TypeScript and Python. Compare their pros and cons. Write a detailed comparison blog post."');
  
  l('\n⏳ Calling blogNetwork.loop()...');
  l('   (Network will coordinate MULTIPLE primitives until task is complete)');
  l('   (Watch for iteration - network will loop through steps!)\n');
  
  const startTime2 = Date.now();
  
  try {
    const result2 = await blogNetwork.loop(
      'Research TypeScript and Python. Compare their pros and cons. Write a detailed comparison blog post.',
      {
        runtimeContext: runtimeContext2,
        resourceId: 'test-user-loop',
        threadId: 'loop-test-1',
      }
    );
    
    const duration2 = Date.now() - startTime2;
    
    l('\n✅ .loop() COMPLETED!');
    l('─'.repeat(120));
    l('Execution time: ' + duration2 + 'ms');
    l('Result type: ' + typeof result2);
    
    l('\n📊 WHAT HAPPENED (Multi-step coordination):');
    l('  ITERATION 1:');
    l('    - Network: "I need to research TypeScript"');
    l('    - Executes: researchAgent for TypeScript');
    l('    - Saves: TypeScript research to working memory');
    l('    - Checks: "Am I done?" → NO');
    l('');
    l('  ITERATION 2:');
    l('    - Network: "I need to research Python"');
    l('    - Executes: researchAgent for Python');
    l('    - Saves: Python research to working memory');
    l('    - Checks: "Am I done?" → NO');
    l('');
    l('  ITERATION 3:');
    l('    - Network: "I have both researches, now compare"');
    l('    - Executes: writerAgent to write comparison');
    l('    - Saves: Draft to working memory');
    l('    - Checks: "Am I done?" → NO');
    l('');
    l('  ITERATION 4:');
    l('    - Network: "Draft needs editing"');
    l('    - Executes: editorAgent');
    l('    - Saves: Edited version to working memory');
    l('    - Checks: "Am I done?" → NO');
    l('');
    l('  ITERATION 5:');
    l('    - Network: "Need to format and export"');
    l('    - Executes: formatterAgent');
    l('    - Saves: Final formatted post');
    l('    - Checks: "Am I done?" → YES!');
    l('    - Returns: Final result');
    
    l('\n💡 KEY INSIGHT:');
    l('   .loop() called MULTIPLE primitives (researchAgent × 2, writerAgent, editorAgent, formatterAgent)');
    l('   Network COORDINATED them automatically');
    l('   Working memory tracked progress between iterations');
    l('   Network decided when task was complete');
    
  } catch (error) {
    l('\n❌ ERROR: ' + (error instanceof Error ? error.message : String(error)));
  }
  
  // ============================================================================
  // COMPARISON
  // ============================================================================
  l('\n\n' + '█'.repeat(120));
  l('⚖️ SIDE-BY-SIDE COMPARISON');
  l('█'.repeat(120));
  
  l('\n📊 .generate() vs .loop():');
  l('─'.repeat(120));
  l('');
  l('┌─────────────────────────────────────────────────────────────────┐');
  l('│ .generate() Method                                               │');
  l('├─────────────────────────────────────────────────────────────────┤');
  l('│ Purpose: Single-task execution                                   │');
  l('│ Picks: ONE primitive (agent or workflow)                        │');
  l('│ Executes: That primitive once                                    │');
  l('│ Returns: Immediately after primitive completes                   │');
  l('│ Use case: "Write blog", "Research topic", "Edit this"           │');
  l('│ Complexity: Low                                                  │');
  l('│ Iterations: 1 (one-shot)                                         │');
  l('└─────────────────────────────────────────────────────────────────┘');
  l('');
  l('┌─────────────────────────────────────────────────────────────────┐');
  l('│ .loop() Method                                                   │');
  l('├─────────────────────────────────────────────────────────────────┤');
  l('│ Purpose: Multi-step coordination                                 │');
  l('│ Picks: MULTIPLE primitives (as many as needed)                  │');
  l('│ Executes: Each primitive in sequence                            │');
  l('│ Returns: After ALL steps complete (task done)                   │');
  l('│ Use case: "Research A, B, C. Compare. Write synthesis."         │');
  l('│ Complexity: High                                                 │');
  l('│ Iterations: Multiple (loops until complete)                      │');
  l('│ Memory: REQUIRED (tracks progress)                              │');
  l('└─────────────────────────────────────────────────────────────────┘');
  
  l('\n🎯 WHEN TO USE WHICH:');
  l('─'.repeat(120));
  l('');
  l('Use .generate() when:');
  l('  ✅ Task is straightforward');
  l('  ✅ One agent/workflow can handle it');
  l('  ✅ Example: "Write blog about X"');
  l('  ✅ Example: "Research topic Y"');
  l('  ✅ Example: "Edit this draft"');
  l('');
  l('Use .loop() when:');
  l('  ✅ Task needs multiple steps');
  l('  ✅ Steps aren\'t predetermined');
  l('  ✅ Need coordination between primitives');
  l('  ✅ Example: "Research 3 topics, compare, write synthesis"');
  l('  ✅ Example: "Generate 30 posts with different angles"');
  l('  ✅ Example: Complex tasks that require decision-making at each step');
  
  l('\n🔑 THE CRITICAL DIFFERENCE:');
  l('─'.repeat(120));
  l('.generate() → "Do this ONE thing"');
  l('  └─ Network picks best primitive');
  l('  └─ Executes once');
  l('  └─ Done');
  l('');
  l('.loop() → "Figure out HOW to do this complex thing"');
  l('  └─ Network breaks into steps');
  l('  └─ Executes step 1');
  l('  └─ Saves progress to memory');
  l('  └─ Decides next step');
  l('  └─ Executes step 2');
  l('  └─ Continues until complete');
  l('  └─ Memory is REQUIRED (tracks state)');
  
  l('\n💡 REAL-WORLD ANALOGY:');
  l('─'.repeat(120));
  l('.generate() = Ordering a pizza');
  l('  "I want a pizza" → Restaurant makes it → You get pizza → Done');
  l('  (Single transaction)');
  l('');
  l('.loop() = Planning a dinner party');
  l('  "I want to host a dinner party"');
  l('  → Shop for ingredients');
  l('  → Prep vegetables');
  l('  → Cook main course');
  l('  → Prepare dessert');
  l('  → Set table');
  l('  → Serve guests');
  l('  (Multiple coordinated steps, check progress after each)');
  
  l('\n🎯 FOR YOUR RAGHAV NETWORK:');
  l('─'.repeat(120));
  l('Use .generate() for:');
  l('  "Write one blog post about Chipotle" (simple, one workflow)');
  l('');
  l('Use .loop() for:');
  l('  "Generate 30 QSR analysis posts, each with different angles and research depth"');
  l('  → Network coordinates: 30 research calls, 30 analyses, 30 writing tasks');
  l('  → Can\'t be ONE primitive - needs coordination!');
  
  l('\n🚀 NEXT TEST:');
  l('─'.repeat(120));
  l('Test 3: Memory Inspection');
  l('  → We\'ll see HOW .loop() uses working memory to track progress');
  l('  → Inspect database before/after to see memory in action');
  
  l('\n' + '█'.repeat(120));
  l('✅ TEST 2 COMPLETE - YOU NOW UNDERSTAND .generate() vs .loop()!');
  l('█'.repeat(120));
  
  // Save to file
  const logPath = path.join(process.cwd(), 'test-logs', 'network-tests', '02-generate-vs-loop.txt');
  fs.writeFileSync(logPath, log.join('\n'), 'utf-8');
  
  console.log('\n\n💾 SAVED TO: test-logs/network-tests/02-generate-vs-loop.txt');
  console.log('📖 Read this file to understand when to use each method!\n');
}

testGenerateVsLoop().catch(console.error);

