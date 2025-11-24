import { config } from 'dotenv';
import OpenAI from "openai";

// Load environment variables
config();

/**
 * Raw Exa API Response Inspector
 * 
 * This test calls the Exa API directly and logs the complete response structure
 * so we can understand how to properly extract sources and answers.
 */
async function inspectExaResponse() {
  console.log('🔍 Inspecting raw Exa API response structure\n');

  if (!process.env.EXA_API_KEY) {
    console.error('❌ EXA_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Initialize Exa client
  const exaClient = new OpenAI({
    baseURL: "https://api.exa.ai",
    apiKey: process.env.EXA_API_KEY,
  });

  const testQuery = "What is Chick-fil-A's average annual revenue per store?";

  try {
    console.log(`📋 Testing query: "${testQuery}"`);
    console.log('⏳ Calling Exa API...\n');

    const completion = await exaClient.chat.completions.create({
      model: "exa",
      messages: [
        {
          role: "user",
          content: testQuery
        }
      ],
      stream: false,
    });

    console.log('🔬 RAW EXA RESPONSE STRUCTURE:');
    console.log('=====================================');
    console.log(JSON.stringify(completion, null, 2));
    console.log('=====================================\n');

    // Also log specific parts to understand the structure
    console.log('📝 Message content:');
    console.log(completion.choices[0]?.message?.content);
    console.log('\n');

    console.log('🏷️ Available properties on completion object:');
    console.log(Object.keys(completion));
    console.log('\n');

    console.log('🏷️ Available properties on choices[0]:');
    console.log(Object.keys(completion.choices[0] || {}));
    console.log('\n');

    console.log('🏷️ Available properties on message:');
    console.log(Object.keys(completion.choices[0]?.message || {}));
    console.log('\n');

    // Check for sources in various possible locations
    console.log('🔍 Checking for sources in various locations:');
    console.log('completion.sources:', (completion as any).sources);
    console.log('completion.citations:', (completion as any).citations);
    console.log('completion.metadata:', (completion as any).metadata);
    console.log('completion.choices[0].sources:', (completion.choices[0] as any).sources);
    console.log('completion.choices[0].citations:', (completion.choices[0] as any).citations);
    console.log('completion.choices[0].message.sources:', (completion.choices[0]?.message as any)?.sources);
    console.log('completion.choices[0].message.citations:', (completion.choices[0]?.message as any)?.citations);

  } catch (error: any) {
    console.error('❌ Error calling Exa API:', error.message);
    
    // Log the full error for debugging
    console.log('\n🔍 Full error details:');
    console.log(error);
  }
}

// Run the inspection
if (require.main === module) {
  inspectExaResponse().catch(console.error);
}

export { inspectExaResponse };
