import { config } from 'dotenv';
import Exa from "exa-js";

// Load environment variables
config();

/**
 * Raw Exa Deep Research API Inspector
 * 
 * This test calls the Exa Deep Research API directly and logs the complete response structure
 * so we can understand the async workflow and response format.
 */
async function inspectExaDeepResearchAPI() {
  console.log('🔬 Inspecting Exa Deep Research API workflow\n');

  if (!process.env.EXA_API_KEY) {
    console.error('❌ EXA_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Initialize Exa client (using official SDK for deep research)
  const exa = new Exa(process.env.EXA_API_KEY);

  // Test with a simple QSR research prompt
  const testPrompt = `
    Analyze Chick-fil-A's competitive advantages by examining:
    (1) revenue per store compared to McDonald's and Subway with specific dollar amounts
    (2) operational efficiency metrics including service times and employee turnover rates
    (3) franchise model differences and their impact on profitability
    
    Cite recent franchise disclosure documents, earnings reports, and industry analysis.
    Provide quantitative data with sources for each metric.
  `;

  try {
    console.log('📋 Test Research Prompt:');
    console.log('=' .repeat(80));
    console.log(testPrompt);
    console.log('=' .repeat(80));
    console.log('\n⏳ Submitting research request...\n');

    // Step 1: Submit research request (async)
    const research = await exa.research.create({
      instructions: testPrompt,
      model: "exa-research-fast", // Using faster model as requested
    });

    console.log('📨 Research submission response:');
    console.log('=' .repeat(40));
    console.log(JSON.stringify(research, null, 2));
    console.log('=' .repeat(40));
    console.log('\n🕐 Research submitted. Polling for completion...\n');

    // Step 2: Poll for completion with timeout
    const maxWaitTime = 120000; // 120 seconds as requested
    const pollInterval = 5000;  // Check every 5 seconds
    const startTime = Date.now();
    
    let result = null;
    let attempts = 0;
    
    while (Date.now() - startTime < maxWaitTime) {
      attempts++;
      console.log(`🔍 Poll attempt ${attempts} (${Math.floor((Date.now() - startTime) / 1000)}s elapsed)`);
      
      try {
        // Get current status
        result = await exa.research.get(research.researchId);
        
        console.log(`   Status: ${(result as any).status || 'unknown'}`);
        
        // Check if completed
        if ((result as any).status === 'completed') {
          console.log('✅ Research completed!\n');
          break;
        } else if ((result as any).status === 'failed') {
          console.log('❌ Research failed!\n');
          break;
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
      } catch (pollError: any) {
        console.log(`   ⚠️ Poll error: ${pollError.message}`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    if (!result || (result as any).status !== 'completed') {
      console.log('⏰ Research timed out or failed');
      console.log('Final status:', (result as any)?.status || 'unknown');
      return;
    }

    // Step 3: Inspect the final result structure
    console.log('🎯 FINAL RESEARCH RESULT STRUCTURE:');
    console.log('=' .repeat(80));
    console.log(JSON.stringify(result, null, 2));
    console.log('=' .repeat(80));
    console.log('\n');

    // Step 4: Analyze specific parts of the response
    console.log('📝 Available properties on result:');
    console.log(Object.keys(result as any));
    console.log('\n');

    // Look for the actual research content
    const resultData = result as any;
    if (resultData.report) {
      console.log('📄 Research Report Length:', resultData.report.length);
      console.log('📄 Report Preview:');
      console.log(resultData.report.substring(0, 300) + '...');
    }

    if (resultData.sources) {
      console.log('\n📚 Sources Found:', resultData.sources.length);
      resultData.sources.slice(0, 3).forEach((source: any, i: number) => {
        console.log(`   ${i + 1}. ${source.title || 'No title'}`);
        console.log(`      URL: ${source.url || 'No URL'}`);
      });
    }

    if (resultData.data) {
      console.log('\n📊 Structured Data Available:', !!resultData.data);
    }

    console.log('\n✅ Deep Research API inspection complete!');

  } catch (error: any) {
    console.error('❌ Error during deep research test:', error.message);
    
    // Log the full error for debugging
    console.log('\n🔍 Full error details:');
    console.log(error);
  }
}

// Run the inspection
if (require.main === module) {
  inspectExaDeepResearchAPI().catch(console.error);
}

export { inspectExaDeepResearchAPI };
