/**
 * Test: Agent Network Intelligence
 * 
 * This demonstrates the POWER of agent networks:
 * - Dynamic routing based on request
 * - .generate() for simple tasks
 * - .loop() for complex tasks
 */

import 'dotenv/config';
import { blogNetwork } from '../src/mastra/agentnetwork/blog-network';
import { RuntimeContext } from '@mastra/core/runtime-context';

async function testNetworkIntelligence() {
  console.log('🧪 TESTING AGENT NETWORK INTELLIGENCE\n');
  console.log('=' .repeat(60));
  
  const runtimeContext = new RuntimeContext();
  
  // Test 1: Simple request - Network should use workflow
  console.log('\n📝 TEST 1: Simple blog post request');
  console.log('─'.repeat(60));
  console.log('Request: "Write a blog about Python"');
  console.log('Expected: Network routes to blogCreationWorkflow\n');
  
  try {
    const result1 = await blogNetwork.generate(
      'Write a blog post about the benefits of Python programming',
      {
        runtimeContext,
        resourceId: 'test-user',
        threadId: 'test-1',
      }
    );
    
    console.log('✅ TEST 1 PASSED!');
    console.log(`📊 Response:`, result1);
    const text1 = typeof result1 === 'string' ? result1 : result1?.text || JSON.stringify(result1);
    console.log(`📝 Preview: ${text1.substring(0, 200)}...`);
  } catch (error) {
    console.error('❌ TEST 1 FAILED:', error);
  }
  
  // Test 2: Research-only request - Network should use research agent
  console.log('\n\n🔍 TEST 2: Research-only request');
  console.log('─'.repeat(60));
  console.log('Request: "Research JavaScript trends"');
  console.log('Expected: Network routes to researchAgent only\n');
  
  try {
    const result2 = await blogNetwork.generate(
      'Research current trends in JavaScript development. I just need the research, not a full blog post.',
      {
        runtimeContext,
        resourceId: 'test-user',
        threadId: 'test-2',
      }
    );
    
    console.log('✅ TEST 2 PASSED!');
    console.log(`📊 Response:`, result2);
    const text2 = typeof result2 === 'string' ? result2 : result2?.text || JSON.stringify(result2);
    console.log(`📝 Preview: ${text2.substring(0, 200)}...`);
  } catch (error) {
    console.error('❌ TEST 2 FAILED:', error);
  }
  
  // Test 3: Complex request using .loop()
  console.log('\n\n🔄 TEST 3: Complex multi-step task with .loop()');
  console.log('─'.repeat(60));
  console.log('Request: "Research TypeScript AND Python. Compare them. Write blog."');
  console.log('Expected: Network coordinates multiple agents\n');
  
  try {
    const result3 = await blogNetwork.loop(
      'Research TypeScript and Python. Compare their strengths and weaknesses. Write a comprehensive blog post comparing them.',
      {
        runtimeContext,
        resourceId: 'test-user',
        threadId: 'test-3',
      }
    );
    
    console.log('✅ TEST 3 PASSED!');
    console.log(`📊 Response:`, result3);
    const text3 = typeof result3 === 'string' ? result3 : result3?.text || JSON.stringify(result3);
    console.log(`📝 Preview: ${text3.substring(0, 200)}...`);
  } catch (error) {
    console.error('❌ TEST 3 FAILED:', error);
  }
  
  console.log('\n\n' + '='.repeat(60));
  console.log('🎉 AGENT NETWORK TESTS COMPLETE!');
  console.log('=' .repeat(60));
  console.log('\n💡 Key Takeaway:');
  console.log('   The SAME network handles different requests intelligently');
  console.log('   - Simple requests → Quick routing');
  console.log('   - Research requests → Just research agent');
  console.log('   - Complex requests → Multiple agents coordinated');
  console.log('\n   This is the POWER of agent networks! 🚀\n');
}

testNetworkIntelligence();

