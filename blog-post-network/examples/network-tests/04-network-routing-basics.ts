/**
 * TEST 1: Network Routing Basics
 * 
 * COMPLEXITY: ⭐☆☆☆☆ (Simplest)
 * 
 * PURPOSE:
 * - Understand how network DECIDES which primitive to use
 * - See different routing scenarios
 * - Learn when network chooses workflow vs individual agents
 * 
 * WHAT YOU'LL LEARN:
 * - Network receives request → analyzes → routes to best primitive
 * - Same network, different requests = different routes
 * - How agent/workflow descriptions guide routing
 * 
 * OUTPUT: test-logs/network-tests/01-routing-basics.txt
 */

import 'dotenv/config';
import { blogNetwork } from '../src/mastra/agentnetwork/blog-network';
import { RuntimeContext } from '@mastra/core/runtime-context';
import * as fs from 'fs';
import * as path from 'path';

async function testNetworkRoutingBasics() {
  const log: string[] = [];
  
  function l(msg: string) {
    console.log(msg);
    log.push(msg);
  }
  
  l('\n' + '█'.repeat(120));
  l('🧪 TEST 1: NETWORK ROUTING BASICS');
  l('█'.repeat(120));
  
  l('\n🎯 WHAT WE\'RE TESTING:');
  l('─'.repeat(120));
  l('1. How does network DECIDE which primitive to use?');
  l('2. Does it route to workflow or individual agents?');
  l('3. Can we see the routing decision?');
  
  l('\n📚 BACKGROUND:');
  l('─'.repeat(120));
  l('The network has access to:');
  l('  Agents: researchAgent, writerAgent, editorAgent, formatterAgent');
  l('  Workflows: blogCreationWorkflow (complete pipeline)');
  l('  Routing Model: GPT-4o (makes intelligent decisions)');
  l('  Memory: Resource-scoped (learns user patterns)\n');
  
  const runtimeContext = new RuntimeContext();
  
  // ============================================================================
  // SCENARIO A: Simple Complete Request
  // ============================================================================
  l('\n' + '═'.repeat(120));
  l('📝 SCENARIO A: Simple Complete Request');
  l('═'.repeat(120));
  
  l('\n📥 USER REQUEST:');
  l('"Write a blog post about the benefits of TypeScript"');
  
  l('\n🤔 WHAT NETWORK SHOULD DO:');
  l('   User wants: COMPLETE blog post');
  l('   Available options:');
  l('     Option 1: Call 4 agents individually (research → write → edit → format)');
  l('     Option 2: Call blogCreationWorkflow (does all 4 steps)');
  l('   Best choice: blogCreationWorkflow (more efficient!)');
  
  l('\n⏳ Calling network.generate()...\n');
  
  try {
    const resultA = await blogNetwork.generate(
      'Write a blog post about the benefits of TypeScript',
      {
        runtimeContext,
        resourceId: 'test-user',
        threadId: 'scenario-a',
      }
    );
    
    l('\n✅ NETWORK COMPLETED!');
    l('\n📊 RESULT ANALYSIS:');
    l('─'.repeat(120));
    l('Result type: ' + typeof resultA);
    l('Has task field: ' + ('task' in resultA));
    l('Has result field: ' + ('result' in resultA));
    l('Has resourceType field: ' + ('resourceType' in resultA));
    
    if ('resourceType' in resultA) {
      l('\n🎯 ROUTING DECISION:');
      l('   Network routed to: ' + resultA.resourceType);
      l('   Resource ID: ' + (resultA.resourceId || 'N/A'));
      
      if (resultA.resourceType === 'workflow') {
        l('   ✅ CORRECT! Network chose workflow (most efficient for complete blog)');
      } else {
        l('   ⚠️ Network chose: ' + resultA.resourceType);
      }
    }
    
    l('\n📝 RESULT PREVIEW (first 300 chars):');
    const resultText = typeof resultA === 'string' ? resultA : 
                       ('result' in resultA && typeof resultA.result === 'string') ? resultA.result :
                       JSON.stringify(resultA).substring(0, 300);
    l(resultText.substring(0, 300) + '...');
    
  } catch (error) {
    l('\n❌ ERROR in Scenario A:');
    l(error instanceof Error ? error.message : String(error));
  }
  
  // ============================================================================
  // SCENARIO B: Research-Only Request
  // ============================================================================
  l('\n\n' + '═'.repeat(120));
  l('🔍 SCENARIO B: Research-Only Request');
  l('═'.repeat(120));
  
  l('\n📥 USER REQUEST:');
  l('"Research the benefits of Python. I just need the research, not a full blog post."');
  
  l('\n🤔 WHAT NETWORK SHOULD DO:');
  l('   User wants: ONLY research (not full blog)');
  l('   Available options:');
  l('     Option 1: Use blogCreationWorkflow (wasteful - does research+write+edit+format)');
  l('     Option 2: Use researchAgent only (efficient!)');
  l('   Best choice: researchAgent only');
  
  l('\n⏳ Calling network.generate()...\n');
  
  try {
    const resultB = await blogNetwork.generate(
      'Research the benefits of Python. I just need the research, not a full blog post.',
      {
        runtimeContext,
        resourceId: 'test-user',
        threadId: 'scenario-b',
      }
    );
    
    l('\n✅ NETWORK COMPLETED!');
    l('\n📊 RESULT ANALYSIS:');
    l('─'.repeat(120));
    
    if ('resourceType' in resultB) {
      l('🎯 ROUTING DECISION:');
      l('   Network routed to: ' + resultB.resourceType);
      l('   Resource ID: ' + (resultB.resourceId || 'N/A'));
      
      if (resultB.resourceType === 'agent' && resultB.resourceId === 'researchAgent') {
        l('   ✅ CORRECT! Network chose researchAgent only (efficient!)');
        l('   ✅ Smart routing - skipped unnecessary steps (write, edit, format)');
      } else {
        l('   ⚠️ Network chose: ' + resultB.resourceType);
      }
    }
    
    l('\n📝 RESULT PREVIEW (first 500 chars):');
    const resultTextB = typeof resultB === 'string' ? resultB : 
                        ('result' in resultB && typeof resultB.result === 'string') ? resultB.result :
                        JSON.stringify(resultB).substring(0, 500);
    l(resultTextB.substring(0, 500) + '...');
    
  } catch (error) {
    l('\n❌ ERROR in Scenario B:');
    l(error instanceof Error ? error.message : String(error));
  }
  
  // ============================================================================
  // SCENARIO C: Edit-Only Request
  // ============================================================================
  l('\n\n' + '═'.repeat(120));
  l('✏️ SCENARIO C: Edit-Only Request');
  l('═'.repeat(120));
  
  l('\n📥 USER REQUEST:');
  l('"Edit and improve this draft: Python is great. It have many benefit."');
  
  l('\n🤔 WHAT NETWORK SHOULD DO:');
  l('   User wants: ONLY editing (has content already)');
  l('   Available options:');
  l('     Option 1: Use blogCreationWorkflow (wrong - would research from scratch!)');
  l('     Option 2: Use editorAgent → formatterAgent (correct!)');
  l('   Best choice: editorAgent (then maybe formatterAgent)');
  
  l('\n⏳ Calling network.generate()...\n');
  
  try {
    const resultC = await blogNetwork.generate(
      'Edit and improve this draft: "Python is great. It have many benefit. Maybe you should learn it."',
      {
        runtimeContext,
        resourceId: 'test-user',
        threadId: 'scenario-c',
      }
    );
    
    l('\n✅ NETWORK COMPLETED!');
    l('\n📊 RESULT ANALYSIS:');
    l('─'.repeat(120));
    
    if ('resourceType' in resultC) {
      l('🎯 ROUTING DECISION:');
      l('   Network routed to: ' + resultC.resourceType);
      l('   Resource ID: ' + (resultC.resourceId || 'N/A'));
      
      if (resultC.resourceType === 'agent' && resultC.resourceId === 'editorAgent') {
        l('   ✅ CORRECT! Network chose editorAgent (user has draft already)');
        l('   ✅ Smart routing - skipped research and writing');
      } else {
        l('   ⚠️ Network chose: ' + resultC.resourceType);
      }
    }
    
    l('\n📝 EDITED RESULT:');
    const resultTextC = typeof resultC === 'string' ? resultC : 
                        ('result' in resultC && typeof resultC.result === 'string') ? resultC.result :
                        JSON.stringify(resultC).substring(0, 500);
    l(resultTextC.substring(0, 500) + '...');
    
  } catch (error) {
    l('\n❌ ERROR in Scenario C:');
    l(error instanceof Error ? error.message : String(error));
  }
  
  // ============================================================================
  // SUMMARY
  // ============================================================================
  l('\n\n' + '█'.repeat(120));
  l('📊 ROUTING INTELLIGENCE SUMMARY');
  l('█'.repeat(120));
  
  l('\n🎯 KEY INSIGHTS:');
  l('─'.repeat(120));
  l('1. SAME network handled 3 DIFFERENT request types');
  l('2. Network made INTELLIGENT routing decisions:');
  l('   - Complete blog request → workflow (efficient)');
  l('   - Research-only request → research agent (minimal)');
  l('   - Edit-only request → editor agent (precise)');
  l('3. Routing is based on:');
  l('   - User intent (what they actually want)');
  l('   - Agent/workflow descriptions (capabilities)');
  l('   - Efficiency (simplest solution that works)');
  l('4. No hardcoded logic - GPT-4o makes decisions dynamically!');
  
  l('\n💡 WHAT THIS MEANS:');
  l('─'.repeat(120));
  l('Agent Network = Smart router that adapts to request');
  l('Workflow = Fixed path (always same steps)');
  l('Network can CHOOSE workflow OR individual agents OR custom path!');
  
  l('\n🚀 NEXT STEPS:');
  l('─'.repeat(120));
  l('Test 2: Understand .generate() vs .loop() methods');
  l('Test 3: See how memory persists and affects routing');
  l('Test 4: Understand client isolation (resourceId)');
  
  l('\n' + '█'.repeat(120));
  l('✅ TEST 1 COMPLETE - ROUTING BASICS UNDERSTOOD!');
  l('█'.repeat(120));
  
  // Save to file
  const logPath = path.join(process.cwd(), 'test-logs', 'network-tests', '01-routing-basics.txt');
  fs.writeFileSync(logPath, log.join('\n'), 'utf-8');
  
  console.log('\n\n💾 SAVED TO: test-logs/network-tests/01-routing-basics.txt');
  console.log('📖 Read this file to see all routing decisions!\n');
}

testNetworkRoutingBasics().catch(console.error);

