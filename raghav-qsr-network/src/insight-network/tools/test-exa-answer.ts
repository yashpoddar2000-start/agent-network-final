import { config } from 'dotenv';
import { exaAnswerTool } from './exa-answer-tool';

// Load environment variables
config();

/**
 * Helper function to assess domain quality for source filtering
 */
function getDomainQuality(domain?: string): string {
  if (!domain) return "❓";
  
  const trustedDomains = [
    "qsrmagazine.com",
    "restaurantbusinessonline.com", 
    "sec.gov",
    "businessinsider.com",
    "pos.toasttab.com",
    "franchisechatter.com",
    "1851franchise.com"
  ];
  
  const academicDomains = [
    ".edu",
    ".gov",
    "harvard.edu",
    "wharton.upenn.edu"
  ];
  
  const questionableDomains = [
    "blog",
    "wordpress",
    "medium.com",
    "substack"
  ];
  
  if (academicDomains.some(d => domain.includes(d))) return "🏛️ (Academic)";
  if (trustedDomains.includes(domain)) return "✅ (Trusted)";
  if (questionableDomains.some(d => domain.includes(d))) return "⚠️ (Blog)";
  if (domain.includes("wikipedia")) return "📖 (Wikipedia)";
  
  return "🔍 (Unknown)";
}

/**
 * Test script for Exa Answer Tool
 * 
 * Tests the bulk answer functionality with sample QSR queries
 */
async function testExaAnswerTool() {
  console.log('🧪 Testing Exa Answer Tool\n');

  // Check if API key is available
  if (!process.env.EXA_API_KEY) {
    console.error('❌ EXA_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Comprehensive test queries representing different viral insight patterns
  const testQueries = [
    // Shocking financial contrasts
    "What is Chick-fil-A's average annual revenue per store in 2024?",
    "What is McDonald's average revenue per store compared to Chick-fil-A?", 
    "What is Subway's average revenue per store vs industry average?",
    
    // Operational mechanisms  
    "What is Chick-fil-A's employee turnover rate compared to industry average?",
    "How much revenue does Chick-fil-A lose by closing on Sundays?",
    
    // Same company paradoxes (viral gold)
    "What is Taco Bell's profit per store vs Pizza Hut under Yum! Brands?",
    "How does KFC performance compare to Taco Bell under same parent company?",
  ];

  try {
    // Test the tool execution
    const result = await exaAnswerTool.execute({
      context: {
        queries: testQueries,
        batchOptions: {
          maxRetries: 3,
          timeoutMs: 25000, // Longer timeout for comprehensive queries
          maxConcurrency: 5, // Moderate concurrency for testing
        }
      }
    });

    // Display results
    console.log('\n📊 Results Summary:');
    console.log(`Total queries: ${result.summary.totalQueries}`);
    console.log(`Successful: ${result.summary.successful}`);
    console.log(`Failed: ${result.summary.failed}`);
    console.log(`Execution time: ${result.summary.executionTimeMs}ms`);

    console.log('\n📋 Detailed Results:');
    result.results.forEach((res, index) => {
      console.log(`\n${index + 1}. ${res.query}`);
      
      if (res.error) {
        console.log(`   ❌ Error: ${res.error}`);
      } else {
        console.log(`   ✅ Answer: ${res.answer.substring(0, 100)}...`);
        console.log(`   📚 Sources: ${res.sources.length}`);
        
        // Show first source as example with rich metadata
        if (res.sources.length > 0) {
          const source = res.sources[0];
          console.log(`   🔗 First source: ${source.title}`);
          console.log(`      📍 URL: ${source.url}`);
          if (source.score !== undefined) console.log(`      📊 Relevance: ${source.score.toFixed(3)}`);
          if (source.author) console.log(`      ✍️  Author: ${source.author}`);
          if (source.publishedDate) console.log(`      📅 Published: ${source.publishedDate.substring(0, 10)}`);
          if (source.snippet) console.log(`      📝 Snippet: ${source.snippet.substring(0, 100)}...`);
        }
      }
    });

    // Analyze source quality and data richness
    console.log('\n📊 DATA QUALITY ANALYSIS:');
    console.log('=====================================');
    
    const allSources = result.results.flatMap(r => r.sources);
    const withScores = allSources.filter(s => s.score !== undefined).length;
    const withAuthors = allSources.filter(s => s.author).length;
    const withDates = allSources.filter(s => s.publishedDate).length;
    const withSnippets = allSources.filter(s => s.snippet).length;
    
    console.log(`📈 Total sources collected: ${allSources.length}`);
    console.log(`📊 Sources with relevance scores: ${withScores}`);
    console.log(`✍️  Sources with authors: ${withAuthors}`);
    console.log(`📅 Sources with publication dates: ${withDates}`);
    console.log(`📝 Sources with content snippets: ${withSnippets}`);
    
    // Show sample high-quality sources
    console.log('\n🏆 Sample high-quality sources:');
    allSources
      .filter(s => s.score && s.score > 0.5)
      .slice(0, 3)
      .forEach((source, i) => {
        const domain = source.url ? new URL(source.url).hostname.replace(/^www\./, '') : 'unknown';
        console.log(`   ${i + 1}. ${domain} (score: ${source.score?.toFixed(3)})`);
        console.log(`      📄 ${source.title}`);
      });
    
    console.log('\n✅ Comprehensive test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testExaAnswerTool().catch(console.error);
}

export { testExaAnswerTool };
