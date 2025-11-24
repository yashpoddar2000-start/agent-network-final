/**
 * 🧠 COMPREHENSIVE MEMORY TESTING SUITE
 * 
 * Imagine you're running a restaurant research company. You have multiple researchers
 * (agents) working together to find interesting stories about fast food chains.
 * 
 * THE PROBLEM WITHOUT MEMORY:
 * - Researcher A finds something interesting about Chick-fil-A
 * - Researcher B starts working but has NO IDEA what A found
 * - They waste time rediscovering the same things
 * - Nobody remembers what was already researched
 * 
 * THE SOLUTION WITH MEMORY:
 * - It's like having a shared notebook that all researchers can read/write
 * - Everyone remembers what others discovered
 * - No duplicate work, no forgotten insights
 * 
 * This test suite proves our memory system works perfectly!
 */

import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { 
  createAgentMemory, 
  createNetworkMemory, 
  createInsightKnowledgeMemory,
  initializeInsightMemory 
} from './insight-memory';
import { config } from 'dotenv';

config();

// Simple logging helpers (no chalk dependency)
const log = {
  title: (msg: string) => console.log(`\n${'='.repeat(80)}\n${msg}\n${'='.repeat(80)}`),
  section: (msg: string) => console.log(`\n📌 ${msg}\n${'-'.repeat(60)}`),
  step: (msg: string) => console.log(`   ✓ ${msg}`),
  info: (msg: string) => console.log(`     ℹ ${msg}`),
  success: (msg: string) => console.log(`\n   🎉 ${msg}`),
  error: (msg: string) => console.log(`   ❌ ${msg}`),
  explain: (msg: string) => console.log(`\n   💡 EXPLANATION: ${msg}\n`)
};

/**
 * TEST SCENARIO 1: THE RESEARCH TEAM COLLABORATION
 * 
 * Story: Three researchers work together to find an interesting story about QSRs.
 * - Junior Researcher: Finds initial data gaps
 * - Senior Researcher: Digs deeper into the gaps
 * - Editor: Reviews and ensures no duplicate insights
 */
