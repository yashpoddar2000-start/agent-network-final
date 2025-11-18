/**
 * Quick Test: Blog Creation Workflow
 * 
 * Tests the complete pipeline we've built so far:
 * Research → Write → Edit → Format
 */

import 'dotenv/config'; // Load .env file
import { createBlogPost } from '../src/mastra/workflows/blog-creation-workflow';

async function testWorkflow() {
  console.log('🧪 TESTING BLOG CREATION WORKFLOW\n');
  console.log('=' .repeat(50));
  
  try {
    const result = await createBlogPost('Benefits of TypeScript', {
      depth: 'moderate',
      numFindings: 5,
    });
    
    console.log('\n✅ SUCCESS!');
    console.log('=' .repeat(50));
    console.log(`📄 File: ${result.exportPath}`);
    console.log(`📊 Stats: ${result.wordCount} words, ${result.readingTime}`);
    console.log(`📈 Quality: ${result.summary.improvementScore}/100`);
    console.log('\n🎉 Workflow test passed!');
    
  } catch (error) {
    console.error('\n❌ FAILED!');
    console.error('=' .repeat(50));
    console.error(error);
  }
}

testWorkflow();

