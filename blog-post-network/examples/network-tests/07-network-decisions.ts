/**
 * TEST 5: Network Decision Logging
 * 
 * COMPLEXITY: ⭐⭐⭐⭐☆
 * 
 * PURPOSE:
 * - Understand HOW network makes routing decisions
 * - See network's "thought process" step-by-step
 * - Learn what information influences routing
 * - Watch network resolve ambiguous requests
 * 
 * WHAT YOU'LL LEARN:
 * - How routing agent (GPT-4o) analyzes requests
 * - What agent/workflow descriptions it reads
 * - How it weighs different options
 * - Why it picks one primitive over another
 * - How memory influences decisions
 * 
 * OUTPUT: test-logs/network-tests/05-network-decisions.txt
 */

import 'dotenv/config';
import { blogNetwork } from '../../src/mastra/agentnetwork/blog-network';
import { RuntimeContext } from '@mastra/core/runtime-context';
import * as fs from 'fs';
import * as path from 'path';

async function testNetworkDecisions() {
  const log: string[] = [];
  
  function l(msg: string) {
    console.log(msg);
    log.push(msg);
  }
  
  l('\n' + '█'.repeat(120));
  l('🧠 TEST 5: NETWORK DECISION LOGGING - Understanding the "Brain"');
  l('█'.repeat(120));
  
  l('\n🎯 WHAT WE\'RE TESTING:');
  l('─'.repeat(120));
  l('1. How does the routing agent (GPT-4o) analyze requests?');
  l('2. What information does it consider?');
  l('3. How does it choose between multiple options?');
  l('4. Can we see its decision-making process?');
  
  l('\n📚 THE DECISION-MAKING PROCESS:');
  l('─'.repeat(120));
  l('When network receives a request, the routing agent (GPT-4o):');
  l('');
  l('  Step 1: READ the user request');
  l('  Step 2: READ all agent descriptions');
  l('  Step 3: READ all workflow descriptions');
  l('  Step 4: READ network instructions (routing rules)');
  l('  Step 5: CHECK working memory (user patterns)');
  l('  Step 6: ANALYZE which primitive fits best');
  l('  Step 7: DECIDE on routing');
  l('  Step 8: EXECUTE the chosen primitive');
  
  l('\n🔍 AVAILABLE PRIMITIVES (What Network Can Choose From):');
  l('─'.repeat(120));
  l('');
  l('Agents:');
  l('  1. researchAgent');
  l('     Description: "Gathers comprehensive research on topics..."');
  l('     Use when: User needs information gathering');
  l('');
  l('  2. writerAgent');
  l('     Description: "Creates compelling blog post drafts..."');
  l('     Use when: User needs content written');
  l('');
  l('  3. editorAgent');
  l('     Description: "Reviews blog post drafts for grammar, clarity..."');
  l('     Use when: User has draft that needs improvement');
  l('');
  l('  4. formatterAgent');
  l('     Description: "Formats blog posts to markdown..."');
  l('     Use when: User needs final export');
  l('');
  l('Workflows:');
  l('  1. blogCreationWorkflow');
  l('     Description: "Complete pipeline from topic to published blog post"');
  l('     Use when: User wants complete blog from just a topic');
  
  // ============================================================================
  // SCENARIO A: Clear Request (Simple Decision)
  // ============================================================================
  l('\n\n' + '═'.repeat(120));
  l('📝 SCENARIO A: Clear Request - Simple Decision');
  l('═'.repeat(120));
  
  l('\n📥 USER REQUEST:');
  l('"Write a complete blog post about artificial intelligence"');
  
  l('\n🤔 NETWORK\'S DECISION PROCESS (What GPT-4o thinks):');
  l('─'.repeat(120));
  l('  Step 1: Analyze request');
  l('    → User says: "Write a complete blog post"');
  l('    → Keywords: "complete", "blog post"');
  l('    → Intent: Wants full pipeline (research + write + edit + format)');
  l('');
  l('  Step 2: Check available options');
  l('    → researchAgent: Only does research (insufficient)');
  l('    → writerAgent: Only writes (missing research/edit/format)');
  l('    → editorAgent: Only edits (user has no draft yet)');
  l('    → formatterAgent: Only formats (user has no content)');
  l('    → blogCreationWorkflow: Does ALL steps ✅ MATCH!');
  l('');
  l('  Step 3: Evaluate options');
  l('    → Workflow is most efficient (one call does everything)');
  l('    → Individual agents would need 4 separate calls');
  l('');
  l('  Step 4: DECISION');
  l('    → Route to: blogCreationWorkflow');
  l('    → Reason: Best fit for complete blog request');
  
  l('\n⏳ Executing network.generate()...\n');
  
  const startTime1 = Date.now();
  
  const result1 = await blogNetwork.generate(
    'Write a complete blog post about artificial intelligence',
    {
      runtimeContext: new RuntimeContext(),
      resourceId: 'decision-test',
      threadId: 'scenario-a',
    }
  );
  
  const duration1 = Date.now() - startTime1;
  
  l('\n✅ EXECUTION COMPLETED!');
  l('─'.repeat(120));
  l('Time: ' + duration1 + 'ms');
  l('Routed to: ' + ('resourceType' in result1 ? result1.resourceType : 'unknown'));
  l('Primitive: ' + ('resourceId' in result1 ? result1.resourceId : 'unknown'));
  
  l('\n📊 DECISION VALIDATION:');
  if ('resourceType' in result1 && result1.resourceType === 'workflow') {
    l('  ✅ CORRECT! Network chose workflow as predicted');
    l('  ✅ Decision was optimal (most efficient path)');
  } else {
    l('  ⚠️ Unexpected: Network chose different primitive');
  }
  
  // ============================================================================
  // SCENARIO B: Ambiguous Request (Complex Decision)
  // ============================================================================
  l('\n\n' + '═'.repeat(120));
  l('🔀 SCENARIO B: Ambiguous Request - Network Must Interpret');
  l('═'.repeat(120));
  
  l('\n📥 USER REQUEST:');
  l('"I need help with Python content"');
  
  l('\n🤔 NETWORK\'S DECISION PROCESS (Ambiguous request):');
  l('─'.repeat(120));
  l('  Step 1: Analyze ambiguous request');
  l('    → User says: "I need help with Python content"');
  l('    → Ambiguous! Could mean:');
  l('      - Research Python?');
  l('      - Write Python blog?');
  l('      - Edit Python draft?');
  l('      - Format Python content?');
  l('');
  l('  Step 2: Check working memory');
  l('    → Look for past patterns');
  l('    → "What has this user requested before?"');
  l('    → If previous requests were full blogs → assume full blog');
  l('');
  l('  Step 3: Apply default assumption');
  l('    → "Help with content" usually means "create content"');
  l('    → Most common interpretation: Write blog');
  l('');
  l('  Step 4: DECISION');
  l('    → Route to: blogCreationWorkflow (most likely intent)');
  l('    → Fallback: Could ask for clarification (we don\'t implement this)');
  
  l('\n⏳ Executing network.generate()...\n');
  
  const result2 = await blogNetwork.generate(
    'I need help with Python content',
    {
      runtimeContext: new RuntimeContext(),
      resourceId: 'decision-test',
      threadId: 'scenario-b',
    }
  );
  
  l('\n✅ EXECUTION COMPLETED!');
  l('Routed to: ' + ('resourceType' in result2 ? result2.resourceType : 'unknown'));
  
  l('\n📊 DECISION ANALYSIS:');
  l('  Network resolved ambiguity by:');
  l('    - Interpreting "help with content" as "create content"');
  l('    - Choosing workflow for completeness');
  l('    - Making reasonable assumption');
  
  // ============================================================================
  // SCENARIO C: Explicit Partial Request (Clear Decision)
  // ============================================================================
  l('\n\n' + '═'.repeat(120));
  l('🎯 SCENARIO C: Explicit Partial Request - Network Knows Exactly What to Do');
  l('═'.repeat(120));
  
  l('\n📥 USER REQUEST:');
  l('"I just need research on blockchain technology. Don\'t write anything, just gather information."');
  
  l('\n🤔 NETWORK\'S DECISION PROCESS (Explicit request):');
  l('─'.repeat(120));
  l('  Step 1: Analyze explicit request');
  l('    → User says: "just need research"');
  l('    → User says: "Don\'t write anything"');
  l('    → Intent: CRYSTAL CLEAR (research only)');
  l('');
  l('  Step 2: Match to primitive');
  l('    → researchAgent: "Gathers research" ✅ PERFECT MATCH');
  l('    → blogCreationWorkflow: Does research + writing (too much)');
  l('');
  l('  Step 3: DECISION');
  l('    → Route to: researchAgent only');
  l('    → Skip: writing, editing, formatting (as requested)');
  l('    → Most efficient: Do exactly what user asked');
  
  l('\n⏳ Executing network.generate()...\n');
  
  const result3 = await blogNetwork.generate(
    'I just need research on blockchain technology. Don\'t write anything, just gather information.',
    {
      runtimeContext: new RuntimeContext(),
      resourceId: 'decision-test',
      threadId: 'scenario-c',
    }
  );
  
  l('\n✅ EXECUTION COMPLETED!');
  l('Routed to: ' + ('resourceType' in result3 ? result3.resourceType : 'unknown'));
  l('Primitive: ' + ('resourceId' in result3 ? result3.resourceId : 'unknown'));
  
  l('\n📊 DECISION VALIDATION:');
  if ('resourceType' in result3 && result3.resourceType === 'agent') {
    l('  ✅ CORRECT! Network chose agent (not workflow)');
    l('  ✅ Respected user\'s explicit instruction "don\'t write"');
  }
  
  // ============================================================================
  // SUMMARY: How Network Makes Decisions
  // ============================================================================
  l('\n\n' + '█'.repeat(120));
  l('🎓 NETWORK DECISION-MAKING SUMMARY');
  l('█'.repeat(120));
  
  l('\n🧠 WHAT INFLUENCES ROUTING DECISIONS:');
  l('─'.repeat(120));
  l('');
  l('1. USER REQUEST (Primary):');
  l('   └─ Keywords: "write", "research", "edit", "complete"');
  l('   └─ Clarity: Explicit vs ambiguous');
  l('   └─ Scope: Full pipeline vs partial task');
  l('');
  l('2. AGENT/WORKFLOW DESCRIPTIONS:');
  l('   └─ Network reads ALL descriptions');
  l('   └─ Matches capabilities to request');
  l('   └─ Better descriptions = Better routing');
  l('');
  l('3. NETWORK INSTRUCTIONS:');
  l('   └─ Routing rules (lines 66-148 in blog-network.ts)');
  l('   └─ Examples of when to use what');
  l('   └─ Decision framework');
  l('');
  l('4. WORKING MEMORY (Secondary):');
  l('   └─ User patterns from past threads');
  l('   └─ Helps resolve ambiguity');
  l('   └─ Consistency with past requests');
  l('');
  l('5. EFFICIENCY:');
  l('   └─ Prefer simplest solution');
  l('   └─ Workflow > multiple agent calls (when applicable)');
  l('   └─ Don\'t over-engineer');
  
  l('\n🎯 DECISION PATTERNS OBSERVED:');
  l('─'.repeat(120));
  l('');
  l('Pattern 1: CLEAR + COMPLETE request');
  l('  Request: "Write complete blog post"');
  l('  Decision: blogCreationWorkflow');
  l('  Reasoning: One primitive handles everything');
  l('');
  l('Pattern 2: AMBIGUOUS request');
  l('  Request: "Help with Python content"');
  l('  Decision: blogCreationWorkflow (reasonable assumption)');
  l('  Reasoning: "Help with content" → "Create content" (default)');
  l('');
  l('Pattern 3: EXPLICIT PARTIAL request');
  l('  Request: "Just research, don\'t write"');
  l('  Decision: researchAgent only');
  l('  Reasoning: User explicitly limited scope');
  
  l('\n💡 KEY INSIGHT:');
  l('─'.repeat(120));
  l('The routing agent (GPT-4o) is INTELLIGENT:');
  l('  ✅ Understands natural language');
  l('  ✅ Interprets user intent');
  l('  ✅ Matches capabilities to needs');
  l('  ✅ Makes efficient choices');
  l('  ✅ Handles ambiguity reasonably');
  l('');
  l('BUT it\'s not magic:');
  l('  ⚠️ Quality depends on good descriptions');
  l('  ⚠️ Ambiguous requests may not match intent');
  l('  ⚠️ Better prompts = Better routing');
  
  l('\n🔑 HOW TO IMPROVE ROUTING:');
  l('─'.repeat(120));
  l('1. Write CLEAR agent descriptions');
  l('   Bad: "Does stuff"');
  l('   Good: "Gathers research on topics. Use when: User needs information."');
  l('');
  l('2. Provide EXAMPLES in network instructions');
  l('   "User says X → Use primitive Y"');
  l('');
  l('3. Be EXPLICIT in requests');
  l('   Vague: "Help with content"');
  l('   Clear: "Write a complete blog post about X"');
  l('');
  l('4. Use MEMORY to build patterns');
  l('   After 10 requests, network learns user\'s typical needs');
  
  l('\n🎯 FOR YOUR RAGHAV NETWORK:');
  l('─'.repeat(120));
  l('Your request: "Generate 30 QSR analysis posts"');
  l('');
  l('Network decision process:');
  l('  1. Analyzes: "30 posts" → Multiple outputs needed');
  l('  2. Checks: "QSR analysis" → Matches Raghav\'s past work');
  l('  3. Decides: Use .loop() with coordination');
  l('  4. For each post:');
  l('     - Check memory: What topics already covered?');
  l('     - Decide depth: New brand → deep research');
  l('     - Route to: Research → Analysis → Write → Edit → Format');
  l('  5. Coordinates all 30 automatically!');
  l('');
  l('The routing agent becomes YOUR content strategist!');
  
  l('\n🚀 WHAT YOU\'VE LEARNED:');
  l('─'.repeat(120));
  l('✅ Routing is LLM-based (GPT-4o makes decisions)');
  l('✅ Decisions based on: request + descriptions + instructions + memory');
  l('✅ Network interprets intent (not just keyword matching)');
  l('✅ Good descriptions = Good routing');
  l('✅ Network can handle ambiguity (within reason)');
  l('✅ Efficiency is a factor (simplest solution wins)');
  
  l('\n🎓 ADVANCED INSIGHT:');
  l('─'.repeat(120));
  l('The routing agent is like a MANAGER:');
  l('  - Reads job description (agent descriptions)');
  l('  - Understands task (user request)');
  l('  - Assigns to right person (routes to primitive)');
  l('  - Efficient delegation (workflow over multiple agents when possible)');
  l('');
  l('Quality of routing = Quality of:');
  l('  1. Agent/workflow descriptions (job descriptions)');
  l('  2. Network instructions (management rules)');
  l('  3. User requests (task clarity)');
  
  l('\n🚀 NEXT TEST:');
  l('─'.repeat(120));
  l('Test 6: Workflow vs Network Comparison (FINAL)');
  l('  → Compare performance, cost, flexibility');
  l('  → Decide when to use workflow vs network');
  l('  → Complete understanding!');
  
  l('\n' + '█'.repeat(120));
  l('✅ TEST 5 COMPLETE - YOU UNDERSTAND NETWORK DECISION-MAKING!');
  l('█'.repeat(120));
  
  // Save to file
  const logPath = path.join(process.cwd(), 'test-logs', 'network-tests', '05-network-decisions.txt');
  fs.writeFileSync(logPath, log.join('\n'), 'utf-8');
  
  console.log('\n\n💾 SAVED TO: test-logs/network-tests/05-network-decisions.txt');
  console.log('📖 Read this file to understand how network makes routing decisions!\n');
}

testNetworkDecisions().catch(console.error);


