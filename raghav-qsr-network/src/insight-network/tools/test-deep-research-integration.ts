import { config } from 'dotenv';
import { deepResearchPromptAgent } from '../agents/deep-research-prompt-agent';
import { exaDeepResearchTool } from './exa-deep-research-tool';
import { z } from 'zod';

// Load environment variables
config();

/**
 * Integration Test: Deep Research Prompt Agent + Deep Research Tool
 * 
 * Tests the complete pipeline:
 * 1. Agent reads spec and generates expert prompts
 * 2. Tool executes async deep research 
 * 3. Results are synthesized into comprehensive insight
 */
async function testDeepResearchIntegration() {
  console.log('🧪 Testing Deep Research Integration (Agent + Tool)\n');

  // Check required API keys
  if (!process.env.EXA_API_KEY) {
    console.error('❌ EXA_API_KEY not found in environment variables');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Test insight: Chick-fil-A vs McDonald's revenue mechanism
  const insightTopic = `
    Why does Chick-fil-A generate $9.3M per store while McDonald's generates only $600K per store?
    Focus on the specific mechanisms that create this 15x revenue difference.
    Include operational strategies, franchise models, and unit economics.
  `;

  try {
    console.log('📋 Research Topic:');
    console.log('=' .repeat(80));
    console.log(insightTopic);
    console.log('=' .repeat(80));

    // Step 1: Agent generates expert prompt
    console.log('\n🧠 Step 1: Generating expert research prompt...');
    
    const promptResponse = await deepResearchPromptAgent.generate(insightTopic);

    const expertPrompt = promptResponse.text;
    
    console.log('\n📝 Generated Expert Prompt:');
    console.log('=' .repeat(80));
    console.log(expertPrompt);
    console.log('=' .repeat(80));

    // Step 2: Tool executes deep research
    console.log('\n🔬 Step 2: Executing deep research (this will take 60-120 seconds)...');
    
    const researchResult = await exaDeepResearchTool.execute({
      context: {
        prompt: expertPrompt,
        researchOptions: {
          model: "exa-research-fast",
          maxTimeoutMs: 120000,
          pollIntervalMs: 5000,
          maxRetries: 2,
        }
      }
    });

    // Step 3: Display comprehensive results
    console.log('\n🎯 INTEGRATION TEST RESULTS:');
    console.log('=' .repeat(80));
    
    console.log('\n📊 Research Summary:');
    console.log(`✅ Research successful: ${researchResult.success}`);
    console.log(`💰 Total cost: $${researchResult.cost.total.toFixed(4)}`);
    console.log(`🔍 Searches performed: ${researchResult.cost.searches}`);
    console.log(`📄 Pages read: ${researchResult.cost.pages.toFixed(1)}`);
    console.log(`⏱️  Execution time: ${Math.floor(researchResult.executionTimeMs / 1000)}s`);
    console.log(`🆔 Research ID: ${researchResult.researchId}`);

    if (researchResult.error) {
      console.log(`❌ Error: ${researchResult.error}`);
    } else {
      console.log(`📄 Report length: ${researchResult.report.length} characters`);
      
      // Show preview of research content
      console.log('\n📋 Research Report Preview:');
      console.log('=' .repeat(80));
      console.log(researchResult.report.substring(0, 800) + '...');
      console.log('=' .repeat(80));
    }

    // Success metrics
    if (researchResult.success) {
      console.log('\n🎉 INTEGRATION TEST PASSED!');
      console.log('✅ Agent successfully generated expert prompt');
      console.log('✅ Tool successfully executed deep research');
      console.log('✅ Comprehensive report generated');
      
      console.log(`\n📈 Efficiency Metrics:`);
      console.log(`   💰 Cost per report: $${researchResult.cost.total.toFixed(4)}`);
      console.log(`   📊 Cost efficiency: ${(researchResult.report.length / researchResult.cost.total / 1000).toFixed(1)}k chars per dollar`);
      console.log(`   ⚡ Speed: ${(researchResult.report.length / researchResult.executionTimeMs * 1000).toFixed(0)} chars per second`);
      
    } else {
      console.log('\n⚠️ INTEGRATION TEST FAILED');
      console.log('❌ Research could not be completed');
      console.log('💡 Consider improving prompt or reducing complexity');
    }

  } catch (error: any) {
    console.error('\n❌ Integration test failed:', error.message);
    console.log('\n🔍 Full error details:');
    console.log(error);
    process.exit(1);
  }
}

// Run the integration test
if (require.main === module) {
  testDeepResearchIntegration().catch(console.error);
}

export { testDeepResearchIntegration };
