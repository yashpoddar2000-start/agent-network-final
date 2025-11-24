import { config } from 'dotenv';
import { qsrInsightNetwork } from './networks/qsr-insight-network';
import { RuntimeContext } from '@mastra/core/runtime-context';

// Load environment variables
config();

/**
 * End-to-End Test: QSR Insight Discovery Network
 * 
 * Tests the complete flow from topic to viral insight:
 * 1. Network generates hypotheses
 * 2. Uses exaAnswerTool for initial research (max 20 queries)
 * 3. Uses deepResearchPromptAgent + exaDeepResearchTool for mechanisms (max 3 calls)
 * 4. Outputs structured insight with shock score
 */
async function testInsightNetwork() {
  console.log('🔥 Testing QSR Insight Discovery Network\n');
  console.log('Target: Generate viral insight with 8+ shock score\n');

  // Verify API keys
  if (!process.env.EXA_API_KEY) {
    console.error('❌ EXA_API_KEY not found in environment variables');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Test scenarios for viral insights
  const testScenarios = [
    {
      name: "Revenue Gap Discovery",
      prompt: "Find a shocking revenue gap between QSR companies. Focus on same-company paradoxes or massive performance differences. Target companies: Chick-fil-A, McDonald's, Taco Bell, Pizza Hut, Subway."
    },
    {
      name: "Operational Advantage",
      prompt: "Discover a contrarian operational strategy that seems wrong but works incredibly well. Look for companies that break conventional rules and win because of it."
    },
    {
      name: "Same Parent Paradox", 
      prompt: "Find QSR brands under the same parent company with dramatically different performance. Investigate Yum! Brands (Taco Bell, Pizza Hut, KFC) or other multi-brand companies."
    }
  ];

  // Test one scenario for now (can expand later)
  const scenario = testScenarios[0]; // Revenue Gap Discovery
  
  try {
    console.log(`🎯 Testing Scenario: ${scenario.name}`);
    console.log(`📋 Research Prompt: ${scenario.prompt}`);
    console.log('\n⏳ Network processing (this may take 3-5 minutes)...\n');

    const startTime = Date.now();
    
    // Create runtime context (required for vNext networks)
    const runtimeContext = new RuntimeContext();
    
    // Call the insight network following blog-post-network pattern
    const result = await qsrInsightNetwork.generate(scenario.prompt, {
      runtimeContext,
      resourceId: 'raghav',
      threadId: `insight-test-${Date.now()}`,
    });
    
    const executionTime = Date.now() - startTime;
    
    console.log('\n🎯 INSIGHT NETWORK RESULTS:');
    console.log('=' .repeat(80));
    console.log(`⏱️  Total execution time: ${Math.floor(executionTime / 1000)}s`);
    
    // Just dump everything - let's see what we get!
    console.log('\n🎯 RAW NETWORK OUTPUT:');
    console.log('=' .repeat(80));
    console.log('RESULT OBJECT:');
    console.log(JSON.stringify(result, null, 2));
    console.log('=' .repeat(80));

    console.log('\n✅ Network test completed!');

  } catch (error: any) {
    console.error('\n❌ Network test failed:', error.message);
    console.log('\n🔍 Full error details:');
    console.log(error);
    
    // Analyze potential issues
    console.log('\n🔧 Possible issues:');
    console.log('- Network instructions may need refinement');
    console.log('- API rate limiting or timeout issues');  
    console.log('- Tool integration problems');
    console.log('- Missing dependencies or environment variables');
    
    process.exit(1);
  }
}

// Add helper for manual testing
export async function runSingleInsightTest(customPrompt?: string) {
  const defaultPrompt = "Find a shocking revenue gap between major QSR companies. Focus on specific dollar amounts and discover why the gap exists.";
  return testInsightNetwork();
}

// Run the test
if (require.main === module) {
  testInsightNetwork().catch(console.error);
}

export { testInsightNetwork };
