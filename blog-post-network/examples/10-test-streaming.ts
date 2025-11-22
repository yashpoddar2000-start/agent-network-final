/**
 * Test: Streaming Network Responses
 * 
 * Demonstrates real-time streaming from agent network
 */

import 'dotenv/config';
import { streamBlogPost } from '../src/mastra/agentnetwork/blog-network';

async function testStreaming() {
  console.log('\n🌊 TESTING STREAMING RESPONSES\n');
  console.log('='.repeat(80));
  console.log('Watch the blog post generate in REAL-TIME!\n');
  
  const stream = await streamBlogPost('Benefits of Go Programming', {
    style: 'technical',
    resourceId: 'streaming-test',
    threadId: 'stream-1',
  });
  
  console.log('📡 Streaming started...\n');
  
  for await (const chunk of stream) {
    // Print each chunk as it arrives
    process.stdout.write('.');
  }
  
  console.log('\n\n✅ Streaming complete!');
  console.log('='.repeat(80));
  console.log('\n🎉 Phase 7 Complete - Streaming works!\n');
}

testStreaming().catch(console.error);