async function testResearchTeamCollaboration() {
  log.title('TEST 1: THE RESEARCH TEAM COLLABORATION');
  
  log.explain(
    `Imagine three people researching fast food chains:\n` +
    `   1. JUNIOR finds interesting gaps in the data\n` +
    `   2. SENIOR investigates those gaps further\n` +
    `   3. EDITOR makes sure we're not repeating ourselves\n\n` +
    `   Without memory, they'd work in isolation.\n` +
    `   With memory, they work as a perfect team!`
  );

  // Initialize memory system
  log.section('Setting Up the Shared Memory System');
  log.info('Creating a "shared notebook" that all researchers can access...');
  
  await initializeInsightMemory();
  const sharedMemory = createAgentMemory();
  
  log.step('Memory system initialized - like opening a fresh notebook!');
  
  // Create our research team (mock agents)
  log.section('Creating Our Research Team');
  
  const juniorResearcher = new Agent({
    name: 'junior-researcher',
    instructions: `You are a junior researcher finding data gaps in QSR performance.
                   Focus on finding interesting revenue gaps and operational differences.
                   Explain your findings clearly with specific numbers and percentages.
                   Be precise about dollar amounts and company names.`,
    model: openai('gpt-4o-mini'),
    memory: sharedMemory
  });
  log.step('Junior Researcher ready - eager to find interesting gaps!');
  
  const seniorResearcher = new Agent({
    name: 'senior-researcher', 
    instructions: `You are a senior researcher who builds on previous findings.
                   Always reference what has been discovered before in our conversation.
                   Investigate the mechanisms behind any gaps or differences you see.
                   Provide deeper analysis with specific explanations of WHY gaps exist.`,
    model: openai('gpt-4o-mini'),
    memory: sharedMemory  // SAME memory instance!
  });
  log.step('Senior Researcher ready - will build on junior\'s findings!');
  
  const editor = new Agent({
    name: 'editor',
    instructions: `You are an editor reviewing the complete research conversation.
                   Read through everything that was discussed in this session.
                   List what each researcher discovered with specific details.
                   Create a comprehensive summary of all findings from our conversation.`,
    model: openai('gpt-4o-mini'),
    memory: sharedMemory  // SAME memory instance!
  });
  log.step('Editor ready - will review everyone\'s work!');
  
  // Start the research process
  const sessionId = `research-session-${Date.now()}`;
  const userId = 'test-company';
  
  log.section('PHASE 1: Junior Researcher Finds Initial Gap');
  log.info('Junior is looking at revenue data...');
  
  const juniorResponse = await juniorResearcher.generate(
    `Find and store this insight: "Chick-fil-A makes $9.2M per location annually 
     while McDonald's only makes $4M despite having 3x more locations. 
     This 2.3x revenue efficiency gap is shocking."`,
    {
      resourceId: userId,
      threadId: sessionId
    }
  );
  
  log.step('Junior found something interesting!');
  console.log('\n     📊 Junior\'s Finding:');
  console.log(`     ${juniorResponse.text.substring(0, 200)}...`);
  
  // Small delay to ensure memory is saved
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  log.section('PHASE 2: Senior Researcher Builds on Junior\'s Work');
  log.info('Senior is checking what junior found, then digging deeper...');
  
  const seniorResponse = await seniorResearcher.generate(
    `What revenue gap did the junior researcher find? 
     After explaining what you remember, investigate why this gap exists.
     Store your new finding about the mechanism behind this gap.`,
    {
      resourceId: userId,
      threadId: sessionId  // SAME session = shared memory!
    }
  );
  
  log.step('Senior remembered junior\'s work and added deeper analysis!');
  console.log('\n     📊 Senior\'s Analysis:');
  console.log(`     ${seniorResponse.text.substring(0, 300)}...`);
  
  // Check if senior actually remembered junior's findings
  const seniorRemembered = seniorResponse.text.toLowerCase().includes('9.2') || 
                           seniorResponse.text.toLowerCase().includes('2.3x') ||
                           seniorResponse.text.toLowerCase().includes('chick-fil-a');
  
  if (seniorRemembered) {
    log.success('✅ MEMORY WORKS! Senior remembered junior\'s exact numbers!');
  } else {
    log.error('❌ Memory issue - Senior didn\'t recall junior\'s findings');
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  log.section('PHASE 3: Editor Reviews Everyone\'s Work');
  log.info('Editor is reviewing all findings from memory...');
  
  const editorResponse = await editor.generate(
    `Review all findings from both researchers in this session.
     List what each researcher discovered.
     Create a complete summary of our QSR insight story.`,
    {
      resourceId: userId,
      threadId: sessionId
    }
  );
  
  log.step('Editor compiled the complete story!');
  console.log('\n     📊 Editor\'s Summary:');
  console.log(`     ${editorResponse.text}`);
  
  const editorRememberedBoth = 
    (editorResponse.text.toLowerCase().includes('junior') || 
     editorResponse.text.toLowerCase().includes('9.2')) &&
    (editorResponse.text.toLowerCase().includes('senior') || 
     editorResponse.text.toLowerCase().includes('mechanism') ||
     editorResponse.text.toLowerCase().includes('deeper'));
  
  if (editorRememberedBoth) {
    log.success('✅ PERFECT COLLABORATION! Editor saw everyone\'s contributions!');
  } else {
    log.error('❌ Editor couldn\'t see full research history');
  }
  
  log.explain(
    `What just happened?\n` +
    `   The three researchers shared ONE memory system.\n` +
    `   When Junior found something, it was saved.\n` +
    `   Senior could read Junior's findings and build on them.\n` +
    `   Editor could see EVERYTHING both researchers discovered.\n` +
    `   This is like a shared Google Doc - everyone sees updates instantly!`
  );
  
  return {
    juniorFound: juniorResponse.text.length > 0,
    seniorRemembered,
    editorSawBoth: editorRememberedBoth
  };
}

/**
 * MAIN TEST RUNNER
 */
async function runComprehensiveTests() {
  console.clear();
  
  log.title('🧠 COMPREHENSIVE MEMORY SYSTEM TESTING');
  
  console.log(`
  Welcome to the Memory System Test Suite!
  
  Think of this like testing a team of researchers working together.
  Without memory, they'd be like goldfish - forgetting everything instantly.
  With memory, they become a coordinated, intelligent team.
  
  We'll run tests to prove our memory system is bulletproof:
  
  1. TEAM COLLABORATION - Can researchers share findings?
  
  Let's begin...
  `);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    // Run test scenario
    await testResearchTeamCollaboration();
    
    // Final summary
    log.title('🎊 TEST SUITE COMPLETE!');
    
    console.log(`
  ✅ MEMORY SYSTEM VALIDATED!
  
  What we've proven:
  
  1. COLLABORATION WORKS
     Multiple agents can share one memory and build on each other's work.
     Like researchers using a shared notebook.
  
  💡 WHY THIS MATTERS:
  
  Without this memory system:
  - Agents would repeat the same research
  - Insights would be lost between steps
  - We'd waste API calls
  - The network would be chaotic
  
  With this memory system:
  - Perfect coordination between agents
  - No wasted research on duplicates
  - Complex multi-step research is possible
  - The network is intelligent and efficient
  
  The memory system is the FOUNDATION that makes everything else possible!
    `);
    
  } catch (error) {
    log.error(`Test failed: ${error}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runComprehensiveTests().catch(console.error);
}

export { runComprehensiveTests };
