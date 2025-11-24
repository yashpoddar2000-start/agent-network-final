import { config } from 'dotenv';
import { deepResearchPromptAgent } from '../agents/deep-research-prompt-agent';

// Load environment variables
config();

/**
 * Quick Test: Deep Research Prompt Agent (Single Prompt Generation)
 * 
 * Tests that the agent can read the spec and generate one excellent prompt
 */
async function testSinglePromptGeneration() {
  console.log('🧪 Testing Single Prompt Generation\n');

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Test insight scenarios
  const testScenarios = [
    {
      name: "Financial Contrast",
      context: "Why does Chick-fil-A generate $9.3M per store while McDonald's generates $600K? Focus on revenue mechanisms."
    },
    {
      name: "Operational Advantage", 
      context: "Chick-fil-A has 5% employee turnover vs 100% industry average. Investigate the retention mechanisms."
    },
    {
      name: "Same Company Paradox",
      context: "Taco Bell vs Pizza Hut under Yum! Brands - same parent, different performance. Find the operational differences."
    }
  ];

  try {
    for (const scenario of testScenarios) {
      console.log(`\n🎯 Testing: ${scenario.name}`);
      console.log(`📋 Context: ${scenario.context}`);
      console.log('⏳ Generating expert prompt...\n');

      const startTime = Date.now();
      const response = await deepResearchPromptAgent.generate(scenario.context);
      const executionTime = Date.now() - startTime;

      console.log('📝 Generated Expert Prompt:');
      console.log('-'.repeat(80));
      console.log(response.text);
      console.log('-'.repeat(80));
      
      // Analyze prompt quality
      const prompt = response.text;
      const hasImperativeVerb = /^(Analyze|Investigate|Examine|Compare|Study)/i.test(prompt.trim());
      const hasSpecificData = /(percentages?|dollar amounts?|rates?|ratios?)/i.test(prompt);
      const hasSources = /(SEC|earnings|franchise disclosure|10-K)/i.test(prompt);
      const hasMethodology = /\((1\)|first|second|third|\d\)|by examining|including)/i.test(prompt);
      const isUnder4k = prompt.length < 4000;
      
      console.log(`\n🔍 Prompt Quality Analysis:`);
      console.log(`   ✅ Imperative verb: ${hasImperativeVerb ? '✓' : '✗'}`);
      console.log(`   ✅ Specific data types: ${hasSpecificData ? '✓' : '✗'}`);
      console.log(`   ✅ Source guidance: ${hasSources ? '✓' : '✗'}`);
      console.log(`   ✅ Clear methodology: ${hasMethodology ? '✓' : '✗'}`);
      console.log(`   ✅ Under 4k chars: ${isUnder4k ? '✓' : '✗'} (${prompt.length} chars)`);
      console.log(`   ⏱️  Generation time: ${executionTime}ms`);

      const qualityScore = [hasImperativeVerb, hasSpecificData, hasSources, hasMethodology, isUnder4k].filter(Boolean).length;
      console.log(`   🎯 Quality score: ${qualityScore}/5`);

      if (qualityScore >= 4) {
        console.log(`   🎉 Excellent prompt quality!`);
      } else {
        console.log(`   ⚠️ Prompt needs improvement`);
      }
    }

    console.log('\n✅ Single prompt generation test complete!');
    console.log('💡 Ready for integration with Deep Research Tool');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔍 Full error details:');
    console.log(error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testSinglePromptGeneration().catch(console.error);
}

export { testSinglePromptGeneration };
